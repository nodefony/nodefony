import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { z } from "zod";
import { EMPTY_PRESENCE, NodefonySocket } from "nodefony/client";
import type {
  IPresenceSnapshot,
  RealtimeIdentity,
  RealtimeState,
} from "nodefony/client";
import {
  CHAT_ATTACH_PATH,
  CHAT_REALTIME_PATH,
  messagePreview,
  nextTyping,
  type ChatContract,
  type ChatMessage,
} from "./chatContract";
import type { CreateRoomBody, EventBody, InviteBody } from "./chatSchemas";
import { catchUpMessages, mergeMessages, withReactions } from "./messages";
import {
  LOBBY_ROOM_ID,
  ONLINE_CHANNEL,
  addUnread,
  roomChannel,
  shouldNotify,
  withUnread,
  type AlertPermission,
  type IRoomMember,
  type IRoomView,
} from "./rooms";
import {
  RosterTracker,
  memberRows,
  type IMemberRow,
  type IRosterRow,
} from "./roster";

/** Messages rechargés à l'ouverture d'un salon et à chaque reconnexion. */
const HISTORY_SIZE = 50;

/** Un signal de frappe au plus toutes les deux secondes. */
const TYPING_THROTTLE_MS = 2000;

/** « Untel écrit… » s'efface sans nouveau signal. */
const TYPING_DISPLAY_MS = 3000;

/**
 * Les membres se relisent au plus une fois par fenêtre : une rafale de
 * présences (connexions, rechargements) ne fait qu'une requête.
 */
const MEMBERS_RELOAD_MS = 400;

/**
 * Un message se dit lu après être resté affiché ce délai, page visible : une
 * rafale ne fait qu'un envoi, et l'historique d'un salon qu'on ne fait que
 * traverser ne compte pas pour lu.
 */
const READ_DELAY_MS = 600;

/** La socket typée par le contrat du chat. */
type ChatSocket = ReturnType<typeof NodefonySocket.fromContract<ChatContract>>;

/** Ce que l'écran du chat lit et fait. */
export interface IChatRoom {
  /** Les salons visibles : publics, les miens, ceux où l'on m'invite. */
  rooms: IRoomView[];
  /** Le salon ouvert. */
  roomId: string;
  /** Ouvre un autre salon. */
  openRoom: (roomId: string) => void;
  messages: ChatMessage[];
  /** Qui écrit dans le salon ouvert, soi compris : la même fenêtre pour tous. */
  typing: string | null;
  /** La présence du salon ouvert (ADR-0025). */
  presence: IPresenceSnapshot;
  /** Les lignes du panneau des présents, triées. */
  people: IRosterRow[];
  /**
   * Les membres d'un salon PRIVÉ et leur état (D51) — dans le salon, en ligne
   * ailleurs, absent ; `null` pour un salon public ou un visiteur anonyme.
   */
  members: IMemberRow[] | null;
  /** Pourquoi le salon ouvert est fermé à cette page ; `null` s'il est ouvert. */
  refusal: string | null;
  /**
   * Ce qui a ramené la page à l'accueil — salon supprimé, ou plus membre ;
   * `null` sinon. Effacé à l'ouverture d'un autre salon.
   */
  notice: string | null;
  /** L'identité annoncée par le serveur ; `null` avant l'accueil. */
  identity: RealtimeIdentity | null;
  state: RealtimeState;
  /**
   * Envoie un message au salon ouvert, avec ses pièces s'il en a ; rejette
   * avec le motif du serveur (403, 413, 422…). Rien ne s'affiche avant
   * l'annonce du salon.
   */
  send: (
    text: string,
    files?: readonly File[],
    replyTo?: string | null,
  ) => Promise<void>;
  /**
   * Les gestes sur un message du salon ouvert : chacun rejette avec le motif
   * du serveur. Rien ne change à l'écran avant que le salon ne l'annonce.
   */
  gestures: IMessageGestures;
  /** Signale qu'on écrit (borné : au plus un signal par intervalle). */
  notifyTyping: () => void;
  /**
   * Les gestes des formulaires : chacun rejette avec le message du serveur
   * (403, 404, 409, 422), que le formulaire affiche sous son champ.
   */
  forms: IRoomForms;
  /**
   * Les notifications du navigateur (D54) : la permission telle qu'elle est,
   * et le geste qui la demande — la demande n'est permise qu'après un clic.
   */
  alerts: { permission: AlertPermission; enable: () => Promise<void> };
}

/** Modifier, retirer, réagir — une route du contrat chacun (XEP-0308, 0424, 0444). */
export interface IMessageGestures {
  /** Remplace le texte d'un de ses messages. */
  edit: (messageId: string, text: string) => Promise<void>;
  /** Retire un message — le sien, ou en modérateur. */
  retract: (messageId: string) => Promise<void>;
  /** Envoie l'ensemble ENTIER de ses réactions sur un message. */
  react: (messageId: string, emojis: readonly string[]) => Promise<void>;
}

/** Ce que le corps d'une route accepte EN ENTRÉE (avant ses défauts). */
type Draft<S extends z.ZodType> = z.input<S>;

/** Les gestes des formulaires du chat — une route du contrat chacun. */
export interface IRoomForms {
  /** Crée un salon, puis l'ouvre. */
  createRoom: (draft: Draft<typeof CreateRoomBody>) => Promise<void>;
  /** Invite une personne dans le salon ouvert. */
  invite: (draft: Draft<typeof InviteBody>) => Promise<void>;
  /** Planifie un événement dans le salon ouvert. */
  planEvent: (draft: Draft<typeof EventBody>) => Promise<void>;
  /** Accepte ou décline une invitation. */
  reply: (eventId: string, partstat: "accepted" | "declined") => Promise<void>;
  /** Ouvre le salon à deux avec une personne présente — ou le crée. */
  openDirect: (userId: string) => Promise<void>;
  /** Supprime le salon ouvert (son propriétaire seul), puis ouvre l'accueil. */
  deleteRoom: () => Promise<void>;
  /** Quitte le salon ouvert (pas son propriétaire), puis ouvre l'accueil. */
  leaveRoom: () => Promise<void>;
  /** Exclut un membre du salon ouvert (propriétaire ou modérateur). */
  removeMember: (userId: string) => Promise<void>;
}

// #region chat-notify-client
/**
 * La personne n'est pas sur la page : onglet caché, ou une autre
 * application (une autre fenêtre) au premier plan. Le seul « visible » ne
 * suffit pas — passer sur une autre application laisse souvent la page
 * visible pour le navigateur, sans personne devant.
 */
function isAway(): boolean {
  return document.visibilityState === "hidden" || !document.hasFocus();
}

/** La permission de notifier ; `unsupported` sans l'API (ou hors navigateur). */
function readPermission(): AlertPermission {
  return typeof Notification === "undefined"
    ? "unsupported"
    : Notification.permission;
}

/**
 * Lève une notification du navigateur pour un message (D54), si la règle
 * pure le permet. Une étiquette par salon : trois messages d'affilée
 * REMPLACENT la notification au lieu d'en empiler trois. Un clic ramène à
 * l'onglet, salon ouvert.
 */
function raiseNotification(
  room: IRoomView,
  author: string,
  preview: string,
  open: (roomId: string) => void,
): void {
  const alert = {
    direct: room.peer !== null,
    away: isAway(),
    permission: readPermission(),
  };
  if (!shouldNotify(alert)) return;
  const note = new Notification(author, {
    body: preview,
    tag: `chat:${room.id}`,
  });
  // L'objet vit le temps de la notification : son écouteur part avec lui.
  note.addEventListener(
    "click",
    () => {
      window.focus();
      open(room.id);
      note.close();
    },
    { once: true },
  );
}
// #endregion

/** Le motif d'un refus HTTP : le message du serveur, sinon le statut. */
async function refusalOf(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (typeof body === "object" && body !== null) {
    for (const key of ["message", "error"]) {
      const value: unknown = Reflect.get(body, key);
      if (typeof value === "string" && value !== "") return value;
    }
  }
  return `envoi refusé (${response.status})`;
}

/** Ce que la page dit d'un refus du serveur. */
const REFUSALS: Record<string, string> = {
  forbidden:
    "Ce salon est réservé à ses membres et aux invités d'un événement en cours.",
  unauthorized: "Connectez-vous pour entrer dans ce salon.",
  unavailable: "Le serveur n'a pas pu vérifier vos droits : réessayez.",
};

/**
 * Le chat, par la socket typée du contrat : la liste des salons, et le salon
 * ouvert — ses messages, sa frappe, sa présence.
 *
 * Guide pour un agent : UNE socket pour tous les salons ; ouvrir un salon,
 * c'est s'abonner à SON canal (`chat:room:<id>`) et se désabonner du
 * précédent — la présence suit l'abonnement. Tout est POUSSÉ : la liste des
 * salons se relit quand le canal personnel le dit (`onUser`), un retrait
 * arrive en `realtime:closed` (`evicted`), un refus en `realtime:denied`. À
 * la reconnexion, l'historique du salon est relu et l'abonnement rejoué par
 * la socket. Doc : `@nodefony/realtime/docs/canaux-a-membres.md`.
 */
export function useChat(): IChatRoom {
  const [rooms, setRooms] = useState<IRoomView[]>([]);
  const [roomId, setRoomId] = useState(LOBBY_ROOM_ID);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [presence, setPresence] = useState<IPresenceSnapshot>(EMPTY_PRESENCE);
  const [people, setPeople] = useState<IRosterRow[]>([]);
  const [roomMembers, setRoomMembers] = useState<IRoomMember[] | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [identity, setIdentity] = useState<RealtimeIdentity | null>(null);
  const [state, setState] = useState<RealtimeState>("disconnected");
  const [socket, setSocket] = useState<ChatSocket | null>(null);
  const lastTyping = useRef(0);
  // Le nom d'un salon qui se ferme, pour le dire ; et le salon qu'on QUITTE
  // soi-même, dont l'éjection n'a rien à annoncer.
  const roomsSeen = useRef<IRoomView[]>([]);
  const leaving = useRef<string | null>(null);
  // Relit les membres du salon ouvert ; posé par l'effet du salon.
  const reloadMembers = useRef<(() => void) | null>(null);
  // Le dernier marqueur ENVOYÉ, `<salon>:<message>` : jamais deux fois le même.
  const marked = useRef<string | null>(null);
  const [permission, setPermission] = useState<AlertPermission>(readPermission);
  useEffect(() => {
    roomsSeen.current = rooms;
  }, [rooms]);

  const openRoom = useCallback((id: string) => {
    setNotice(null);
    setRoomId(id);
  }, []);

  // La socket et la liste des salons : une fois pour la page.
  useEffect(() => {
    const created = NodefonySocket.fromContract<ChatContract>({
      url: CHAT_REALTIME_PATH,
    });
    setSocket(created);
    /** Relit la liste ; rend la liste relue, ou `null` sur une coupure. */
    const loadRooms = (): Promise<IRoomView[] | null> =>
      created
        .get("/demo/chat/rooms")
        .then((list) => {
          setRooms(list);
          return list;
        })
        .catch(() => {
          // Coupure entre-temps : la reconnexion relira la liste.
          return null;
        });
    const offs = [
      created.onIdentity(setIdentity),
      created.onState((next) => {
        setState(next);
        if (next === "connected") void loadRooms();
      }),
      // #region chat-rooms-client
      // Ajouté à un salon, retiré, invité : le serveur le POUSSE, on relit.
      // Un message d'un salon qu'on ne regarde pas (D53) : un non-lu de plus,
      // sans requête ; un salon pas encore listé, on relit la liste — elle
      // porte déjà son compte —, PUIS on notifie : le premier message d'une
      // conversation à deux neuve arrive avant qu'elle soit listée, et la
      // notification se perdait (vu au navigateur piloté).
      created.onUser((pushed) => {
        if (pushed.type === "rooms:changed") {
          void loadRooms();
          return;
        }
        const room = roomsSeen.current.find(
          (item) => item.id === pushed.roomId,
        );
        if (room !== undefined) {
          setRooms((known) => addUnread(known, pushed.roomId));
          raiseNotification(room, pushed.author, pushed.preview, openRoom);
          return;
        }
        void loadRooms().then((list) => {
          const fresh = list?.find((item) => item.id === pushed.roomId);
          if (fresh !== undefined)
            raiseNotification(fresh, pushed.author, pushed.preview, openRoom);
        });
      }),
      // #endregion
    ];
    created.connect().catch(() => {
      // Serveur injoignable : l'état le dit, la reconnexion continue en fond.
    });
    return () => {
      for (const off of offs) off();
      created.disconnect();
      setSocket(null);
    };
  }, [openRoom]);

  // #region chat-online-client
  // « En ligne » : une page CONNECTÉE s'y abonne, quel que soit le salon. La
  // socket rejoue l'abonnement à chaque reconnexion ; un anonyme n'y va pas.
  const signedIn = identity?.authenticated === true;
  useEffect(() => {
    if (socket === null || !signedIn) return;
    socket.subscribe(ONLINE_CHANNEL);
    return () => socket.unsubscribe(ONLINE_CHANNEL);
  }, [socket, signedIn]);
  // #endregion

  // Le salon ouvert : son canal, son historique, sa frappe, sa présence.
  useEffect(() => {
    if (socket === null) return;
    const channel = roomChannel(roomId);
    const roster = new RosterTracker();
    let typingTimer: ReturnType<typeof setTimeout> | null = null;
    let markTimer: ReturnType<typeof setTimeout> | null = null;
    let membersTimer: ReturnType<typeof setTimeout> | null = null;
    // Qui regarde : connu si la socket a déjà reçu son accueil.
    let me: string | null =
      socket.identity?.authenticated === true ? socket.identity.id : null;
    let live = true;
    setMessages([]);
    setTyping(null);
    setRefusal(null);
    setPresence(EMPTY_PRESENCE);
    setPeople([]);
    setRoomMembers(null);

    /** Rend le panneau, et se rappelle à l'échéance de la prochaine marque. */
    const draw = () => {
      if (!live) return;
      const now = Date.now();
      setPeople(roster.rows(me, now));
      if (markTimer !== null) clearTimeout(markTimer);
      const next = roster.nextChange(now);
      markTimer = next === null ? null : setTimeout(draw, next + 16);
    };
    /** Demande les noms encore inconnus — seuls les présents sont nommés. */
    const askNames = () => {
      const ids = roster.missingNames();
      if (ids.length === 0) return;
      socket
        .get("/demo/chat/rooms/{room}/people", {
          params: { room: roomId },
          query: { ids: ids.join(",") },
        })
        .then((found) => {
          roster.learn(ids, found);
          draw();
        })
        .catch(() => roster.forget(ids));
    };
    // #region chat-members-client
    // Les membres d'un salon privé : relus à l'ouverture, puis quand une
    // présence bouge — celle du salon ou celle du canal « en ligne ». Une
    // rafale ne fait qu'une requête. Un visiteur anonyme ne les demande pas.
    const loadMembers = () => {
      membersTimer = null;
      if (socket.identity?.authenticated !== true) return;
      socket
        .get("/demo/chat/rooms/{room}/members", { params: { room: roomId } })
        .then((found) => {
          if (live) setRoomMembers(found);
        })
        .catch(() => {
          // Refus ou coupure : la prochaine présence relira.
        });
    };
    const scheduleMembers = () => {
      membersTimer ??= setTimeout(loadMembers, MEMBERS_RELOAD_MS);
    };
    reloadMembers.current = loadMembers;
    // #endregion
    // #region chat-history-client
    // Relu à chaque connexion, APRÈS l'abonnement effectif : un message publié
    // entre la lecture et l'abonnement serait perdu. La page relue se recoupe
    // par `id` avec ce qu'on montrait ; un trou remplace au lieu de fusionner.
    const loadHistory = () => {
      socket
        .whenSubscribed(channel)
        .then(() =>
          socket.get("/demo/chat/rooms/{room}/history", {
            params: { room: roomId },
            query: { limit: HISTORY_SIZE },
          }),
        )
        .then((past) => {
          if (live)
            setMessages((known) => catchUpMessages(known, past, HISTORY_SIZE));
        })
        .catch(() => {
          // Refus, salon quitté ou coupure : le refus du canal le dira.
        });
    };
    // #endregion
    const offs = [
      // #region chat-room-client
      // Le canal du salon porte ses messages ET sa frappe, typés par le contrat.
      socket.on(channel, (frame) => {
        // Ni sa propre frappe, ni celle d'un auteur dont le message vient d'arriver.
        const self = socket.identity?.userIdentifier ?? null;
        setTyping((current) => nextTyping(current, frame, self));
        if (frame.kind === "message") {
          const message = frame.message;
          // Neuf, modifié ou retiré : la version reçue remplace la nôtre.
          setMessages((known) => mergeMessages(known, [message]));
          // Personne devant, compte connecté : un message NEUF d'un autre
          // attend d'être lu (D53) — le serveur ne l'alerte pas, on est abonné.
          if (
            me !== null &&
            isAway() &&
            message.editedAt === undefined &&
            message.retracted === undefined &&
            message.author !== self
          ) {
            setRooms((known) => addUnread(known, roomId));
            const room = roomsSeen.current.find((item) => item.id === roomId);
            if (room !== undefined)
              raiseNotification(
                room,
                message.author,
                messagePreview(message),
                openRoom,
              );
          }
          return;
        }
        if (frame.kind === "reactions") {
          setMessages((known) =>
            withReactions(known, frame.messageId, frame.reactions),
          );
          return;
        }
        if (frame.author === self) return;
        if (typingTimer !== null) clearTimeout(typingTimer);
        typingTimer = setTimeout(() => setTyping(null), TYPING_DISPLAY_MS);
      }),
      // #endregion
      // #region chat-presence-client
      // Qui est là : la vue du salon, puis les noms demandés à l'annuaire.
      socket.onPresence(channel, (snapshot) => {
        setPresence(snapshot);
        roster.observe(snapshot.members, snapshot.partial, Date.now());
        draw();
        askNames();
        scheduleMembers();
      }),
      // #endregion
      socket.onPresence(ONLINE_CHANNEL, scheduleMembers),
      socket.onIdentity((who) => {
        me = who?.authenticated === true ? who.id : null;
        draw();
      }),
      socket.onDenied((denied) => {
        if (denied.channel === channel)
          setRefusal(REFUSALS[denied.reason] ?? "Ce salon vous est fermé.");
      }),
      socket.onClosed((closed) => {
        if (closed.channel !== channel) return;
        // Le salon a disparu (`ended`), ou l'on n'en est plus (`evicted`) :
        // rien à y regarder. Retour à l'accueil, et le motif le dit — en
        // NOMMANT le salon, sinon « ce salon » se lit sous l'en-tête de l'accueil.
        if (leaving.current === roomId) leaving.current = null;
        else {
          const name =
            roomsSeen.current.find((item) => item.id === roomId)?.name ??
            roomId;
          setNotice(
            closed.reason === "ended"
              ? `Le salon « ${name} » a été supprimé. Retour à l'accueil.`
              : `Vous n'êtes plus membre de « ${name} ». Retour à l'accueil.`,
          );
        }
        setRooms((known) => known.filter((item) => item.id !== roomId));
        setRoomId(LOBBY_ROOM_ID);
      }),
      socket.onState((next) => {
        if (next !== "connected") return;
        loadHistory();
        loadMembers();
      }),
    ];
    socket.subscribe(channel);
    if (socket.state === "connected") {
      loadHistory();
      loadMembers();
    }
    return () => {
      live = false;
      if (reloadMembers.current === loadMembers) reloadMembers.current = null;
      for (const off of offs) off();
      if (typingTimer !== null) clearTimeout(typingTimer);
      if (markTimer !== null) clearTimeout(markTimer);
      if (membersTimer !== null) clearTimeout(membersTimer);
      socket.unsubscribe(channel);
    };
  }, [socket, roomId, openRoom]);

  // #region chat-read-client
  // Lu (D52) : le dernier message du salon ouvert, resté affiché page VISIBLE
  // ET au premier plan, pour un compte connecté. Le serveur ne recule jamais le marqueur ; la
  // pastille du salon tombe à zéro tout de suite.
  const newest = messages.at(-1)?.id ?? null;
  useEffect(() => {
    if (socket === null || !signedIn || newest === null) return;
    const key = `${roomId}:${newest}`;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const markLater = () => {
      if (timer !== null || marked.current === key) return;
      if (isAway()) return;
      timer = setTimeout(() => {
        timer = null;
        // Partie entre-temps : le retour au premier plan réarmera.
        if (isAway()) return;
        marked.current = key;
        setRooms((known) => withUnread(known, roomId, 0));
        socket
          .put("/demo/chat/rooms/{room}/messages/{message}/read", undefined, {
            params: { room: roomId, message: newest },
          })
          .catch(() => {
            // Coupure ou salon quitté : le prochain message redira où on en est.
            if (marked.current === key) marked.current = null;
          });
      }, READ_DELAY_MS);
    };
    markLater();
    document.addEventListener("visibilitychange", markLater);
    window.addEventListener("focus", markLater);
    return () => {
      document.removeEventListener("visibilitychange", markLater);
      window.removeEventListener("focus", markLater);
      if (timer !== null) clearTimeout(timer);
    };
  }, [socket, signedIn, roomId, newest]);
  // #endregion

  const send = useCallback(
    async (
      text: string,
      files: readonly File[] = [],
      replyTo: string | null = null,
    ) => {
      if (files.length > 0) return sendWithFiles(roomId, text, files, replyTo);
      // #region chat-send-client
      // Le texte seul : l'auteur, c'est le serveur qui le pose d'après la session.
      if (socket === null) throw new Error("socket fermée");
      await socket.post(
        "/demo/chat/rooms/{room}/send",
        replyTo === null ? { text } : { text, replyTo },
        { params: { room: roomId } },
      );
      // #endregion
    },
    [socket, roomId],
  );

  // #region chat-typing-client
  // Un signal SANS corps, au plus toutes les deux secondes : l'auteur vient
  // de la connexion, et le signal ne quitte pas le salon.
  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (socket === null || now - lastTyping.current < TYPING_THROTTLE_MS)
      return;
    lastTyping.current = now;
    socket
      .post("/demo/chat/rooms/{room}/typing", undefined, {
        params: { room: roomId },
      })
      .catch(() => {
        // Un signal perdu ne se rattrape pas : le prochain le remplace.
      });
  }, [socket, roomId]);
  // #endregion

  // #region rooms-forms-client
  // Un formulaire = une route du contrat, par la socket déjà ouverte. Un salon
  // créé ou ouvert à deux entre AUSSITÔT dans la liste ; le reste arrive par
  // le canal personnel (`onUser`), chez soi comme chez l'invité.
  const forms = useMemo<IRoomForms>(() => {
    const open = (room: IRoomView) => {
      setRooms((known) =>
        known.some((item) => item.id === room.id) ? known : [...known, room],
      );
      setRoomId(room.id);
    };
    const live = () => {
      if (socket === null) throw new Error("socket fermée");
      return socket;
    };
    return {
      createRoom: async (draft) =>
        open(await live().post("/demo/chat/rooms", draft)),
      invite: async (draft) => {
        await live().post("/demo/chat/rooms/{room}/members", draft, {
          params: { room: roomId },
        });
        reloadMembers.current?.();
      },
      planEvent: async (draft) => {
        await live().post("/demo/chat/rooms/{room}/events", draft, {
          params: { room: roomId },
        });
      },
      reply: async (eventId, partstat) => {
        await live().post(
          "/demo/chat/events/{event}/reply",
          { partstat },
          { params: { event: eventId } },
        );
      },
      openDirect: async (userId) =>
        open(
          await live().post("/demo/chat/direct/{user}", undefined, {
            params: { user: userId },
          }),
        ),
      deleteRoom: async () => {
        const gone = roomId;
        await live().delete("/demo/chat/rooms/{room}", undefined, {
          params: { room: gone },
        });
        setRooms((known) => known.filter((item) => item.id !== gone));
        setRoomId(LOBBY_ROOM_ID);
      },
      // #region rooms-leave-client
      // Quitter = se retirer soi-même : la route d'exclusion, avec SON id.
      leaveRoom: async () => {
        const me = live().identity;
        if (me?.authenticated !== true || me.id === null)
          throw new Error("connexion requise");
        const gone = roomId;
        leaving.current = gone;
        try {
          await live().delete(
            "/demo/chat/rooms/{room}/members/{user}",
            undefined,
            { params: { room: gone, user: me.id } },
          );
        } catch (error) {
          leaving.current = null;
          throw error;
        }
        setRooms((known) => known.filter((item) => item.id !== gone));
        setRoomId(LOBBY_ROOM_ID);
      },
      // #endregion
      // Exclure : la MÊME route, avec l'identifiant d'un autre. Le serveur
      // relit les rôles en base ; l'exclu reçoit `evicted` sur tous ses onglets.
      removeMember: async (userId) => {
        await live().delete(
          "/demo/chat/rooms/{room}/members/{user}",
          undefined,
          { params: { room: roomId, user: userId } },
        );
        reloadMembers.current?.();
      },
    };
  }, [socket, roomId]);
  // #endregion

  // La permission ne se demande qu'après un GESTE : les navigateurs ignorent,
  // ou bloquent pour de bon, une demande faite au chargement de la page.
  const enableAlerts = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    setPermission(await Notification.requestPermission());
  }, []);
  const alerts = useMemo(
    () => ({ permission, enable: enableAlerts }),
    [permission, enableAlerts],
  );

  // #region chat-gestures-client
  // Modifier, retirer, réagir : une route chacun, par la socket déjà ouverte.
  // L'écran ne bouge qu'à l'annonce du salon — chez soi comme chez les autres.
  const gestures = useMemo<IMessageGestures>(() => {
    const live = () => {
      if (socket === null) throw new Error("socket fermée");
      return socket;
    };
    const params = (messageId: string) => ({
      params: { room: roomId, message: messageId },
    });
    return {
      edit: async (messageId, text) => {
        await live().patch(
          "/demo/chat/rooms/{room}/messages/{message}",
          { text },
          params(messageId),
        );
      },
      retract: async (messageId) => {
        await live().delete(
          "/demo/chat/rooms/{room}/messages/{message}",
          undefined,
          params(messageId),
        );
      },
      react: async (messageId, emojis) => {
        await live().put(
          "/demo/chat/rooms/{room}/messages/{message}/reactions",
          { emojis: [...emojis] },
          params(messageId),
        );
      },
    };
  }, [socket, roomId]);
  // #endregion

  // Les lignes du panneau des membres : la règle pure (`memberRows`), avec la
  // présence du salon poussée en direct — « dans le salon » sans requête.
  const me = identity?.authenticated === true ? identity.id : null;
  const current = rooms.find((item) => item.id === roomId) ?? null;
  const members = useMemo(() => {
    if (roomMembers === null || roomMembers.length === 0 || current === null)
      return null;
    return memberRows(
      roomMembers,
      presence.members,
      me,
      { id: current.id, direct: current.peer !== null },
      current.role,
    );
  }, [roomMembers, presence.members, me, current]);

  return {
    rooms,
    roomId,
    openRoom,
    messages,
    typing,
    presence,
    people,
    members,
    refusal,
    notice,
    identity,
    state,
    send,
    gestures,
    notifyTyping,
    forms,
    alerts,
  };
}

// #region chat-attach-client
/**
 * Un message AVEC pièces : un `POST` multipart ordinaire, la session suit par
 * le cookie. La clé d'idempotence est tirée par INTENTION d'envoi. Et rien
 * d'autre : le message reviendra par le salon, comme chez tout le monde — un
 * seul chemin met l'écran à jour.
 */
async function sendWithFiles(
  roomId: string,
  text: string,
  files: readonly File[],
  replyTo: string | null,
): Promise<void> {
  const form = new FormData();
  form.append("text", text);
  if (replyTo !== null) form.append("replyTo", replyTo);
  for (const file of files) form.append("file", file, file.name);
  const response = await fetch(
    CHAT_ATTACH_PATH.replace("{room}", encodeURIComponent(roomId)),
    {
      method: "POST",
      body: form,
      credentials: "same-origin",
      headers: { "Idempotency-Key": crypto.randomUUID() },
    },
  );
  if (!response.ok) throw new Error(await refusalOf(response));
}
// #endregion
