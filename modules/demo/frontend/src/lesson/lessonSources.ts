import type { LessonFile } from "./lesson";

/**
 * Le texte brut des fichiers cités, lu par Vite à la construction. Les motifs
 * sont des chemins EXACTS (aucun joker) : rien d'autre n'entre dans la page.
 */
const RAW = import.meta.glob<string>(
  [
    "../../../nodefony/config/config.ts",
    "../../../nodefony/config/security.ts",
    "../../../nodefony/controllers/BinaryController.ts",
    "../../../nodefony/controllers/ChatController.ts",
    "../../../nodefony/controllers/DemoMcpController.ts",
    "../../../nodefony/controllers/FirstStepsController.ts",
    "../../../nodefony/controllers/PartnerController.ts",
    "../../../nodefony/controllers/PartnerTokenController.ts",
    "../../../nodefony/controllers/McpTokenController.ts",
    "../../../nodefony/controllers/SseController.ts",
    "../../../nodefony/controllers/VideoController.ts",
    "../../../nodefony/controllers/UploadController.ts",
    "../../../nodefony/service/UploadService.ts",
    "../../../nodefony/service/ChatService.ts",
    "../../../nodefony/service/RoomService.ts",
    "../../../nodefony/service/RoomAdmission.ts",
    "../../../nodefony/service/LinkPreviewService.ts",
    "../../../nodefony/entity/rooms.ts",
    "../../../nodefony/service/DemoMcpService.ts",
    "../../../nodefony/service/DemoPulseService.ts",
    "../../../nodefony/service/PartnerTokenService.ts",
    "../../../nodefony/command/PartnerCallCommand.ts",
    "../../../nodefony/mcp/demoTools.ts",
    "../binary/binaryClient.ts",
    "../binary/binaryDemo.ts",
    "../chat/chatContract.ts",
    "../chat/attachments.ts",
    "../chat/useChat.ts",
    "../chat/rooms.ts",
    "../chat/roster.ts",
    "../first/firstClient.ts",
    "../first/firstSteps.ts",
    "../kit/markdown.ts",
    "../kit/detect.ts",
    "../kit/messageLinks.ts",
    "../kit/codeHighlight.ts",
    "../kit/MathView.tsx",
    "../kit/preview.ts",
    "../kit/probe.ts",
    "../mcp/mcpClient.ts",
    "../mcp/mcpDemo.ts",
    "../mcp/useMcpFeed.ts",
    "../partner/partnerApi.ts",
    "../partner/usePartnerLab.ts",
    "../pulse.ts",
    "../sse/sseClient.ts",
    "../sse/sseDemo.ts",
    "../video/videoDemo.ts",
    "../video/VideoLesson.tsx",
    "../video/VideoVisuals.tsx",
    "../upload/uploadDemo.ts",
    "../upload/uploadClient.ts",
    "../upload/UploadLesson.tsx",
    "../upload/UploadVisuals.tsx",
    "../../../nodefony/controllers/MeteorController.ts",
    "../../../nodefony/controllers/PrismController.ts",
    "../../../nodefony/service/MeteorService.ts",
    "../../../nodefony/service/PrismService.ts",
    "../../../nodefony/game/GameRoom.ts",
    "../../../nodefony/kit/fixedStep.ts",
    "../kit/records.ts",
    "../game/snapshots.ts",
    "../game/commandSender.ts",
    "../game/wireMeter.ts",
    "../game/gameSocket.ts",
    "../game/useGameLoop.ts",
    "../meteor/meteorDemo.ts",
    "../meteor/meteorClient.ts",
    "../meteor/meteorScene.ts",
    "../prism/prismDemo.ts",
    "../prism/prismClient.ts",
    "../prism/prismScene.ts",
    "../../../nodefony/controllers/SensorController.ts",
    "../../../nodefony/service/SensorService.ts",
    "../../../nodefony/sensor/plant.ts",
    "../../../nodefony/sensor/alarms.ts",
    "../../../nodefony/sensor/gamma.ts",
    "../../../nodefony/sensor/cryostat.ts",
    "../../../nodefony/sensor/quantum.ts",
    "../sensor/sensorDemo.ts",
    "../sensor/sensorClient.ts",
    "../sensor/sensorStats.ts",
    "../sensor/BlochView.tsx",
    "../../../proto/demo/telemetry/v1/telemetry.proto",
    "../../../nodefony/controllers/TelemetryController.ts",
    "../../../nodefony/controllers/DemoRealtimeController.ts",
    "../../../nodefony/service/TelemetryRelayService.ts",
    "../../../nodefony/command/SensorPushCommand.ts",
    "../grpc/grpcDemo.ts",
    "../grpc/grpcClient.ts",
  ],
  { query: "?raw", import: "default", eager: true },
);

/** Le texte d'un motif ci-dessus ; vide s'il manque (la page le signale). */
function read(key: string): string {
  return RAW[key] ?? "";
}

/**
 * Le texte des fichiers que les pages d'apprentissage citent : la page montre
 * le code qui tourne, pas une copie.
 *
 * Guide pour un agent : la clé est le chemin déclaré dans `lesson.ts`
 * (`LessonFile`). `satisfies Record<LessonFile, string>` refuse la compilation
 * si un fichier cité n'a pas son texte ici ; le test du module vérifie chaque
 * région citée sur CE texte, celui que la page affiche.
 */
export const LESSON_SOURCES = {
  "nodefony/config/config.ts": read("../../../nodefony/config/config.ts"),
  "nodefony/config/security.ts": read("../../../nodefony/config/security.ts"),
  "nodefony/controllers/BinaryController.ts": read(
    "../../../nodefony/controllers/BinaryController.ts",
  ),
  "nodefony/controllers/ChatController.ts": read(
    "../../../nodefony/controllers/ChatController.ts",
  ),
  "nodefony/controllers/DemoMcpController.ts": read(
    "../../../nodefony/controllers/DemoMcpController.ts",
  ),
  "nodefony/controllers/FirstStepsController.ts": read(
    "../../../nodefony/controllers/FirstStepsController.ts",
  ),
  "nodefony/controllers/PartnerController.ts": read(
    "../../../nodefony/controllers/PartnerController.ts",
  ),
  "nodefony/controllers/PartnerTokenController.ts": read(
    "../../../nodefony/controllers/PartnerTokenController.ts",
  ),
  "nodefony/controllers/McpTokenController.ts": read(
    "../../../nodefony/controllers/McpTokenController.ts",
  ),
  "nodefony/controllers/SseController.ts": read(
    "../../../nodefony/controllers/SseController.ts",
  ),
  "nodefony/controllers/VideoController.ts": read(
    "../../../nodefony/controllers/VideoController.ts",
  ),
  "nodefony/service/ChatService.ts": read(
    "../../../nodefony/service/ChatService.ts",
  ),
  "nodefony/service/RoomService.ts": read(
    "../../../nodefony/service/RoomService.ts",
  ),
  "nodefony/service/RoomAdmission.ts": read(
    "../../../nodefony/service/RoomAdmission.ts",
  ),
  "nodefony/service/LinkPreviewService.ts": read(
    "../../../nodefony/service/LinkPreviewService.ts",
  ),
  "nodefony/entity/rooms.ts": read("../../../nodefony/entity/rooms.ts"),
  "nodefony/service/DemoMcpService.ts": read(
    "../../../nodefony/service/DemoMcpService.ts",
  ),
  "nodefony/service/DemoPulseService.ts": read(
    "../../../nodefony/service/DemoPulseService.ts",
  ),
  "nodefony/service/PartnerTokenService.ts": read(
    "../../../nodefony/service/PartnerTokenService.ts",
  ),
  "nodefony/command/PartnerCallCommand.ts": read(
    "../../../nodefony/command/PartnerCallCommand.ts",
  ),
  "nodefony/mcp/demoTools.ts": read("../../../nodefony/mcp/demoTools.ts"),
  "frontend/src/binary/binaryClient.ts": read("../binary/binaryClient.ts"),
  "frontend/src/binary/binaryDemo.ts": read("../binary/binaryDemo.ts"),
  "frontend/src/chat/chatContract.ts": read("../chat/chatContract.ts"),
  "frontend/src/chat/attachments.ts": read("../chat/attachments.ts"),
  "frontend/src/chat/useChat.ts": read("../chat/useChat.ts"),
  "frontend/src/chat/rooms.ts": read("../chat/rooms.ts"),
  "frontend/src/chat/roster.ts": read("../chat/roster.ts"),
  "frontend/src/first/firstClient.ts": read("../first/firstClient.ts"),
  "frontend/src/first/firstSteps.ts": read("../first/firstSteps.ts"),
  "frontend/src/kit/markdown.ts": read("../kit/markdown.ts"),
  "frontend/src/kit/detect.ts": read("../kit/detect.ts"),
  "frontend/src/kit/messageLinks.ts": read("../kit/messageLinks.ts"),
  "frontend/src/kit/codeHighlight.ts": read("../kit/codeHighlight.ts"),
  "frontend/src/kit/MathView.tsx": read("../kit/MathView.tsx"),
  "frontend/src/kit/preview.ts": read("../kit/preview.ts"),
  "frontend/src/kit/probe.ts": read("../kit/probe.ts"),
  "frontend/src/mcp/mcpClient.ts": read("../mcp/mcpClient.ts"),
  "frontend/src/mcp/mcpDemo.ts": read("../mcp/mcpDemo.ts"),
  "frontend/src/mcp/useMcpFeed.ts": read("../mcp/useMcpFeed.ts"),
  "frontend/src/partner/partnerApi.ts": read("../partner/partnerApi.ts"),
  "frontend/src/partner/usePartnerLab.ts": read("../partner/usePartnerLab.ts"),
  "frontend/src/pulse.ts": read("../pulse.ts"),
  "frontend/src/sse/sseClient.ts": read("../sse/sseClient.ts"),
  "frontend/src/sse/sseDemo.ts": read("../sse/sseDemo.ts"),
  "frontend/src/video/videoDemo.ts": read("../video/videoDemo.ts"),
  "frontend/src/video/VideoLesson.tsx": read("../video/VideoLesson.tsx"),
  "frontend/src/video/VideoVisuals.tsx": read("../video/VideoVisuals.tsx"),
  "nodefony/controllers/UploadController.ts": read(
    "../../../nodefony/controllers/UploadController.ts",
  ),
  "nodefony/service/UploadService.ts": read(
    "../../../nodefony/service/UploadService.ts",
  ),
  "frontend/src/upload/uploadDemo.ts": read("../upload/uploadDemo.ts"),
  "frontend/src/upload/uploadClient.ts": read("../upload/uploadClient.ts"),
  "frontend/src/upload/UploadLesson.tsx": read("../upload/UploadLesson.tsx"),
  "frontend/src/upload/UploadVisuals.tsx": read("../upload/UploadVisuals.tsx"),
  "nodefony/controllers/MeteorController.ts": read(
    "../../../nodefony/controllers/MeteorController.ts",
  ),
  "nodefony/controllers/PrismController.ts": read(
    "../../../nodefony/controllers/PrismController.ts",
  ),
  "nodefony/service/MeteorService.ts": read(
    "../../../nodefony/service/MeteorService.ts",
  ),
  "nodefony/service/PrismService.ts": read(
    "../../../nodefony/service/PrismService.ts",
  ),
  "nodefony/game/GameRoom.ts": read("../../../nodefony/game/GameRoom.ts"),
  "nodefony/kit/fixedStep.ts": read("../../../nodefony/kit/fixedStep.ts"),
  "frontend/src/kit/records.ts": read("../kit/records.ts"),
  "frontend/src/game/snapshots.ts": read("../game/snapshots.ts"),
  "frontend/src/game/commandSender.ts": read("../game/commandSender.ts"),
  "frontend/src/game/wireMeter.ts": read("../game/wireMeter.ts"),
  "frontend/src/game/gameSocket.ts": read("../game/gameSocket.ts"),
  "frontend/src/game/useGameLoop.ts": read("../game/useGameLoop.ts"),
  "frontend/src/meteor/meteorDemo.ts": read("../meteor/meteorDemo.ts"),
  "frontend/src/meteor/meteorClient.ts": read("../meteor/meteorClient.ts"),
  "frontend/src/meteor/meteorScene.ts": read("../meteor/meteorScene.ts"),
  "frontend/src/prism/prismDemo.ts": read("../prism/prismDemo.ts"),
  "frontend/src/prism/prismClient.ts": read("../prism/prismClient.ts"),
  "frontend/src/prism/prismScene.ts": read("../prism/prismScene.ts"),
  "nodefony/controllers/SensorController.ts": read(
    "../../../nodefony/controllers/SensorController.ts",
  ),
  "nodefony/service/SensorService.ts": read(
    "../../../nodefony/service/SensorService.ts",
  ),
  "nodefony/sensor/plant.ts": read("../../../nodefony/sensor/plant.ts"),
  "nodefony/sensor/alarms.ts": read("../../../nodefony/sensor/alarms.ts"),
  "nodefony/sensor/gamma.ts": read("../../../nodefony/sensor/gamma.ts"),
  "nodefony/sensor/cryostat.ts": read("../../../nodefony/sensor/cryostat.ts"),
  "nodefony/sensor/quantum.ts": read("../../../nodefony/sensor/quantum.ts"),
  "frontend/src/sensor/sensorDemo.ts": read("../sensor/sensorDemo.ts"),
  "frontend/src/sensor/sensorClient.ts": read("../sensor/sensorClient.ts"),
  "frontend/src/sensor/sensorStats.ts": read("../sensor/sensorStats.ts"),
  "frontend/src/sensor/BlochView.tsx": read("../sensor/BlochView.tsx"),
  "proto/demo/telemetry/v1/telemetry.proto": read(
    "../../../proto/demo/telemetry/v1/telemetry.proto",
  ),
  "nodefony/controllers/TelemetryController.ts": read(
    "../../../nodefony/controllers/TelemetryController.ts",
  ),
  "nodefony/controllers/DemoRealtimeController.ts": read(
    "../../../nodefony/controllers/DemoRealtimeController.ts",
  ),
  "nodefony/service/TelemetryRelayService.ts": read(
    "../../../nodefony/service/TelemetryRelayService.ts",
  ),
  "nodefony/command/SensorPushCommand.ts": read(
    "../../../nodefony/command/SensorPushCommand.ts",
  ),
  "frontend/src/grpc/grpcDemo.ts": read("../grpc/grpcDemo.ts"),
  "frontend/src/grpc/grpcClient.ts": read("../grpc/grpcClient.ts"),
} satisfies Record<LessonFile, string>;
