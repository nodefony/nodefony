import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { rename } from "node:fs/promises";
import { deflateRawSync, gzipSync } from "node:zlib";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, vi, afterEach, afterAll } from "vitest";
import type { IUploadedFile } from "@nodefony/http";
import {
  FileClass,
  getScaffoldSpec,
  readSymbolsGraph,
  RequestContext,
} from "nodefony";
import { defineSecurityConfig } from "@nodefony/security";
import {
  defineDemoConfig,
  demoConfigJsonSchema,
} from "../nodefony/config/defineModuleConfig";
import {
  demoSecurity,
  MCP_AREA,
  PARTNER_AREA,
} from "../nodefony/config/security";
import DemoModule from "../index";
import DemoPulseService, {
  PULSE_MIN_INTERVAL_MS,
} from "../nodefony/service/DemoPulseService";
import type { IDemoPulse } from "../frontend/src/pulse";
import ChatService, {
  CHAT_ATTACHMENT_LIMIT,
  CHAT_ATTACHMENT_PER_ACCOUNT,
  CHAT_WRITE_QUOTA,
  CHAT_HISTORY_LIMIT,
} from "../nodefony/service/ChatService";
import { memoryArchive } from "./memoryArchive";
import { utf8ByteLength } from "../frontend/src/kit/utf8";
import {
  CreateRoomBody,
  EventBody,
  InviteBody,
  SendBody,
} from "../frontend/src/chat/chatSchemas";
import {
  INFLATE_LIMIT,
  PREVIEW_ENTRIES,
  PREVIEW_LINES,
  countLines,
  decodeText,
  describeFile,
  inflateHead,
  sniffImage,
} from "../frontend/src/kit/preview";
import {
  CSV_MAX_ROWS,
  GUESS_LANGUAGE_BYTES,
  detectBlocks,
} from "../frontend/src/kit/detect";
import { messageLinks } from "../frontend/src/kit/messageLinks";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FilePreview } from "../frontend/src/kit/FilePreview";
import {
  canonicalLanguage,
  highlightCode,
  tokensOfHtml,
} from "../frontend/src/kit/codeHighlight";
import {
  applyMention,
  codeMark,
  collectLinks,
  continueList,
  isBareLink,
  linkMark,
  mathMark,
  mentionAt,
  mentionOf,
  parseInline,
  parseMarkdown,
  prefixLines,
  suggestMentions,
  toggleMark,
} from "../frontend/src/kit/markdown";
import {
  attachmentProblem,
  fencePaste,
  insertAt,
  looksLikeCode,
  pasteRoute,
  textProblem,
} from "../frontend/src/chat/attachments";
import {
  ATTACHMENT_MAX_BYTES,
  ATTACHMENT_MAX_COUNT,
  MESSAGE_MAX_BYTES,
  MESSAGE_PREVIEW_MAX,
  PEOPLE_MAX,
  messagePreview,
  nextTyping,
  type ChatMessage,
} from "../frontend/src/chat/chatContract";
import {
  EVENT_MAX_MS,
  EVENT_PAST_TOLERANCE_MS,
  INVITE_EARLY_MS,
  LOBBY_ROOM_ID,
  ROOM_NAME_MAX,
  addUnread,
  admissionOf,
  canAppoint,
  canManage,
  directKey,
  directPeer,
  eventProblem,
  headlineEvent,
  memberStateOf,
  normalizeRoomName,
  roomChannel,
  roomIdOf,
  roomNameProblem,
  shouldNotify,
  titleWithUnread,
  totalUnread,
  unreadLabel,
  withUnread,
  type IRoomView,
} from "../frontend/src/chat/rooms";
import {
  ARRIVAL_MARK_MS,
  DEPARTURE_MARK_MS,
  RosterTracker,
  memberRows,
} from "../frontend/src/chat/roster";
import {
  LESSON_LAYERS,
  extractRegion,
  tabExcerpts,
  type ILesson,
} from "../frontend/src/lesson/lesson";
import { highlight } from "../frontend/src/highlight";
import {
  constantNames,
  resolveConstants,
} from "../frontend/src/lesson/lessonConstants";
import { LESSON_SOURCES } from "../frontend/src/lesson/lessonSources";
import { CHAT_LESSON } from "../frontend/src/chat/chatTabs";
import { PARTNER_LESSON } from "../frontend/src/partner/partnerTabs";
import { FIRST_LESSON } from "../frontend/src/first/firstTabs";
import { describeExchange } from "../frontend/src/first/exchange";
import { checkEcho } from "../frontend/src/first/firstClient";
import { SSE_LESSON } from "../frontend/src/sse/sseTabs";
import { answerWords, SSE_PATH } from "../frontend/src/sse/sseDemo";
import { readTimeline } from "../frontend/src/sse/sseTimeline";
import { VIDEO_LESSON } from "../frontend/src/video/videoTabs";
import { UPLOAD_LESSON } from "../frontend/src/upload/uploadTabs";
import { describeReceived, readBox } from "../frontend/src/video/fileMap";
import {
  MediaParams,
  SAMPLE_VIDEO,
  VIDEO_PATH,
} from "../frontend/src/video/videoDemo";
import {
  formatBody,
  hexPreview,
  isTextual,
  pickHeaders,
  pickSent,
  PROBE_BODY_LIMIT,
  type IProbeResult,
} from "../frontend/src/kit/probe";
import {
  decodeClaims,
  tamperSignature,
} from "../frontend/src/partner/partnerApi";
import { DEMOS } from "../demos";
import demoModuleConfig from "../nodefony/config/config";
import { BINARY_LESSON } from "../frontend/src/binary/binaryTabs";
import { MCP_LESSON } from "../frontend/src/mcp/mcpTabs";
import { METEOR_LESSON } from "../frontend/src/meteor/meteorTabs";
import { PRISM_LESSON } from "../frontend/src/prism/prismTabs";
import { SENSOR_LESSON } from "../frontend/src/sensor/sensorTabs";
import SensorService from "../nodefony/service/SensorService";
import {
  ACQUISITION_HZ,
  MACHINES,
  QUANTITIES,
  cryoRecord,
  windowRecord,
  type IAlarmBoard,
  type IPlantWindow,
} from "../frontend/src/sensor/sensorDemo";
import { defineRecord } from "../frontend/src/kit/records";
import {
  SnapshotBuffer,
  interpolateById,
} from "../frontend/src/game/snapshots";
import {
  BOOM_METEOR,
  boomRecord,
  DEFENDERS,
  meteorRecord,
  RING_RADIUS,
} from "../frontend/src/meteor/meteorDemo";
import {
  droneRecord,
  PRISM_CREW,
  prismTiles,
  tileAt,
} from "../frontend/src/prism/prismDemo";
import { GameRoom, IDLE_MS } from "../nodefony/game/GameRoom";
import { MeteorRules } from "../nodefony/service/MeteorService";
import { PrismRules } from "../nodefony/service/PrismService";
import {
  authServerMetadataRequest,
  authorizationServersOf,
  finalMessage,
  offersCodeFlow,
  progressOf,
  readMessages,
  readToken,
  sameOriginServer,
  toolText,
  toolsOf,
} from "../frontend/src/mcp/mcpClient";
import {
  CHAT_READ_MAX,
  MCP_GATE_PATH,
  MCP_TOOL_DIGEST,
  MCP_TOOL_POST,
  MCP_TOOL_READ,
  MCP_WRITE_SCOPE,
  type IMcpFeedEntry,
} from "../frontend/src/mcp/mcpDemo";
import { demoTools } from "../nodefony/mcp/demoTools";
import DemoMcpService, {
  MCP_FEED_MAX_PER_S,
} from "../nodefony/service/DemoMcpService";
import {
  BINARY_PATH,
  BINARY_SOCKET,
  DigestParams,
  PAYLOAD_LIMIT,
  SAMPLE_SIZES,
  SampleParams,
} from "../frontend/src/binary/binaryDemo";
import {
  readPositions,
  readSamples,
} from "../frontend/src/binary/binaryClient";
import {
  WIRE_CBOR,
  formatBytes,
  median,
  readCloses,
  readOffers,
  readWire,
  responses,
  sizeRows,
  throughput,
  typicalFrame,
} from "../frontend/src/binary/wire";
import { PARTNER_CALL_COMMAND } from "../nodefony/command/PartnerCallCommand";
import { SENSOR_PUSH_COMMAND } from "../nodefony/command/SensorPushCommand";
import { create, toBinary } from "@bufbuild/protobuf";
import { timestampFromMs } from "@bufbuild/protobuf/wkt";
import {
  LatestRequestSchema,
  LatestResponseSchema,
} from "../nodefony/gen/demo/telemetry/v1/telemetry_pb";
import { GRPC_LESSON } from "../frontend/src/grpc/grpcTabs";
import {
  encodeLatestRequest,
  envelope,
  GRPC_ENVELOPE_BYTES,
} from "../frontend/src/grpc/grpcClient";
import { readGrpcFrame } from "../frontend/src/grpc/grpcWire";
import { DOCS_NEXT, docsVersionFor, repoFileUrl } from "../frontend/src/about";

/**
 * Ce que ce test prouve, sans serveur :
 *  1. le module s'IMPORTE sans kernel — donc il reste testable hors serveur ;
 *  2. sa config refuse ce qu'elle ne connaît pas, et publie le nom court du
 *     secret machine ;
 *  3. la zone qu'il apporte à `@nodefony/security` est VALIDE pour lui, et sa
 *     ressource suit l'adresse publique de l'application ;
 *  4. le pouls de l'accueil publie au plus une fois par seconde, et se tait
 *     quand personne n'écoute ;
 *  5. chaque page d'apprentissage suit le modèle commun : onglets dans
 *     l'ordre des couches, chaque extrait cité existe et n'est pas vide,
 *     chaque décorateur employé est expliqué, chaque constante a sa valeur ;
 *  6. chaque RENVOI de l'index des démos (`demos.ts`) mène quelque part :
 *     fichier, page de doc, type exporté, commande, skill — c'est l'index que
 *     lit un agent avant d'ouvrir un fichier, un renvoi mort l'égare.
 */
describe("demo", () => {
  it("s'importe sans kernel", () => {
    expect(DemoModule).toBeTypeOf("function");
  });

  it("le secret machine est absent par défaut, et se règle par NF_KEYCLOAK_MACHINE_SECRET", () => {
    expect(defineDemoConfig({}).machineSecret).toBeUndefined();
    const schema = JSON.stringify(demoConfigJsonSchema());
    expect(schema).toContain('"env":"NF_KEYCLOAK_MACHINE_SECRET"');
    expect(schema).toContain('"secret":true');
  });

  it("le quota d'écriture du chat vaut CHAT_WRITE_QUOTA, se règle par NF_DEMO_CHAT_WRITE_QUOTA, et refuse zéro", () => {
    expect(defineDemoConfig({}).chatWriteQuota).toBe(CHAT_WRITE_QUOTA);
    expect(defineDemoConfig({ chatWriteQuota: 500 }).chatWriteQuota).toBe(500);
    expect(JSON.stringify(demoConfigJsonSchema())).toContain(
      '"env":"NF_DEMO_CHAT_WRITE_QUOTA"',
    );
    expect(() => defineDemoConfig({ chatWriteQuota: 0 })).toThrow();
  });

  it("refuse une clé INCONNUE plutôt que de l'ignorer", () => {
    expect(() => defineDemoConfig({ machineSecert: "faute" })).toThrow(
      /machineSecert/u,
    );
  });

  it("sa zone est acceptée par security, et sa ressource suit jwt.issuer", () => {
    const config = defineSecurityConfig({
      jwt: { issuer: "https://exemple.test" },
      ...demoSecurity,
    });
    expect(config.areas[PARTNER_AREA]?.resource).toBe(
      "https://exemple.test/demo/api/partner",
    );
  });
});

// L'archive en mémoire (`memoryArchive.ts`) tire l'`id` et l'instant comme la
// base le ferait. Ce que la base fait vraiment (ordre, un historique
// par salon) se prouve de bout en bout (`chat.e2e.test.ts`).
describe("demo — l'historique du chat", () => {
  it("écrire passe par l'archive : l'id et l'instant viennent d'elle, jamais de l'écrivain", async () => {
    const chat = new ChatService(undefined, undefined, memoryArchive());
    const sent = await chat.publish(LOBBY_ROOM_ID, {
      authorId: "u1",
      author: "alice",
      text: "bonjour",
    });
    expect(sent).toEqual({
      id: "m1",
      author: "alice",
      text: "bonjour",
      sentAt: 1,
    });
    expect(await chat.recent(LOBBY_ROOM_ID, CHAT_HISTORY_LIMIT)).toEqual([
      sent,
    ]);
  });

  it("sans archive joignable, écrire échoue en le disant", async () => {
    await expect(
      new ChatService().publish(LOBBY_ROOM_ID, {
        authorId: "u1",
        author: "alice",
        text: "x",
      }),
    ).rejects.toThrow(/aucune archive/u);
  });
});

describe("demo — la borne d'un message, en OCTETS", () => {
  it("le compteur rend ce que TextEncoder produirait, demi-caractère isolé compris", () => {
    const encoder = new TextEncoder();
    for (const text of [
      "",
      "abc",
      "été",
      "€",
      "😀",
      "a😀b",
      "\uD83D", // demi-caractère seul : U+FFFD, trois octets
      "\uDE00x",
    ])
      expect(utf8ByteLength(text), JSON.stringify(text)).toBe(
        encoder.encode(text).byteLength,
      );
  });

  it("64 Kio passent, un octet de plus non — un emoji compte quatre", () => {
    const full = "a".repeat(MESSAGE_MAX_BYTES);
    expect(textProblem(full)).toBeNull();
    expect(SendBody.safeParse({ text: full }).success).toBe(true);
    // Même nombre de CARACTÈRES moins trois, mais quatre octets pour l'emoji.
    const over = `${"a".repeat(MESSAGE_MAX_BYTES - 3)}😀`;
    expect(utf8ByteLength(over)).toBe(MESSAGE_MAX_BYTES + 1);
    expect(textProblem(over)).toMatch(/joins-le en fichier/u);
    expect(SendBody.safeParse({ text: over }).success).toBe(false);
    expect(attachmentProblem(over, [])).toBe(textProblem(over));
  });
});

describe("demo — qui entre dans un salon (règle pure)", () => {
  const NOW = 1_000_000_000;
  const publicRoom = { access: "public" as const, locked: false };
  const privateRoom = { access: "private" as const, locked: false };
  const invite = (start: number, end: number, extra: object = {}) => ({
    start,
    end,
    status: "confirmed" as const,
    partstat: "accepted" as const,
    ...extra,
  });

  it("un salon inconnu refuse", () => {
    expect(
      admissionOf({ room: null, member: true, invitations: [] }, NOW),
    ).toBe("refused");
  });

  it("un salon public non verrouillé accueille tout le monde, un verrouillé seulement ses membres", () => {
    expect(
      admissionOf({ room: publicRoom, member: false, invitations: [] }, NOW),
    ).toBe("public");
    const locked = { access: "public" as const, locked: true };
    expect(
      admissionOf({ room: locked, member: false, invitations: [] }, NOW),
    ).toBe("refused");
    expect(
      admissionOf({ room: locked, member: true, invitations: [] }, NOW),
    ).toBe("member");
  });

  it("un salon privé : membre oui, inconnu non", () => {
    expect(
      admissionOf({ room: privateRoom, member: true, invitations: [] }, NOW),
    ).toBe("member");
    expect(
      admissionOf({ room: privateRoom, member: false, invitations: [] }, NOW),
    ).toBe("refused");
  });

  it("un invité entre quinze minutes avant le début, jusqu'à la fin, pas après", () => {
    const facts = (start: number, end: number) => ({
      room: privateRoom,
      member: false,
      invitations: [invite(start, end)],
    });
    expect(
      admissionOf(facts(NOW + INVITE_EARLY_MS, NOW + 3_600_000), NOW),
    ).toBe("invited");
    expect(
      admissionOf(facts(NOW + INVITE_EARLY_MS + 1, NOW + 3_600_000), NOW),
    ).toBe("refused");
    expect(admissionOf(facts(NOW - 3_600_000, NOW), NOW)).toBe("invited");
    expect(admissionOf(facts(NOW - 3_600_000, NOW - 1), NOW)).toBe("refused");
  });

  it("une invitation déclinée, ou un événement annulé, n'ouvre rien", () => {
    const live = [NOW - 60_000, NOW + 60_000] as const;
    expect(
      admissionOf(
        {
          room: privateRoom,
          member: false,
          invitations: [invite(...live, { partstat: "declined" })],
        },
        NOW,
      ),
    ).toBe("refused");
    expect(
      admissionOf(
        {
          room: privateRoom,
          member: false,
          invitations: [invite(...live, { status: "cancelled" })],
        },
        NOW,
      ),
    ).toBe("refused");
  });

  it("le canal d'un salon se lit dans les deux sens, et refuse ce qui n'en est pas un", () => {
    expect(roomIdOf(roomChannel("equipe"))).toBe("equipe");
    expect(roomIdOf("chat:room:")).toBeNull();
    expect(roomIdOf("chat:room:a:b")).toBeNull();
    expect(roomIdOf("user:42")).toBeNull();
  });

  it("l'en-tête montre l'événement en cours, sinon le prochain, jamais un annulé ou fini", () => {
    const ev = (
      id: string,
      start: number,
      end: number,
      status = "confirmed" as const,
    ) => ({ id, title: id, start, end, status });
    expect(
      headlineEvent(
        [ev("fini", NOW - 20, NOW - 10), ev("demain", NOW + 100, NOW + 200)],
        NOW,
      )?.id,
    ).toBe("demain");
    expect(
      headlineEvent(
        [
          ev("demain", NOW + 100, NOW + 200),
          ev("maintenant", NOW - 5, NOW + 5),
        ],
        NOW,
      )?.id,
    ).toBe("maintenant");
    expect(
      headlineEvent(
        [{ ...ev("annulé", NOW - 5, NOW + 5), status: "cancelled" as const }],
        NOW,
      ),
    ).toBeNull();
  });
});

describe("demo — les formulaires des salons (règles pures)", () => {
  it("un nom de salon est normalisé : NFC, bords retirés, espaces réduits", () => {
    // « é » composé (U+00E9) et « e » + accent combinant (U+0301) : le même nom.
    expect(normalizeRoomName("  Café   du   matin ")).toBe("Café du matin");
  });

  it("un nom vide, trop long ou au préfixe réservé est refusé, en le disant", () => {
    expect(roomNameProblem("")).toMatch(/nom/u);
    expect(roomNameProblem("a".repeat(ROOM_NAME_MAX))).toBeNull();
    expect(roomNameProblem("a".repeat(ROOM_NAME_MAX + 1))).toMatch(/80/u);
    // Le préfixe des salons à deux, quelle que soit la casse.
    expect(roomNameProblem("DM:alice")).toMatch(/réservé/u);
  });

  it("le schéma rend le nom NORMALISÉ à l'action, et refuse un champ en trop", () => {
    const parsed = CreateRoomBody.parse({
      name: "  projet   atlas ",
      access: "private",
    });
    expect(parsed.name).toBe("projet atlas");
    expect(
      CreateRoomBody.safeParse({ name: "x", access: "public", ownerId: "moi" })
        .success,
    ).toBe(false);
  });

  it("un créneau : la fin après le début, 24 h au plus, pas dans le passé", () => {
    const now = 1_000_000_000_000;
    const hour = 3_600_000;
    expect(eventProblem(now, now + hour, now)).toBeNull();
    expect(eventProblem(now + hour, now + hour, now)).toMatch(/après/u);
    expect(eventProblem(now, now + EVENT_MAX_MS + 1, now)).toMatch(/24 h/u);
    expect(
      eventProblem(now - EVENT_PAST_TOLERANCE_MS, now + hour, now),
    ).toBeNull();
    expect(
      eventProblem(now - EVENT_PAST_TOLERANCE_MS - 1, now + hour, now),
    ).toMatch(/passé/u);
  });

  it("le schéma d'un événement refuse un fuseau inconnu et un créneau à l'envers", () => {
    const start = Date.now() + 3_600_000;
    const ok = {
      title: "Revue",
      start,
      end: start + 1_800_000,
      timeZone: "Europe/Paris",
    };
    expect(EventBody.parse(ok).attendees).toEqual([]);
    expect(
      EventBody.safeParse({ ...ok, timeZone: "Mars/Olympus" }).success,
    ).toBe(false);
    expect(EventBody.safeParse({ ...ok, end: start }).success).toBe(false);
  });

  it("inviter : membre par défaut", () => {
    expect(InviteBody.parse({ identifier: " bob " })).toEqual({
      identifier: "bob",
      role: "member",
    });
  });

  it("qui gère : le propriétaire et les modérateurs ; seul le propriétaire nomme un modérateur", () => {
    expect([
      canManage("owner"),
      canManage("moderator"),
      canManage("member"),
      canManage(null),
    ]).toEqual([true, true, false, false]);
    expect(canAppoint("owner", "moderator")).toBe(true);
    expect(canAppoint("moderator", "moderator")).toBe(false);
    expect(canAppoint("moderator", "member")).toBe(true);
    expect(canAppoint("member", "member")).toBe(false);
    // Personne ne nomme un second propriétaire.
    expect(canAppoint("owner", "owner")).toBe(false);
  });

  it("un salon à deux : le même nom dans les deux sens, et l'autre personne retrouvée", () => {
    const [a, b] = [
      "0f1e2d3c-aaaa-4bbb-8ccc-000000000001",
      "9a8b7c6d-aaaa-4bbb-8ccc-000000000002",
    ];
    expect(directKey(a, b)).toBe(directKey(b, a));
    expect(directKey(a, b).length).toBeLessThanOrEqual(ROOM_NAME_MAX);
    expect(directPeer(directKey(a, b), a)).toBe(b);
    expect(directPeer(directKey(a, b), b)).toBe(a);
    // Une troisième personne n'y lit rien, ni un salon ordinaire.
    expect(directPeer(directKey(a, b), "c")).toBeNull();
    expect(directPeer("salon", a)).toBeNull();
    // Un identifiant qui contient « : » ne trompe pas la lecture.
    expect(directPeer(directKey("x:1", "y"), "y")).toBe("x:1");
  });
});

describe("demo — les non-lus (D52, règles pures)", () => {
  const room = (id: string, unread: number): IRoomView => ({
    id,
    name: id,
    kind: "chat",
    access: "private",
    locked: false,
    description: null,
    role: "member",
    event: null,
    peer: null,
    unread,
  });

  it("la pastille : rien à zéro, le nombre jusqu'à 99, « 99+ » au-delà", () => {
    expect(unreadLabel(0)).toBeNull();
    expect(unreadLabel(1)).toBe("1");
    expect(unreadLabel(99)).toBe("99");
    expect(unreadLabel(100)).toBe("99+");
  });

  it("🔴 ramener un salon à zéro ne touche que lui — et rend la MÊME liste si rien ne change", () => {
    const rooms = [room("a", 3), room("b", 2)];
    const next = withUnread(rooms, "a", 0);
    expect(next.map((r) => r.unread)).toEqual([0, 2]);
    expect(rooms[0]?.unread).toBe(3); // l'ancienne liste reste intacte
    expect(next[1]).toBe(rooms[1]);
    expect(withUnread(next, "a", 0)).toBe(next);
    expect(withUnread(next, "inconnu", 0)).toBe(next);
  });

  it("D53 — un non-lu de plus : le salon visé seul ; un salon inconnu rend la MÊME liste", () => {
    const rooms = [room("a", 0), room("b", 98)];
    expect(addUnread(rooms, "b").map((r) => r.unread)).toEqual([0, 99]);
    expect(addUnread(rooms, "inconnu")).toBe(rooms);
  });

  it("D53 — le titre de l'onglet : le total devant, plafonné ; rien à zéro", () => {
    expect(totalUnread([room("a", 2), room("b", 3)])).toBe(5);
    expect(titleWithUnread("Démo", 0)).toBe("Démo");
    expect(titleWithUnread("Démo", 5)).toBe("(5) Démo");
    expect(titleWithUnread("Démo", 250)).toBe("(99+) Démo");
  });

  it("🔴 D54 — notifier : une conversation à deux, la personne ailleurs, permission accordée — et rien d'autre", () => {
    const yes = { direct: true, away: true, permission: "granted" as const };
    expect(shouldNotify(yes)).toBe(true);
    expect(shouldNotify({ ...yes, direct: false })).toBe(false);
    expect(shouldNotify({ ...yes, away: false })).toBe(false);
    for (const permission of ["default", "denied", "unsupported"] as const)
      expect(shouldNotify({ ...yes, permission })).toBe(false);
  });
});

describe("demo — l'extrait d'une alerte (D53, règle pure)", () => {
  const message = (text: string, pieces = 0): ChatMessage => ({
    id: "m1",
    author: "zoé",
    text,
    sentAt: 1,
    ...(pieces === 0
      ? {}
      : {
          attachments: Array.from({ length: pieces }, (_, i) => ({
            id: `p${i}`,
            name: "a.png",
            size: 1,
            kind: "image" as const,
          })),
        }),
  });

  it("le texte sur une ligne ; un message de pièces seules dit combien", () => {
    expect(messagePreview(message("  bonjour\n\n  à tous  "))).toBe(
      "bonjour à tous",
    );
    expect(messagePreview(message("", 2))).toBe("📎 2 pièce(s) jointe(s)");
    expect(messagePreview(message(""))).toBe("(message vide)");
  });

  it("🔴 borné à MESSAGE_PREVIEW_MAX sans couper un emoji, même au bout d'un texte de 64 Kio", () => {
    const long = messagePreview(message("x".repeat(65_536)));
    expect(long).toHaveLength(MESSAGE_PREVIEW_MAX);
    expect(long.endsWith("…")).toBe(true);
    // L'emoji (deux unités UTF-16) chevauche la coupe : il part entier.
    const emoji = "a".repeat(MESSAGE_PREVIEW_MAX - 2) + "😀" + "b".repeat(10);
    const cut = messagePreview(message(emoji));
    expect(cut).toBe(`${"a".repeat(MESSAGE_PREVIEW_MAX - 2)}…`);
    expect(cut.isWellFormed()).toBe(true);
  });
});

describe("demo — les membres d'un salon privé (D51, règle pure)", () => {
  const inRoom = new Map([["bob", { tabs: 1 }]]);
  const members = [
    { id: "zoe", name: "zoé", role: "member" as const, online: false },
    { id: "bob", name: "bob", role: "member" as const, online: true },
    { id: "ann", name: "ann", role: "owner" as const, online: true },
    { id: "max", name: "max", role: "moderator" as const, online: true },
  ];
  const room = { id: "projet", direct: false };

  it("dans le salon (présence du salon) prime sur « en ligne » ; sinon en ligne ailleurs ; sinon absent", () => {
    expect(memberStateOf({ id: "bob", online: false }, inRoom)).toBe("here");
    expect(memberStateOf({ id: "ann", online: true }, inRoom)).toBe("online");
    expect(memberStateOf({ id: "zoe", online: false }, inRoom)).toBe("away");
  });

  it("ordre : soi, puis l'état, puis le rôle, puis le nom", () => {
    const rows = memberRows(members, inRoom, "zoe", room, "member");
    expect(rows.map((r) => [r.id, r.state])).toEqual([
      ["zoe", "away"],
      ["bob", "here"],
      ["ann", "online"],
      ["max", "online"],
    ]);
  });

  it("🔴 « Exclure » suit la règle partagée : jamais soi, jamais le propriétaire, un modérateur par le propriétaire seul", () => {
    const removable = (me: string, myRole: "owner" | "moderator" | "member") =>
      Object.fromEntries(
        memberRows(members, inRoom, me, room, myRole).map((r) => [
          r.id,
          r.removable,
        ]),
      );
    expect(removable("ann", "owner")).toEqual({
      ann: false,
      bob: true,
      max: true,
      zoe: true,
    });
    expect(removable("max", "moderator")).toEqual({
      max: false,
      bob: true,
      ann: false,
      zoe: true,
    });
    expect(removable("bob", "member")).toEqual({
      bob: false,
      ann: false,
      max: false,
      zoe: false,
    });
    // Un salon à deux appartient aux deux : personne n'en exclut personne.
    expect(
      memberRows(members, inRoom, "ann", { id: "dm", direct: true }, "owner")
        .map((r) => r.removable)
        .some(Boolean),
    ).toBe(false);
  });
});

describe("demo — le panneau des présents (règle pure)", () => {
  /** Une vue de présence : identité → onglets. */
  const view = (entries: Record<string, number>) =>
    new Map(Object.entries(entries).map(([id, tabs]) => [id, { tabs }]));

  it("la première vue ne marque personne : « vient d'arriver » est une nouvelle, pas un état initial", () => {
    const roster = new RosterTracker();
    roster.observe(view({ a: 1, b: 2 }), false, 0);
    expect(roster.rows(null, 0).map((r) => r.state)).toEqual(["here", "here"]);
  });

  it("une arrivée est marquée deux secondes, un départ reste visible trois secondes", () => {
    const roster = new RosterTracker();
    roster.observe(view({ a: 1, b: 1 }), false, 0);
    roster.observe(view({ a: 1, c: 1 }), false, 1000);
    const states = (now: number) =>
      Object.fromEntries(roster.rows(null, now).map((r) => [r.id, r.state]));
    expect(states(1000)).toEqual({ a: "here", b: "left", c: "arrived" });
    expect(roster.nextChange(1000)).toBe(ARRIVAL_MARK_MS);
    expect(states(1000 + ARRIVAL_MARK_MS)).toEqual({
      a: "here",
      b: "left",
      c: "here",
    });
    expect(states(1000 + DEPARTURE_MARK_MS)).toEqual({ a: "here", c: "here" });
    expect(roster.nextChange(1000 + DEPARTURE_MARK_MS)).toBeNull();
  });

  it("une vue partielle (bus perdu, reconnexion) ne fabrique ni arrivée ni départ", () => {
    const roster = new RosterTracker();
    roster.observe(view({ a: 1, b: 1 }), false, 0);
    roster.observe(view({ a: 1, c: 1 }), true, 10);
    expect(roster.rows(null, 10).map((r) => [r.id, r.state])).toEqual([
      ["a", "here"],
      ["c", "here"],
    ]);
  });

  it("trie : soi d'abord, puis l'alphabet français, les inconnus en dernier", () => {
    const roster = new RosterTracker();
    roster.observe(view({ u1: 1, u2: 1, u3: 1, u4: 1 }), false, 0);
    roster.learn(
      ["u1", "u2", "u3"],
      [
        { id: "u1", name: "Zoé" },
        { id: "u2", name: "élodie" },
        { id: "u3", name: "Bob" },
      ],
    );
    expect(roster.rows("u1", 0).map((r) => r.name)).toEqual([
      "Zoé",
      "Bob",
      "élodie",
      null,
    ]);
  });

  it("demande chaque nom UNE fois ; un nom non rendu redevient demandable", () => {
    const roster = new RosterTracker();
    roster.observe(view({ a: 1, b: 1 }), false, 0);
    const asked = roster.missingNames();
    expect(asked).toEqual(["a", "b"]);
    expect(roster.missingNames()).toEqual([]);
    roster.learn(asked, [{ id: "a", name: "Alice" }]);
    expect(roster.missingNames()).toEqual(["b"]);
  });

  it("borne une demande à PEOPLE_MAX identités", () => {
    const roster = new RosterTracker();
    const many: Record<string, number> = {};
    for (let i = 0; i < PEOPLE_MAX + 5; i += 1) many[`u${i}`] = 1;
    roster.observe(view(many), false, 0);
    expect(roster.missingNames()).toHaveLength(PEOPLE_MAX);
    expect(roster.missingNames()).toHaveLength(5);
  });
});

describe("demo — les règles des pièces jointes (page ET serveur)", () => {
  it("🔴 un collage reste un MESSAGE : du code entre dans un bloc, seul plus lourd qu'un message devient une pièce", () => {
    const code = [
      'import { defineConfig } from "nodefony";',
      "",
      "export default defineConfig({",
      '  name: "app",',
      "  modules: [],",
      "});",
    ].join("\n");
    const prose =
      "Bonjour à tous.\nLa réunion est déplacée à jeudi.\nMerci de prévenir l'équipe.";
    expect(looksLikeCode(code)).toBe(true);
    expect(looksLikeCode(prose)).toBe(false);
    expect(looksLikeCode("a;\nb;")).toBe(false); // deux lignes : trop peu pour juger
    expect(pasteRoute(prose)).toBe("text");
    expect(pasteRoute(code)).toBe("code");
    expect(pasteRoute(`${code}\n\`\`\`\nx;`)).toBe("piece");
    // Un gros fichier de code qui tient dans un message reste un message.
    const big = `${code}\n`.repeat(200);
    expect(utf8ByteLength(big)).toBeGreaterThan(1500);
    expect(pasteRoute(big)).toBe("code");
    expect(pasteRoute("x".repeat(MESSAGE_MAX_BYTES))).toBe("piece");
    expect(fencePaste(`${code}\r\n\r\n`)).toBe(`\`\`\`\n${code}\n\`\`\`\n`);
    // Le bloc collé se relit comme UN bloc de code, lignes vides comprises.
    expect(parseMarkdown(fencePaste(code))).toEqual([
      { type: "pre", value: code },
    ]);
    expect(countLines("")).toBe(0);
    expect(countLines("un\ndeux\n")).toBe(2);
  });

  it("refuse le vide, le trop-plein et la pièce trop grosse ou vide", () => {
    const one = { name: "a.txt", size: 10 };
    expect(attachmentProblem("", [])).toBe("message vide");
    expect(attachmentProblem("salut", [])).toBeNull();
    expect(attachmentProblem("", [one])).toBeNull();
    expect(
      attachmentProblem(
        "",
        Array.from({ length: ATTACHMENT_MAX_COUNT + 1 }, () => one),
      ),
    ).toMatch(/au plus/u);
    expect(
      attachmentProblem("", [
        { name: "g.bin", size: ATTACHMENT_MAX_BYTES + 1 },
      ]),
    ).toMatch(/dépasse/u);
    expect(attachmentProblem("", [{ name: "v.txt", size: 0 }])).toMatch(
      /vide/u,
    );
  });

  it("une émoticône s'insère à la place de la sélection, curseur après elle", () => {
    expect(insertAt("bonjour", 3, 7, "🙂")).toEqual({
      value: "bon🙂",
      caret: 5,
    });
  });
});

describe("demo — les pièces du salon, classées d'après leurs OCTETS", () => {
  const work = mkdtempSync(path.join(os.tmpdir(), "nf-demo-chat-"));
  afterAll(() => rmSync(work, { recursive: true, force: true }));
  let seq = 0;

  /** Un fichier reçu, tel que le sous-système d'upload le rend. */
  const upload = (filename: string, bytes: Uint8Array): IUploadedFile => {
    seq += 1;
    let at = path.join(work, `incoming-${seq}`);
    writeFileSync(at, bytes);
    const file: IUploadedFile = {
      filename,
      size: bytes.length,
      prettySize: `${bytes.length} o`,
      mimeType: "image/png", // ce que le navigateur DÉCLARE : jamais cru
      hash: null,
      hashAlgorithm: false,
      lastModifiedDate: null,
      // Le fichier de DESTINATION, comme le vrai : un `FileClass`.
      move: () => {
        throw new Error("move() synchrone : jamais appelé par la démo");
      },
      moveAsync: async (target) => {
        await rename(at, target);
        at = target;
        return FileClass.from(target);
      },
      getMimeType: () => file.mimeType,
      getSize: () => file.size,
      getPrettySize: () => file.prettySize,
    };
    return file;
  };
  const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const store = () => new ChatService(undefined, path.join(work, `s${seq}`));

  it("🔴 une page HTML déclarée image/png n'est PAS une image : texte, téléchargée", async () => {
    const chat = store();
    const [piece] = await chat.saveAttachments(LOBBY_ROOM_ID, "u1", [
      upload("photo.png", new TextEncoder().encode("<script>x</script>\n")),
    ]);
    expect(piece?.kind).toBe("text");
    expect(chat.attachment(piece?.id ?? "")?.mime).toBe(
      "text/plain; charset=utf-8",
    );
  });

  it("🔴 une pièce retient le salon de son message : la servir exigera d'y être admis", async () => {
    const chat = store();
    const [piece] = await chat.saveAttachments("equipe", "u1", [
      upload("note.txt", new TextEncoder().encode("privé\n")),
    ]);
    expect(chat.attachment(piece?.id ?? "")?.roomId).toBe("equipe");
  });

  it("une vraie image est reconnue à sa signature ; un binaire reste un fichier", async () => {
    expect(sniffImage(PNG)).toBe("image/png");
    expect(sniffImage(new Uint8Array([0x3c, 0x73, 0x76, 0x67]))).toBeNull();
    expect(decodeText(new Uint8Array([0x61, 0x00, 0x62]))).toBeNull();
    expect(decodeText(new Uint8Array([0xff, 0xfe]))).toBeNull();
    const chat = store();
    const [image, binary] = await chat.saveAttachments(LOBBY_ROOM_ID, "u1", [
      upload("a.png", PNG),
      upload("b.bin", new Uint8Array([1, 0, 2, 3])),
    ]);
    expect(image?.kind).toBe("image");
    expect(binary?.kind).toBe("file");
    expect(chat.attachment(binary?.id ?? "")?.mime).toBe(
      "application/octet-stream",
    );
  });

  it("un texte annonce ses lignes et ses PREVIEW_LINES premières", async () => {
    const chat = store();
    const [piece] = await chat.saveAttachments(LOBBY_ROOM_ID, "u1", [
      upload(
        "collé.txt",
        new TextEncoder().encode(
          Array.from({ length: PREVIEW_LINES + 2 }, (_, i) => i + 1).join("\n"),
        ),
      ),
    ]);
    expect(piece).toMatchObject({
      kind: "text",
      lines: PREVIEW_LINES + 2,
      preview: Array.from({ length: PREVIEW_LINES }, (_, i) => i + 1).join(
        "\n",
      ),
    });
  });

  it("le stock est BORNÉ : la plus ancienne sort, fichier effacé, annonce marquée à la relecture", async () => {
    seq += 1;
    const chat = new ChatService(
      undefined,
      path.join(work, `s${seq}`),
      memoryArchive(),
    );
    const [first] = await chat.saveAttachments(LOBBY_ROOM_ID, "u1", [
      upload("0.png", PNG),
    ]);
    await chat.publish(LOBBY_ROOM_ID, {
      authorId: "u1",
      author: "a",
      text: "",
      attachments: first ? [first] : [],
    });
    const [kept] = (await chat.recent(LOBBY_ROOM_ID, 1))[0]?.attachments ?? [];
    expect(kept?.expired).toBeUndefined();
    // Un compte par pièce : seule la borne du DISQUE joue ici.
    for (let i = 1; i <= CHAT_ATTACHMENT_LIMIT; i += 1)
      await chat.saveAttachments(LOBBY_ROOM_ID, `o${i}`, [
        upload(`${i}.png`, PNG),
      ]);
    expect(chat.attachment(first?.id ?? "")).toBeUndefined();
    // L'historique vient de l'archive (la base) : la pièce partie s'y annonce
    // à la LECTURE, rien n'a été réécrit.
    const [gone] = (await chat.recent(LOBBY_ROOM_ID, 1))[0]?.attachments ?? [];
    expect(gone?.expired).toBe(true);
    const dir = path.dirname(
      chat.attachment(
        (
          await chat.saveAttachments(LOBBY_ROOM_ID, "oz", [
            upload("z.png", PNG),
          ])
        )[0]?.id ?? "",
      )?.file ?? "",
    );
    expect(readdirSync(dir)).toHaveLength(CHAT_ATTACHMENT_LIMIT);
  });

  it("🔴 un compte qui enchaîne les pièces ne pousse dehors que les SIENNES", async () => {
    seq += 1;
    const chat = new ChatService(
      undefined,
      path.join(work, `s${seq}`),
      memoryArchive(),
    );
    const [other] = await chat.saveAttachments(LOBBY_ROOM_ID, "autre", [
      upload("autre.png", PNG),
    ]);
    const greedy: string[] = [];
    for (let i = 0; i < CHAT_ATTACHMENT_PER_ACCOUNT + 5; i += 1) {
      const [piece] = await chat.saveAttachments(LOBBY_ROOM_ID, "vorace", [
        upload(`${i}.png`, PNG),
      ]);
      greedy.push(piece?.id ?? "");
    }
    expect(chat.attachment(other?.id ?? "")).toBeDefined();
    const kept = greedy.filter((id) => chat.attachment(id) !== undefined);
    // Ses plus anciennes sont parties, les plus récentes restent.
    expect(kept).toEqual(greedy.slice(5));
  });

  it("un envoi refusé ne laisse rien sur le disque", async () => {
    const chat = new ChatService(undefined, path.join(work, "refus"));
    await chat.discard([upload("x.bin", new Uint8Array([1, 2]))]);
    expect(readdirSync(path.join(work, "refus"))).toEqual([]);
  });

  /** Un zip minimal : en-têtes locaux, index central, fin d'index. */
  const zip = (files: Record<string, string>, deflate = true): Buffer => {
    const locals: Buffer[] = [];
    const central: Buffer[] = [];
    let offset = 0;
    for (const [name, content] of Object.entries(files)) {
      const raw = Buffer.from(content);
      const data = deflate ? deflateRawSync(raw) : raw;
      const label = Buffer.from(name);
      const local = Buffer.alloc(30);
      local.writeUInt32LE(0x04034b50, 0);
      local.writeUInt16LE(deflate ? 8 : 0, 8);
      local.writeUInt32LE(data.length, 18);
      local.writeUInt32LE(raw.length, 22);
      local.writeUInt16LE(label.length, 26);
      const entry = Buffer.alloc(46);
      entry.writeUInt32LE(0x02014b50, 0);
      entry.writeUInt16LE(deflate ? 8 : 0, 10);
      entry.writeUInt32LE(data.length, 20);
      entry.writeUInt32LE(raw.length, 24);
      entry.writeUInt16LE(label.length, 28);
      entry.writeUInt32LE(offset, 42);
      locals.push(local, label, data);
      central.push(entry, label);
      offset += 30 + label.length + data.length;
    }
    const index = Buffer.concat(central);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(Object.keys(files).length, 8);
    end.writeUInt16LE(Object.keys(files).length, 10);
    end.writeUInt32LE(index.length, 12);
    end.writeUInt32LE(offset, 16);
    return Buffer.concat([...locals, index, end]);
  };

  /** Une archive tar (ustar) : un en-tête de 512 octets par entrée. */
  const tar = (files: Record<string, string>): Buffer => {
    const blocks: Buffer[] = [];
    for (const [name, content] of Object.entries(files)) {
      const header = Buffer.alloc(512);
      header.write(name, 0);
      header.write(content.length.toString(8).padStart(11, "0"), 124);
      header.write(name.endsWith("/") ? "5" : "0", 156);
      header.write("ustar\u000000", 257);
      const body = Buffer.alloc(Math.ceil(content.length / 512) * 512);
      body.write(content);
      blocks.push(header, body);
    }
    blocks.push(Buffer.alloc(1024));
    return Buffer.concat(blocks);
  };

  it("🔴 un zip annonce son INDEX : 20 entrées au plus, sur le total", async () => {
    const files: Record<string, string> = {};
    for (let i = 1; i <= 25; i += 1) files[`src/f${i}.txt`] = "x".repeat(i);
    const [piece] = await store().saveAttachments(LOBBY_ROOM_ID, "u1", [
      upload("code.zip", zip(files)),
    ]);
    expect(piece).toMatchObject({ kind: "archive", format: "zip", total: 25 });
    expect(piece?.entries).toHaveLength(PREVIEW_ENTRIES);
    expect(piece?.entries?.[2]).toEqual({ name: "src/f3.txt", size: 3 });
  });

  it("un tar et un tar.gz se listent ; un dossier est une entrée de taille 0", async () => {
    const archive = tar({
      "app/": "",
      "app/a.txt": "abc",
      "app/b.txt": "x".repeat(700),
    });
    const [plain, packed] = await store().saveAttachments(LOBBY_ROOM_ID, "u1", [
      upload("a.tar", archive),
      upload("a.tar.gz", gzipSync(archive)),
    ]);
    const entries = [
      { name: "app/", size: 0 },
      { name: "app/a.txt", size: 3 },
      { name: "app/b.txt", size: 700 },
    ];
    expect(plain).toMatchObject({
      kind: "archive",
      format: "tar",
      total: 3,
      entries,
    });
    expect(packed).toMatchObject({
      kind: "archive",
      format: "tar.gz",
      total: 3,
      entries,
    });
  });

  it("🔴 une bombe est COUPÉE : la décompression s'arrête au premier mégaoctet", async () => {
    const bomb = deflateRawSync(Buffer.alloc(8 * INFLATE_LIMIT));
    expect(bomb.length).toBeLessThan(16_384);
    const out = await inflateHead(bomb, "raw", INFLATE_LIMIT);
    expect(out).toMatchObject({ truncated: true });
    expect(out.bytes.length).toBe(INFLATE_LIMIT);
    const [piece] = await store().saveAttachments(LOBBY_ROOM_ID, "u1", [
      upload(
        "bombe.tar.gz",
        gzipSync(tar({ "zero.bin": "\u0000".repeat(3 * INFLATE_LIMIT) })),
      ),
    ]);
    expect(piece).toMatchObject({ kind: "archive", truncated: true, total: 1 });
  });

  it("un Word et un ODT montrent leurs premiers paragraphes, entités décodées", async () => {
    const docx = zip({
      "[Content_Types].xml": "<Types/>",
      "word/document.xml":
        '<w:document><w:body><w:p><w:r><w:t>Bonjour </w:t></w:r><w:r><w:t xml:space="preserve">&amp; bienvenue</w:t></w:r></w:p><w:p></w:p><w:p><w:r><w:tab/><w:t>Deuxième</w:t></w:r></w:p></w:body></w:document>',
    });
    const odt = zip(
      {
        mimetype: "application/vnd.oasis.opendocument.text",
        "content.xml":
          '<office:document-content><office:body><office:text><text:h text:outline-level="1">Titre</text:h><text:p>Un<text:s/>texte &lt;ici&gt;</text:p></office:text></office:body></office:document-content>',
      },
      false,
    );
    const [word, odf] = await store().saveAttachments(LOBBY_ROOM_ID, "u1", [
      upload("lettre.docx", docx),
      upload("note.odt", odt),
    ]);
    expect(word).toMatchObject({
      kind: "document",
      format: "docx",
      paragraphs: ["Bonjour & bienvenue", "Deuxième"],
    });
    expect(odf).toMatchObject({
      kind: "document",
      format: "odt",
      paragraphs: ["Titre", "Un texte <ici>"],
    });
  });

  it("un Excel et un ODS montrent le coin de la première feuille", async () => {
    const xlsx = zip({
      "xl/workbook.xml": "<workbook/>",
      "xl/sharedStrings.xml":
        "<sst><si><t>Nom</t></si><si><t>Ville</t></si><si><r><t>Ly</t></r><r><t>on</t></r></si></sst>",
      "xl/worksheets/sheet1.xml":
        '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="C1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>Alice</t></is></c><c r="B2"><v>42</v></c><c r="C2" t="s"><v>2</v></c><c r="H2"><v>9</v></c></row></sheetData></worksheet>',
    });
    const ods = zip({
      mimetype: "application/vnd.oasis.opendocument.spreadsheet",
      "content.xml":
        '<office:spreadsheet><table:table table:name="F1"><table:table-row><table:table-cell><text:p>a</text:p></table:table-cell><table:table-cell table:number-columns-repeated="2"/><table:table-cell><text:p>d</text:p></table:table-cell></table:table-row><table:table-row table:number-rows-repeated="1048575"><table:table-cell table:number-columns-repeated="16384"/></table:table-row></table:table><table:table table:name="F2"><table:table-row><table:table-cell><text:p>autre</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet>',
    });
    const [excel, calc] = await store().saveAttachments(LOBBY_ROOM_ID, "u1", [
      upload("t.xlsx", xlsx),
      upload("t.ods", ods),
    ]);
    expect(excel).toMatchObject({
      kind: "sheet",
      format: "xlsx",
      rows: [
        ["Nom", "", "Ville"],
        ["Alice", "42", "Lyon"],
      ],
    });
    expect(calc).toMatchObject({
      kind: "sheet",
      format: "ods",
      rows: [["a", "", "", "d"]],
    });
  });

  it("un PDF s'affiche, d'après %PDF- ; un zip illisible reste un fichier", async () => {
    const chat = store();
    const [pdf, broken] = await chat.saveAttachments(LOBBY_ROOM_ID, "u1", [
      upload("doc.bin", new TextEncoder().encode("%PDF-1.7\n%âãÏÓ\n")),
      upload("casse.zip", new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0, 0])),
    ]);
    expect(pdf?.kind).toBe("pdf");
    expect(chat.attachment(pdf?.id ?? "")?.mime).toBe("application/pdf");
    expect(broken?.kind).toBe("file");
  });

  it("🔴 le navigateur annonce le MÊME aperçu que le serveur (`describeFile`, isomorphe)", async () => {
    const samples: [string, Uint8Array][] = [
      ["a.png", PNG],
      ["notes.txt", new TextEncoder().encode("un\ndeux\ntrois\nquatre\n")],
      ["code.zip", zip({ "a.txt": "abc", "b/c.txt": "de" })],
      ["code.tar.gz", gzipSync(tar({ "x.txt": "hello" }))],
      ["b.bin", new Uint8Array([1, 0, 2, 3])],
    ];
    const pieces = await store().saveAttachments(
      LOBBY_ROOM_ID,
      "u1",
      samples.map(([name, bytes]) => upload(name, bytes)),
    );
    for (const [i, [, bytes]] of samples.entries()) {
      const {
        id: _id,
        name: _name,
        size: _size,
        ...server
      } = pieces[i] ?? {
        id: "",
        name: "",
        size: 0,
        kind: "file",
      };
      expect((await describeFile(bytes)).fields).toEqual(server);
    }
    // Le même fichier tourne dans le navigateur : aucune API propre à Node.
    const source = readFileSync(
      path.join(
        path.dirname(path.dirname(fileURLToPath(import.meta.url))),
        "frontend/src/kit/preview.ts",
      ),
      "utf8",
    );
    expect(source).not.toMatch(/["']node:|\bBuffer\b|\brequire\(/);
  });
});

describe("demo — le Markdown du salon, le même pour tous", () => {
  it("gras, italique, code, lien ; un marqueur orphelin et snake_case restent du texte", () => {
    expect(
      parseInline("**gras** et _it_ puis `a*b` [doc](https://x.dev/a)"),
    ).toEqual([
      { type: "strong", children: ["gras"] },
      " et ",
      { type: "em", children: ["it"] },
      " puis ",
      { type: "code", value: "a*b" },
      " ",
      { type: "link", href: "https://x.dev/a", children: ["doc"] },
    ]);
    expect(parseInline("ma_variable_longue * 2 **seul")).toEqual([
      "ma_variable_longue * 2 **seul",
    ]);
    expect(parseInline("voir https://nodefony.net/doc.")).toEqual([
      "voir ",
      {
        type: "link",
        href: "https://nodefony.net/doc",
        children: ["https://nodefony.net/doc"],
      },
      ".",
    ]);
  });

  it("`www.` sans schéma devient un lien http (GFM), affiché tel qu'écrit", () => {
    expect(parseInline("voir www.free.fr/aide, puis")).toEqual([
      "voir ",
      {
        type: "link",
        href: "http://www.free.fr/aide",
        children: ["www.free.fr/aide"],
      },
      ", puis",
    ]);
    // Un `_` dans les deux derniers segments : pas un domaine.
    expect(parseInline("www.mon_site.fr")).toEqual(["www.mon_site.fr"]);
    // Collé à un mot, ou en majuscules : du texte.
    expect(parseInline("awww.a.fr WWW.a.fr")).toEqual(["awww.a.fr WWW.a.fr"]);
    // Rendu en pastille de domaine, comme une adresse https nue — pas un [texte](…).
    const [www] = parseInline("www.a.dev");
    const [labelled] = parseInline("[www.a.dev](https://www.a.dev)");
    const [https] = parseInline("https://a.dev");
    expect(
      typeof www === "object" && www.type === "link" && isBareLink(www),
    ).toBe(true);
    expect(
      typeof https === "object" && https.type === "link" && isBareLink(https),
    ).toBe(true);
    expect(
      typeof labelled === "object" &&
        labelled.type === "link" &&
        isBareLink(labelled),
    ).toBe(false);
    // Le rang compte aussi ces liens, page ET serveur.
    expect(messageLinks("www.a.dev et https://b.dev")).toEqual([
      "http://www.a.dev",
      "https://b.dev",
    ]);
  });

  it("🔴 un lien javascript: reste du TEXTE", () => {
    expect(parseInline("[clic](javascript:alert(1))")).toEqual([
      "[clic](javascript:alert(1))",
    ]);
  });

  it("blocs : code, liste, citation, paragraphe à plusieurs lignes", () => {
    expect(
      parseMarkdown(
        "a\nb\n\n```\nx **y**\n```\n- un\n- deux\n1. premier\n> cité",
      ),
    ).toEqual([
      { type: "p", children: ["a", { type: "br" }, "b"] },
      { type: "pre", value: "x **y**" },
      { type: "ul", items: [["un"], ["deux"]] },
      { type: "ol", items: [["premier"]] },
      { type: "quote", children: ["cité"] },
    ]);
  });

  it("les boutons posent ou ôtent le marqueur, la sélection suit", () => {
    const bold = toggleMark("un mot ici", 3, 6, "**");
    expect(bold).toEqual({ value: "un **mot** ici", start: 5, end: 8 });
    expect(toggleMark(bold.value, bold.start, bold.end, "**")).toEqual({
      value: "un mot ici",
      start: 3,
      end: 6,
    });
    expect(codeMark("a\nb", 0, 3).value).toBe("```\na\nb\n```");
    expect(linkMark("voir doc", 5, 8)).toEqual({
      value: "voir [doc](https://)",
      start: 11,
      end: 19,
    });
  });

  it("le bouton formule pose `$…$` sur une ligne, un bloc `$$` sur plusieurs", () => {
    expect(mathMark("aire x^2 ici", 5, 8)).toEqual({
      value: "aire $x^2$ ici",
      start: 6,
      end: 9,
    });
    expect(mathMark("aire $x^2$ ici", 6, 9).value).toBe("aire x^2 ici");
    expect(mathMark("a\nb", 0, 3).value).toBe("$$\na\nb\n$$");
    expect(mathMark("vu : a\nb", 5, 8).value).toBe("vu : \n$$\na\nb\n$$");
    // Ce que pose le bouton, le salon le lit comme une formule.
    expect(parseInline("aire $x^2$ ici")).toContainEqual({
      type: "math",
      tex: "x^2",
    });
  });

  it("une @mention en cours : un arobase en début de mot, jusqu’au curseur", () => {
    expect(mentionAt("salut @ad", 9)).toEqual({
      start: 6,
      end: 9,
      query: "ad",
    });
    expect(mentionAt("@", 1)).toEqual({ start: 0, end: 1, query: "" });
    // Le nom se poursuit après le curseur : il est remplacé en entier.
    expect(mentionAt("@admin ok", 3)).toEqual({
      start: 0,
      end: 6,
      query: "ad",
    });
    expect(mentionAt("mail a@b", 8)).toBeNull();
    expect(mentionAt("salut ad", 8)).toBeNull();
    expect(mentionAt("@-x", 3)).toBeNull();
    expect(mentionAt("@ad mot", 7)).toBeNull();
  });

  it("les noms proposés commencent par ce qui est tapé, accents ignorés", () => {
    const names = ["Élodie", "admin", "Émile", "user", "admin"];
    expect(suggestMentions(names, "e", 8)).toEqual(["Élodie", "Émile"]);
    expect(suggestMentions(names, "AD", 8)).toEqual(["admin"]);
    expect(suggestMentions(names, "", 2)).toEqual(["Élodie", "admin"]);
    expect(suggestMentions(names, "zz", 8)).toEqual([]);
  });

  it("valider une mention écrit ce qu’écrit le panneau, sans doubler l’espace", () => {
    expect(mentionOf("user")).toBe("@user ");
    const typed = mentionAt("salut @u", 8);
    if (typed === null) throw new Error("mention attendue");
    expect(applyMention("salut @u", typed, "user")).toEqual({
      value: "salut @user ",
      start: 12,
      end: 12,
    });
    const middle = mentionAt("@us vu", 3);
    if (middle === null) throw new Error("mention attendue");
    expect(applyMention("@us vu", middle, "user")).toEqual({
      value: "@user vu",
      start: 6,
      end: 6,
    });
    expect(parseInline(mentionOf("user"))).toContainEqual({
      type: "mention",
      name: "user",
    });
  });

  it("listes et citation : posées sur chaque ligne touchée, ôtées au second clic", () => {
    const list = prefixLines("titre\nun\ndeux", 7, 12, "1. ");
    expect(list).toEqual({ value: "titre\n1. un\n2. deux", start: 6, end: 19 });
    expect(prefixLines(list.value, list.start, list.end, "1. ").value).toBe(
      "titre\nun\ndeux",
    );
    expect(prefixLines("cité", 0, 0, "> ").value).toBe("> cité");
  });

  it("🔴 Entrée dans une liste ouvre l'élément suivant ; sur un élément vide, en sort", () => {
    expect(continueList("- un", 4)).toEqual({
      value: "- un\n- ",
      start: 7,
      end: 7,
    });
    expect(continueList("  9) neuf", 9)).toEqual({
      value: "  9) neuf\n  10) ",
      start: 16,
      end: 16,
    });
    expect(continueList("- un\n- ", 7)).toEqual({
      value: "- un\n",
      start: 5,
      end: 5,
    });
    expect(continueList("pas une liste", 13)).toBeNull();
  });
});

describe("demo — la nature de chaque bloc d'un message (règle pure)", () => {
  it("un texte vide n'a aucun bloc ; un texte simple, un bloc text", () => {
    expect(detectBlocks("  \n ")).toEqual([]);
    expect(detectBlocks("bonjour **toi**")).toEqual([
      { nature: "text", source: "bonjour **toi**" },
    ]);
  });

  it("ordre D25 : étiquette explicite, puis JSON, tableau, diff, texte", () => {
    expect(detectBlocks("```ts\nconst a = 1;\n```")).toEqual([
      { nature: "code", source: "const a = 1;", language: "ts" },
    ]);
    // Une étiquette gagne sur le contenu : ce JSON est montré comme du code.
    expect(detectBlocks('```json\n{"a":1}\n```')[0]?.nature).toBe("code");
    // Sans étiquette, le corps est analysé avant de n'être que du code.
    expect(detectBlocks('```\n{"a":[1,2]}\n```')).toEqual([
      { nature: "json", source: '{"a":[1,2]}', value: { a: [1, 2] } },
    ]);
    expect(detectBlocks("```\nrien à reconnaître ici\n```")).toEqual([
      { nature: "code", source: "rien à reconnaître ici", language: null },
    ]);
    expect(detectBlocks('[1, 2, {"x": null}]')[0]?.nature).toBe("json");
    // Un nombre ou un mot JSON seul reste du texte.
    expect(detectBlocks("42")[0]?.nature).toBe("text");
    expect(detectBlocks("{pas du json")[0]?.nature).toBe("text");
    expect(detectBlocks("@@ -1 +1 @@\n-a\n+b")[0]?.nature).toBe("diff");
    // Des puces « - » sans en-tête ne font pas un diff.
    expect(detectBlocks("- un\n- deux")[0]?.nature).toBe("text");
  });

  it("tableau : trois séparateurs, largeur égale exigée, lignes bornées et comptées", () => {
    for (const sep of [";", "\t"]) {
      const block = detectBlocks(`a${sep}b\n1${sep}2\n3${sep}4`)[0];
      expect(block).toMatchObject({
        nature: "csv",
        separator: sep,
        header: ["a", "b"],
        rows: [
          ["1", "2"],
          ["3", "4"],
        ],
        total: 2,
      });
    }
    // À la virgule : trois lignes de trois colonnes au moins.
    expect(detectBlocks("a,b,c\n1,2,3\n4,5,6")[0]).toMatchObject({
      nature: "csv",
      separator: ",",
      header: ["a", "b", "c"],
      total: 2,
    });
    // La prose porte des virgules : deux lignes, ou deux colonnes, restent du texte.
    expect(detectBlocks("Bonjour, ça va\nOui, merci")[0]?.nature).toBe("text");
    expect(detectBlocks("a,b\n1,2\n3,4")[0]?.nature).toBe("text");
    expect(detectBlocks("a,b,c\n1,2,3")[0]?.nature).toBe("text");
    // Largeur inégale : ce n'est pas un tableau.
    expect(detectBlocks("a;b\n1;2;3")[0]?.nature).toBe("text");
    // Une seule ligne : pas un tableau.
    expect(detectBlocks("a;b")[0]?.nature).toBe("text");
    const many = [
      "x,y,z",
      ...Array.from({ length: 500 }, (_, i) => `${i},${i},${i}`),
    ];
    const big = detectBlocks(many.join("\n"))[0];
    expect(big?.nature === "csv" && big.rows.length).toBe(CSV_MAX_ROWS);
    expect(big?.nature === "csv" && big.total).toBe(500);
  });

  it("formule : `$$` seul sur sa ligne, ou `$$ … $$` d'une ligne ; non fermée, du texte", () => {
    expect(detectBlocks("avant\n$$\nx^2 + y^2\n$$\naprès")).toEqual([
      { nature: "text", source: "avant\n" },
      { nature: "math", source: "$$\nx^2 + y^2\n$$", tex: "x^2 + y^2" },
      { nature: "text", source: "après" },
    ]);
    expect(detectBlocks("$$ a+b $$")).toEqual([
      { nature: "math", source: "$$ a+b $$", tex: "a+b" },
    ]);
    expect(detectBlocks("$$\nx")[0]?.nature).toBe("text");
  });

  it("🔴 aucun caractère perdu : chaque source est une tranche du texte, dans l'ordre", () => {
    const text = [
      "intro avec https://x.dev",
      "",
      "```py",
      "print(1)",
      "```",
      "$$",
      "e=mc^2",
      "$$",
      "a;b",
      "1;2",
      "",
      "```",
      "[1,2]",
      "```",
      "fin",
    ].join("\n");
    const blocks = detectBlocks(text);
    expect(blocks.map((b) => b.nature)).toEqual([
      "text",
      "code",
      "math",
      "csv",
      "json",
      "text",
    ]);
    let cursor = 0;
    for (const block of blocks) {
      const at = text.indexOf(block.source, cursor);
      expect(at).toBeGreaterThanOrEqual(cursor);
      cursor = at + block.source.length;
    }
    // Les caractères hors source sont des balises de bloc ou des blancs.
    let rest = text;
    for (const block of blocks) rest = rest.replace(block.source, "");
    expect(rest.replace(/[`\s$]|py/g, "")).toBe("");
  });

  it("borné et linéaire : 64 Kio de lignes, de JSON ou de fences se lisent vite", () => {
    const start = performance.now();
    detectBlocks("a\n".repeat(32_000));
    detectBlocks("```\nx\n".repeat(8_000));
    detectBlocks("[" + "1,".repeat(32_000) + "1]");
    expect(performance.now() - start).toBeLessThan(500);
    expect(GUESS_LANGUAGE_BYTES).toBe(4096);
  });
});

describe("demo — les natures en ligne du Markdown", () => {
  it("@mention, couleur, date ISO, formule — et rien de plus", () => {
    expect(
      parseInline("salut @alice.d, #ff0 ou #A1B2C3 le 2026-11-13"),
    ).toEqual([
      "salut ",
      { type: "mention", name: "alice.d" },
      ", ",
      { type: "color", value: "#ff0" },
      " ou ",
      { type: "color", value: "#A1B2C3" },
      " le ",
      { type: "date", iso: "2026-11-13", hasTime: false },
    ]);
    expect(parseInline("à 2026-11-13T14:30:05+01:00 pile")).toEqual([
      "à ",
      { type: "date", iso: "2026-11-13T14:30:05+01:00", hasTime: true },
      " pile",
    ]);
    expect(parseInline("soit $x^2$ ici")).toEqual([
      "soit ",
      { type: "math", tex: "x^2" },
      " ici",
    ]);
  });

  it("les faux positifs restent du texte", () => {
    // Courriel, mot collé, couleur trop longue, date impossible, prix.
    expect(parseInline("a@b.net")).toEqual(["a@b.net"]);
    expect(parseInline("#abcd #ggg #12345678")).toEqual([
      "#abcd #ggg #12345678",
    ]);
    expect(parseInline("2026-02-31 et 2026-13-01 et 2026-11-13T25:00")).toEqual(
      ["2026-02-31 et 2026-13-01 et 2026-11-13T25:00"],
    );
    expect(parseInline("5$ puis 6$ ou $5 et $6")).toEqual([
      "5$ puis 6$ ou $5 et $6",
    ]);
    expect(parseInline("\\$5\\$")).toEqual(["$5$"]);
  });

  it("🔴 les liens gardent leur reconnaissance et leur ORDRE, natures présentes ou non", () => {
    const text =
      "voir [doc](https://a.dev/@bob) puis https://b.dev/#fff le 2026-11-13 et $[x](https://c.dev)$ enfin https://d.dev";
    expect(collectLinks(parseMarkdown(text))).toEqual([
      "https://a.dev/@bob",
      "https://b.dev/#fff",
      "https://c.dev",
      "https://d.dev",
    ]);
  });

  it("le rang d'un lien suit les blocs de texte seulement (page ET serveur)", () => {
    const text = [
      "un https://a.dev",
      "```",
      "https://dans-le-code.dev",
      "```",
      '{"u":"https://dans-un-json.dev"}',
      "",
      "deux [b](https://b.dev)",
    ].join("\n");
    expect(messageLinks(text)).toEqual(["https://a.dev", "https://b.dev"]);
  });
});

describe("demo — la coloration du code", () => {
  it("lit la sortie de highlight.js sans perte, entités rendues", () => {
    const tokens = tokensOfHtml(
      '<span class="hljs-keyword">if</span> (a &lt; b &amp;&amp; c) <span class="hljs-comment">// <span class="hljs-doctag">x</span> &gt;</span>',
    );
    expect(tokens.map((t) => t.text).join("")).toBe("if (a < b && c) // x >");
    expect(tokens.map((t) => t.kind)).toEqual(["keyword", "plain", "comment"]);
  });

  it("langues permises seulement ; les étiquettes usuelles se ramènent", () => {
    expect(canonicalLanguage("ts")).toBe("typescript");
    expect(canonicalLanguage("html")).toBe("xml");
    expect(canonicalLanguage("sh")).toBe("bash");
    expect(canonicalLanguage("brainfuck")).toBeNull();
    expect(canonicalLanguage("constructor")).toBeNull();
  });

  it("colore pour de vrai (import différé), sans perte ; langue inconnue : null", async () => {
    const code = 'const a: number = 1; // note\nreturn "x";';
    const tokens = await highlightCode(code, "ts");
    expect(tokens?.map((t) => t.text).join("")).toBe(code);
    expect(tokens?.some((t) => t.kind === "keyword")).toBe(true);
    expect(tokens?.some((t) => t.kind === "string")).toBe(true);
    expect(await highlightCode("x", "brainfuck")).toBeNull();
    const diff = await highlightCode("@@ -1 +1 @@\n-a\n+b", "diff");
    expect(diff?.some((t) => t.kind === "added")).toBe(true);
    expect(diff?.some((t) => t.kind === "removed")).toBe(true);
  });

  it("devine la langue d'un bloc sans étiquette ; du texte ordinaire reste brut", async () => {
    const guessed = await highlightCode(
      'import fs from "node:fs";\nconst a = 1;\nfunction f() { return a; }',
      null,
    );
    expect(guessed?.some((t) => t.kind !== "plain")).toBe(true);
    expect(await highlightCode("bonjour tout le monde", null)).toBeNull();
  });

  it("🔴 les briques de rendu n'injectent jamais de HTML et nomment tous leurs renvois", () => {
    const front = path.join(
      path.dirname(path.dirname(fileURLToPath(import.meta.url))),
      "frontend/src",
    );
    for (const file of [
      "kit/NatureBlocks.tsx",
      "kit/MathView.tsx",
      "kit/MessageBody.tsx",
      "kit/MarkdownText.tsx",
      "kit/HoverBubble.tsx",
      "kit/codeHighlight.ts",
      "chat/ChatLinkPreview.tsx",
      "chat/ChatAttachments.tsx",
    ]) {
      const source = readFileSync(path.join(front, file), "utf8");
      expect(source, file).not.toMatch(/dangerouslySetInnerHTML|innerHTML/);
      expect(source, file).not.toMatch(/\bas any\b|@ts-ignore/);
    }
    const math = readFileSync(path.join(front, "kit/MathView.tsx"), "utf8");
    // KaTeX ne reçoit jamais de quoi sortir de la formule.
    expect(math).toMatch(/^\s+trust: false,$/m);
    expect(math).toMatch(/^\s+strict: "ignore",$/m);
    expect(math).toMatch(/^\s+output: "mathml",$/m);
    expect(math).toMatch(/^\s+maxExpand: MATH_MAX_EXPAND,$/m);
    expect(math).toMatch(/^\s+maxSize: MATH_MAX_SIZE,$/m);
  });
});

/** Toutes les pages d'apprentissage : une démo neuve s'ajoute ICI. */
const LESSONS: readonly { page: string; lesson: ILesson }[] = [
  { page: "chat", lesson: CHAT_LESSON },
  { page: "partner", lesson: PARTNER_LESSON },
  { page: "first-steps", lesson: FIRST_LESSON },
  { page: "sse", lesson: SSE_LESSON },
  { page: "video", lesson: VIDEO_LESSON },
  { page: "upload", lesson: UPLOAD_LESSON },
  { page: "binary", lesson: BINARY_LESSON },
  { page: "mcp", lesson: MCP_LESSON },
  { page: "meteor", lesson: METEOR_LESSON },
  { page: "prism", lesson: PRISM_LESSON },
  { page: "sensor", lesson: SENSOR_LESSON },
  { page: "grpc", lesson: GRPC_LESSON },
];

/** Chaque extrait cité, avec sa page et sa couche. */
const CITED = LESSONS.flatMap(({ page, lesson }) =>
  lesson.tabs.flatMap((tab) =>
    tabExcerpts(tab).map((excerpt) => ({
      page,
      layer: tab.layer,
      file: excerpt.file,
      region: excerpt.region,
    })),
  ),
);

describe("demo — les pages d'apprentissage suivent le modèle commun", () => {
  it.each(LESSONS)(
    "$page : onglets dans l'ordre des couches, sans doublon, aucun vide",
    ({ lesson }) => {
      const order = LESSON_LAYERS.map((layer) => layer.id);
      const ranks = lesson.tabs.map((tab) => order.indexOf(tab.layer));
      expect(ranks).toEqual([...new Set(ranks)].toSorted((x, y) => x - y));
      for (const tab of lesson.tabs) {
        expect(tab.blocks.length, tab.layer).toBeGreaterThan(0);
      }
    },
  );

  it.each(CITED)(
    "$page / $layer : la région $region existe dans $file, et n'est pas vide",
    ({ file, region }) => {
      // Le texte que la PAGE affiche (lu par Vite), pas une relecture à part.
      const code = extractRegion(LESSON_SOURCES[file], region);
      expect(code, `// #region ${region} absente de ${file}`).not.toBeNull();
      expect(code?.trim()).not.toBe("");
    },
  );

  // Un contrat `.proto` n'a pas de constantes TypeScript : ses capitales
  // (`NO_SIDE_EFFECTS`) sont des valeurs d'énumération du protocole.
  it.each(CITED.filter(({ file }) => !file.endsWith(".proto")))(
    "$page / $layer : chaque constante de $region a sa valeur",
    ({ file, region }) => {
      const code = extractRegion(LESSON_SOURCES[file], region) ?? "";
      const resolved = resolveConstants(code, LESSON_SOURCES).map(
        (constant) => constant.name,
      );
      expect(resolved).toEqual(constantNames(code));
    },
  );

  /** Les décorateurs d'un source, hors commentaires et TSDoc qui en citent. */
  const decoratorsIn = (source: string): string[] =>
    [
      ...source
        .split("\n")
        .filter((line) => !/^\s*(\*|\/\/|\/\*)/.test(line))
        .join("\n")
        .matchAll(/@([A-Za-z]\w*)\(/g),
    ].map((match) => match[1] ?? "");

  it.each(LESSONS)(
    "$page : la liste des décorateurs est COMPLÈTE",
    ({ lesson }) => {
      const used = new Set(
        lesson.decoratedFiles.flatMap((file) =>
          decoratorsIn(LESSON_SOURCES[file]),
        ),
      );
      expect([...used].toSorted()).toEqual(
        lesson.decorators.map((decorator) => decorator.name).toSorted(),
      );
    },
  );

  const placed = LESSONS.flatMap(({ page, lesson }) =>
    lesson.decorators.map((decorator) => ({
      page,
      lesson,
      name: decorator.name,
      file: decorator.file,
      region: decorator.region,
    })),
  );

  it.each(placed)(
    "$page : @$name est dans la région $region, citée par un onglet",
    ({ lesson, name, file, region }) => {
      expect(extractRegion(LESSON_SOURCES[file], region)).toContain(
        `@${name}(`,
      );
      const cited = lesson.tabs.some((tab) =>
        tabExcerpts(tab).some(
          (excerpt) => excerpt.file === file && excerpt.region === region,
        ),
      );
      expect(cited).toBe(true);
    },
  );

  it("désindente la région, et rend null si elle manque ou reste ouverte", () => {
    const source =
      "a\n  // #region x\n    un()\n      deux()\n  // #endregion\n";
    expect(extractRegion(source, "x")).toBe("un()\n  deux()");
    expect(extractRegion(source, "y")).toBeNull();
    expect(extractRegion("// #region x\nun()\n", "x")).toBeNull();
  });

  it("la coloration est sans perte, et distingue décorateurs, mots-clés et chaînes", () => {
    const source = '@route("x", { a: 1 }) // note\nconst it: Type = `t`;';
    const tokens = highlight(source);
    expect(tokens.map((token) => token.text).join("")).toBe(source);
    const kinds = Object.fromEntries(
      tokens.map((token) => [token.text, token.kind]),
    );
    expect(kinds).toMatchObject({
      "@route": "decorator",
      '"x"': "string",
      "1": "number",
      "// note": "comment",
      const: "keyword",
      Type: "type",
      "`t`": "string",
    });
    for (const text of Object.values(LESSON_SOURCES)) {
      expect(
        highlight(text)
          .map((token) => token.text)
          .join(""),
      ).toBe(text);
    }
  });

  it("résout un gabarit à travers les autres constantes, ignore chaînes et commentaires", () => {
    const sources = {
      "a.ts": 'export const BASE_PATH = "/demo/api";\nconst LIMIT_N = 50;',
      "b.ts": "const FULL_PATH = `${BASE_PATH}/whoami`;",
    };
    const code = 'call(FULL_PATH, LIMIT_N); // NOT_THIS\nlog("NOR_THIS");';
    expect(resolveConstants(code, sources)).toEqual([
      { name: "FULL_PATH", value: '"/demo/api/whoami"', file: "b.ts" },
      { name: "LIMIT_N", value: "50", file: "a.ts" },
    ]);
    expect(resolveConstants("use(MISSING_ONE)", sources)).toEqual([]);
  });

  it("une propriété en capitales n'est pas une constante de la leçon", () => {
    expect(
      constantNames("Number.POSITIVE_INFINITY + LIMIT_N; a?.MAX_X; B_C"),
    ).toEqual(["LIMIT_N", "B_C"]);
  });

  it("résout un tableau de littéraux ; une virgule dans une chaîne le rend sans valeur", () => {
    const sources = {
      "a.ts":
        'const STEPS_LIST = ["a", "b", 3];\nconst BAD_LIST = ["x, y"];\nconst MIXED_LIST = ["a", other];',
    };
    expect(
      resolveConstants("use(STEPS_LIST, BAD_LIST, MIXED_LIST)", sources),
    ).toEqual([{ name: "STEPS_LIST", value: '["a", "b", 3]', file: "a.ts" }]);
  });
});

describe("demo — les leçons à gestes : la sonde et le contrôleur cité", () => {
  it.each([
    ["nodefony/controllers/FirstStepsController.ts", FIRST_LESSON],
    ["nodefony/controllers/SseController.ts", SSE_LESSON],
    ["nodefony/controllers/VideoController.ts", VIDEO_LESSON],
    ["nodefony/controllers/UploadController.ts", UPLOAD_LESSON],
    ["nodefony/service/UploadService.ts", UPLOAD_LESSON],
    ["frontend/src/upload/uploadDemo.ts", UPLOAD_LESSON],
    ["frontend/src/upload/uploadClient.ts", UPLOAD_LESSON],
    ["frontend/src/upload/UploadVisuals.tsx", UPLOAD_LESSON],
    ["frontend/src/upload/UploadLesson.tsx", UPLOAD_LESSON],
    ["nodefony/controllers/BinaryController.ts", BINARY_LESSON],
    ["nodefony/controllers/DemoMcpController.ts", MCP_LESSON],
    ["nodefony/controllers/McpTokenController.ts", MCP_LESSON],
    ["nodefony/service/DemoMcpService.ts", MCP_LESSON],
    ["nodefony/mcp/demoTools.ts", MCP_LESSON],
    ["nodefony/controllers/MeteorController.ts", METEOR_LESSON],
    ["nodefony/service/MeteorService.ts", METEOR_LESSON],
    ["nodefony/controllers/PrismController.ts", PRISM_LESSON],
    ["nodefony/service/PrismService.ts", PRISM_LESSON],
    ["nodefony/game/GameRoom.ts", METEOR_LESSON],
    ["nodefony/kit/fixedStep.ts", PRISM_LESSON],
    ["nodefony/controllers/SensorController.ts", SENSOR_LESSON],
    ["nodefony/service/SensorService.ts", SENSOR_LESSON],
    ["frontend/src/sensor/sensorDemo.ts", SENSOR_LESSON],
    ["frontend/src/sensor/sensorClient.ts", SENSOR_LESSON],
    ["nodefony/sensor/plant.ts", SENSOR_LESSON],
    ["nodefony/sensor/alarms.ts", SENSOR_LESSON],
    ["nodefony/sensor/gamma.ts", SENSOR_LESSON],
    ["nodefony/sensor/cryostat.ts", SENSOR_LESSON],
    ["nodefony/sensor/quantum.ts", SENSOR_LESSON],
    ["frontend/src/sensor/sensorStats.ts", SENSOR_LESSON],
    ["proto/demo/telemetry/v1/telemetry.proto", GRPC_LESSON],
    ["nodefony/controllers/TelemetryController.ts", GRPC_LESSON],
    ["nodefony/service/TelemetryRelayService.ts", GRPC_LESSON],
    ["nodefony/command/SensorPushCommand.ts", GRPC_LESSON],
    ["frontend/src/grpc/grpcDemo.ts", GRPC_LESSON],
    ["frontend/src/grpc/grpcClient.ts", GRPC_LESSON],
  ] as const)(
    "chaque région de %s est citée par la leçon : aucun geste oublié",
    (file, lesson) => {
      const declared = [
        ...LESSON_SOURCES[file].matchAll(/^\s*\/\/ #region (\S+)\s*$/gm),
      ].map((match) => match[1]);
      const cited = lesson.tabs.flatMap((tab) =>
        tabExcerpts(tab)
          .filter((excerpt) => excerpt.file === file)
          .map((excerpt) => excerpt.region),
      );
      expect(declared.length).toBeGreaterThan(0);
      expect(declared.toSorted()).toEqual([...new Set(cited)].toSorted());
    },
  );

  it("un corps JSON est remis en forme ; un JSON faux reste tel quel", () => {
    expect(formatBody('{"a":1}', "application/json")).toBe('{\n  "a": 1\n}');
    expect(formatBody("{pas du json", "application/json")).toBe("{pas du json");
    expect(formatBody('{"a":1}', "text/plain")).toBe('{"a":1}');
  });

  it("un corps trop long est coupé, en disant combien manque", () => {
    const shown = formatBody("x".repeat(PROBE_BODY_LIMIT + 7), "text/plain");
    expect(shown.startsWith("x".repeat(PROBE_BODY_LIMIT))).toBe(true);
    expect(shown).toContain("7 caractères de plus");
  });

  it("seuls les en-têtes qui apprennent quelque chose sont gardés, dans l'ordre", () => {
    const headers = new Headers({
      etag: '"abc"',
      "content-type": "text/plain",
      "set-cookie": "s=1",
      date: "Sun, 08 Nov 2026 10:00:00 GMT",
    });
    expect(pickHeaders(headers)).toEqual([
      ["content-type", "text/plain"],
      ["etag", '"abc"'],
    ]);
  });

  it("un corps binaire se lit en hexadécimal : position, octets, ASCII", () => {
    const bytes = new Uint8Array([0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69]);
    expect(hexPreview(bytes, 900).split("\n")).toEqual([
      "900 octets reçus — les 9 premiers :",
      `00000000  00 00 00 20 66 74 79 70 69${" ".repeat(21)}  ... ftypi`,
    ]);
    expect(isTextual("video/mp4")).toBe(false);
    expect(isTextual("application/octet-stream")).toBe(false);
    expect(isTextual("text/plain; charset=utf-8")).toBe(true);
    expect(isTextual("application/json")).toBe(true);
    expect(isTextual(null)).toBe(true);
  });

  it("seuls les en-têtes ENVOYÉS qui changent la réponse sont montrés", () => {
    expect(
      pickSent({
        headers: { "if-range": '"e"', range: "bytes=0-9", "x-other": "1" },
      }),
    ).toEqual([
      ["range", "bytes=0-9"],
      ["if-range", '"e"'],
    ]);
    expect(pickSent({})).toEqual([]);
  });

  /** Un résultat de sonde minimal, à compléter. */
  const probed = (over: Partial<IProbeResult>): IProbeResult => ({
    request: "GET /demo/api/first/web",
    sent: [],
    status: 200,
    ms: 12,
    headers: [["content-type", "application/json; charset=utf-8"]],
    body: "{}",
    chunks: [],
    redirected: false,
    finalUrl: null,
    error: null,
    ...over,
  });

  it("l'échange dit le sens du statut : suivi, gardé, refusé AVANT l'action, absent", () => {
    expect(describeExchange(probed({})).phrase).toMatch(/^200 — du JSON reçu/u);
    const followed = describeExchange(
      probed({ redirected: true, finalUrl: "/demo/api/first/note" }),
    );
    expect([followed.tone, followed.phrase]).toEqual([
      "redirect",
      "Redirigé\u00a0: le navigateur a suivi jusqu'à /demo/api/first/note, qui a répondu 200.",
    ]);
    expect(describeExchange(probed({ status: 304, body: "" })).tone).toBe(
      "cache",
    );
    expect(describeExchange(probed({ status: 422 })).phrase).toContain(
      "AVANT l'action",
    );
    expect(describeExchange(probed({ status: 404 })).tone).toBe("refused");
    expect(
      describeExchange(probed({ status: null, error: "réseau coupé" })),
    ).toMatchObject({ tone: "error", status: "—" });
    const stream = describeExchange(
      probed({
        headers: [["content-type", "text/plain"]],
        body: "5 4 3",
        ms: 2000,
        chunks: [
          { at: 1, text: "5" },
          { at: 400, text: "4" },
        ],
      }),
    );
    expect(stream.phrase).toBe(
      "200 — du texte reçu, en 2 morceaux sur 2000 ms.",
    );
  });

  it("la page vérifie le corps AVANT d'envoyer, avec le schéma du serveur", () => {
    expect(checkEcho({ name: "Alice", age: 30 })).toEqual([]);
    expect(checkEcho({ name: "Alice", age: "vingt" })).toEqual(["age"]);
    expect(checkEcho({ name: "", age: 30, extra: 1 })).toEqual([
      "name",
      "corps",
    ]);
  });

  it("la frise : une bande par connexion, la coupure et la reprise à leur instant", () => {
    const timeline = readTimeline(
      [
        { at: 10, text: "▶ ouvert" },
        { at: 20, text: "message #1 · événement 1 sur 6" },
        { at: 30, text: "message #2 · événement 2 sur 6" },
        { at: 40, text: "↻ coupé : le client se reconnecte" },
        { at: 850, text: "▶ rouvert — Last-Event-ID: 2" },
        { at: 860, text: 'progress · {"step":"lecture","percent":25}' },
        { at: 900, text: "■ la page a fermé le flux" },
      ],
      920,
    );
    expect(timeline.span).toBe(920);
    expect(timeline.links).toEqual([
      { start: 10, end: 40 },
      { start: 850, end: 900 },
    ]);
    expect(
      timeline.marks.map((mark) => [mark.at, mark.kind, mark.label]),
    ).toEqual([
      [20, "event", "message #1"],
      [30, "event", "message #2"],
      [40, "cut", "coupé"],
      [860, "event", "progress"],
      [900, "close", "fermé"],
    ]);
  });

  it("la frise lit aussi le fil BRUT : battements à part, la réponse est la connexion", () => {
    const timeline = readTimeline(
      [
        { at: 5, text: ": heartbeat\n\n" },
        { at: 1005, text: ": heartbeat\n\n" },
        { at: 3500, text: "id: 4\nevent: status\ndata: {}\n\ndata: enfin\n\n" },
      ],
      3510,
    );
    expect(timeline.links).toEqual([{ start: 0, end: 3510 }]);
    expect(timeline.marks.map((mark) => [mark.kind, mark.label])).toEqual([
      ["comment", "battement"],
      ["comment", "battement"],
      ["event", "status #4"],
      ["event", "message"],
    ]);
    // Un corps JSON n'est pas un flux : rien à dessiner.
    expect(readTimeline([{ at: 3, text: '{ "state": "prêt" }' }], 4)).toEqual({
      span: 4,
      links: [],
      marks: [],
    });
  });

  it("la réponse en flux reprend la question, un mot par événement", () => {
    const words = answerWords("Pourquoi SSE ?");
    expect(words.join(" ")).toContain("« Pourquoi SSE ? »");
    expect(words.every((word) => word !== "" && !word.includes(" "))).toBe(
      true,
    );
  });

  it("le contrôleur SSE vit sous son préfixe, et chaque action ouvre un flux", () => {
    const source = LESSON_SOURCES["nodefony/controllers/SseController.ts"];
    expect(source).toContain("@controller(SSE_PATH)");
    expect(SSE_PATH).toBe("/demo/api/sse");
    const actions = [...source.matchAll(/^\s*@(Get|Post)\(/gm)].length;
    const opened = [...source.matchAll(/this\.renderSse/g)].length;
    expect(actions).toBe(7);
    expect(opened).toBe(actions);
  });
});

describe("demo — Vidéo par plages", () => {
  const moduleDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

  it("un nom de vidéo passe, un chemin ou un autre fichier est refusé", () => {
    expect(MediaParams.safeParse({ name: SAMPLE_VIDEO }).success).toBe(true);
    expect(MediaParams.safeParse({ name: "ma-video_2.webm" }).success).toBe(
      true,
    );
    for (const name of [
      "../package.json",
      "..",
      "a/b.mp4",
      "notes.txt",
      ".mp4",
      "",
    ]) {
      expect(MediaParams.safeParse({ name }).success, name).toBe(false);
    }
  });

  it("la vidéo d'essai est posée, et son index (moov) précède les images (mdat)", () => {
    const bytes = readFileSync(path.join(moduleDir, "media", SAMPLE_VIDEO));
    // Les boîtes de tête d'un MP4 : 4 octets de taille, 4 de type.
    const boxes: string[] = [];
    for (let at = 0; at + 8 <= bytes.length;) {
      const size = bytes.readUInt32BE(at);
      boxes.push(bytes.toString("latin1", at + 4, at + 8));
      if (size < 8) break;
      at += size;
    }
    expect(boxes[0]).toBe("ftyp");
    expect(boxes).toContain("mdat");
    expect(boxes.indexOf("moov")).toBeGreaterThan(-1);
    expect(boxes.indexOf("moov")).toBeLessThan(boxes.indexOf("mdat"));
  });

  it("la carte lit l'en-tête d'une boîte MP4 ; une taille 0 va jusqu'au bout", () => {
    const head = (size: number, type: string) => {
      const bytes = new Uint8Array(8);
      new DataView(bytes.buffer).setUint32(0, size);
      bytes.set(new TextEncoder().encode(type), 4);
      return bytes;
    };
    expect(readBox(head(32, "ftyp"), 0, 1000)).toEqual({
      type: "ftyp",
      start: 0,
      size: 32,
    });
    expect(readBox(head(0, "mdat"), 200, 1000)).toEqual({
      type: "mdat",
      start: 200,
      size: 800,
    });
    expect(readBox(head(4, "moov"), 0, 1000)).toBeNull();
    expect(readBox(new Uint8Array(3), 0, 1000)).toBeNull();
  });

  it("la carte dit ce qu'une réponse a fait voyager du fichier", () => {
    const result = (
      status: number,
      headers: [string, string][],
    ): Parameters<typeof describeReceived>[0] => ({
      request: "GET /x",
      sent: [],
      status,
      ms: 1,
      headers,
      body: "",
      chunks: [],
      redirected: false,
      finalUrl: null,
      error: null,
    });
    const part = describeReceived(
      result(206, [["content-range", "bytes 0-99/1000"]]),
    );
    expect(part.span).toEqual({ start: 0, end: 99 });
    expect(part.total).toBe(1000);
    expect(part.text).toContain("MORCEAU");
    const whole = describeReceived(
      result(200, [
        ["content-type", "video/mp4"],
        ["content-length", "1000"],
      ]),
    );
    expect(whole.span).toEqual({ start: 0, end: 999 });
    expect(
      describeReceived(result(416, [["content-range", "bytes */1000"]])),
    ).toMatchObject({ span: null, total: 1000 });
    expect(describeReceived(result(304, [])).span).toBeNull();
    expect(
      describeReceived(result(200, [["content-type", "application/json"]]))
        .span,
    ).toBeNull();
  });

  it("le contrôleur sert le dossier par plages, le nom validé avant l'action", () => {
    const source = LESSON_SOURCES["nodefony/controllers/VideoController.ts"];
    expect(source).toContain("@controller(VIDEO_PATH)");
    expect(VIDEO_PATH).toBe("/demo/api/media");
    expect(source).toContain(
      '@Get("/{name}", { schema: { params: MediaParams } })',
    );
    expect(source).toContain("this.renderMediaStream(file)");
  });
});

describe("demo — Temps réel binaire", () => {
  /** Une ligne de la sonde, comme `probeRealtime` l'écrit. */
  const frame = (at: number, text: string) => ({ at, text });

  it("relit chaque trame du relevé : compteur, sens, taille, nature, temps", () => {
    const lines = readWire([
      frame(0, "cbor ▶ offre : nodefony.jsonrpc.cbor.v1, nodefony.jsonrpc.v1"),
      frame(4, 'cbor ← 210 o texte 0.08 ms · {"jsonrpc":"2.0"…'),
      frame(9, "cbor → 41 o binaire · a3 67 6a 73"),
      frame(12, "cbor ← 568 o binaire 0.12 ms · a3 67 6a 73 6f 6e …"),
      frame(20, "cbor ■ fermée 1000"),
    ]);
    expect(lines).toHaveLength(3);
    expect(lines[2]).toEqual({
      at: 12,
      label: "cbor",
      dir: "in",
      bytes: 568,
      binary: true,
      ms: 0.12,
      head: "a3 67 6a 73 6f 6e …",
    });
    expect(lines[1]?.ms).toBeNull();
  });

  it("l'offre et la fermeture se lisent par compteur", () => {
    const chunks = [
      frame(0, "cbor ▶ offre : nodefony.jsonrpc.cbor.v1, nodefony.jsonrpc.v1"),
      frame(1, "texte ▶ offre : rien"),
      // La socket que la page garde : son offre a eu lieu avant le geste.
      frame(2, "app ● déjà ouverte — offre : nodefony.jsonrpc.cbor.v1"),
      frame(9, "cbor ■ fermée 1009 Max payload size exceeded"),
    ];
    expect(readOffers(chunks)).toEqual({
      cbor: "nodefony.jsonrpc.cbor.v1, nodefony.jsonrpc.v1",
      texte: "rien",
      app: "nodefony.jsonrpc.cbor.v1",
    });
    expect(readCloses(chunks)).toEqual({ cbor: 1009 });
  });

  it("la réponse d'une requête est la première trame reçue APRÈS son envoi — ni l'accueil ni une trame de plus", () => {
    const lines = readWire([
      frame(0, "cbor ← 300 o texte 0.1 ms · accueil"),
      frame(1, "texte ← 290 o texte 0.1 ms · accueil"),
      frame(2, "cbor → 40 o binaire · req 64"),
      frame(3, "cbor ← 110 o binaire 0.01 ms · rép 64"),
      // Une trame de plus avant la requête suivante : ce n'est pas une réponse.
      frame(3, "cbor ← 50 o binaire 0.01 ms · intrus"),
      frame(4, "texte → 60 o texte · req 64"),
      frame(5, "cbor → 40 o binaire · req 1024"),
      frame(6, "texte ← 140 o texte 0.02 ms · rép 64"),
      frame(7, "cbor ← 1070 o binaire 0.02 ms · rép 1024"),
    ]);
    expect(responses(lines, WIRE_CBOR).map((line) => line.bytes)).toEqual([
      110, 1070,
    ]);
    const rows = sizeRows(lines, [64, 1024]);
    expect(
      rows.map((row) => [row.size, row.cbor?.bytes, row.text?.bytes]),
    ).toEqual([
      [64, 110, 140],
      [1024, 1070, undefined],
    ]);
  });

  it("le débit somme les octets REÇUS par fenêtre COMPLÈTE, ramenés à la seconde", () => {
    const lines = readWire([
      frame(0, "cbor ← 500 o binaire 0.1 ms · a"),
      frame(100, "cbor ← 500 o binaire 0.1 ms · b"),
      frame(200, "cbor → 999 o binaire · envoi ignoré"),
      frame(600, "cbor ← 500 o binaire 0.1 ms · c"),
      // Fenêtre [1000, 1500) seulement entamée : elle ne compte pas.
      frame(1100, "cbor ← 500 o binaire 0.1 ms · d"),
    ]);
    expect(throughput(lines, WIRE_CBOR, 500)).toEqual([
      { at: 500, perSecond: 2000 },
      { at: 1000, perSecond: 1000 },
    ]);
    expect(typicalFrame(lines, WIRE_CBOR)).toBe(500);
    expect(median([3, 1, 2, 10])).toBe(2.5);
    expect(median([])).toBeNull();
  });

  it("une taille s'écrit en octets, Kio ou Mio, avec une espace insécable", () => {
    expect(formatBytes(568)).toBe("568 o");
    expect(formatBytes(4150)).toBe("4,1 Kio");
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1,5 Mio");
  });

  it("Int16 et Float32 se lisent sur la TRANCHE reçue, en petit-boutiste", () => {
    // Un tampon plus grand que la tranche : la lecture doit partir de byteOffset.
    const buffer = new Uint8Array(16).fill(0xff);
    const view = new DataView(buffer.buffer);
    view.setInt16(4, -1234, true);
    view.setInt16(6, 32_000, true);
    expect([...readSamples(buffer.subarray(4, 8))]).toEqual([-1234, 32_000]);
    view.setFloat32(8, 0.25, true);
    view.setFloat32(12, 0.75, true);
    expect([...readPositions(buffer.subarray(8, 16))]).toEqual([0.25, 0.75]);
  });

  it("le serveur ne produit que les tailles du contrat, et n'empreinte que des octets", () => {
    for (const size of SAMPLE_SIZES) {
      expect(SampleParams.safeParse({ size }).success, String(size)).toBe(true);
    }
    expect(SampleParams.safeParse({ size: 100 }).success).toBe(false);
    expect(SampleParams.safeParse({ size: 64, extra: 1 }).success).toBe(false);
    expect(DigestParams.safeParse({ bytes: new Uint8Array(3) }).success).toBe(
      true,
    );
    for (const bytes of [{ $bytes: "AQID" }, [1, 2, 3], "AQID"]) {
      expect(DigestParams.safeParse({ bytes }).success).toBe(false);
    }
  });

  it("la config de la démo passe le serveur en CBOR et relève maxPayload sur ws ET wss", () => {
    expect(demoModuleConfig["module-realtime"]).toEqual({ codec: "cbor" });
    expect(demoModuleConfig["module-http"]).toEqual({
      websocket: { maxPayload: PAYLOAD_LIMIT },
      websocketSecure: { maxPayload: PAYLOAD_LIMIT },
    });
    // 1,5 Mio passe en CBOR ; en base64, il dépasse : le geste 5 le montre.
    expect(1.5 * 1024 * 1024).toBeLessThan(PAYLOAD_LIMIT);
    expect(Math.ceil((1.5 * 1024 * 1024) / 3) * 4).toBeGreaterThanOrEqual(
      PAYLOAD_LIMIT,
    );
  });

  it("le contrôleur binaire vit sous son préfixe, sur sa propre socket", () => {
    const source = LESSON_SOURCES["nodefony/controllers/BinaryController.ts"];
    expect(source).toContain("@controller(BINARY_PATH)");
    expect(BINARY_PATH).toBe("/demo/api/binary");
    expect(BINARY_SOCKET).toBe("/demo/api/binary/realtime");
    // Le codec est l'affaire de la config et de la négociation : aucun import ici.
    expect(source).not.toContain("nodefony/cbor");
    expect(source).not.toContain("CBOR_FRAME_CODEC");
  });
});

describe("demo — le jeton montré par la page partenaire", () => {
  // Un JWT fabriqué pour le test : en-tête, charge, signature.
  const encode = (value: object): string =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encode({ alg: "ES256" })}.${encode({ sub: "admin", exp: 10, aud: "https://x.test/demo/api/partner" })}.c2lnbmF0dXJlLWRlLXRlc3QtYXNzZXotbG9uZ3Vl`;

  it("décode les revendications pour l'affichage, et rend null sur un jeton malformé", () => {
    expect(decodeClaims(token)).toEqual({
      sub: "admin",
      exp: 10,
      aud: "https://x.test/demo/api/partner",
    });
    expect(decodeClaims("deux.parties")).toBeNull();
    expect(decodeClaims("a.bm9uLWpzb24.c")).toBeNull();
  });

  it("l'altération change la SIGNATURE, et elle seule", () => {
    const tampered = tamperSignature(token);
    const [head, body, signature] = tampered.split(".");
    const [origHead, origBody, origSignature] = token.split(".");
    expect(head).toBe(origHead);
    expect(body).toBe(origBody);
    expect(signature).not.toBe(origSignature);
    expect(signature?.length).toBe(origSignature?.length);
  });
});

describe("demo — les renvois de l'index des démos", () => {
  const moduleDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

  /** Un chemin sous `node_modules`, résolu comme Node le fait : en remontant. */
  const inNodeModules = (relative: string): string | null => {
    let dir = moduleDir;
    for (;;) {
      const candidate = path.join(dir, "node_modules", ...relative.split("/"));
      if (existsSync(candidate)) return candidate;
      const parent = path.dirname(dir);
      if (parent === dir) return null;
      dir = parent;
    }
  };

  const ready = DEMOS.filter((demo) => demo.status === "ready");
  const files = ready.flatMap((demo) =>
    demo.files.map((file) => ({ id: demo.id, file })),
  );
  const docs = ready.flatMap((demo) =>
    "doc" in demo ? [{ id: demo.id, doc: demo.doc }] : [],
  );
  const skills = ready.flatMap((demo) =>
    "skill" in demo ? [{ id: demo.id, skill: demo.skill }] : [],
  );
  const commands = ready.flatMap((demo) =>
    "command" in demo ? [{ id: demo.id, command: demo.command }] : [],
  );
  const types = ready.flatMap((demo) =>
    demo.types.map((type) => ({ id: demo.id, type })),
  );

  // L'accueil le promet à l'agent : pour chaque démo, les fichiers à ouvrir,
  // la doc à lire, la commande à lancer et le skill à charger.
  it("une démo prête cite des fichiers, une doc, une commande et un skill", () => {
    for (const demo of ready) {
      expect(demo.files.length, demo.id).toBeGreaterThan(0);
      expect("doc" in demo, `${demo.id} : doc`).toBe(true);
      expect("command" in demo, `${demo.id} : command`).toBe(true);
      expect("skill" in demo, `${demo.id} : skill`).toBe(true);
    }
  });

  it.each(files)("$id : le fichier $file existe dans le module", ({ file }) => {
    expect(existsSync(path.join(moduleDir, ...file.split("/")))).toBe(true);
  });

  // « Chaque fichier porte un Guide pour un agent » : l'accueil l'affirme.
  it.each(files)(
    "$id : le fichier $file porte un « Guide pour un agent »",
    ({ file }) => {
      const source = readFileSync(
        path.join(moduleDir, ...file.split("/")),
        "utf8",
      );
      expect(source).toContain("Guide pour un agent");
    },
  );

  it.each(docs)("$id : la page $doc est installée", ({ doc }) => {
    expect(
      inNodeModules(doc),
      `node_modules/${doc} introuvable`,
    ).not.toBeNull();
  });

  it.each(skills)("$id : le skill $skill est livré", ({ skill }) => {
    const file = `@nodefony/devkit/skills/${skill}/SKILL.md`;
    expect(
      inNodeModules(file),
      `node_modules/${file} introuvable`,
    ).not.toBeNull();
  });

  it.each(types)(
    "$id : le type $type est exporté par son paquet",
    ({ type }) => {
      // Forme imposée : `Nom (paquet)` — `nodefony/client` est porté par le cœur.
      const match = /^(\w+) \(([^)]+)\)$/.exec(type);
      expect(
        match,
        `« ${type} » : forme attendue \`Nom (paquet)\``,
      ).not.toBeNull();
      const [, name = "", pkg = ""] = match ?? [];
      const owner =
        pkg === "nodefony" || pkg.startsWith("nodefony/")
          ? "@nodefony/core"
          : pkg;
      const graph = readSymbolsGraph(moduleDir);
      expect(
        graph,
        "graphe symbolique du framework introuvable",
      ).not.toBeNull();
      const entry = graph?.symbols[`${owner}:${name}`] ?? graph?.symbols[name];
      expect(entry?.module).toBe(owner);
      expect(entry?.exported).toBe(true);
    },
  );

  it.each(commands)("$id : la commande « $command » existe", ({ command }) => {
    const [npx, bin, verb = "", ...rest] = command.split(" ");
    expect(`${npx} ${bin}`).toBe("npx nodefony");
    if (verb === "create") {
      // Un générateur : son type existe, et chaque valeur de drapeau est un
      // choix qu'il propose.
      const spec = getScaffoldSpec(rest[0]).at(0);
      expect(spec, `create ${rest[0]} : générateur inconnu`).toBeDefined();
      for (let i = 1; i < rest.length; i += 1) {
        const value = rest[i + 1];
        if (!rest[i]?.startsWith("--") || value === undefined) continue;
        expect(
          spec?.questions.some((q) =>
            q.choices?.some((c) => c.value === value),
          ),
          `${rest[i]} ${value} : choix inconnu de create ${rest[0]}`,
        ).toBe(true);
      }
      return;
    }
    // Une commande du module : son nom est celui qu'elle déclare.
    expect([PARTNER_CALL_COMMAND, SENSOR_PUSH_COMMAND]).toContain(verb);
  });
});

describe("demo — gRPC : la page écrit et lit le fil sans bibliothèque", () => {
  it("la requête écrite à la main est celle de @bufbuild/protobuf, varint de longueur compris", () => {
    for (const machine of ["Pompe P-101", "é".repeat(64)]) {
      expect(encodeLatestRequest(machine)).toEqual(
        toBinary(LatestRequestSchema, create(LatestRequestSchema, { machine })),
      );
    }
  });

  /** Le message de fin d'une réponse gRPC-Web : drapeau 0x80, longueur, statut en texte. */
  const trailerFrame = (text: string): Uint8Array => {
    const body = new TextEncoder().encode(text);
    const out = envelope(body);
    out[0] = 0x80;
    return out;
  };

  it("la réponse gRPC-Web se lit en entier : mesure enveloppée, puis statut de fin, sans octet perdu", () => {
    const message = toBinary(
      LatestResponseSchema,
      create(LatestResponseSchema, {
        reading: {
          machine: "Pompe P-101",
          celsius: 61.37,
          measuredAt: timestampFromMs(Date.UTC(2026, 10, 13, 14, 2, 17, 384)),
        },
      }),
    );
    const fin = trailerFrame("grpc-status: 0\r\n");
    const frame = new Uint8Array(
      GRPC_ENVELOPE_BYTES + message.byteLength + fin.byteLength,
    );
    frame.set(envelope(message));
    frame.set(fin, GRPC_ENVELOPE_BYTES + message.byteLength);
    const segments = readGrpcFrame(frame);
    // Contigus, de 0 à la fin : chaque octet a sa légende.
    expect(segments.at(0)?.start).toBe(0);
    expect(segments.at(-1)?.end).toBe(frame.byteLength);
    for (let i = 1; i < segments.length; i += 1) {
      expect(segments[i]?.start).toBe(segments[i - 1]?.end);
    }
    expect(segments.some((s) => s.part === "rest")).toBe(false);
    expect(segments.map((s) => s.label)).toEqual(
      expect.arrayContaining([
        "drapeau 0 : message, non compressé",
        `longueur : ${message.byteLength} octets`,
        "drapeau 0x80 : message de fin",
        "statut : « grpc-status: 0 »",
        "machine = « Pompe P-101 »",
        "celsius = 61.37",
        "nanos = 384000000",
      ]),
    );
  });

  it("une trame coupée finit en octets non lus, jamais en valeur inventée", () => {
    const message = toBinary(
      LatestResponseSchema,
      create(LatestResponseSchema, {
        reading: { machine: "Pompe P-101", celsius: 1 },
      }),
    );
    const cut = envelope(message).subarray(0, GRPC_ENVELOPE_BYTES + 6);
    const segments = readGrpcFrame(cut);
    expect(segments.at(-1)?.part).toBe("rest");
    expect(segments.at(-1)?.end).toBe(cut.byteLength);
  });

  it("la doc liée est celle de la version installée par npm, celle du développement sinon", () => {
    const version = "10.0.0-beta.6";
    for (const installed of [
      "/app/node_modules/nodefony/dist/index.js",
      "C:\\app\\node_modules\\nodefony\\dist\\index.js",
    ]) {
      expect(docsVersionFor(installed, version)).toBe(version);
    }
    for (const source of [
      "/repo/src/nodefony/dist/index.js",
      "D:\\repo\\src\\nodefony\\dist\\index.js",
    ]) {
      expect(docsVersionFor(source, version)).toBe(DOCS_NEXT);
    }
    expect(repoFileUrl(DOCS_NEXT, "LICENSE.txt")).toContain("/blob/dev/");
    expect(repoFileUrl(version, "LICENSE.txt")).toContain(`/blob/v${version}/`);
  });

  it("un flux Connect ou gRPC se montre en octets : son enveloppe n'est pas du texte", () => {
    expect(isTextual("application/connect+json")).toBe(false);
    expect(isTextual("application/grpc-web+proto")).toBe(false);
    expect(isTextual("application/json")).toBe(true);
  });
});

describe("demo — le pouls de l'accueil (demo:pulse)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("coalesce une rafale en UNE trame, puis au plus une par seconde", () => {
    vi.useFakeTimers();
    const pulse = new DemoPulseService();
    const sent: IDemoPulse[] = [];
    pulse.attach((value) => sent.push(value));
    for (let i = 0; i < 100; i += 1) pulse.recordPartnerCall();
    vi.advanceTimersByTime(0);
    expect(sent).toEqual([{ partner: { calls: 100 }, chat: { messages: 0 } }]);
    pulse.recordPartnerCall();
    vi.advanceTimersByTime(PULSE_MIN_INTERVAL_MS - 1);
    expect(sent).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(sent.at(-1)?.partner.calls).toBe(101);
  });

  it("se tait sans abonné, et compte quand même", () => {
    vi.useFakeTimers();
    const pulse = new DemoPulseService();
    const sent: IDemoPulse[] = [];
    const detach = pulse.attach((value) => sent.push(value));
    pulse.recordPartnerCall();
    detach();
    vi.advanceTimersByTime(PULSE_MIN_INTERVAL_MS * 3);
    expect(sent).toEqual([]);
    expect(pulse.snapshot().partner.calls).toBe(1);
  });
});

describe("demo — MCP", () => {
  /** Les outils de la porte, sur un salon neuf. */
  const toolsOn = (chat: ChatService) =>
    Object.fromEntries(demoTools(chat).map((tool) => [tool.name, tool]));
  const anyCaller = { authenticated: false, roles: [], scopes: [] };

  it("lit une réponse JSON, et un flux SSE dont le dernier bloc est encore incomplet", () => {
    expect(
      readMessages('{"jsonrpc":"2.0","id":1,"result":{"ok":true}}'),
    ).toEqual([
      {
        id: 1,
        method: null,
        params: undefined,
        result: { ok: true },
        error: null,
      },
    ]);
    const stream =
      'event: message\ndata: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"p","progress":1,"total":8,"message":"lot 1/8 parcouru"}}\n\n' +
      'data: {"jsonrpc":"2.0","id":2,"result":{"content":[{"type":"text","text":"fini"}]}}\n\n' +
      'data: {"jsonrpc":"2.0","id":3,"res';
    const messages = readMessages(stream);
    expect(messages).toHaveLength(2);
    expect(
      progressOf(
        messages[0] ?? {
          id: null,
          method: null,
          params: null,
          result: null,
          error: null,
        },
      ),
    ).toEqual({
      progress: 1,
      total: 8,
      message: "lot 1/8 parcouru",
    });
    expect(toolText(finalMessage(messages))).toEqual({
      text: "fini",
      isError: false,
    });
  });

  it("lit les annotations d'un outil, et une erreur JSON-RPC", () => {
    const listed = readMessages(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        result: {
          tools: [
            {
              name: "a",
              description: "d",
              annotations: {
                readOnlyHint: false,
                openWorldHint: false,
                destructiveHint: false,
              },
            },
            { name: "b", description: "e" },
          ],
        },
      }),
    );
    expect(toolsOf(finalMessage(listed))).toEqual([
      {
        name: "a",
        title: null,
        description: "d",
        readOnly: false,
        openWorld: false,
        destructive: false,
      },
      {
        name: "b",
        title: null,
        description: "e",
        readOnly: null,
        openWorld: null,
        destructive: null,
      },
    ]);
    const failed = readMessages(
      '{"jsonrpc":"2.0","id":2,"error":{"code":-32602,"message":"outil inconnu"}}',
    );
    expect(finalMessage(failed)?.error).toEqual({
      code: -32602,
      message: "outil inconnu",
    });
  });

  it("le flux normé : un émetteur sans autorisation par code arrête l'agent, Keycloak non", () => {
    // Ce que publie l'émetteur d'une application Nodefony (RFC 8414).
    expect(
      offersCodeFlow({
        issuer: "https://app.test",
        jwks_uri: "https://app.test/.well-known/jwks.json",
        response_types_supported: [],
        grant_types_supported: [],
      }),
    ).toBe(false);
    expect(
      offersCodeFlow({
        authorization_endpoint: "https://kc.test/auth",
        grant_types_supported: ["authorization_code", "refresh_token"],
      }),
    ).toBe(true);
    // `grant_types_supported` absent : la RFC 8414 sous-entend le code.
    expect(
      offersCodeFlow({ authorization_endpoint: "https://kc.test/auth" }),
    ).toBe(true);
    expect(
      offersCodeFlow({ grant_types_supported: ["authorization_code"] }),
    ).toBe(false);
  });

  it("la page ne lit que le serveur de SA propre origine ; les autres restent à l'agent", () => {
    const servers = authorizationServersOf({
      resource: "https://app.test/mcp/demo",
      authorization_servers: [
        "https://kc.test/realms/app",
        "https://app.test",
        42,
      ],
    });
    expect(servers).toEqual(["https://kc.test/realms/app", "https://app.test"]);
    expect(sameOriginServer(servers, "https://app.test")).toBe(
      "https://app.test",
    );
    expect(sameOriginServer(servers, "https://127.0.0.1:5152")).toBeNull();
    expect(authorizationServersOf("pas un document")).toEqual([]);
  });

  it("le chemin bien connu s'insère entre l'origine et le chemin de l'émetteur (RFC 8414)", () => {
    expect(authServerMetadataRequest("https://kc.test/realms/app/").url).toBe(
      "https://kc.test/.well-known/oauth-authorization-server/realms/app",
    );
    expect(authServerMetadataRequest("https://app.test").url).toBe(
      "https://app.test/.well-known/oauth-authorization-server",
    );
  });

  it("relit le jeton du guichet, et refuse ce qui n'en est pas un", () => {
    const token = {
      account: "admin",
      accessToken: "x.y.z",
      expiresIn: 300,
      resource: "https://app.test/mcp/demo",
      scopes: ["demo:write"],
    };
    expect(readToken(JSON.stringify(token))).toEqual(token);
    expect(readToken('{"accessToken":"x"}')).toBeNull();
    expect(readToken("pas du json")).toBeNull();
  });

  it("la zone de la porte rend sa ressource absolue, et le scope est réservé aux administrateurs", () => {
    const config = defineSecurityConfig({
      jwt: { issuer: "https://exemple.test" },
      ...demoSecurity,
    });
    expect(config.areas[MCP_AREA]?.resource).toBe(
      `https://exemple.test${MCP_GATE_PATH}`,
    );
    expect(config.areas[MCP_AREA]?.authenticators).toEqual(["anonymous"]);
    expect(config.grantableScopes[MCP_WRITE_SCOPE]).toEqual(["ROLE_ADMIN"]);
  });

  it("chaque outil dit s'il lit ou s'il modifie (annotations MCP)", () => {
    for (const tool of demoTools(new ChatService())) {
      expect(typeof tool.annotations?.readOnlyHint, tool.name).toBe("boolean");
      expect(typeof tool.annotations?.openWorldHint, tool.name).toBe("boolean");
      if (tool.annotations?.readOnlyHint === false) {
        expect(typeof tool.annotations.destructiveHint, tool.name).toBe(
          "boolean",
        );
      }
    }
    const tools = toolsOn(new ChatService());
    expect(tools[MCP_TOOL_POST]?.scopes).toEqual([MCP_WRITE_SCOPE]);
    expect(tools[MCP_TOOL_POST]?.actsForUser).toBe(true);
    expect(tools[MCP_TOOL_READ]?.scopes).toBeUndefined();
  });

  it("la lecture rend les derniers messages ; hors bornes, un échec MÉTIER que l'agent lit", async () => {
    const chat = new ChatService(undefined, undefined, memoryArchive());
    await chat.publish(LOBBY_ROOM_ID, {
      authorId: "u1",
      author: "alice",
      text: "un",
    });
    await chat.publish(LOBBY_ROOM_ID, {
      authorId: "u2",
      author: "bob",
      text: "deux",
    });
    const read = toolsOn(chat)[MCP_TOOL_READ];
    const ok = await read?.handler({ limit: 1 }, anyCaller);
    // L'`id` stable voyage aussi : l'agent peut viser CE message.
    expect(ok).toEqual({
      content: [
        {
          type: "text",
          text: '[{"id":"m2","author":"bob","text":"deux","sentAt":2}]',
        },
      ],
    });
    const tooMany = await read?.handler(
      { limit: CHAT_READ_MAX + 1 },
      anyCaller,
    );
    expect(tooMany?.isError).toBe(true);
  });

  it("l'outil long s'arrête dès que l'agent a fermé le flux", async () => {
    const abort = new AbortController();
    abort.abort();
    const digest = toolsOn(
      new ChatService(undefined, undefined, memoryArchive()),
    )[MCP_TOOL_DIGEST];
    const reported: number[] = [];
    const result = await digest?.handler({}, anyCaller, {
      signal: abort.signal,
      progress: (progress) => reported.push(progress),
    });
    expect(result).toEqual({
      content: [{ type: "text", text: "interrompu" }],
      isError: true,
    });
    expect(reported).toEqual([]);
  });

  it("l'écriture signe au nom du compte du jeton, et refuse sans compte", async () => {
    const chat = new ChatService(undefined, undefined, memoryArchive());
    const post = toolsOn(chat)[MCP_TOOL_POST];
    const anonymous = await post?.handler({ text: "salut" }, anyCaller);
    expect(anonymous?.isError).toBe(true);
    expect(await chat.recent(LOBBY_ROOM_ID, 10)).toEqual([]);
    const signed = await RequestContext.run(
      {
        requestId: "mcp-test",
        token: { isAuthenticated: () => true },
        user: { id: "1", identifier: "admin", roles: ["ROLE_ADMIN"] },
      },
      () => post?.handler({ text: "  bonjour  " }, anyCaller),
    );
    expect(signed?.isError).toBeUndefined();
    expect(
      (await chat.recent(LOBBY_ROOM_ID, 10)).map(({ author, text }) => ({
        author,
        text,
      })),
    ).toEqual([{ author: "admin", text: "bonjour" }]);
    // La règle du salon, la même que la route d'envoi : un texte vide est refusé.
    const empty = await RequestContext.run(
      {
        requestId: "mcp-test",
        token: { isAuthenticated: () => true },
        user: { id: "1", identifier: "admin", roles: ["ROLE_ADMIN"] },
      },
      () => post?.handler({ text: "   " }, anyCaller),
    );
    expect(empty?.isError).toBe(true);
  });

  it("le fil ne bâtit rien sans spectateur, et plafonne une rafale", () => {
    const service = new DemoMcpService();
    const entry = (at: number): IMcpFeedEntry => ({
      at,
      method: "tools/list",
      tool: null,
      caller: "anonyme",
      ms: 1,
      status: 200,
    });
    expect(service.watched).toBe(false);
    service.record(entry(1000));
    const sent: IMcpFeedEntry[] = [];
    const detach = service.attach((line) => sent.push(line));
    expect(service.watched).toBe(true);
    for (let i = 0; i < MCP_FEED_MAX_PER_S * 3; i += 1)
      service.record(entry(5000));
    expect(sent).toHaveLength(MCP_FEED_MAX_PER_S);
    service.record(entry(6000));
    expect(sent).toHaveLength(MCP_FEED_MAX_PER_S + 1);
    detach();
    expect(service.watched).toBe(false);
  });

  it("la carte MCP est prête, et pointe la leçon", () => {
    const card = DEMOS.find((demo) => demo.id === "mcp");
    expect(card?.status).toBe("ready");
    expect(card?.path).toBe("/demo/mcp");
  });
});

describe("Jeux — les briques communes et les règles", () => {
  /** Une connexion de test : la salle ne lit que `open`. */
  const connection = () => ({ userId: null, open: true });

  it("un enregistrement fait l'aller-retour octet pour octet, et borne au lieu de replier", () => {
    const record = defineRecord([
      { name: "id", type: "u16" },
      { name: "x", type: "i16", scale: 10 },
      { name: "r", type: "u8" },
      { name: "v", type: "f32" },
      { name: "n", type: "u32" },
    ] as const);
    const bytes = record.write([
      { id: 513, x: -12.3, r: 7, v: 1.5, n: 182_790 },
      { id: 2, x: 99_999, r: 300, v: -0.25, n: 5e9 },
    ]);
    expect(bytes.byteLength).toBe(2 * record.bytes);
    expect(record.bytes).toBe(13);
    // Un Uint8Array reçu ne commence pas toujours au début de son tampon.
    const shifted = new Uint8Array(bytes.byteLength + 3);
    shifted.set(bytes, 3);
    const [first, second] = record.read(shifted.subarray(3));
    expect(first).toEqual({ id: 513, x: -12.3, r: 7, v: 1.5, n: 182_790 });
    expect(second?.x).toBe(3276.7);
    expect(second?.r).toBe(255);
    // Un compte au-delà de 32 bits reste au plafond, il ne repart pas de zéro.
    expect(second?.n).toBe(4_294_967_295);
  });

  it("les enregistrements des deux jeux ont la taille annoncée sur la page", () => {
    expect(meteorRecord.bytes).toBe(8);
    expect(boomRecord.bytes).toBe(6);
    expect(droneRecord.bytes).toBe(8);
  });

  it("la salle assoit un humain à sa première commande, et les robots complètent", () => {
    const rules = new MeteorRules();
    const room = new GameRoom(rules);
    room.tick(1 / 30);
    expect(room.pilots()).toHaveLength(DEFENDERS);
    expect(room.humans).toBe(0);
    const player = connection();
    expect(room.command(player, { angle: 1, fire: false, tag: 42 })).toBe(true);
    room.tick(1 / 30);
    expect(room.humans).toBe(1);
    expect(room.pilots()).toHaveLength(DEFENDERS);
    expect(room.pilots().find((p) => !p.robot)?.tag).toBe(42);
  });

  it("la salle refuse une commande invalide, et libère la place d'une connexion fermée", () => {
    const room = new GameRoom(new MeteorRules());
    const player = connection();
    expect(room.command(player, { angle: "1", fire: false, tag: 1 })).toBe(
      false,
    );
    expect(room.command(player, { angle: 1, fire: false, tag: 1, x: 3 })).toBe(
      false,
    );
    expect(room.humans).toBe(0);
    room.command(player, { angle: 1, fire: false, tag: 1 });
    player.open = false;
    room.tick(1 / 30);
    expect(room.humans).toBe(0);
    expect(room.pilots().every((p) => p.robot)).toBe(true);
    expect(IDLE_MS).toBeGreaterThan(1000);
  });

  it("Météores : un tir qui touche casse le météore — décidé par le serveur", () => {
    const rules = new MeteorRules();
    const room = new GameRoom(rules);
    room.command(connection(), { angle: 0, fire: true, tag: 7 });
    rules.meteors.push({
      id: 1,
      x: RING_RADIUS + 60,
      y: 0,
      vx: 0,
      vy: 0,
      r: 8,
      hp: 1,
    });
    let boomed = false;
    // Le canon part de −π/2 et pivote à 7 rad/s vers 0 : une dizaine de tours, puis le vol du tir.
    for (let i = 0; i < 40 && !boomed; i += 1) {
      const frame = room.tick(1 / 30);
      boomed = boomRecord.read(frame.booms).some((b) => b.kind === BOOM_METEOR);
    }
    expect(boomed).toBe(true);
    expect(rules.score).toBeGreaterThan(0);
  });

  it("Prisme : une case survolée prend la couleur de l'équipe, et le score suit", () => {
    const rules = new PrismRules();
    const room = new GameRoom(rules);
    const frame = room.tick(1 / 30);
    expect(room.pilots()).toHaveLength(PRISM_CREW);
    expect(frame.tiles.byteLength).toBe(prismTiles.length);
    const owned = [...frame.tiles].filter((owner) => owner > 0).length;
    expect(owned).toBeGreaterThan(0);
    expect(frame.scores.reduce((a, b) => a + b, 0)).toBe(owned);
    // La trame porte une COPIE : la grille qui change ensuite ne la touche pas.
    const before = frame.tiles.slice();
    for (let i = 0; i < 30; i += 1) room.tick(1 / 30);
    expect(frame.tiles).toEqual(before);
  });

  it("Prisme : la grille se calcule à l'identique des deux côtés, case par case", () => {
    expect(prismTiles).toHaveLength(397);
    prismTiles.forEach((tile, i) => expect(tileAt(tile.x, tile.z)).toBe(i));
    expect(tileAt(100, 100)).toBe(-1);
  });

  it("l'interpolation place une entité entre deux trames, et montre une entité neuve telle quelle", () => {
    const buffer = new SnapshotBuffer<number>(30);
    expect(buffer.pair(0)).toBeNull();
    buffer.push(1, 1000);
    buffer.push(2, 1033);
    buffer.push(3, 1066);
    const pair = buffer.pair(1066 + buffer.delayMs - 16);
    expect(pair?.from.data).toBe(2);
    expect(pair?.to.data).toBe(3);
    const mixed = interpolateById(
      [{ id: 1, x: 0 }],
      [
        { id: 1, x: 10 },
        { id: 2, x: 5 },
      ],
      0.5,
      (a, b, k) => ({ ...b, x: a.x + (b.x - a.x) * k }),
    );
    expect(mixed).toEqual([
      { id: 1, x: 5 },
      { id: 2, x: 5 },
    ]);
  });

  it("les deux cartes de jeu sont prêtes et mènent à leur page", () => {
    for (const id of ["meteor", "prism"]) {
      const card = DEMOS.find((demo) => demo.id === id);
      expect(card?.status).toBe("ready");
      expect(card !== undefined && "path" in card ? card.path : null).toBe(
        `/demo/${id}`,
      );
    }
  });
});

describe("Sonde — le service d'acquisition", () => {
  /** Avance la sonde de `ticks` tours, sans attendre l'horloge. */
  const run = (sensors: SensorService, ticks: number) => {
    for (let i = 0; i < ticks; i += 1) sensors.step();
  };

  it("chaque cadence reçoit la réduction de SA période : 100 ms = 5 échantillons, 1 s = 50", () => {
    const sensors = new SensorService();
    const fast: IPlantWindow[] = [];
    const slow: IPlantWindow[] = [];
    const stops = [
      sensors.watchPlant(100, (frame) => fast.push(frame)),
      sensors.watchPlant(1000, (frame) => slow.push(frame)),
    ];
    run(sensors, ACQUISITION_HZ);
    stops.forEach((stop) => stop());
    expect(fast).toHaveLength(10);
    expect(slow).toHaveLength(1);
    expect(fast.at(0)?.n).toBe(5);
    expect(slow.at(0)?.n).toBe(50);
    // 4 machines × 3 grandeurs, 12 octets par série : 144 octets de mesures.
    const window = slow.at(0);
    expect(window?.w.byteLength).toBe(
      MACHINES.length * QUANTITIES.length * windowRecord.bytes,
    );
    const series = windowRecord.read(window?.w ?? new Uint8Array());
    for (const { min, max, mean } of series) {
      expect(min).toBeLessThanOrEqual(mean);
      expect(mean).toBeLessThanOrEqual(max);
    }
  });

  it("le tableau d'alarmes part au premier tour, puis chaque seconde", () => {
    const sensors = new SensorService();
    const boards: IAlarmBoard[] = [];
    const stop = sensors.watchAlarms((board) => boards.push(board));
    run(sensors, 1);
    expect(boards).toHaveLength(1);
    expect(boards.at(0)?.alarms.map((a) => a.id)).toEqual([
      ...MACHINES.map((m) => `vibration-${m.id}`),
      "cryo-mxc",
    ]);
    run(sensors, ACQUISITION_HZ);
    stop();
    expect(boards.length).toBeGreaterThanOrEqual(2);
  });

  it("🔴 acquitter signe du nom DONNÉ par le contrôleur (la session), et refuse ce qui n'attend rien", () => {
    const sensors = new SensorService();
    const seen: { board: IAlarmBoard | null } = { board: null };
    const stop = sensors.watchAlarms((board) => {
      seen.board = board;
    });
    expect(sensors.acknowledge("vibration-1", "admin")).toBe(false);
    expect(sensors.acknowledge("inconnue", "admin")).toBe(false);
    // Le roulement de la machine 3 se dégrade par cycle : au plus quelques minutes simulées.
    let pending = false;
    for (let i = 0; i < ACQUISITION_HZ * 240 && !pending; i += 1) {
      sensors.step();
      pending =
        seen.board?.alarms.some(
          (a) => a.id === "vibration-3" && a.state === "unacknowledged",
        ) ?? false;
    }
    expect(pending).toBe(true);
    expect(sensors.acknowledge("vibration-3", "admin")).toBe(true);
    stop();
    const event = seen.board?.journal.at(-1);
    expect(event?.id).toBe("vibration-3");
    expect(event?.state).toBe("acknowledged");
    expect(event?.by).toBe("admin");
  });

  it("le spectre entier part en u32 : 1 024 canaux, 4 096 octets", () => {
    const sensors = new SensorService();
    const stop = sensors.watchGamma(() => {});
    run(sensors, ACQUISITION_HZ);
    stop();
    const whole = sensors.spectrum();
    expect(whole.s.byteLength).toBe(4096);
    expect(whole.live).toBeGreaterThan(0);
    expect(whole.live).toBeLessThanOrEqual(whole.real);
  });

  it("l'historique du cryostat garde les points du run en cours, deux par seconde", () => {
    const sensors = new SensorService();
    run(sensors, ACQUISITION_HZ * 3);
    const history = sensors.cryoHistory();
    const points = cryoRecord.read(history.points);
    expect(points).toHaveLength(6);
    const hours = points.map((point) => point.h);
    expect(hours).toEqual(hours.toSorted((a, b) => a - b));
  });

  it("la carte Sonde est prête et mène à sa page", () => {
    const card = DEMOS.find((demo) => demo.id === "sensor");
    expect(card?.status).toBe("ready");
    expect(card !== undefined && "path" in card ? card.path : null).toBe(
      "/demo/sensor",
    );
  });
});

describe("FilePreview — une bulle n'a aucune action (D31)", () => {
  // Une bulle de survol ne prend jamais le focus : un bouton ou un lien qu'elle
  // porterait serait inatteignable au clavier (WCAG 2.1.1).
  const file = {
    name: "notes.txt",
    size: 12,
    kind: "text" as const,
    lines: 3,
    preview: "a\nb\nc",
  };

  it("`controls={false}` : l'aperçu, sans bouton ni lien", () => {
    const still = renderToStaticMarkup(
      createElement(FilePreview, { file, url: "/f/1", controls: false }),
    );
    expect(still).toContain("notes.txt");
    expect(still).toContain("a\nb\nc");
    expect(still).not.toMatch(/<(button|a)\b/);
  });

  it("par défaut : le dépli et le téléchargement", () => {
    const full = renderToStaticMarkup(
      createElement(FilePreview, { file, url: "/f/1" }),
    );
    expect(full).toMatch(/<button\b/);
    expect(full).toMatch(/<a\b[^>]*download/);
  });
});

describe("demo — qui « écrit… » (nextTyping)", () => {
  const message = (author: string): ChatMessage => ({
    id: "m1",
    author,
    text: "salut",
    sentAt: 1,
  });

  it("montre la frappe d'un autre", () => {
    expect(nextTyping(null, { kind: "typing", author: "bob" }, "alice")).toBe(
      "bob",
    );
  });

  it("ne montre jamais sa propre frappe, et garde celle d'un autre", () => {
    expect(nextTyping(null, { kind: "typing", author: "alice" }, "alice")).toBe(
      null,
    );
    expect(
      nextTyping("bob", { kind: "typing", author: "alice" }, "alice"),
    ).toBe("bob");
  });

  it("le message de l'auteur qui écrivait clôt sa frappe, pas celle d'un autre", () => {
    expect(
      nextTyping("bob", { kind: "message", message: message("bob") }, "alice"),
    ).toBe(null);
    expect(
      nextTyping(
        "bob",
        { kind: "message", message: message("carol") },
        "alice",
      ),
    ).toBe("bob");
  });

  it("un anonyme voit la frappe de tous", () => {
    expect(nextTyping(null, { kind: "typing", author: "bob" }, null)).toBe(
      "bob",
    );
  });
});
