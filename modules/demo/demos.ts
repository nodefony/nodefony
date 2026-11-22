/**
 * Index des démos — SOURCE UNIQUE : l'accueil `/demo` en tire son catalogue
 * et ses onglets de métier, et un agent y trouve, pour chaque démo, les
 * fichiers à lire, les types à utiliser, la doc, la commande et le skill.
 *
 * Guide pour un agent : une démo se déclare ICI, et nulle part ailleurs —
 * pas de JSON parallèle. `as const satisfies` garde les littéraux (les `id`
 * deviennent le type `DemoId`, que les onglets de métier référencent) tout en
 * vérifiant chaque entrée contre `IDemoEntry`. Les chemins de `files` sont
 * relatifs au module ; ceux de `doc`, à `node_modules`.
 */

/** Niveau d'une démo, affiché en étiquette sur sa carte. */
export type DemoLevel = "beginner" | "intermediate" | "advanced";

/** Rubrique du catalogue. */
export type DemoRubric = "realtime" | "games" | "transports" | "programs";

/** Une entrée de l'index. */
export interface IDemoEntry {
  /** Identifiant stable, ancre de la carte (`#demo-<id>`). */
  id: string;
  title: string;
  rubric: DemoRubric;
  level: DemoLevel;
  /** Ce que la démo montre, en une ou deux phrases ; `code` entre accents graves. */
  teaches: string;
  /** `soon` : carte grisée « Démo à venir » — la fonctionnalité existe, la démo pas encore. */
  status: "ready" | "soon";
  /** Étiquette courte affichée en haut de la carte. */
  tag?: string;
  /** Page de la démo, quand elle en a une. */
  path?: string;
  /** Fichiers du module à lire, dans l'ordre. */
  files: readonly string[];
  /** Types publics que la démo emploie, avec leur paquet. */
  types: readonly string[];
  /** Page de doc, chemin sous `node_modules`. */
  doc?: string;
  /** Commande qui la montre ou qui génère son équivalent. */
  command?: string;
  /** Skill qui porte le savoir-faire. */
  skill?: string;
}

/** Les rubriques, dans l'ordre d'affichage. */
export const DEMO_RUBRICS = [
  {
    id: "realtime",
    title: "Temps réel",
    summary: "la socket, les canaux, le binaire",
  },
  {
    id: "games",
    title: "Jeux",
    summary: "le temps réel, à plusieurs, en jouant",
  },
  {
    id: "transports",
    title: "Flux et transports",
    summary: "HTTP, HTTP/2, flux serveur",
  },
  {
    id: "programs",
    title: "Sécurité, programmes et agents",
    summary: "jetons, outils, fichiers",
  },
] as const satisfies readonly {
  id: DemoRubric;
  title: string;
  summary: string;
}[];

export const DEMOS = [
  {
    id: "chat",
    title: "Chat",
    rubric: "realtime",
    level: "intermediate",
    teaches:
      "Salons en base, présence, « en train d'écrire », historique, invitations, événements et messages privés. Lecture libre, écriture sous session.",
    status: "ready",
    tag: "cookbook, 7 étapes",
    path: "/demo/chat",
    files: [
      "frontend/src/chat/chatSchemas.ts",
      "frontend/src/chat/chatContract.ts",
      "nodefony/controllers/ChatController.ts",
      "nodefony/service/ChatService.ts",
      "frontend/src/chat/rooms.ts",
      "nodefony/service/RoomService.ts",
      "nodefony/entity/rooms.ts",
      "frontend/src/chat/RoomForms.tsx",
      "frontend/src/chat/ChatLesson.tsx",
      "frontend/src/chat/attachments.ts",
      "frontend/src/chat/ChatComposer.tsx",
      "frontend/src/chat/ChatAttachments.tsx",
      "frontend/src/kit/preview.ts",
      "frontend/src/kit/FilePreview.tsx",
      "frontend/src/kit/markdown.ts",
      "frontend/src/kit/MarkdownText.tsx",
      "frontend/src/kit/MarkdownEditor.tsx",
      "frontend/src/chat/useChat.ts",
      "frontend/src/chat/messages.ts",
      "frontend/src/chat/roster.ts",
      "frontend/src/chat/ChatMessageList.tsx",
      "frontend/src/chat/ChatPeople.tsx",
      "frontend/src/chat/ChatLinkPreview.tsx",
      "nodefony/service/RoomAdmission.ts",
      "nodefony/service/LinkPreviewService.ts",
    ],
    types: [
      "ContractRealtimeController (@nodefony/realtime)",
      "IRealtimeContract (nodefony/client)",
      "NodefonySocket (nodefony/client)",
    ],
    doc: "@nodefony/realtime/docs/cookbook-chat.md",
    command: "npx nodefony create controller chat --kind realtime",
    skill: "nodefony-add-realtime-channel",
  },
  {
    id: "binary",
    title: "Temps réel binaire",
    rubric: "realtime",
    level: "advanced",
    teaches:
      "Des octets dans les messages — mesures de machine, positions d'un jeu, un dessin — en trames CBOR : négociées par connexion, mesurées sur le fil, typées des deux côtés.",
    status: "ready",
    tag: "7 gestes à essayer",
    path: "/demo/binary",
    files: [
      "nodefony/config/config.ts",
      "frontend/src/binary/binaryDemo.ts",
      "nodefony/controllers/BinaryController.ts",
      "frontend/src/binary/binaryClient.ts",
      "frontend/src/binary/BinaryLesson.tsx",
      "frontend/src/binary/BinaryVisuals.tsx",
      "frontend/src/binary/wire.ts",
      "frontend/src/kit/probe.ts",
    ],
    types: [
      "ContractRealtimeController (@nodefony/realtime)",
      "NodefonySocket (nodefony/client)",
      "CBOR_FRAME_CODEC (nodefony/cbor)",
    ],
    doc: "@nodefony/realtime/docs/protocole.md",
    command: "npx nodefony create controller --kind realtime",
    skill: "nodefony-add-realtime-channel",
  },
  {
    id: "sensor",
    title: "Sonde",
    rubric: "realtime",
    level: "intermediate",
    teaches:
      "Une usine et un laboratoire sur la même socket : trois écrans à trois cadences, des alarmes ISA-18.2, un spectre gamma, un cryostat, un test de Bell et la tomographie d'un qubit.",
    status: "ready",
    tag: "9 gestes, 3 bancs",
    path: "/demo/sensor",
    files: [
      "frontend/src/sensor/sensorDemo.ts",
      "nodefony/controllers/SensorController.ts",
      "nodefony/service/SensorService.ts",
      "nodefony/kit/fixedStep.ts",
      "frontend/src/kit/records.ts",
      "nodefony/sensor/plant.ts",
      "nodefony/sensor/alarms.ts",
      "nodefony/sensor/gamma.ts",
      "nodefony/sensor/cryostat.ts",
      "nodefony/sensor/quantum.ts",
      "frontend/src/sensor/sensorClient.ts",
      "frontend/src/sensor/sensorStats.ts",
      "frontend/src/sensor/SensorLesson.tsx",
      "frontend/src/sensor/SensorCharts.tsx",
      "frontend/src/sensor/BlochView.tsx",
    ],
    types: [
      "ContractRealtimeController (@nodefony/realtime)",
      "NodefonySocket (nodefony/client)",
      "CBOR_FRAME_CODEC (nodefony/cbor)",
    ],
    doc: "@nodefony/realtime/docs/cadence-et-contre-pression.md",
    command: "npx nodefony create controller --kind realtime",
    skill: "nodefony-add-realtime-channel",
  },
  {
    id: "meteor",
    title: "Météores",
    rubric: "games",
    level: "advanced",
    teaches:
      "Un jeu coopératif : des centaines de météores, un canon par joueur, le serveur qui arbitre trente fois par seconde et le monde en octets sur le fil.",
    status: "ready",
    tag: "jeu, à plusieurs",
    path: "/demo/meteor",
    files: [
      "frontend/src/meteor/meteorDemo.ts",
      "nodefony/controllers/MeteorController.ts",
      "nodefony/service/MeteorService.ts",
      "nodefony/game/GameRoom.ts",
      "nodefony/kit/fixedStep.ts",
      "frontend/src/kit/records.ts",
      "frontend/src/game/snapshots.ts",
      "frontend/src/game/commandSender.ts",
      "frontend/src/meteor/meteorClient.ts",
      "frontend/src/meteor/MeteorGame.tsx",
      "frontend/src/meteor/meteorScene.ts",
    ],
    types: [
      "ContractRealtimeController (@nodefony/realtime)",
      "IRealtimeConnection (@nodefony/realtime)",
      "NodefonySocket (nodefony/client)",
      "CBOR_FRAME_CODEC (nodefony/cbor)",
    ],
    doc: "@nodefony/realtime/docs/cas-d-usage.md",
    command: "npx nodefony create controller --kind realtime",
    skill: "nodefony-add-realtime-channel",
  },
  {
    id: "prism",
    title: "Prisme",
    rubric: "games",
    level: "advanced",
    teaches:
      "Quatre équipes colorent une arène 3D : la même salle de jeu que Météores, d'autres règles. Ce qui se partage entre deux jeux, et ce qui leur reste propre.",
    status: "ready",
    tag: "jeu 3D, en équipes",
    path: "/demo/prism",
    files: [
      "frontend/src/prism/prismDemo.ts",
      "nodefony/controllers/PrismController.ts",
      "nodefony/service/PrismService.ts",
      "nodefony/game/GameRoom.ts",
      "frontend/src/kit/records.ts",
      "frontend/src/game/snapshots.ts",
      "frontend/src/prism/prismClient.ts",
      "frontend/src/prism/PrismGame.tsx",
      "frontend/src/prism/prismScene.ts",
    ],
    types: [
      "ContractRealtimeController (@nodefony/realtime)",
      "IRealtimeConnection (@nodefony/realtime)",
      "NodefonySocket (nodefony/client)",
    ],
    doc: "@nodefony/realtime/docs/cas-d-usage.md",
    command: "npx nodefony create controller --kind realtime",
    skill: "nodefony-add-realtime-channel",
  },
  {
    id: "first-steps",
    title: "Premiers pas",
    rubric: "transports",
    level: "beginner",
    teaches:
      "Un contrôleur en dix gestes : rendre une valeur, du HTML, un corps validé, une erreur, une redirection, une `Response` Web, un flux, un fichier, l'appelant — et la même action par WebSocket.",
    status: "ready",
    tag: "10 étapes à essayer",
    path: "/demo/first-steps",
    files: [
      "frontend/src/first/firstSteps.ts",
      "nodefony/controllers/FirstStepsController.ts",
      "frontend/src/first/firstClient.ts",
      "frontend/src/first/FirstStepsLesson.tsx",
      "frontend/src/first/FirstVisuals.tsx",
      "frontend/src/kit/probe.ts",
      "frontend/src/kit/ProbeResult.tsx",
    ],
    types: ["Controller (@nodefony/framework)", "HttpError (@nodefony/http)"],
    doc: "@nodefony/framework/docs/controller.md",
    command: "npx nodefony create controller",
    skill: "nodefony-dev",
  },
  {
    id: "sse",
    title: "Flux SSE",
    rubric: "transports",
    level: "beginner",
    teaches:
      "Pousser des événements serveur (`text/event-stream`) que le navigateur lit avec `EventSource` : nommés et typés, repris après une coupure, gardés vivants, négociés, et en réponse à un `POST`.",
    status: "ready",
    tag: "7 gestes à essayer",
    path: "/demo/sse",
    files: [
      "frontend/src/sse/sseDemo.ts",
      "nodefony/controllers/SseController.ts",
      "frontend/src/sse/sseClient.ts",
      "frontend/src/sse/SseLesson.tsx",
      "frontend/src/sse/SseVisuals.tsx",
      "frontend/src/kit/probe.ts",
      "frontend/src/kit/StepsLesson.tsx",
    ],
    types: ["SseStream (@nodefony/http)", "NodefonySse (nodefony/client)"],
    doc: "@nodefony/http/docs/sse.md",
    command: "npx nodefony create controller",
    skill: "nodefony-dev",
  },
  {
    id: "video-range",
    title: "Vidéo par plages",
    rubric: "transports",
    level: "intermediate",
    teaches:
      "Servir les vidéos de `media/` par plages (`Range`, 206) : le lecteur saute où il veut, le serveur ne lit que le morceau demandé — plage impossible, en-tête invalide, `If-Range` et nom refusé compris.",
    status: "ready",
    tag: "7 gestes à essayer",
    path: "/demo/video",
    files: [
      "frontend/src/video/videoDemo.ts",
      "nodefony/controllers/VideoController.ts",
      "frontend/src/video/VideoLesson.tsx",
      "frontend/src/video/VideoVisuals.tsx",
      "frontend/src/kit/probe.ts",
      "frontend/src/kit/StepsLesson.tsx",
    ],
    types: ["Controller (@nodefony/framework)"],
    doc: "@nodefony/http/docs/byte-stream.md",
    command: "npx nodefony create controller",
    skill: "nodefony-dev",
  },
  {
    id: "grpc",
    title: "gRPC",
    rubric: "transports",
    level: "advanced",
    teaches:
      "Une machine pousse sa température en gRPC natif, la page la trace en direct par la socket ; `Latest` se lit en `GET`, sans bibliothèque.",
    status: "ready",
    tag: "7 gestes, 3 protocoles",
    path: "/demo/grpc",
    files: [
      "proto/demo/telemetry/v1/telemetry.proto",
      "frontend/src/grpc/grpcDemo.ts",
      "nodefony/controllers/TelemetryController.ts",
      "nodefony/service/TelemetryRelayService.ts",
      "nodefony/command/SensorPushCommand.ts",
      "nodefony/controllers/DemoRealtimeController.ts",
      "frontend/src/grpc/grpcClient.ts",
      "frontend/src/grpc/GrpcLesson.tsx",
    ],
    types: [
      "GrpcController (@nodefony/framework)",
      "NodefonySocket (nodefony/client)",
    ],
    doc: "@nodefony/framework/docs/grpc.md",
    command: "npx nodefony demo:sensor:push",
    skill: "nodefony-add-grpc-service",
  },
  {
    id: "partner",
    title: "API entre programmes",
    rubric: "programs",
    level: "advanced",
    teaches:
      "Un programme appelle `/demo/api/partner` avec un jeton : sans jeton 401, avec 200, altéré 401 — à essayer dans la page.",
    status: "ready",
    tag: "jeton machine",
    path: "/demo/partner",
    files: [
      "nodefony/config/security.ts",
      "nodefony/controllers/PartnerController.ts",
      "nodefony/service/PartnerTokenService.ts",
      "nodefony/controllers/PartnerTokenController.ts",
      "frontend/src/partner/usePartnerLab.ts",
      "nodefony/command/PartnerCallCommand.ts",
    ],
    types: [
      "ISecurityConfigInput (@nodefony/security)",
      "TokenService (@nodefony/security)",
      "Firewall (@nodefony/security)",
    ],
    doc: "@nodefony/security/docs/obtenir-un-jeton.md",
    command: "npx nodefony demo:partner:call",
    skill: "nodefony-authentication",
  },
  {
    id: "mcp",
    title: "MCP",
    rubric: "programs",
    level: "advanced",
    teaches:
      "La porte d'entrée d'un agent : des outils découverts et appelés par MCP — lecture publique, outil long en flux SSE, écriture réservée à un scope — et le chemin normé du jeton.",
    status: "ready",
    tag: "7 gestes à essayer",
    path: "/demo/mcp",
    files: [
      "nodefony/config/security.ts",
      "frontend/src/mcp/mcpDemo.ts",
      "nodefony/controllers/DemoMcpController.ts",
      "nodefony/service/DemoMcpService.ts",
      "nodefony/mcp/demoTools.ts",
      "nodefony/controllers/McpTokenController.ts",
      "frontend/src/mcp/mcpClient.ts",
      "frontend/src/mcp/useMcpFeed.ts",
      "frontend/src/mcp/McpLesson.tsx",
      "frontend/src/mcp/McpVisuals.tsx",
    ],
    types: [
      "defineMcpGate (@nodefony/ai)",
      "IMcpTool (nodefony)",
      "mcpText (@nodefony/ai)",
    ],
    doc: "@nodefony/ai/docs/mcp.md",
    command: "npx nodefony create controller --kind mcp",
    skill: "nodefony-dev",
  },
  {
    id: "upload",
    title: "Envoi de fichiers",
    rubric: "programs",
    level: "beginner",
    teaches:
      "Téléverser un fichier en flux jusqu'au disque, suivre sa progression, le relire intact : bornes propres à la route (413 pendant le flux), plusieurs fichiers et un champ, corps brut, type reconnu aux octets, empreinte `Repr-Digest`.",
    status: "ready",
    tag: "7 gestes à essayer",
    path: "/demo/upload",
    files: [
      "frontend/src/upload/uploadDemo.ts",
      "nodefony/controllers/UploadController.ts",
      "nodefony/service/UploadService.ts",
      "frontend/src/upload/uploadClient.ts",
      "frontend/src/upload/UploadLesson.tsx",
      "frontend/src/upload/UploadVisuals.tsx",
      "frontend/src/kit/preview.ts",
      "frontend/src/kit/StepsLesson.tsx",
    ],
    types: [
      "IUploadedFile (@nodefony/http)",
      "IRouteUploadOptions (@nodefony/http)",
    ],
    doc: "@nodefony/http/docs/upload.md",
    command: "npx nodefony create controller",
    skill: "nodefony-dev",
  },
] as const satisfies readonly IDemoEntry[];

/** Identifiant d'une démo de l'index — une faute de frappe ne compile pas. */
export type DemoId = (typeof DEMOS)[number]["id"];
