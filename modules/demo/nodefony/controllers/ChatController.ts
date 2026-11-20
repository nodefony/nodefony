import { Inject } from "nodefony";
import type { ContractRouteSchemas } from "nodefony";
import {
  contentDisposition,
  controller,
  route,
  Idempotent,
  IsGranted,
  Param,
} from "@nodefony/framework";
import type { RouteInput } from "@nodefony/framework";
import {
  ContractRealtimeController,
  RealtimeBroadcast,
  RealtimeChannel,
} from "@nodefony/realtime";
import { HttpError } from "@nodefony/http";
import type { ContextType } from "@nodefony/http";
import {
  AttachBody,
  CreateRoomBody,
  EditBody,
  EventBody,
  EventParams,
  HistoryQuery,
  InviteBody,
  LinkParams,
  MemberParams,
  MessageParams,
  PeopleQuery,
  ReactBody,
  ReplyBody,
  RoomParams,
  SendBody,
  UserParams,
} from "../../frontend/src/chat/chatSchemas";
import { attachmentProblem } from "../../frontend/src/chat/attachments";
import {
  PRESENCE_GRACE_MS,
  type ChatContract,
  type ChatLinkPreview,
  type ChatMessage,
  type ChatPerson,
  type ChatReaction,
} from "../../frontend/src/chat/chatContract";
import {
  ONLINE_CHANNEL,
  ROOM_CHANNEL_PATTERN,
  admissionOf,
  type IRoomEvent,
  type IRoomMember,
  type IRoomView,
} from "../../frontend/src/chat/rooms";
import type { ChatQuota } from "../service/ChatService";
import type ChatService from "../service/ChatService";
import type RoomService from "../service/RoomService";
import {
  LinkPreviewRefusal,
  type LinkPreviewRefusalReason,
} from "../service/LinkPreviewService";
import type LinkPreviewService from "../service/LinkPreviewService";
import { RoomRefusal, type RoomRefusalReason } from "../service/RoomService";
import RoomAdmission from "../service/RoomAdmission";

/** Une route qui vise un message : `/demo/chat/rooms/{room}/messages/{message}`. */
type MessageInput<S extends object = object> = RouteInput<
  { params: typeof MessageParams } & S
>;

/** Une route qui vise un salon : `/demo/chat/rooms/{room}/…`. */
type RoomInput<S extends object = object> = RouteInput<
  { params: typeof RoomParams } & S
>;

/**
 * Les salons du chat — UN contrôleur, deux transports : chaque action répond
 * en HTTP ET par la socket (`/demo/chat/realtime`), sous la même sécurité.
 *
 * Guide pour un agent :
 *  • un SALON = un canal `chat:room:<id>` ; qui y entre est décidé par la
 *    règle des salons (`frontend/src/chat/rooms.ts`, `admissionOf`), lue en
 *    base par `RoomAdmission` pour la socket et par `#admitted` pour les
 *    routes — la MÊME règle, quel que soit le chemin ;
 *  • LIRE un salon public est libre, ÉCRIRE exige une session (`@IsGranted`)
 *    ET d'être admis ; l'auteur vient de `this.user`, jamais d'un champ du
 *    client ;
 *  • corps, queries et paramètres sont VALIDÉS avant l'action (`schema`), par
 *    les schémas partagés de `frontend/src/chat/chatSchemas.ts` ;
 *  • l'historique vit dans `ChatService`, les salons dans `RoomService`, les
 *    aperçus de lien dans `LinkPreviewService` (un contrôleur temps réel est
 *    instancié par connexion) ;
 *  • `@RealtimeBroadcast("chat:")` fait traverser chaque salon d'un serveur à
 *    l'autre (plusieurs pods, `nodefony cluster`) — les TRAMES, pas l'état ;
 *  • la démo tient sur UN pod : sa base est un fichier SQLite local
 *    (`demoDrizzleOverride`), ses pièces vivent sur le disque et dans la
 *    mémoire du processus qui les a reçues (`ChatService`). SQLite n'est pas
 *    le bon mode pour plusieurs pods : une base partagée (PostgreSQL, MySQL)
 *    et un stockage de fichiers partagé le sont.
 * Doc : `@nodefony/realtime/docs/canaux-a-membres.md` ; générer l'équivalent :
 * `npx nodefony create controller chat --kind realtime` ; skill livré :
 * `nodefony-add-realtime-channel`.
 *
 * Les blocs `// #region <nom>` sont CITÉS par la page d'apprentissage
 * (`frontend/src/chat/chatTabs.ts`) : les renommer casse son test.
 */
// #region chat-broadcast
// Plusieurs pods : chaque publication sur un canal `chat:` traverse le bus.
@RealtimeBroadcast("chat:")
// #endregion
// #region chat-class
// Préfixe de toutes les routes de la classe.
@controller("/demo/chat")
// Le contrat typé : les canaux et les routes que le navigateur compile aussi.
class ChatController extends ContractRealtimeController<ChatContract> {
  // #endregion
  // #region chat-routes
  /**
   * Les VALEURS des routes du contrat — le schéma même que chaque route valide.
   * Vérifiées au démarrage : une route du contrat sans action ne démarre pas.
   */
  static readonly serverRoutes = {
    "GET /demo/chat/rooms": {},
    "POST /demo/chat/rooms/{room}/send": { params: RoomParams, body: SendBody },
    "POST /demo/chat/rooms/{room}/typing": { params: RoomParams },
    "GET /demo/chat/rooms/{room}/history": {
      params: RoomParams,
      query: HistoryQuery,
    },
    "GET /demo/chat/rooms/{room}/people": {
      params: RoomParams,
      query: PeopleQuery,
    },
    "POST /demo/chat/rooms": { body: CreateRoomBody },
    "DELETE /demo/chat/rooms/{room}": { params: RoomParams },
    "GET /demo/chat/rooms/{room}/members": { params: RoomParams },
    "POST /demo/chat/rooms/{room}/members": {
      params: RoomParams,
      body: InviteBody,
    },
    "DELETE /demo/chat/rooms/{room}/members/{user}": { params: MemberParams },
    "POST /demo/chat/rooms/{room}/events": {
      params: RoomParams,
      body: EventBody,
    },
    "POST /demo/chat/events/{event}/reply": {
      params: EventParams,
      body: ReplyBody,
    },
    "POST /demo/chat/direct/{user}": { params: UserParams },
    "PATCH /demo/chat/rooms/{room}/messages/{message}": {
      params: MessageParams,
      body: EditBody,
    },
    "DELETE /demo/chat/rooms/{room}/messages/{message}": {
      params: MessageParams,
    },
    "PUT /demo/chat/rooms/{room}/messages/{message}/read": {
      params: MessageParams,
    },
    "PUT /demo/chat/rooms/{room}/messages/{message}/reactions": {
      params: MessageParams,
      body: ReactBody,
    },
    "GET /demo/chat/rooms/{room}/messages/{message}/links/{index}": {
      params: LinkParams,
    },
  } satisfies ContractRouteSchemas<ChatContract>;
  // #endregion

  // #region chat-inject
  /**
   * Les services arrivent par leur NOM (`@Inject("ChatService")`) : le
   * contrôleur, recréé à chaque connexion, ne garde rien ; l'historique et
   * les salons vivent dans des services, uniques pour toute l'application.
   */
  constructor(
    context: ContextType,
    @Inject("ChatService") private readonly chat: ChatService,
    @Inject("RoomService") private readonly rooms: RoomService,
    @Inject("LinkPreviewService") private readonly links: LinkPreviewService,
  ) {
    super("chat", context);
  }
  // #endregion

  // #region chat-door
  /** Ouvre le pont : les actions ci-dessous deviennent joignables par la socket. */
  protected override realtimeApiRequest(): boolean {
    return true;
  }

  /** La porte WebSocket : `handleRealtime` porte tout le protocole. */
  @route("demo-chat-realtime", {
    path: "/realtime",
    requirements: { methods: ["WEBSOCKET"] },
  })
  async realtime(message: string | Uint8Array | null): Promise<void> {
    this.handleRealtime(message);
  }
  // #endregion

  // #region chat-admitted
  /**
   * La garde des routes d'un salon — la MÊME règle que le canal : un salon
   * inconnu répond 404, un salon où l'on n'entre pas répond 403.
   */
  async #admitted(roomId: string): Promise<void> {
    const facts = await this.rooms.admissionFacts(
      roomId,
      this.user?.id ?? null,
    );
    if (facts.room === null) throw new HttpError("salon introuvable", 404);
    if (admissionOf(facts, Date.now()) === "refused")
      throw new HttpError("ce salon est réservé à ses membres", 403);
  }
  // #endregion

  // #region chat-rooms
  /** Les salons que je vois : publics, les miens, ceux où l'on m'invite. */
  @route("demo-chat-rooms", {
    path: "/rooms",
    requirements: { methods: ["GET", "WEBSOCKET"] },
  })
  roomList(): Promise<IRoomView[]> {
    return this.rooms.roomsFor(this.user?.id ?? null, Date.now());
  }
  // #endregion

  /** La personne connectée — `@IsGranted` l'a déjà exigée. */
  #me(): { id: string; identifier: string } {
    const me = this.user;
    if (me === null) throw new HttpError("connexion requise", 401);
    return me;
  }

  // #region chat-quota
  /**
   * La personne connectée, son geste COMPTÉ : au-delà de son quota
   * (`ChatService.spend`), 429 + `Retry-After` — avant toute lecture en base.
   * Le quota se tient sur le COMPTE : une seconde socket, un second onglet ne
   * le multiplient pas.
   */
  #writer(kind: ChatQuota = "write"): { id: string; identifier: string } {
    const me = this.#me();
    const wait = this.chat.spend(kind, me.id);
    if (wait === 0) return me;
    this.response?.setHeader("Retry-After", String(wait));
    throw new HttpError(`trop d'écritures : réessaie dans ${wait} s`, 429);
  }
  // #endregion

  // #region rooms-refused
  /**
   * Un geste du service, son refus traduit en statut, avec le message que la
   * page affiche sous le champ fautif. La seule traduction : `RoomService`
   * dit POURQUOI, le contrôleur dit COMMENT.
   */
  async #refused<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (error instanceof RoomRefusal)
        throw new HttpError(error.message, statusOf(error.reason));
      throw error;
    }
  }
  // #endregion

  // #region rooms-create-route
  /**
   * Créer un salon — `POST /demo/chat/rooms` ou `socket.post(…)`. Le nom
   * arrive validé ET normalisé (`CreateRoomBody`) ; la session en devient
   * propriétaire. `@Idempotent()` : un double clic ne crée qu'un salon.
   */
  @route("demo-chat-room-create", {
    path: "/rooms",
    requirements: { methods: ["POST", "WEBSOCKET"] },
    schema: { body: CreateRoomBody },
  })
  @IsGranted(["ROLE_USER"])
  @Idempotent()
  createRoom(
    input: RouteInput<{ body: typeof CreateRoomBody }>,
  ): Promise<IRoomView> {
    const me = this.#writer();
    return this.#refused(() => this.rooms.createRoom(me.id, input.body));
  }
  // #endregion

  // #region rooms-delete-route
  /**
   * Supprimer un salon — `DELETE /demo/chat/rooms/{room}` ou
   * `socket.delete(…)` : son propriétaire seul. La base efface tout, ferme
   * le canal pour ses présents ; les pièces quittent le disque ici.
   */
  @route("demo-chat-room-delete", {
    path: "/rooms/{room}",
    requirements: { methods: ["DELETE", "WEBSOCKET"] },
    schema: { params: RoomParams },
  })
  @IsGranted(["ROLE_USER"])
  async deleteRoom(input: RoomInput): Promise<{ ok: true }> {
    const me = this.#writer();
    const attachments = await this.#refused(() =>
      this.rooms.deleteRoom(input.params.room, me.id),
    );
    await this.chat.dropAttachments(attachments);
    return { ok: true };
  }
  // #endregion

  // #region rooms-remove-route
  /**
   * Quitter ou exclure — `DELETE …/rooms/{room}/members/{user}` ou
   * `socket.delete(…)`. `{user}` est l'identifiant STABLE du compte : le
   * sien pour quitter, celui d'un autre pour l'exclure. Les rôles sont relus
   * EN BASE ; l'exclu est désabonné sur tous les serveurs, sa page reçoit
   * `realtime:closed` (`evicted`) et un nouvel abonnement lui est refusé.
   */
  @route("demo-chat-room-member-remove", {
    path: "/rooms/{room}/members/{user}",
    requirements: { methods: ["DELETE", "WEBSOCKET"] },
    schema: { params: MemberParams },
  })
  @IsGranted(["ROLE_USER"])
  async removeMember(
    input: RouteInput<{ params: typeof MemberParams }>,
  ): Promise<{ ok: true }> {
    const me = this.#writer();
    await this.#refused(() =>
      this.rooms.removeMember(input.params.room, me.id, input.params.user),
    );
    return { ok: true };
  }
  // #endregion

  // #region rooms-invite-route
  /**
   * Inviter — `POST …/rooms/{room}/members`. Le rôle de qui invite est relu
   * EN BASE (le bouton caché par la page ne protège rien) : 403 sinon.
   */
  @route("demo-chat-room-invite", {
    path: "/rooms/{room}/members",
    requirements: { methods: ["POST", "WEBSOCKET"] },
    schema: { params: RoomParams, body: InviteBody },
  })
  @IsGranted(["ROLE_USER"])
  async invite(
    input: RoomInput<{ body: typeof InviteBody }>,
  ): Promise<{ ok: true }> {
    const me = this.#writer();
    await this.#refused(() =>
      this.rooms.invite(
        input.params.room,
        me.id,
        input.body.identifier,
        input.body.role,
      ),
    );
    return { ok: true };
  }
  // #endregion

  /** Planifier un événement — `POST …/rooms/{room}/events`. */
  @route("demo-chat-room-event", {
    path: "/rooms/{room}/events",
    requirements: { methods: ["POST", "WEBSOCKET"] },
    schema: { params: RoomParams, body: EventBody },
  })
  @IsGranted(["ROLE_USER"])
  @Idempotent()
  planEvent(input: RoomInput<{ body: typeof EventBody }>): Promise<IRoomEvent> {
    const me = this.#writer();
    return this.#refused(() =>
      this.rooms.planEvent(input.params.room, me.id, input.body),
    );
  }

  /** Accepter ou décliner une invitation — `POST /demo/chat/events/{event}/reply`. */
  @route("demo-chat-event-reply", {
    path: "/events/{event}/reply",
    requirements: { methods: ["POST", "WEBSOCKET"] },
    schema: { params: EventParams, body: ReplyBody },
  })
  @IsGranted(["ROLE_USER"])
  async reply(
    input: RouteInput<{
      params: typeof EventParams;
      body: typeof ReplyBody;
    }>,
  ): Promise<{ ok: true }> {
    const me = this.#writer();
    await this.#refused(() =>
      this.rooms.reply(input.params.event, me.id, input.body.partstat),
    );
    return { ok: true };
  }

  // #region rooms-direct-route
  /**
   * Écrire en privé — `POST /demo/chat/direct/{user}` : rend le salon à deux,
   * existant ou neuf. Sans corps, et sans `@Idempotent()` : l'opération l'est
   * par construction (un `upsert` sur le nom de la paire).
   */
  @route("demo-chat-direct", {
    path: "/direct/{user}",
    requirements: { methods: ["POST", "WEBSOCKET"] },
    schema: { params: UserParams },
  })
  @IsGranted(["ROLE_USER"])
  openDirect(
    input: RouteInput<{ params: typeof UserParams }>,
  ): Promise<IRoomView> {
    const me = this.#writer();
    return this.#refused(() => this.rooms.openDirect(me, input.params.user));
  }
  // #endregion

  // #region chat-history
  /** L'historique d'un salon — `GET …/history` ou `socket.get(…)`. */
  @route("demo-chat-history", {
    path: "/rooms/{room}/history",
    requirements: { methods: ["GET", "WEBSOCKET"] },
    schema: { params: RoomParams, query: HistoryQuery },
  })
  async history(
    input: RoomInput<{ query: typeof HistoryQuery }>,
  ): Promise<ChatMessage[]> {
    await this.#admitted(input.params.room);
    return this.chat.recent(input.params.room, input.query.limit);
  }

  // #region chat-link-route
  /**
   * L'aperçu d'un lien d'un message — `GET …/messages/{message}/links/{index}`.
   * Jamais une adresse : le lien de rang `index` du message, relu en base,
   * dans un salon où l'on entre (404 si le message n'est pas de ce salon ou
   * n'a pas ce lien). L'issue de la lecture du site tiers est une DONNÉE (200) ;
   * au-delà de 30 aperçus par minute et par compte (par adresse pour un anonyme) : 429 + `Retry-After`.
   */
  @route("demo-chat-link", {
    path: "/rooms/{room}/messages/{message}/links/{index}",
    requirements: { methods: ["GET", "WEBSOCKET"] },
    schema: { params: LinkParams },
  })
  async link(
    input: RouteInput<{ params: typeof LinkParams }>,
  ): Promise<ChatLinkPreview> {
    await this.#admitted(input.params.room);
    try {
      // Le quota se tient sur le COMPTE, sinon sur l'adresse (proxy de
      // confiance compris) — jamais sur la session : un anonyme en change en
      // ne renvoyant pas son cookie.
      return await this.links.preview(
        this.user?.id ?? this.context?.remoteAddress ?? "anonymous",
        input.params.room,
        input.params.message,
        input.params.index,
      );
    } catch (error) {
      if (!(error instanceof LinkPreviewRefusal)) throw error;
      if (error.reason === "rate-limited")
        this.response?.setHeader("Retry-After", String(error.retryAfterS));
      throw new HttpError(error.message, linkStatusOf(error.reason));
    }
  }
  // #endregion
  // #endregion

  // #region chat-send
  /**
   * L'envoi — `POST …/send` ou `socket.post(…)`. Sans session : 403 (le
   * visiteur anonyme n'a aucun rôle), avant d'entrer ici. La socket pose une
   * clé d'idempotence par appel : `@Idempotent()` rend la réponse déjà
   * calculée à une trame rejouée, au lieu de publier deux fois.
   */
  @route("demo-chat-send", {
    path: "/rooms/{room}/send",
    requirements: { methods: ["POST", "WEBSOCKET"] },
    schema: { params: RoomParams, body: SendBody },
  })
  @IsGranted(["ROLE_USER"])
  @Idempotent()
  async send(
    input: RoomInput<{ body: typeof SendBody }>,
  ): Promise<{ id: string; sentAt: number }> {
    const me = this.#writer();
    await this.#admitted(input.params.room);
    const { id, sentAt } = await this.#refused(() =>
      this.chat.publish(input.params.room, {
        authorId: me.id,
        author: me.identifier,
        text: input.body.text,
        ...(input.body.replyTo === undefined
          ? {}
          : { replyTo: input.body.replyTo }),
      }),
    );
    return { id, sentAt };
  }
  // #endregion

  // #region chat-message-gestures
  /**
   * Modifier un message — `PATCH …/messages/{message}` (XEP-0308). Son auteur
   * seul : l'identité vient de la session, la règle de `RoomService`. Le
   * message ENTIER repart sur le salon.
   */
  @route("demo-chat-edit", {
    path: "/rooms/{room}/messages/{message}",
    requirements: { methods: ["PATCH", "WEBSOCKET"] },
    schema: { params: MessageParams, body: EditBody },
  })
  @IsGranted(["ROLE_USER"])
  async edit(
    input: MessageInput<{ body: typeof EditBody }>,
  ): Promise<{ editedAt: number }> {
    const me = this.#writer();
    await this.#admitted(input.params.room);
    const message = await this.#refused(() =>
      this.chat.edit(
        input.params.room,
        input.params.message,
        me.id,
        input.body.text,
      ),
    );
    return { editedAt: message.editedAt ?? Date.now() };
  }

  /**
   * Retirer un message — `DELETE …/messages/{message}` (XEP-0424) : son
   * auteur, ou le propriétaire ou un modérateur du salon (XEP-0425). Rejoué,
   * il répond 404 : le message est déjà retiré.
   */
  @route("demo-chat-retract", {
    path: "/rooms/{room}/messages/{message}",
    requirements: { methods: ["DELETE", "WEBSOCKET"] },
    schema: { params: MessageParams },
  })
  @IsGranted(["ROLE_USER"])
  async retract(input: MessageInput): Promise<{ ok: true }> {
    const me = this.#writer();
    await this.#admitted(input.params.room);
    await this.#refused(() =>
      this.chat.retract(input.params.room, input.params.message, me.id),
    );
    return { ok: true };
  }

  // #region chat-read
  /**
   * Lu — `PUT …/messages/{message}/read` (D52) : mon marqueur de lecture
   * avance jusqu'à ce message. Rejoué, ou en retard sur un autre onglet, il
   * ne change rien : le marqueur ne recule jamais, d'où le `PUT`. Réservé
   * aux connectés admis dans le salon.
   */
  @route("demo-chat-read", {
    path: "/rooms/{room}/messages/{message}/read",
    requirements: { methods: ["PUT", "WEBSOCKET"] },
    schema: { params: MessageParams },
  })
  @IsGranted(["ROLE_USER"])
  async markRead(input: MessageInput): Promise<{ ok: true }> {
    const me = this.#me();
    await this.#admitted(input.params.room);
    await this.#refused(() =>
      this.rooms.markRead(input.params.room, me.id, input.params.message),
    );
    return { ok: true };
  }
  // #endregion

  /**
   * Réagir — `PUT …/messages/{message}/reactions` (XEP-0444) : le corps est
   * l'ensemble ENTIER de mes réactions sur ce message, qui remplace le
   * précédent. Rejoué, il rend le même état : un `PUT` est idempotent par
   * nature.
   */
  @route("demo-chat-react", {
    path: "/rooms/{room}/messages/{message}/reactions",
    requirements: { methods: ["PUT", "WEBSOCKET"] },
    schema: { params: MessageParams, body: ReactBody },
  })
  @IsGranted(["ROLE_USER"])
  async react(
    input: MessageInput<{ body: typeof ReactBody }>,
  ): Promise<ChatReaction[]> {
    const me = this.#writer();
    await this.#admitted(input.params.room);
    return this.#refused(() =>
      this.chat.react(
        input.params.room,
        input.params.message,
        { id: me.id, name: me.identifier },
        input.body.emojis,
      ),
    );
  }
  // #endregion

  // #region chat-attach
  /**
   * Un message AVEC des pièces — `POST …/attachments`, multipart : le champ
   * `text` et jusqu'à cinq fichiers. HTTP SEULEMENT : des octets en volume
   * voyagent en flux jusqu'au disque, jamais dans une trame de socket. Le
   * message part sur le salon comme tout autre. `@Idempotent()` exige
   * l'en-tête `Idempotency-Key` : un formulaire d'un autre site ne sait pas le
   * poser, l'envoi forgé s'arrête là.
   */
  @route("demo-chat-attach", {
    path: "/rooms/{room}/attachments",
    requirements: { methods: ["POST"] },
    schema: { params: RoomParams, body: AttachBody },
  })
  @IsGranted(["ROLE_USER"])
  @Idempotent()
  async attach(
    input: RoomInput<{ body: typeof AttachBody }>,
  ): Promise<{ id: string; sentAt: number }> {
    const files = this.files;
    let me: { id: string; identifier: string };
    try {
      me = this.#writer();
      await this.#admitted(input.params.room);
    } catch (refusal) {
      await this.chat.discard(files);
      throw refusal;
    }
    // Les règles de la page, REJOUÉES ici : le navigateur n'est jamais cru.
    const problem = attachmentProblem(
      input.body.text,
      files.map((file) => ({ name: file.filename, size: file.size })),
    );
    if (problem !== null) {
      await this.chat.discard(files);
      throw new HttpError(problem, files.length === 0 ? 400 : 413);
    }
    const attachments = await this.chat.saveAttachments(
      input.params.room,
      me.id,
      files,
    );
    try {
      const { id, sentAt } = await this.#refused(() =>
        this.chat.publish(input.params.room, {
          authorId: me.id,
          author: me.identifier,
          text: input.body.text,
          attachments,
          ...(input.body.replyTo === undefined
            ? {}
            : { replyTo: input.body.replyTo }),
        }),
      );
      return { id, sentAt };
    } catch (refusal) {
      // Réponse à un message d'ailleurs : les pièces reçues ne restent pas.
      await this.chat.dropAttachments(attachments);
      throw refusal;
    }
  }
  // #endregion

  // #region chat-file
  /**
   * Une pièce — `GET /demo/chat/files/<id>`. Son adresse est un identifiant
   * tiré au hasard par le serveur, impossible à deviner. Le type servi vient
   * des OCTETS : seules les images reconnues et les PDF s'affichent, tout le
   * reste se télécharge ; `nosniff` interdit au navigateur de deviner,
   * `sandbox` désarme un document ouvert dans un onglet. Un PDF fait
   * exception à `sandbox` : Chrome refuse d'afficher un PDF sous `sandbox`.
   * Sa visionneuse est isolée de la page, et il ne s'encadre que par une page
   * de l'application (`frame-ancestors 'self'`).
   *
   * L'identifiant ne suffit pas : la pièce appartient à un salon, et la servir
   * passe par la MÊME garde que lire son historique. Un éjecté, ou un lien
   * recopié hors d'un salon privé, reçoit 403 ; un salon supprimé a déjà
   * effacé ses pièces (404).
   */
  @route("demo-chat-file", {
    path: "/files/{id}",
    requirements: { methods: ["GET"] },
  })
  async file(@Param("id") id: string): Promise<void> {
    const stored = this.chat.attachment(id);
    if (stored === undefined)
      throw new HttpError("pièce introuvable, ou sortie du stockage", 404);
    await this.#admitted(stored.roomId);
    const pdf = stored.meta.kind === "pdf";
    const inline = pdf || stored.meta.kind === "image";
    await this.streamFile(stored.file, {
      "Content-Type": stored.mime,
      "Content-Disposition": contentDisposition(
        inline ? "inline" : "attachment",
        stored.meta.name,
      ),
      "X-Content-Type-Options": "nosniff",
      ...(pdf
        ? {
            "Content-Security-Policy": "frame-ancestors 'self'",
            "X-Frame-Options": "SAMEORIGIN",
          }
        : { "Content-Security-Policy": "sandbox" }),
    });
  }
  // #endregion

  // #region chat-people-route
  /**
   * L'annuaire d'un salon — `GET …/people?ids=…`. La page reçoit des
   * identités opaques par la présence ; elle demande ici leurs noms, et seuls
   * les PRÉSENTS de CE salon sont nommés (`RoomService.people`).
   */
  @route("demo-chat-people", {
    path: "/rooms/{room}/people",
    requirements: { methods: ["GET", "WEBSOCKET"] },
    schema: { params: RoomParams, query: PeopleQuery },
  })
  async people(
    input: RoomInput<{ query: typeof PeopleQuery }>,
  ): Promise<ChatPerson[]> {
    await this.#admitted(input.params.room);
    return this.rooms.people(input.params.room, input.query.ids);
  }
  // #endregion

  // #region chat-members-route
  /**
   * Les membres d'un salon PRIVÉ, avec leur rôle et s'ils sont en ligne —
   * `GET …/members` (D51), le même chemin que l'invitation (`POST`) : par la
   * socket aussi, chaque verbe trouve SA route (méthode logique du pont).
   * Réservé à qui est admis dans ce salon : membres et invités d'un événement
   * en cours. Un salon public rend une liste vide.
   */
  @route("demo-chat-room-members", {
    path: "/rooms/{room}/members",
    requirements: { methods: ["GET", "WEBSOCKET"] },
    schema: { params: RoomParams },
  })
  @IsGranted(["ROLE_USER"])
  async members(input: RoomInput): Promise<IRoomMember[]> {
    await this.#admitted(input.params.room);
    return this.rooms.members(input.params.room);
  }
  // #endregion

  // #region chat-room
  /**
   * Tous les salons, déclarés UNE fois par un motif : il pose la règle ET sert
   * chaque salon (`chat:room:42`). `RoomAdmission` tranche qui entre (lu en
   * base, au `subscribe` ; un nom qui n'est pas un salon est refusé) ;
   * `anonymous: true` laisse un visiteur lire un salon PUBLIC — la règle le
   * refuse ailleurs. La présence suit l'abonnement : qui est admis figure dans
   * la liste, nommé s'il a un compte, compté sinon ; un départ attend `grace`
   * avant d'être annoncé (ADR-0025 P5).
   */
  @RealtimeChannel(ROOM_CHANNEL_PATTERN, {
    allow: RoomAdmission,
    anonymous: true,
    presence: { grace: PRESENCE_GRACE_MS },
  })
  room(): () => void {
    return () => {};
  }
  // #endregion

  // #region chat-online
  /**
   * « En ligne » (D51) : toute page connectée s'y abonne au chargement, quel
   * que soit le salon ouvert. Aucune trame ; la présence ne publie que des
   * NOMBRES (`maxNamed: 0`) — aucun abonné n'apprend qui est là. Le serveur,
   * lui, lit les identités (`hub.presence()`) pour dire aux membres d'un
   * salon privé où sont les autres (`RoomService.members`). Réservé aux
   * comptes : un anonyme n'a rien à y annoncer.
   */
  @RealtimeChannel(ONLINE_CHANNEL, {
    authenticated: true,
    presence: { grace: PRESENCE_GRACE_MS, maxNamed: 0 },
  })
  online(): () => void {
    return () => {};
  }
  // #endregion

  // #region chat-typing
  /**
   * « J'écris » — `POST …/typing`, sans corps : l'auteur vient de la
   * connexion. Réservé aux connectés ADMIS dans le salon ; le signal part sur
   * le canal du salon, en message éphémère, et ne fuit donc jamais hors de
   * lui.
   */
  @route("demo-chat-typing", {
    path: "/rooms/{room}/typing",
    requirements: { methods: ["POST", "WEBSOCKET"] },
    schema: { params: RoomParams },
  })
  @IsGranted(["ROLE_USER"])
  async typing(input: RoomInput): Promise<{ ok: true }> {
    const me = this.#writer("typing");
    await this.#admitted(input.params.room);
    this.chat.typing(input.params.room, me.identifier);
    return { ok: true };
  }
  // #endregion
}

/**
 * Le statut HTTP d'une raison de refus. Le `switch` est EXHAUSTIF : une
 * raison ajoutée au service sans statut ne compile pas.
 */
function statusOf(reason: RoomRefusalReason): number {
  switch (reason) {
    case "not-found":
      return 404;
    case "forbidden":
      return 403;
    case "conflict":
      return 409;
    case "invalid":
      return 422;
  }
}

/**
 * Le statut HTTP d'un refus d'aperçu. Le `switch` est EXHAUSTIF : une raison
 * ajoutée au service sans statut ne compile pas.
 */
function linkStatusOf(reason: LinkPreviewRefusalReason): number {
  switch (reason) {
    case "not-found":
      return 404;
    case "rate-limited":
      return 429;
  }
}

export default ChatController;
