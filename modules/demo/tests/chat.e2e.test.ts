import { randomUUID } from "node:crypto";
import { AUTH_ME_PATH } from "nodefony";
import {
  E2E_USER_IDENTIFIER,
  adminLogin,
  csrfHeaders,
  userLogin,
} from "nodefony/testing";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import {
  CHAT_ATTACH_PATH,
  CHAT_FILE_PATH,
  CHAT_REALTIME_PATH,
  MESSAGE_MAX_BYTES,
  type ChatContract,
  type ChatMessage,
  type ChatReaction,
  type MessageNotice,
} from "../frontend/src/chat/chatContract";
import {
  LOBBY_ROOM_ID,
  ONLINE_CHANNEL,
  roomChannel,
  type IRoomMember,
  type IRoomView,
} from "../frontend/src/chat/rooms";
import {
  CHAT_TYPING_QUOTA,
  CHAT_WRITE_WINDOW_MS,
} from "../nodefony/service/ChatService";
import {
  closeAll,
  demoDescribe,
  ensureMember,
  httpUrl,
  openSocket,
  startDemoServer,
  waitFor,
} from "./realtimeHarness";

/**
 * Les salons de bout en bout : des sockets ANONYMES qui écoutent, un compte
 * connecté qui écrit en HTTP — la page fait de même, sa session suit par le
 * cookie.
 *
 * Ce que les tests unitaires ne voient pas : une écriture qui atteint TOUS
 * les abonnés d'un salon, l'auteur posé par le serveur, la garde d'un salon
 * privé (la MÊME règle sur la socket et sur les routes), la frappe qui ne
 * quitte pas son salon, la présence, l'idempotence d'un envoi rejoué, et une
 * pièce jointe servie désarmée quoi que prétende son nom. Une ABSENCE (rien
 * n'a été diffusé) se prouve toujours par un message témoin envoyé APRÈS, sur
 * le même fil : jamais par une attente, qu'un runner lent ferait mentir.
 * Lancement : `npm run test:e2e`.
 */

/** Le salon privé que la démo sème : membre = `admin`, événement en cours. */
const TEAM_ROOM_ID = "equipe";

let stop: () => Promise<void> = async () => undefined;
/** Les en-têtes d'une session `admin` : cookie et jeton anti-CSRF. */
let admin: Record<string, string> = {};
beforeAll(async () => {
  stop = await startDemoServer();
  const base = httpUrl("");
  admin = await csrfHeaders(base, await adminLogin(base));
});
afterEach(() => closeAll());
afterAll(async () => {
  await stop();
});

/** Un abonné anonyme d'un salon, et ce qu'il a reçu. */
async function listener(roomId = LOBBY_ROOM_ID) {
  const socket = await openSocket<ChatContract>(CHAT_REALTIME_PATH, {
    cbor: false,
  });
  const channel = roomChannel(roomId);
  const messages: ChatMessage[] = [];
  const typing: string[] = [];
  const reactions: { messageId: string; reactions: ChatReaction[] }[] = [];
  socket.on(channel, (frame) => {
    if (frame.kind === "message") messages.push(frame.message);
    else if (frame.kind === "reactions") reactions.push(frame);
    else typing.push(frame.author);
  });
  socket.subscribe(channel);
  // Le serveur ACQUITTE l'abonnement : sans cette attente, un message envoyé
  // aussitôt partirait avant que l'abonné soit inscrit.
  await socket.whenSubscribed(channel);
  return { socket, messages, typing, reactions };
}

/** Une route d'un salon. */
const roomPath = (roomId: string, tail: string) =>
  httpUrl(`/demo/chat/rooms/${roomId}/${tail}`);

/** Envoie un message en HTTP, au nom de la session `admin`. */
function send(
  text: string,
  key = randomUUID(),
  extra: object = {},
  roomId = LOBBY_ROOM_ID,
) {
  return fetch(roomPath(roomId, "send"), {
    method: "POST",
    headers: {
      ...admin,
      "content-type": "application/json",
      "idempotency-key": key,
    },
    body: JSON.stringify({ text, ...extra }),
  });
}

/** Un texte unique : les cas partagent le salon, jamais leurs messages. */
const unique = (label: string) => `${label} ${randomUUID()}`;

demoDescribe("discussion — le salon public", () => {
  // #region chat-broadcast-e2e
  it("un message écrit atteint TOUS les abonnés du salon, signé par le serveur", async () => {
    const [alice, bob] = [await listener(), await listener()];
    const text = unique("bonjour");
    const res = await send(text);
    expect(res.status).toBe(200);
    const sent: unknown = await res.json();
    const id =
      typeof sent === "object" && sent !== null
        ? Reflect.get(sent, "id")
        : null;

    const seen = (who: { messages: ChatMessage[] }) =>
      who.messages.find((m) => m.text === text);
    await waitFor(
      "le message chez les deux abonnés",
      () => seen(alice) !== undefined && seen(bob) !== undefined,
    );
    // L'auteur vient de la SESSION, jamais d'un champ du client.
    expect(seen(alice)?.author).toBe("admin");
    // L'`id` stable tiré par la base : le MÊME pour l'écrivain et les abonnés.
    expect(typeof id).toBe("string");
    expect(seen(alice)?.id).toBe(id);
    expect(seen(bob)?.id).toBe(id);
  });
  // #endregion

  it("le client ne choisit pas l'auteur : un champ en trop est refusé", async () => {
    const res = await send(unique("usurpation"), randomUUID(), {
      author: "quelqu'un d'autre",
    });
    // 422 : le corps est lisible mais refusé par son schéma (`strictObject`).
    expect(res.status).toBe(422);
    await res.body?.cancel();
  });

  it("l'historique rend le message à qui arrive APRÈS, lu en base sous le même id", async () => {
    const text = unique("pour plus tard");
    const res0 = await send(text);
    expect(res0.status).toBe(200);
    const sent: unknown = await res0.json();
    const id =
      typeof sent === "object" && sent !== null
        ? Reflect.get(sent, "id")
        : null;
    // Lecture libre, en HTTP : la même action que `socket.get(…)` de la page.
    const res = await fetch(roomPath(LOBBY_ROOM_ID, "history?limit=200"));
    expect(res.status).toBe(200);
    const history: unknown = await res.json();
    const found = Array.isArray(history)
      ? history.find(
          (m: unknown) =>
            typeof m === "object" &&
            m !== null &&
            Reflect.get(m, "text") === text,
        )
      : undefined;
    expect(found).toBeDefined();
    expect(Reflect.get(found ?? {}, "id")).toBe(id);
  });

  it("un message de 64 Kio passe ; un octet de plus est refusé, rien n'est diffusé", async () => {
    const watcher = await listener();
    const full = unique("x").padEnd(MESSAGE_MAX_BYTES, "a");
    expect((await send(full)).status).toBe(200);
    const over = await send(`${full}a`);
    expect(over.status).toBe(422);
    await over.body?.cancel();
    const witness = unique("témoin");
    await send(witness);
    await waitFor("le témoin", () =>
      watcher.messages.some((m) => m.text === witness),
    );
    expect(watcher.messages.some((m) => m.text === full)).toBe(true);
    expect(watcher.messages.some((m) => m.text === `${full}a`)).toBe(false);
  });

  it("écrire exige une session : un anonyme est refusé, et rien n'est diffusé", async () => {
    const intruder = await listener();
    const text = unique("anonyme");
    await expect(
      intruder.socket.post(
        "/demo/chat/rooms/{room}/send",
        { text },
        { params: { room: LOBBY_ROOM_ID } },
      ),
    ).rejects.toThrow();
    // Témoin : quand ce message arrive, celui de l'anonyme l'aurait précédé.
    const witness = unique("témoin");
    await send(witness);
    await waitFor("le témoin", () =>
      intruder.messages.some((m) => m.text === witness),
    );
    expect(intruder.messages.some((m) => m.text === text)).toBe(false);
  });

  it("un envoi rejoué avec la même clé ne publie qu'une fois", async () => {
    const watcher = await listener();
    const text = unique("une seule fois");
    const key = randomUUID();
    const [first, again] = [await send(text, key), await send(text, key)];
    expect(first.status).toBe(200);
    expect(again.status).toBe(200);
    // La réponse rejouée est celle déjà calculée.
    expect(await again.json()).toEqual(await first.json());

    const witness = unique("témoin");
    await send(witness);
    await waitFor("le témoin", () =>
      watcher.messages.some((m) => m.text === witness),
    );
    expect(watcher.messages.filter((m) => m.text === text)).toHaveLength(1);
  });

  it("la frappe d'un connecté atteint le salon ; celle d'un anonyme est refusée", async () => {
    const watcher = await listener();
    const anonymous = await fetch(roomPath(LOBBY_ROOM_ID, "typing"), {
      method: "POST",
    });
    expect(anonymous.status).toBe(403);
    await anonymous.body?.cancel();
    const res = await fetch(roomPath(LOBBY_ROOM_ID, "typing"), {
      method: "POST",
      headers: admin,
    });
    expect(res.status).toBe(200);
    await res.body?.cancel();
    await waitFor("la frappe d'admin", () => watcher.typing.includes("admin"));
    expect(watcher.typing).toEqual(["admin"]);
  });

  it("la présence compte l'anonyme sans le nommer", async () => {
    // L'écoute AVANT la demande, comme une page : la liste suit l'acquittement
    // de près, et quand les deux trames arrivent dans le même paquet, un
    // écouteur posé après `whenSubscribed` l'a déjà manquée — et un second
    // `subscribe` ne repart pas au serveur (ref-compté). Le test qui faisait
    // ainsi ne passait que si un départ voisin venait le réveiller.
    const socket = await openSocket<ChatContract>(CHAT_REALTIME_PATH, {
      cbor: false,
    });
    const channel = roomChannel(LOBBY_ROOM_ID);
    const seen: { count: number; unnamed: number }[] = [];
    socket.onPresence(channel, (view) => {
      if (view.ready) seen.push({ count: view.count, unnamed: view.unnamed });
    });
    socket.subscribe(channel);
    await waitFor("une vue de présence", () => seen.length > 0);
    expect(seen.at(-1)?.unnamed).toBeGreaterThanOrEqual(1);
  });

  it("l'annuaire ne nomme jamais un compte absent du salon", async () => {
    const res = await fetch(
      roomPath(LOBBY_ROOM_ID, `people?ids=${randomUUID()},${randomUUID()}`),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});

demoDescribe("discussion — le salon privé", () => {
  it("un anonyme voit la liste publique, pas le salon privé ; son membre le voit, avec l'événement en cours", async () => {
    const anonymous: IRoomView[] = await (
      await fetch(httpUrl("/demo/chat/rooms"))
    ).json();
    expect(anonymous.some((room) => room.id === LOBBY_ROOM_ID)).toBe(true);
    expect(anonymous.some((room) => room.id === TEAM_ROOM_ID)).toBe(false);

    const mine: IRoomView[] = await (
      await fetch(httpUrl("/demo/chat/rooms"), { headers: admin })
    ).json();
    const team = mine.find((room) => room.id === TEAM_ROOM_ID);
    expect(team?.role).toBe("owner");
    expect(team?.event?.title).toBe("Point d'équipe");
  });

  it("la socket refuse le salon privé à un anonyme", async () => {
    const socket = await openSocket<ChatContract>(CHAT_REALTIME_PATH, {
      cbor: false,
    });
    const refused: string[] = [];
    socket.onDenied((denied) => {
      if (denied.channel === roomChannel(TEAM_ROOM_ID))
        refused.push(denied.reason);
    });
    socket.subscribe(roomChannel(TEAM_ROOM_ID));
    await waitFor("le refus du salon privé", () => refused.length > 0);
    expect(refused).toEqual(["forbidden"]);
  });

  it("les routes appliquent la MÊME règle : 403 à l'anonyme, 200 au membre, 404 au salon inconnu", async () => {
    const outsider = await fetch(roomPath(TEAM_ROOM_ID, "history"));
    expect(outsider.status).toBe(403);
    await outsider.body?.cancel();
    const member = await fetch(roomPath(TEAM_ROOM_ID, "history"), {
      headers: admin,
    });
    expect(member.status).toBe(200);
    await member.body?.cancel();
    const nowhere = await fetch(roomPath("inexistant", "history"));
    expect(nowhere.status).toBe(404);
    await nowhere.body?.cancel();
  });

  it("un message du salon privé ne fuit pas dans le salon public", async () => {
    const lobby = await listener();
    const secret = unique("secret");
    expect((await send(secret, randomUUID(), {}, TEAM_ROOM_ID)).status).toBe(
      200,
    );
    const witness = unique("témoin");
    await send(witness);
    await waitFor("le témoin", () =>
      lobby.messages.some((m) => m.text === witness),
    );
    expect(lobby.messages.some((m) => m.text === secret)).toBe(false);
  });
});

/** Un `POST` JSON d'une session, avec sa clé d'idempotence. */
function post(
  headers: Record<string, string>,
  pathname: string,
  body?: object,
) {
  return fetch(httpUrl(pathname), {
    method: "POST",
    headers: {
      ...headers,
      "content-type": "application/json",
      "idempotency-key": randomUUID(),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

/** Les salons qu'une session voit. */
async function roomsOf(headers: Record<string, string>): Promise<IRoomView[]> {
  const res = await fetch(httpUrl("/demo/chat/rooms"), { headers });
  expect(res.status).toBe(200);
  return res.json();
}

/** Les noms tirés par le cas en cours, rendus à la fin du cas. */
const namedRooms = new Set<string>();

/** Un nom de salon neuf : les cas partagent la base. */
const roomName = (label: string): string => {
  const name = `${label} ${randomUUID().slice(0, 8)}`;
  namedRooms.add(name);
  return name;
};

// Un compte possède au plus `ROOMS_OWNED_MAX` salons : chaque cas supprime
// ceux qu'il a créés, sinon le onzième salon de la suite répond 409 et c'est
// l'ORDRE des cas qui décide de qui échoue.
afterEach(async () => {
  if (namedRooms.size === 0) return;
  const owned = (await roomsOf(admin)).filter(
    (room) => room.role === "owner" && namedRooms.has(room.name),
  );
  namedRooms.clear();
  await Promise.all(
    owned.map(async (room) => {
      const res = await fetch(httpUrl(`/demo/chat/rooms/${room.id}`), {
        method: "DELETE",
        headers: admin,
      });
      await res.body?.cancel();
    }),
  );
});

/** L'identité stable d'une session, lue sur `/me` (`{ user: { id, … } }`). */
async function idOf(headers: Record<string, string>): Promise<string> {
  const body: unknown = await (
    await fetch(httpUrl(AUTH_ME_PATH), { headers })
  ).json();
  const user: unknown =
    typeof body === "object" && body !== null
      ? Reflect.get(body, "user")
      : null;
  const id =
    typeof user === "object" && user !== null ? Reflect.get(user, "id") : null;
  expect(typeof id).toBe("string");
  return String(id);
}

demoDescribe("discussion — les formulaires", () => {
  /** La session du second compte, et son identité stable. */
  let member: Record<string, string> = {};
  let memberId = "";
  beforeAll(async () => {
    // Le second compte : déjà semé sur une base partagée, créé sinon.
    await ensureMember();
    const base = httpUrl("");
    member = await csrfHeaders(base, await userLogin(base));
    memberId = await idOf(member);
  });

  it("créer : la session devient propriétaire, le nom arrive normalisé ; le même nom est refusé (409)", async () => {
    const name = roomName("projet");
    const res = await post(admin, "/demo/chat/rooms", {
      name: `  ${name.replace(" ", "   ")} `,
      access: "private",
    });
    expect(res.status).toBe(200);
    const room: IRoomView = await res.json();
    expect(room.name).toBe(name);
    expect(room.role).toBe("owner");
    expect((await roomsOf(admin)).some((r) => r.id === room.id)).toBe(true);
    // Privé : l'autre compte ne le voit pas.
    expect((await roomsOf(member)).some((r) => r.id === room.id)).toBe(false);

    const again = await post(admin, "/demo/chat/rooms", {
      name,
      access: "public",
    });
    expect(again.status).toBe(409);
    await again.body?.cancel();
    const reserved = await post(admin, "/demo/chat/rooms", {
      name: "dm:moi",
      access: "public",
    });
    expect(reserved.status).toBe(422);
    await reserved.body?.cancel();
  });

  it("inviter : 403 à qui ne gère pas, 404 au compte inconnu, puis l'invité voit le salon ; 409 la seconde fois", async () => {
    const created = await post(admin, "/demo/chat/rooms", {
      name: roomName("équipe projet"),
      access: "private",
    });
    const room: IRoomView = await created.json();
    const members = `/demo/chat/rooms/${room.id}/members`;

    // Le membre n'en est pas encore membre : il ne gère rien.
    const intruder = await post(member, members, { identifier: "admin" });
    expect(intruder.status).toBe(403);
    await intruder.body?.cancel();
    const unknown = await post(admin, members, {
      identifier: `inconnu-${randomUUID()}`,
    });
    expect(unknown.status).toBe(404);
    await unknown.body?.cancel();

    const invited = await post(admin, members, {
      identifier: E2E_USER_IDENTIFIER,
    });
    expect(invited.status).toBe(200);
    await invited.body?.cancel();
    const seen = (await roomsOf(member)).find((r) => r.id === room.id);
    expect(seen?.role).toBe("member");
    // Membre simple : toujours pas le droit d'inviter.
    const again = await post(member, members, { identifier: "admin" });
    expect(again.status).toBe(403);
    await again.body?.cancel();
    const twice = await post(admin, members, {
      identifier: E2E_USER_IDENTIFIER,
    });
    expect(twice.status).toBe(409);
    await twice.body?.cancel();
  });

  it("planifier : l'invité reçoit une invitation à accepter ; la décliner retire le salon de sa liste", async () => {
    const created = await post(admin, "/demo/chat/rooms", {
      name: roomName("revue"),
      access: "private",
    });
    const room: IRoomView = await created.json();
    const events = `/demo/chat/rooms/${room.id}/events`;
    const start = Date.now() + 3_600_000;
    const slot = {
      title: "Revue du lot 3",
      start,
      end: start + 1_800_000,
      timeZone: "Europe/Paris",
    };

    // Qui ne gère pas le salon ne planifie rien.
    const intruder = await post(member, events, slot);
    expect(intruder.status).toBe(403);
    await intruder.body?.cancel();

    // Un invité inconnu : tous sont nommés, et rien n'est créé.
    const unknown = await post(admin, events, {
      ...slot,
      attendees: ["personne-ici"],
    });
    expect(unknown.status).toBe(404);
    expect(await unknown.text()).toMatch(/personne-ici/u);

    const planned = await post(admin, events, {
      ...slot,
      attendees: [E2E_USER_IDENTIFIER],
    });
    expect(planned.status).toBe(200);
    const event: { id: string } = await planned.json();
    const invitation = (await roomsOf(member)).find((r) => r.id === room.id);
    expect(invitation?.event?.partstat).toBe("needs-action");
    expect(invitation?.role).toBeNull();

    const declined = await post(member, `/demo/chat/events/${event.id}/reply`, {
      partstat: "declined",
    });
    expect(declined.status).toBe(200);
    await declined.body?.cancel();
    expect((await roomsOf(member)).some((r) => r.id === room.id)).toBe(false);
    const nowhere = await post(
      member,
      `/demo/chat/events/${randomUUID()}/reply`,
      {
        partstat: "accepted",
      },
    );
    expect(nowhere.status).toBe(404);
    await nowhere.body?.cancel();
  });

  it("🔴 à la fin de son événement, l'invité est éjecté du salon privé ; le membre y reste", async () => {
    const created = await post(admin, "/demo/chat/rooms", {
      name: roomName("point éclair"),
      access: "private",
    });
    const room: IRoomView = await created.json();
    // Une fenêtre courte, mais assez large pour s'abonner avant la fin.
    const start = Date.now();
    const planned = await post(admin, `/demo/chat/rooms/${room.id}/events`, {
      title: "Point éclair",
      start,
      end: start + 5_000,
      timeZone: "Europe/Paris",
      attendees: [E2E_USER_IDENTIFIER],
    });
    expect(planned.status).toBe(200);
    const event: { id: string } = await planned.json();
    const accepted = await post(member, `/demo/chat/events/${event.id}/reply`, {
      partstat: "accepted",
    });
    expect(accepted.status).toBe(200);
    await accepted.body?.cancel();

    const channel = roomChannel(room.id);
    const [guest, owner] = [
      await openSocket<ChatContract>(CHAT_REALTIME_PATH, {
        cbor: false,
        session: member,
      }),
      await openSocket<ChatContract>(CHAT_REALTIME_PATH, {
        cbor: false,
        session: admin,
      }),
    ];
    const guestClosed: string[] = [];
    const ownerClosed: string[] = [];
    guest.onClosed((closed) => {
      if (closed.channel === channel) guestClosed.push(closed.reason);
    });
    owner.onClosed((closed) => {
      if (closed.channel === channel) ownerClosed.push(closed.reason);
    });
    const ownerSeen: string[] = [];
    owner.on(channel, (frame) => {
      if (frame.kind === "message") ownerSeen.push(frame.message.text);
    });
    guest.subscribe(channel);
    owner.subscribe(channel);
    await Promise.all([
      guest.whenSubscribed(channel),
      owner.whenSubscribed(channel),
    ]);

    // Aucune durée assertée : on attend le FAIT, l'éjection.
    await waitFor("l'éjection de l'invité", () => guestClosed.length > 0);
    expect(guestClosed).toEqual(["evicted"]);
    // Le membre reste : un message écrit APRÈS lui parvient encore (témoin).
    const witness = unique("après la fin");
    const sent = await send(witness, randomUUID(), {}, room.id);
    expect(sent.status).toBe(200);
    await waitFor("le témoin chez le propriétaire", () =>
      ownerSeen.includes(witness),
    );
    expect(ownerClosed).toEqual([]);
    // Et la porte HTTP dit la même chose : l'invité n'entre plus.
    const after = await fetch(roomPath(room.id, "history"), {
      headers: member,
    });
    expect(after.status).toBe(403);
    await after.body?.cancel();
  });

  it("🔴 D51 — les membres d'un salon privé et leur état : « en ligne » sans que personne n'apprenne qui l'est", async () => {
    const created = await post(admin, "/demo/chat/rooms", {
      name: roomName("présence"),
      access: "private",
    });
    const room: IRoomView = await created.json();
    const invited = await post(admin, `/demo/chat/rooms/${room.id}/members`, {
      identifier: E2E_USER_IDENTIFIER,
    });
    expect(invited.status).toBe(200);
    await invited.body?.cancel();
    const membersPath = roomPath(room.id, "members");
    const read = async (): Promise<IRoomMember[]> => {
      const res = await fetch(membersPath, { headers: admin });
      expect(res.status).toBe(200);
      return res.json();
    };
    /** Relit la route jusqu'à ce que le membre soit dans l'état attendu. */
    const until = async (what: string, online: boolean): Promise<void> => {
      const deadline = Date.now() + 15_000;
      for (;;) {
        const found = (await read()).find((m) => m.id === memberId);
        if (found?.online === online) return;
        if (Date.now() > deadline) throw new Error(`délai dépassé : ${what}`);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    // Les deux membres, nommés, avec leur rôle ; personne n'a de page ouverte.
    const first = await read();
    expect(first.map((m) => `${m.name}:${m.role}`).toSorted()).toEqual(
      ["admin:owner", `${E2E_USER_IDENTIFIER}:member`].toSorted(),
    );
    expect(first.find((m) => m.id === memberId)?.online).toBe(false);

    // Le membre ouvre une page AILLEURS : il rejoint seulement « en ligne ».
    const page = await openSocket<ChatContract>(CHAT_REALTIME_PATH, {
      cbor: false,
      session: member,
    });
    const counts: Array<{ count: number; named: number }> = [];
    page.onPresence(ONLINE_CHANNEL, (snapshot) =>
      counts.push({ count: snapshot.count, named: snapshot.members.size }),
    );
    page.subscribe(ONLINE_CHANNEL);
    await page.whenSubscribed(ONLINE_CHANNEL);
    await until("le membre vu en ligne", true);
    // Confidentialité : l'abonné reçoit des NOMBRES, jamais une identité.
    await waitFor("une vue de « en ligne »", () =>
      counts.some((c) => c.count > 0),
    );
    expect(counts.every((c) => c.named === 0)).toBe(true);

    // Page fermée : absent, une fois la grâce écoulée (on attend le FAIT).
    page.disconnect();
    await until("le membre redevenu absent", false);

    // Un salon public ne dit rien de personne ; un non-membre n'entre pas ;
    // un anonyme non plus.
    const lobby = await fetch(roomPath(LOBBY_ROOM_ID, "members"), {
      headers: admin,
    });
    expect(await lobby.json()).toEqual([]);
    const other = await post(admin, "/demo/chat/rooms", {
      name: roomName("fermé"),
      access: "private",
    });
    const closed: IRoomView = await other.json();
    const stranger = await fetch(roomPath(closed.id, "members"), {
      headers: member,
    });
    expect(stranger.status).toBe(403);
    await stranger.body?.cancel();
    const anonymous = await fetch(membersPath);
    expect(anonymous.status).toBe(403);
    await anonymous.body?.cancel();
  });

  it("🔴 D52 — les non-lus en base : depuis le dernier lu, jamais ses propres messages, et le marqueur ne recule pas", async () => {
    const created = await post(admin, "/demo/chat/rooms", {
      name: roomName("non-lus"),
      access: "private",
    });
    const room: IRoomView = await created.json();
    expect(room.unread).toBe(0);
    const invited = await post(admin, `/demo/chat/rooms/${room.id}/members`, {
      identifier: E2E_USER_IDENTIFIER,
    });
    expect(invited.status).toBe(200);
    await invited.body?.cancel();
    const unreadOf = async (
      headers: Record<string, string>,
      roomId = room.id,
    ): Promise<number | undefined> =>
      (await roomsOf(headers)).find((r) => r.id === roomId)?.unread;
    const write = async (
      headers: Record<string, string>,
      roomId = room.id,
    ): Promise<string> => {
      const res = await post(headers, `/demo/chat/rooms/${roomId}/send`, {
        text: unique("non-lu"),
      });
      expect(res.status).toBe(200);
      const sent: { id: string } = await res.json();
      return sent.id;
    };
    const markRead = async (
      headers: Record<string, string>,
      messageId: string,
      roomId = room.id,
    ): Promise<number> => {
      const res = await gesture(headers, "PUT", roomId, messageId, {
        tail: "/read",
      });
      await res.body?.cancel();
      return res.status;
    };

    // Trois messages du membre, un de soi : le sien ne compte pas pour soi.
    const ids = [await write(member), await write(member), await write(member)];
    await write(admin);
    expect(await unreadOf(admin)).toBe(3);
    expect(await unreadOf(member)).toBe(1);

    // Lu jusqu'au deuxième : il en reste un.
    expect(await markRead(admin, ids[1] ?? "")).toBe(200);
    expect(await unreadOf(admin)).toBe(1);
    // Un onglet en retard redit le premier : le marqueur ne recule pas.
    expect(await markRead(admin, ids[0] ?? "")).toBe(200);
    expect(await unreadOf(admin)).toBe(1);
    // Un message retiré n'est plus à lire.
    const retracted = await gesture(member, "DELETE", room.id, ids[2] ?? "");
    expect(retracted.status).toBe(200);
    await retracted.body?.cancel();
    expect(await unreadOf(admin)).toBe(0);

    // Un salon public jamais ouvert ne compte rien ; ouvert, il compte.
    const open = await post(admin, "/demo/chat/rooms", {
      name: roomName("place"),
      access: "public",
    });
    const square: IRoomView = await open.json();
    const first = await write(admin, square.id);
    expect(await unreadOf(member, square.id)).toBe(0);
    expect(await markRead(member, first, square.id)).toBe(200);
    await write(admin, square.id);
    expect(await unreadOf(member, square.id)).toBe(1);

    // Le message d'un AUTRE salon ne marque rien ici ; un étranger, un
    // anonyme n'y marquent rien.
    expect(await markRead(admin, ids[0] ?? "", square.id)).toBe(404);
    const other = await post(admin, "/demo/chat/rooms", {
      name: roomName("à part"),
      access: "private",
    });
    const apart: IRoomView = await other.json();
    expect(await markRead(member, ids[0] ?? "", apart.id)).toBe(403);
    const anonymous = await markRead({}, ids[0] ?? "");
    expect(anonymous).toBeGreaterThanOrEqual(401);
    expect(anonymous).toBeLessThanOrEqual(403);
  });

  it("🔴 D53 — un message alerte le membre ABSENT d'un salon privé : jamais le présent, jamais l'auteur, jamais un salon public", async () => {
    const create = async (
      label: string,
      access: "private" | "public",
    ): Promise<IRoomView> => {
      const res = await post(admin, "/demo/chat/rooms", {
        name: roomName(label),
        access,
      });
      expect(res.status).toBe(200);
      return res.json();
    };
    const invite = async (roomId: string): Promise<void> => {
      const res = await post(admin, `/demo/chat/rooms/${roomId}/members`, {
        identifier: E2E_USER_IDENTIFIER,
      });
      expect(res.status).toBe(200);
      await res.body?.cancel();
    };
    const say = async (
      headers: Record<string, string>,
      roomId: string,
      text: string,
    ): Promise<void> => {
      const res = await post(headers, `/demo/chat/rooms/${roomId}/send`, {
        text,
      });
      expect(res.status).toBe(200);
      await res.body?.cancel();
    };
    const room = await create("alertes", "private");
    await invite(room.id);

    // Deux pages ouvertes AILLEURS : le membre, et l'auteur.
    const [page, own] = [
      await openSocket<ChatContract>(CHAT_REALTIME_PATH, {
        cbor: false,
        session: member,
      }),
      await openSocket<ChatContract>(CHAT_REALTIME_PATH, {
        cbor: false,
        session: admin,
      }),
    ];
    const memberAlerts: MessageNotice[] = [];
    const ownAlerts: MessageNotice[] = [];
    page.onUser((notice) => {
      if (notice.type === "room:message") memberAlerts.push(notice);
    });
    own.onUser((notice) => {
      if (notice.type === "room:message") ownAlerts.push(notice);
    });

    // Absent : l'alerte arrive, avec l'auteur posé par le serveur.
    const first = unique("alerte");
    await say(admin, room.id, first);
    await waitFor("l'alerte du membre absent", () => memberAlerts.length > 0);
    expect(memberAlerts).toEqual([
      {
        type: "room:message",
        roomId: room.id,
        author: "admin",
        preview: first,
      },
    ]);

    // Présent : abonné au salon, il lit le message — sans alerte.
    const channel = roomChannel(room.id);
    const seen: string[] = [];
    page.on(channel, (frame) => {
      if (frame.kind === "message") seen.push(frame.message.text);
    });
    page.subscribe(channel);
    await page.whenSubscribed(channel);
    const second = unique("présent");
    await say(admin, room.id, second);
    await waitFor("le message chez le présent", () => seen.includes(second));

    // Un salon public n'alerte personne, même un membre absent.
    const square = await create("place", "public");
    await invite(square.id);
    await say(admin, square.id, unique("public"));

    // Témoins : un autre salon privé, où chacun est absent à son tour.
    const apart = await create("à part", "private");
    await invite(apart.id);
    const witness = unique("témoin");
    await say(admin, apart.id, witness);
    await waitFor("le témoin du membre", () =>
      memberAlerts.some((n) => n.preview === witness),
    );
    expect(memberAlerts.map((n) => n.roomId)).toEqual([room.id, apart.id]);
    const reply = unique("réponse");
    await say(member, apart.id, reply);
    await waitFor("le témoin de l'auteur", () => ownAlerts.length > 0);
    // L'auteur n'a jamais été alerté de ses propres messages.
    expect(ownAlerts.map((n) => n.preview)).toEqual([reply]);
  });

  it("écrire en privé : deux clics, UN salon à deux, nommé chez l'autre d'après soi ; pas avec soi-même", async () => {
    const adminId = await idOf(admin);
    const [first, second] = await Promise.all([
      post(member, `/demo/chat/direct/${adminId}`),
      post(member, `/demo/chat/direct/${adminId}`),
    ]);
    expect([first.status, second.status]).toEqual([200, 200]);
    const a: IRoomView = await first.json();
    const b: IRoomView = await second.json();
    expect(a.id).toBe(b.id);
    expect(a.peer).toBe("admin");
    expect(a.access).toBe("private");
    // Chez l'autre, le même salon porte le nom de qui l'a ouvert.
    const mirror = (await roomsOf(admin)).find((r) => r.id === a.id);
    expect(mirror?.peer).toBe(E2E_USER_IDENTIFIER);
    // On n'invite personne dans un salon à deux.
    const third = await post(admin, `/demo/chat/rooms/${a.id}/members`, {
      identifier: "admin",
    });
    expect(third.status).toBe(403);
    await third.body?.cancel();

    const self = await post(member, `/demo/chat/direct/${memberId}`);
    expect(self.status).toBe(422);
    await self.body?.cancel();
  });
});

demoDescribe("discussion — les pièces jointes", () => {
  // #region chat-attachment-e2e
  it("une pièce piégée (du HTML nommé .png) est jugée sur ses octets et servie désarmée", async () => {
    const watcher = await listener();
    const text = unique("pièce");
    const form = new FormData();
    form.append("text", text);
    form.append(
      "file",
      new Blob(["<script>alert('piège')</script>"], { type: "image/png" }),
      "photo.png",
    );
    const res = await fetch(
      httpUrl(CHAT_ATTACH_PATH.replace("{room}", LOBBY_ROOM_ID)),
      {
        method: "POST",
        headers: { ...admin, "idempotency-key": randomUUID() },
        body: form,
      },
    );
    expect(res.status).toBe(200);

    await waitFor("le message et sa pièce", () =>
      watcher.messages.some((m) => m.text === text),
    );
    const piece = watcher.messages.find((m) => m.text === text)
      ?.attachments?.[0];
    // Le SERVEUR décide de la sorte, d'après le contenu : pas une image.
    expect(piece?.kind).not.toBe("image");

    const file = await fetch(httpUrl(`${CHAT_FILE_PATH}/${piece?.id ?? ""}`));
    expect(file.status).toBe(200);
    expect(file.headers.get("content-type")).not.toMatch(/^image\//u);
    expect(file.headers.get("content-disposition")).toMatch(/^attachment;/u);
    expect(file.headers.get("x-content-type-options")).toBe("nosniff");
    expect(file.headers.get("content-security-policy")).toBe("sandbox");
    await file.body?.cancel();
  });
  // #endregion

  it("🔴 la pièce d'un salon privé ne se sert qu'à ses admis : l'identifiant ne suffit pas", async () => {
    const form = new FormData();
    form.append("text", unique("pièce privée"));
    form.append("file", new Blob(["privé\n"], { type: "text/plain" }), "a.txt");
    const res = await fetch(
      httpUrl(CHAT_ATTACH_PATH.replace("{room}", TEAM_ROOM_ID)),
      {
        method: "POST",
        headers: { ...admin, "idempotency-key": randomUUID() },
        body: form,
      },
    );
    expect(res.status).toBe(200);
    const { id }: { id: string } = await res.json();
    const history = await fetch(roomPath(TEAM_ROOM_ID, "history"), {
      headers: admin,
    });
    const messages: ChatMessage[] = await history.json();
    const piece = messages.find((m) => m.id === id)?.attachments?.[0];
    expect(piece).toBeDefined();
    const url = httpUrl(`${CHAT_FILE_PATH}/${piece?.id ?? ""}`);

    const outsider = await fetch(url);
    expect(outsider.status).toBe(403);
    await outsider.body?.cancel();
    const member = await fetch(url, { headers: admin });
    expect(member.status).toBe(200);
    await member.body?.cancel();
  });

  it("un envoi multipart sans clé d'idempotence est refusé (formulaire forgé)", async () => {
    const form = new FormData();
    form.append("text", unique("forgé"));
    const res = await fetch(
      httpUrl(CHAT_ATTACH_PATH.replace("{room}", LOBBY_ROOM_ID)),
      { method: "POST", headers: admin, body: form },
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
    await res.body?.cancel();
  });
});

/** Le lien d'un message : `GET …/messages/{message}/links/{index}`. */
const linkPath = (roomId: string, messageId: string, index: number) =>
  httpUrl(`/demo/chat/rooms/${roomId}/messages/${messageId}/links/${index}`);

/** Envoie un message au nom de `admin` et rend son identifiant. */
async function sendForId(text: string, roomId = LOBBY_ROOM_ID) {
  const res = await send(text, randomUUID(), {}, roomId);
  expect(res.status).toBe(200);
  const sent: unknown = await res.json();
  const id =
    typeof sent === "object" && sent !== null ? Reflect.get(sent, "id") : null;
  expect(typeof id).toBe("string");
  return String(id);
}

demoDescribe("discussion — le débit d'écriture", () => {
  it("🔴 429 au-delà du quota de frappe d'un compte, avec `Retry-After` et l'attente dans le message ; un autre compte n'est pas touché", async () => {
    await ensureMember();
    const base = httpUrl("");
    const greedy = await csrfHeaders(base, await userLogin(base));
    const typing = (headers: Record<string, string>) =>
      fetch(roomPath(LOBBY_ROOM_ID, "typing"), { method: "POST", headers });
    // Le quota de frappe, à part de celui des écritures : l'épuiser ne
    // coupe aucun envoi d'un autre test.
    let refused: Response | null = null;
    for (let i = 0; i <= CHAT_TYPING_QUOTA && refused === null; i++) {
      const res = await typing(greedy);
      if (res.status === 429) refused = res;
      else {
        expect(res.status).toBe(200);
        await res.body?.cancel();
      }
    }
    expect(refused?.status).toBe(429);
    const wait = Number(refused?.headers.get("retry-after"));
    expect(Number.isInteger(wait)).toBe(true);
    expect(wait).toBeGreaterThanOrEqual(1);
    expect(wait).toBeLessThanOrEqual(CHAT_WRITE_WINDOW_MS / 1000);
    // Le message le dit aussi, pour qui le lit (la socket le porte en `error.data.retryAfter`).
    expect(await refused?.text()).toContain(`${wait} s`);

    const other = await typing(admin);
    expect(other.status).toBe(200);
    await other.body?.cancel();
  });
});

demoDescribe("discussion — l'aperçu d'un lien", () => {
  // Aucun test ne dépend d'Internet : la cible est le réseau du serveur
  // lui-même, que la garde SSRF refuse avant toute connexion.
  const INTERNAL = "http://127.0.0.1:9/interne";

  it("un lien vers le réseau du serveur : 200 `internal`, jamais lu", async () => {
    const id = await sendForId(unique(`voir ${INTERNAL}`));
    const res = await fetch(linkPath(LOBBY_ROOM_ID, id, 0), { headers: admin });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      state: "internal",
      url: INTERNAL,
      site: "127.0.0.1",
    });
  });

  it("le même aperçu se lit sans session dans un salon public", async () => {
    const id = await sendForId(unique(`voir ${INTERNAL}`));
    const res = await fetch(linkPath(LOBBY_ROOM_ID, id, 0));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ state: "internal" });
  });

  it("404 : un message d'un AUTRE salon, un lien qui n'existe pas, un message inconnu, un salon inconnu", async () => {
    const inTeam = await sendForId(unique(`équipe ${INTERNAL}`), TEAM_ROOM_ID);
    // Le message existe, mais pas dans ce salon : jamais lu de biais.
    const other = await fetch(linkPath(LOBBY_ROOM_ID, inTeam, 0), {
      headers: admin,
    });
    expect(other.status).toBe(404);
    await other.body?.cancel();

    const inLobby = await sendForId(unique(`voir ${INTERNAL}`));
    const beyond = await fetch(linkPath(LOBBY_ROOM_ID, inLobby, 1), {
      headers: admin,
    });
    expect(beyond.status).toBe(404);
    await beyond.body?.cancel();

    const noLink = await sendForId(unique("aucun lien ici"));
    const bare = await fetch(linkPath(LOBBY_ROOM_ID, noLink, 0), {
      headers: admin,
    });
    expect(bare.status).toBe(404);
    await bare.body?.cancel();

    const unknown = await fetch(linkPath(LOBBY_ROOM_ID, randomUUID(), 0), {
      headers: admin,
    });
    expect(unknown.status).toBe(404);
    await unknown.body?.cancel();

    const nowhere = await fetch(linkPath("inexistant", inLobby, 0), {
      headers: admin,
    });
    expect(nowhere.status).toBe(404);
    await nowhere.body?.cancel();
  });

  it("l'indice est borné par le schéma : 100 et `1e2` ne passent pas jusqu'au service", async () => {
    const id = await sendForId(unique(`voir ${INTERNAL}`));
    for (const index of ["100", "1e2", "-1"]) {
      const res = await fetch(
        httpUrl(
          `/demo/chat/rooms/${LOBBY_ROOM_ID}/messages/${id}/links/${index}`,
        ),
        { headers: admin },
      );
      // Refusé par le schéma des paramètres, avant tout service.
      expect([400, 404, 422]).toContain(res.status);
      await res.body?.cancel();
    }
  });

  it("403 : le salon privé reste fermé à un anonyme, son message ne se lit pas de biais", async () => {
    const id = await sendForId(unique(`équipe ${INTERNAL}`), TEAM_ROOM_ID);
    const res = await fetch(linkPath(TEAM_ROOM_ID, id, 0));
    expect(res.status).toBe(403);
    await res.body?.cancel();
    const member = await fetch(linkPath(TEAM_ROOM_ID, id, 0), {
      headers: admin,
    });
    expect(member.status).toBe(200);
    await member.body?.cancel();
  });

  it("429 au-delà de 30 aperçus par minute et par compte, avec `Retry-After` ; un autre compte n'est pas touché", async () => {
    await ensureMember();
    const base = httpUrl("");
    const greedy = await csrfHeaders(base, await userLogin(base));
    const id = await sendForId(unique(`voir ${INTERNAL}`));
    for (let i = 0; i < 30; i++) {
      const res = await fetch(linkPath(LOBBY_ROOM_ID, id, 0), {
        headers: greedy,
      });
      expect(res.status).toBe(200);
      await res.body?.cancel();
    }
    const refused = await fetch(linkPath(LOBBY_ROOM_ID, id, 0), {
      headers: greedy,
    });
    expect(refused.status).toBe(429);
    const wait = Number(refused.headers.get("retry-after"));
    expect(Number.isInteger(wait)).toBe(true);
    expect(wait).toBeGreaterThanOrEqual(1);
    expect(wait).toBeLessThanOrEqual(60);
    await refused.body?.cancel();

    const other = await fetch(linkPath(LOBBY_ROOM_ID, id, 0), {
      headers: admin,
    });
    expect(other.status).toBe(200);
    await other.body?.cancel();
  });
});

/** L'`id` que le serveur rend d'un envoi. */
async function sentId(res: Response): Promise<string> {
  expect(res.status).toBe(200);
  const body: unknown = await res.json();
  const id =
    typeof body === "object" && body !== null ? Reflect.get(body, "id") : null;
  expect(typeof id).toBe("string");
  return String(id);
}

/** Un geste sur un message : modifier, retirer, réagir. */
function gesture(
  headers: Record<string, string>,
  method: "PATCH" | "DELETE" | "PUT",
  roomId: string,
  messageId: string,
  options: { tail?: string; body?: object } = {},
) {
  return fetch(roomPath(roomId, `messages/${messageId}${options.tail ?? ""}`), {
    method,
    headers: { ...headers, "content-type": "application/json" },
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
  });
}

/** Le dernier état d'un message reçu sur le salon. */
const lastOf = (who: { messages: ChatMessage[] }, id: string) =>
  who.messages.findLast((m) => m.id === id);

demoDescribe("discussion — répondre, réagir, modifier, retirer", () => {
  let member: Record<string, string> = {};
  beforeAll(async () => {
    await ensureMember();
    const base = httpUrl("");
    member = await csrfHeaders(base, await userLogin(base));
  });

  it("une réponse arrive avec la citation de son message, et l'historique la relit", async () => {
    const lobby = await listener();
    const first = unique("question");
    const firstId = await sentId(await send(first));
    const answer = unique("réponse");
    const answerId = await sentId(
      await send(answer, randomUUID(), { replyTo: firstId }),
    );
    await waitFor("la réponse", () => lastOf(lobby, answerId) !== undefined);
    const expected = {
      id: firstId,
      state: "present",
      author: "admin",
      excerpt: first,
    };
    expect(lastOf(lobby, answerId)?.replyTo).toEqual(expected);
    const res = await fetch(roomPath(LOBBY_ROOM_ID, "history?limit=200"));
    const past: ChatMessage[] = await res.json();
    expect(past.find((m) => m.id === answerId)?.replyTo).toEqual(expected);
    // Retirée, la réponse perd aussi sa citation : rien du message cité ne reste.
    expect(
      (await gesture(admin, "DELETE", LOBBY_ROOM_ID, answerId)).status,
    ).toBe(200);
    const after: ChatMessage[] = await (
      await fetch(roomPath(LOBBY_ROOM_ID, "history?limit=200"))
    ).json();
    expect(after.find((m) => m.id === answerId)).not.toHaveProperty("replyTo");
  });

  it("répondre à un message d'un AUTRE salon : 404, et l'extrait ne fuit pas", async () => {
    const lobby = await listener();
    const secret = unique("secret");
    const secretId = await sentId(
      await send(secret, randomUUID(), {}, TEAM_ROOM_ID),
    );
    const res = await send(unique("curieux"), randomUUID(), {
      replyTo: secretId,
    });
    expect(res.status).toBe(404);
    await res.body?.cancel();
    const witness = unique("témoin");
    await send(witness);
    await waitFor("le témoin", () =>
      lobby.messages.some((m) => m.text === witness),
    );
    expect(JSON.stringify(lobby.messages)).not.toContain(secret);
  });

  it("modifier : l'auteur seul ; le message ENTIER repart, même id, marqué modifié", async () => {
    const lobby = await listener();
    const id = await sentId(await send(unique("brouillon")));
    const fixed = unique("corrigé");
    const other = await gesture(member, "PATCH", LOBBY_ROOM_ID, id, {
      body: { text: "usurpé" },
    });
    expect(other.status).toBe(403);
    await other.body?.cancel();
    const empty = await gesture(admin, "PATCH", LOBBY_ROOM_ID, id, {
      body: { text: "" },
    });
    expect(empty.status).toBe(422);
    await empty.body?.cancel();
    const res = await gesture(admin, "PATCH", LOBBY_ROOM_ID, id, {
      body: { text: fixed },
    });
    expect(res.status).toBe(200);
    await waitFor(
      "la version corrigée",
      () => lastOf(lobby, id)?.text === fixed,
    );
    expect(typeof lastOf(lobby, id)?.editedAt).toBe("number");
  });

  it("retirer : 403 à qui n'est ni l'auteur ni modérateur ; retiré, il ne garde rien et ne se retire pas deux fois", async () => {
    const lobby = await listener();
    const text = unique("à retirer");
    const id = await sentId(await send(text));
    const other = await gesture(member, "DELETE", LOBBY_ROOM_ID, id);
    expect(other.status).toBe(403);
    await other.body?.cancel();
    expect((await gesture(admin, "DELETE", LOBBY_ROOM_ID, id)).status).toBe(
      200,
    );
    await waitFor(
      "le retrait",
      () => lastOf(lobby, id)?.retracted === "author",
    );
    expect(lastOf(lobby, id)?.text).toBe("");
    const again = await gesture(admin, "DELETE", LOBBY_ROOM_ID, id);
    expect(again.status).toBe(404);
    await again.body?.cancel();
    const res = await fetch(roomPath(LOBBY_ROOM_ID, "history?limit=200"));
    const past: ChatMessage[] = await res.json();
    expect(past.find((m) => m.id === id)).toMatchObject({
      text: "",
      retracted: "author",
    });
    expect(JSON.stringify(past)).not.toContain(text);
  });

  it("la modération retire le message d'un membre (XEP-0425)", async () => {
    const created = await post(admin, "/demo/chat/rooms", {
      name: roomName("modéré"),
      access: "private",
    });
    expect(created.status).toBe(200);
    const room: IRoomView = await created.json();
    const invited = await post(admin, `/demo/chat/rooms/${room.id}/members`, {
      identifier: E2E_USER_IDENTIFIER,
    });
    expect(invited.status).toBe(200);
    await invited.body?.cancel();
    const res = await fetch(roomPath(room.id, "send"), {
      method: "POST",
      headers: {
        ...member,
        "content-type": "application/json",
        "idempotency-key": randomUUID(),
      },
      body: JSON.stringify({ text: unique("hors sujet") }),
    });
    const id = await sentId(res);
    expect((await gesture(admin, "DELETE", room.id, id)).status).toBe(200);
    const past: ChatMessage[] = await (
      await fetch(roomPath(room.id, "history?limit=10"), { headers: admin })
    ).json();
    expect(past.find((m) => m.id === id)?.retracted).toBe("moderation");
  });

  it("réagir : l'ensemble de chacun remplace le sien, le salon reçoit TOUTES les réactions ; rejoué, rien ne change", async () => {
    const lobby = await listener();
    const id = await sentId(await send(unique("vote")));
    const put = (headers: Record<string, string>, emojis: string[]) =>
      gesture(headers, "PUT", LOBBY_ROOM_ID, id, {
        tail: "/reactions",
        body: { emojis },
      });
    expect((await put(member, ["👍"])).status).toBe(200);
    const both = await put(admin, ["👍", "🎉"]);
    const expected = [
      { emoji: "👍", names: [E2E_USER_IDENTIFIER, "admin"] },
      { emoji: "🎉", names: ["admin"] },
    ];
    expect(await both.json()).toEqual(expected);
    expect(await (await put(admin, ["👍", "🎉"])).json()).toEqual(expected);
    await waitFor("les réactions sur le salon", () =>
      lobby.reactions.some(
        (frame) =>
          frame.messageId === id &&
          JSON.stringify(frame.reactions) === JSON.stringify(expected),
      ),
    );
    const word = await put(admin, ["bravo"]);
    expect(word.status).toBe(422);
    await word.body?.cancel();
    const anonymous = await fetch(
      roomPath(LOBBY_ROOM_ID, `messages/${id}/reactions`),
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ emojis: ["👍"] }),
      },
    );
    expect(anonymous.status).toBeGreaterThanOrEqual(401);
    expect(anonymous.status).toBeLessThanOrEqual(403);
    await anonymous.body?.cancel();
    const past: ChatMessage[] = await (
      await fetch(roomPath(LOBBY_ROOM_ID, "history?limit=200"))
    ).json();
    expect(past.find((m) => m.id === id)?.reactions).toEqual(expected);
  });
});

demoDescribe("discussion — supprimer un salon", () => {
  let member: Record<string, string> = {};
  beforeAll(async () => {
    await ensureMember();
    const base = httpUrl("");
    member = await csrfHeaders(base, await userLogin(base));
  });

  /** `DELETE /demo/chat/rooms/{room}` au nom d'une session. */
  const destroy = (headers: Record<string, string>, roomId: string) =>
    fetch(httpUrl(`/demo/chat/rooms/${roomId}`), {
      method: "DELETE",
      headers,
    });

  it("403 au membre, 200 au propriétaire ; ensuite le salon et ses messages n'existent plus", async () => {
    const created = await post(admin, "/demo/chat/rooms", {
      name: roomName("éphémère"),
      access: "private",
    });
    expect(created.status).toBe(200);
    const room: IRoomView = await created.json();
    const invited = await post(admin, `/demo/chat/rooms/${room.id}/members`, {
      identifier: E2E_USER_IDENTIFIER,
      role: "moderator",
    });
    expect(invited.status).toBe(200);
    await invited.body?.cancel();
    expect(
      (await send(unique("dernier mot"), randomUUID(), {}, room.id)).status,
    ).toBe(200);
    // Modérateur, pas propriétaire : refusé.
    const refused = await destroy(member, room.id);
    expect(refused.status).toBe(403);
    await refused.body?.cancel();
    const done = await destroy(admin, room.id);
    expect(done.status).toBe(200);
    await done.body?.cancel();
    expect((await roomsOf(admin)).some((item) => item.id === room.id)).toBe(
      false,
    );
    expect((await roomsOf(member)).some((item) => item.id === room.id)).toBe(
      false,
    );
    const history = await fetch(roomPath(room.id, "history?limit=10"), {
      headers: admin,
    });
    expect(history.status).toBe(404);
    await history.body?.cancel();
    const again = await destroy(admin, room.id);
    expect(again.status).toBe(404);
    await again.body?.cancel();
  });

  /** `DELETE …/members/{user}` : quitter (son id) ou exclure (celui d'un autre). */
  const removeMember = (
    headers: Record<string, string>,
    roomId: string,
    userId: string,
  ) =>
    fetch(httpUrl(`/demo/chat/rooms/${roomId}/members/${userId}`), {
      method: "DELETE",
      headers,
    });

  it("🔴 exclure : le membre perd le salon ; un modérateur n'exclut pas un modérateur ; le propriétaire ne quitte pas", async () => {
    const created = await post(admin, "/demo/chat/rooms", {
      name: roomName("exclusion"),
      access: "private",
    });
    expect(created.status).toBe(200);
    const room: IRoomView = await created.json();
    const memberId = await idOf(member);
    const adminId = await idOf(admin);
    const invited = await post(admin, `/demo/chat/rooms/${room.id}/members`, {
      identifier: E2E_USER_IDENTIFIER,
      role: "moderator",
    });
    expect(invited.status).toBe(200);
    await invited.body?.cancel();
    const before = await fetch(roomPath(room.id, "history"), {
      headers: member,
    });
    expect(before.status).toBe(200);
    await before.body?.cancel();

    // Un modérateur ne retire pas le propriétaire.
    const upward = await removeMember(member, room.id, adminId);
    expect(upward.status).toBe(403);
    await upward.body?.cancel();
    // Le propriétaire ne quitte pas : il supprime.
    const ownerLeaves = await removeMember(admin, room.id, adminId);
    expect(ownerLeaves.status).toBe(403);
    await ownerLeaves.body?.cancel();

    const kicked = await removeMember(admin, room.id, memberId);
    expect(kicked.status).toBe(200);
    await kicked.body?.cancel();
    const after = await fetch(roomPath(room.id, "history"), {
      headers: member,
    });
    expect(after.status).toBe(403);
    await after.body?.cancel();
    expect((await roomsOf(member)).some((item) => item.id === room.id)).toBe(
      false,
    );
    const twice = await removeMember(admin, room.id, memberId);
    expect(twice.status).toBe(404);
    await twice.body?.cancel();
    await (await destroy(admin, room.id)).body?.cancel();
  });

  it("quitter : un membre se retire lui-même, et le salon privé lui est fermé", async () => {
    const created = await post(admin, "/demo/chat/rooms", {
      name: roomName("départ"),
      access: "private",
    });
    const room: IRoomView = await created.json();
    const memberId = await idOf(member);
    await (
      await post(admin, `/demo/chat/rooms/${room.id}/members`, {
        identifier: E2E_USER_IDENTIFIER,
        role: "member",
      })
    ).body?.cancel();
    const left = await removeMember(member, room.id, memberId);
    expect(left.status).toBe(200);
    await left.body?.cancel();
    const after = await fetch(roomPath(room.id, "history"), {
      headers: member,
    });
    expect(after.status).toBe(403);
    await after.body?.cancel();
    await (await destroy(admin, room.id)).body?.cancel();
  });

  it("l'accueil ne se supprime pas, même par son propriétaire", async () => {
    const res = await destroy(admin, LOBBY_ROOM_ID);
    expect(res.status).toBe(403);
    await res.body?.cancel();
  });
});
