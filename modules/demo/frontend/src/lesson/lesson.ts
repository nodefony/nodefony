/**
 * Le modèle COMMUN des pages d'apprentissage : le code d'une démo se lit par
 * COUCHE de l'application — config, sécurité, contrôleur, service, données,
 * commande, front, devops —, là où un développeur le cherche. Chaque onglet
 * suit la logique métier en paragraphes, chacun suivi du code qu'il explique,
 * CITÉ des vrais fichiers du module, jamais recopié.
 *
 * Guide pour un agent : une démo déclare ses onglets (`ILessonTab[]`, ex.
 * `chat/chatTabs.ts`) et ses décorateurs ; `LessonCode` les affiche. Un extrait
 * est un bloc `// #region <nom>` … `// #endregion` d'un fichier du module. Le
 * test du module (`tests/demo.test.ts`) exige que chaque région citée existe,
 * que les onglets suivent l'ordre des couches, que la liste des décorateurs
 * soit complète et que chaque constante citée ait sa valeur. Le texte des
 * fichiers est lu par Vite (`lessonSources.ts`, `import.meta.glob`).
 */

/** Un fichier cité, relatif à la racine du module, séparateur `/`. */
export type LessonFile =
  | "nodefony/config/config.ts"
  | "nodefony/config/security.ts"
  | "nodefony/controllers/BinaryController.ts"
  | "nodefony/controllers/ChatController.ts"
  | "nodefony/controllers/DemoMcpController.ts"
  | "nodefony/controllers/FirstStepsController.ts"
  | "nodefony/controllers/PartnerController.ts"
  | "nodefony/controllers/PartnerTokenController.ts"
  | "nodefony/controllers/McpTokenController.ts"
  | "nodefony/controllers/SseController.ts"
  | "nodefony/controllers/VideoController.ts"
  | "nodefony/service/ChatService.ts"
  | "nodefony/service/RoomService.ts"
  | "nodefony/service/RoomAdmission.ts"
  | "nodefony/service/LinkPreviewService.ts"
  | "nodefony/entity/rooms.ts"
  | "nodefony/service/DemoMcpService.ts"
  | "nodefony/service/DemoPulseService.ts"
  | "nodefony/service/PartnerTokenService.ts"
  | "nodefony/command/PartnerCallCommand.ts"
  | "nodefony/mcp/demoTools.ts"
  | "frontend/src/binary/binaryClient.ts"
  | "frontend/src/binary/binaryDemo.ts"
  | "frontend/src/chat/chatContract.ts"
  | "frontend/src/chat/attachments.ts"
  | "frontend/src/chat/useChat.ts"
  | "frontend/src/chat/rooms.ts"
  | "frontend/src/chat/roster.ts"
  | "frontend/src/first/firstClient.ts"
  | "frontend/src/first/firstSteps.ts"
  | "frontend/src/kit/markdown.ts"
  | "frontend/src/kit/detect.ts"
  | "frontend/src/kit/messageLinks.ts"
  | "frontend/src/kit/codeHighlight.ts"
  | "frontend/src/kit/MathView.tsx"
  | "frontend/src/kit/preview.ts"
  | "frontend/src/kit/probe.ts"
  | "frontend/src/mcp/mcpClient.ts"
  | "frontend/src/mcp/mcpDemo.ts"
  | "frontend/src/mcp/useMcpFeed.ts"
  | "frontend/src/partner/partnerApi.ts"
  | "frontend/src/partner/usePartnerLab.ts"
  | "frontend/src/pulse.ts"
  | "frontend/src/sse/sseClient.ts"
  | "frontend/src/sse/sseDemo.ts"
  | "frontend/src/video/videoDemo.ts"
  | "frontend/src/video/VideoLesson.tsx"
  | "frontend/src/video/VideoVisuals.tsx"
  | "nodefony/controllers/UploadController.ts"
  | "nodefony/service/UploadService.ts"
  | "frontend/src/upload/uploadDemo.ts"
  | "frontend/src/upload/uploadClient.ts"
  | "frontend/src/upload/UploadLesson.tsx"
  | "frontend/src/upload/UploadVisuals.tsx"
  | "nodefony/controllers/MeteorController.ts"
  | "nodefony/controllers/PrismController.ts"
  | "nodefony/service/MeteorService.ts"
  | "nodefony/service/PrismService.ts"
  | "nodefony/game/GameRoom.ts"
  | "nodefony/kit/fixedStep.ts"
  | "frontend/src/kit/records.ts"
  | "frontend/src/game/snapshots.ts"
  | "frontend/src/game/commandSender.ts"
  | "frontend/src/game/wireMeter.ts"
  | "frontend/src/game/gameSocket.ts"
  | "frontend/src/game/useGameLoop.ts"
  | "frontend/src/meteor/meteorDemo.ts"
  | "frontend/src/meteor/meteorClient.ts"
  | "frontend/src/meteor/meteorScene.ts"
  | "frontend/src/prism/prismDemo.ts"
  | "frontend/src/prism/prismClient.ts"
  | "frontend/src/prism/prismScene.ts"
  | "nodefony/controllers/SensorController.ts"
  | "nodefony/service/SensorService.ts"
  | "nodefony/sensor/plant.ts"
  | "nodefony/sensor/alarms.ts"
  | "nodefony/sensor/gamma.ts"
  | "nodefony/sensor/cryostat.ts"
  | "nodefony/sensor/quantum.ts"
  | "frontend/src/sensor/sensorDemo.ts"
  | "frontend/src/sensor/sensorClient.ts"
  | "frontend/src/sensor/sensorStats.ts"
  | "frontend/src/sensor/BlochView.tsx"
  | "proto/demo/telemetry/v1/telemetry.proto"
  | "nodefony/controllers/TelemetryController.ts"
  | "nodefony/controllers/DemoRealtimeController.ts"
  | "nodefony/service/TelemetryRelayService.ts"
  | "nodefony/command/SensorPushCommand.ts"
  | "frontend/src/grpc/grpcDemo.ts"
  | "frontend/src/grpc/grpcClient.ts";

/** Les couches, dans l'ordre où l'on construit une fonctionnalité. */
export const LESSON_LAYERS = [
  { id: "config", label: "Config" },
  { id: "security", label: "Sécurité" },
  { id: "controller", label: "Contrôleur" },
  { id: "service", label: "Service" },
  { id: "data", label: "Données (ORM)" },
  { id: "command", label: "Commande" },
  { id: "front", label: "Front" },
  { id: "devops", label: "DevOps" },
] as const;

/** Une couche de l'application. */
export type LessonLayer = (typeof LESSON_LAYERS)[number]["id"];

/** Un extrait : la région `region` du fichier `file`. */
export interface ILessonExcerpt {
  file: LessonFile;
  region: string;
  /** Étape du cookbook qui l'introduit, quand la démo en suit un. */
  step?: number;
}

/**
 * Ce que l'exploitation tape ou pose — terminal, `.env`, journal — et qui ne
 * vit dans aucun fichier du module : il ne se cite donc pas, il se montre.
 */
export interface ILessonSnippet {
  /** Où ça se tape ou se lit (« Terminal », « .env de l'application »). */
  label: string;
  lines: readonly string[];
}

/** Un paragraphe de l'onglet, et le code ou les réglages qu'il explique. */
export interface ILessonBlock {
  /** Le paragraphe ; `code` entre accents graves. */
  text: string;
  excerpt?: ILessonExcerpt;
  snippet?: ILessonSnippet;
}

/** Un onglet : une couche, ce qu'elle porte pour cette démo, et son code. */
export interface ILessonTab {
  layer: LessonLayer;
  blocks: readonly ILessonBlock[];
}

/** Un décorateur employé par une démo, et la région qui le montre. */
export interface ILessonDecorator {
  /** Nom, sans `@`. */
  name: string;
  /** Paquet qui l'exporte. */
  from: string;
  /** Ce qu'il fait, en une phrase. */
  role: string;
  file: LessonFile;
  region: string;
}

/** Une démo telle que sa page l'enseigne. */
export interface ILesson {
  tabs: readonly ILessonTab[];
  /** TOUS les décorateurs des fichiers `decoratedFiles`. */
  decorators: readonly ILessonDecorator[];
  decoratedFiles: readonly LessonFile[];
}

/** Le libellé d'une couche. */
export function layerLabel(layer: LessonLayer): string {
  return LESSON_LAYERS.find((entry) => entry.id === layer)?.label ?? layer;
}

/** Les extraits d'un onglet, dans l'ordre. */
export function tabExcerpts(tab: ILessonTab): ILessonExcerpt[] {
  return tab.blocks.flatMap((block) =>
    block.excerpt === undefined ? [] : [block.excerpt],
  );
}

/** Ligne d'ouverture ou de fermeture d'une région. */
const REGION_OPEN = /^\s*\/\/ #region (\S+)\s*$/;
const REGION_CLOSE = /^\s*\/\/ #endregion\b/;

/**
 * Le texte d'une région d'un fichier, désindenté.
 *
 * @param source - le texte entier du fichier
 * @param name - le nom de la région (`// #region <name>`)
 * @returns le corps de la région, ou `null` si elle n'existe pas ou n'est
 *   pas refermée
 */
export function extractRegion(source: string, name: string): string | null {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => REGION_OPEN.exec(line)?.[1] === name);
  if (start === -1) return null;
  const length = lines
    .slice(start + 1)
    .findIndex((line) => REGION_CLOSE.test(line));
  if (length === -1) return null;
  const body = lines.slice(start + 1, start + 1 + length);
  const indent = Math.min(
    ...body
      .filter((line) => line.trim() !== "")
      .map((line) => line.length - line.trimStart().length),
  );
  return body
    .map((line) => line.slice(Number.isFinite(indent) ? indent : 0))
    .join("\n")
    .trim();
}
