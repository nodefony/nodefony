import type { ILesson, LessonFile } from "../lesson/lesson";

/**
 * gRPC, couche par couche — du contrat `.proto` à la page qui suit la
 * machine (modèle commun : `lesson/lesson.ts`). Les gestes de la page citent
 * les mêmes régions, une par une, à côté de leurs appels.
 */

const CONTRACT: LessonFile = "proto/demo/telemetry/v1/telemetry.proto";
const SECURITY: LessonFile = "nodefony/config/security.ts";
const CONTROLLER: LessonFile = "nodefony/controllers/TelemetryController.ts";
const CHANNEL: LessonFile = "nodefony/controllers/DemoRealtimeController.ts";
const RELAY: LessonFile = "nodefony/service/TelemetryRelayService.ts";
const MACHINE: LessonFile = "nodefony/command/SensorPushCommand.ts";
const SHARED: LessonFile = "frontend/src/grpc/grpcDemo.ts";
const CLIENT: LessonFile = "frontend/src/grpc/grpcClient.ts";

export const GRPC_LESSON = {
  tabs: [
    {
      layer: "security",
      blocks: [
        {
          text: "Une zone au motif EXACT pour la seule méthode qui écrit : `Push` exige un jeton émis pour elle. `Latest`, en lecture, reste publique.",
          excerpt: { file: SECURITY, region: "telemetry-area" },
        },
        {
          text: "Le scope qui ouvre `Push`, réservé aux administrateurs : un autre compte reçoit un jeton sans lui.",
          excerpt: { file: SECURITY, region: "telemetry-grant" },
        },
      ],
    },
    {
      layer: "controller",
      blocks: [
        {
          text: "Le contrat d'abord : deux méthodes, un flux client et un appel unaire sans effet de bord. `buf generate` en tire le code typé (`nodefony/gen/`), jamais édité.",
          excerpt: { file: CONTRACT, region: "proto-service" },
        },
        {
          text: "La mesure, datée par la machine. Les noms des champs ne voyagent pas : seuls leurs numéros passent sur le fil.",
          excerpt: { file: CONTRACT, region: "proto-reading" },
        },
        {
          text: "`@GrpcService` lie la classe au contrat : une méthode du contrat = une méthode de la classe. Le service qui porte la logique s'injecte.",
          excerpt: { file: CONTROLLER, region: "grpc-controller" },
        },
        {
          text: "`Push` reçoit un itérable : une mesure par tour de boucle, une seule réponse à la fin. `@RequireScope` refuse un jeton sans le scope.",
          excerpt: { file: CONTROLLER, region: "grpc-push" },
        },
        {
          text: "`Latest` rend la dernière mesure. Déclarée sans effet de bord, elle se lit aussi en `GET`.",
          excerpt: { file: CONTROLLER, region: "grpc-latest" },
        },
        {
          text: "La page suit par la socket de la démo : le canal relaie ce que le service publie, et ne coûte rien tant qu'aucune page ne regarde.",
          excerpt: { file: CHANNEL, region: "grpc-channel" },
        },
      ],
    },
    {
      layer: "service",
      blocks: [
        {
          text: "Le relais : la dernière mesure de chaque machine, mise à jour en place, et la fonction de publication — `null` tant que personne ne regarde.",
          excerpt: { file: RELAY, region: "grpc-relay" },
        },
        {
          text: "Une mesure non plausible n'est ni retenue ni relayée ; le flux de la machine continue.",
          excerpt: { file: RELAY, region: "grpc-relay-publish" },
        },
      ],
    },
    {
      layer: "command",
      blocks: [
        {
          text: "La machine : un transport gRPC natif (HTTP/2, TLS) et un client typé par le code généré. Un seul appel `Push`, ouvert tant qu'elle mesure.",
          excerpt: { file: MACHINE, region: "grpc-client" },
        },
        {
          text: "Un flux client est un itérable asynchrone : chaque `yield` envoie un message, la fin de l'itérable ferme l'envoi.",
          excerpt: { file: MACHINE, region: "grpc-readings" },
        },
      ],
    },
    {
      layer: "front",
      blocks: [
        {
          text: "Les chemins, le scope et le canal, écrits UNE fois et importés par le serveur ET par la page. Le test du module vérifie que les chemins sont ceux du contrat.",
          excerpt: { file: SHARED, region: "grpc-shared" },
        },
        {
          text: "Ce que le canal transporte : une mesure, ou un flux qui s'ouvre ou se ferme.",
          excerpt: { file: SHARED, region: "grpc-frames" },
        },
        {
          text: "Suivre la machine : s'abonner au canal, et demander l'état à chaque connexion.",
          excerpt: { file: CLIENT, region: "client-follow" },
        },
        {
          text: "Appeler `Latest` sans bibliothèque : un `POST` en JSON, ou un `GET` dont l'adresse porte le message — la variante qu'un cache sait garder.",
          excerpt: { file: CLIENT, region: "client-latest-json" },
        },
        {
          text: "Le même appel en gRPC-Web, avec `fetch` seul : l'enveloppe de 5 octets, le message écrit en trois morceaux ; la réponse revient en octets, statut compris.",
          excerpt: { file: CLIENT, region: "client-grpc-web" },
        },
        {
          text: "Ce que le service refuse : `Push` sans jeton, `Push` en `GET`, une méthode hors du contrat.",
          excerpt: { file: CLIENT, region: "client-refused" },
        },
      ],
    },
  ],
  decorators: [
    {
      name: "GrpcService",
      from: "@nodefony/framework/grpc",
      role: "lie la classe à un service du contrat ; chaque méthode devient une route.",
      file: CONTROLLER,
      region: "grpc-controller",
    },
    {
      name: "Inject",
      from: "nodefony",
      role: "injecte le service qui porte la logique, par son nom.",
      file: CONTROLLER,
      region: "grpc-controller",
    },
    {
      name: "RequireScope",
      from: "@nodefony/framework",
      role: "exige un scope dans le jeton ; sinon 7 PERMISSION_DENIED.",
      file: CONTROLLER,
      region: "grpc-push",
    },
    {
      name: "injectable",
      from: "nodefony",
      role: "rend le service injectable : un singleton pour toute l'application.",
      file: RELAY,
      region: "grpc-relay",
    },
  ],
  decoratedFiles: [CONTROLLER, RELAY],
} as const satisfies ILesson;

/** Un extrait que la leçon cite : un geste qui en citerait un autre ne compile pas. */
export type GrpcExcerpt =
  (typeof GRPC_LESSON.tabs)[number]["blocks"][number]["excerpt"];
