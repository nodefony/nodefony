import { useState, type ReactNode } from "react";
import {
  docsVersion,
  docUrl,
  type IDemoAbout,
  REPO_URL,
  repoFileUrl,
} from "../about";
import { LEVELS } from "../Catalogue";
import { CopyLine } from "../kit/CopyLine";
import { LessonCode } from "../lesson/LessonCode";
import type { LessonFile } from "../lesson/lesson";
import { probeRequest } from "../kit/probe";
import { StepsLesson, type ILessonStep } from "../kit/StepsLesson";
import {
  latestGrpcWeb,
  latestJson,
  latestPost,
  pushByGet,
  pushWithoutToken,
  unknownMethod,
} from "./grpcClient";
import {
  DEFAULT_MACHINE,
  PUSH_COMMAND,
  TELEMETRY_LATEST_PATH,
  TELEMETRY_PUSH_PATH,
  TELEMETRY_SERVICE,
} from "./grpcDemo";
import { GRPC_LESSON, type GrpcExcerpt } from "./grpcTabs";
import { LivePanel, Refusals, SocketLog, WireFrame } from "./GrpcVisuals";
import { useTelemetry } from "./useTelemetry";
import "./grpc.css";

const CONTRACT = "proto/demo/telemetry/v1/telemetry.proto" satisfies LessonFile;
const SECURITY = "nodefony/config/security.ts" satisfies LessonFile;
const CONTROLLER =
  "nodefony/controllers/TelemetryController.ts" satisfies LessonFile;
const CHANNEL =
  "nodefony/controllers/DemoRealtimeController.ts" satisfies LessonFile;
const RELAY = "nodefony/service/TelemetryRelayService.ts" satisfies LessonFile;
const MACHINE = "nodefony/command/SensorPushCommand.ts" satisfies LessonFile;
const SHARED = "frontend/src/grpc/grpcDemo.ts" satisfies LessonFile;
const CLIENT = "frontend/src/grpc/grpcClient.ts" satisfies LessonFile;

/** Octets gardés d'une réponse gRPC-Web : la mesure ET le message de fin. */
const FRAME_BYTES_KEPT = 256;

/** Un geste de la leçon, et le visuel qu'il montre sous ses appels. */
interface IGrpcStep extends ILessonStep<GrpcExcerpt> {
  shows?: "machine" | "frame" | "socket" | "curl" | "refusals";
  /** Sections de la doc gRPC (ancre du titre) que le geste résume. */
  docs?: readonly (readonly [label: string, anchor: string])[];
}

/** Les sept gestes, pour la machine que la page suit. */
function buildSteps(machine: string): readonly [IGrpcStep, ...IGrpcStep[]] {
  return [
    {
      id: "contract",
      short: "Le contrat",
      gesture: "telemetry.proto",
      title: "Le contrat, avant le code",
      text: "Un fichier `.proto` décrit le service : ses méthodes, leurs messages, le numéro de chaque champ. `buf generate` en tire le code typé, pour le serveur comme pour la machine. Le contrat déclare `Latest` : on l'appelle tel quel, en Connect — un `POST`, le message en JSON dans le corps.",
      excerpts: [
        { file: CONTRACT, region: "proto-service" },
        { file: CONTRACT, region: "proto-reading" },
      ],
      expect: "200, et la dernière mesure — {} avant la machine",
      docs: [
        [
          "Où vivent le contrat et le code généré",
          "où-vivent-le-contrat-et-le-code-généré",
        ],
        ["Les quatre formes de méthode", "les-quatre-formes-de-méthode"],
      ],
      calls: [
        {
          label: "Appeler Latest",
          verb: "POST",
          path: TELEMETRY_LATEST_PATH,
          run: (live) => probeRequest(latestPost(machine), live),
        },
      ],
    },
    {
      id: "controller",
      short: "Contrôleur, service",
      gesture: "@GrpcService",
      title: "Le contrôleur traduit, le service relaie",
      text: "`@GrpcService` lie la classe au contrat : une méthode du contrat est une méthode de la classe, sinon la compilation échoue. Le contrôleur ne fait que traduire ; la dernière mesure vit dans un service injecté, partagé par toute l'application.",
      excerpts: [
        { file: CONTROLLER, region: "grpc-controller" },
        { file: CONTROLLER, region: "grpc-latest" },
        { file: RELAY, region: "grpc-relay" },
      ],
      expect: "la dernière mesure, ou {} avant la machine",
      docs: [
        ["Écrire un service", "-écrire-un-service"],
        [
          "La logique dans un service injecté",
          "la-logique-dans-un-service-injecté",
        ],
      ],
      calls: [
        {
          label: "Lire la dernière mesure",
          verb: "GET",
          path: TELEMETRY_LATEST_PATH,
          run: (live) => probeRequest(latestJson(machine), live),
        },
      ],
    },
    {
      id: "push",
      short: "La machine pousse",
      gesture: "createGrpcTransport",
      title: "La machine pousse, en gRPC natif",
      text: "La machine est une commande de l'application, lancée dans un second terminal : un client gRPC Node, en HTTP/2 et TLS sur le port 5152. Elle ouvre UN appel `Push` et y envoie une mesure par tour de cadence ; la page passe à « machine connectée ». À la fin du flux, le serveur répond par son total.",
      excerpts: [
        { file: MACHINE, region: "grpc-client" },
        { file: MACHINE, region: "grpc-readings" },
        { file: CONTROLLER, region: "grpc-push" },
      ],
      expect: "machine connectée, puis { accepted: N }",
      shows: "machine",
      docs: [
        ["Protocoles et ports", "-protocoles-et-ports"],
        ["Les quatre formes de méthode", "les-quatre-formes-de-méthode"],
      ],
      calls: [],
    },
    {
      id: "frame",
      short: "Sur le fil",
      gesture: "gRPC-Web",
      title: "Une mesure sur le fil, en gRPC-Web",
      text: "La même route parle trois protocoles. gRPC natif : HTTP/2 obligatoire, le statut voyage dans des en-têtes de FIN — c'est la machine. gRPC-Web : les mêmes octets, mais le statut passe dans le corps, en un dernier message (drapeau `0x80`), parce qu'un navigateur ne lit pas ces en-têtes ; il passe aussi en HTTP/1.1. Connect : JSON, et `GET` pour une lecture (geste 6). Ici, gRPC-Web avec `fetch` seul : chaque message est précédé de 5 octets d'enveloppe, un champ s'écrit par son numéro, jamais par son nom.",
      excerpts: [
        { file: CLIENT, region: "client-grpc-web" },
        { file: CONTRACT, region: "proto-reading" },
      ],
      expect: "la mesure enveloppée, puis grpc-status: 0",
      shows: "frame",
      docs: [
        ["Protocoles et ports", "-protocoles-et-ports"],
        ["La forme écrite, par protocole", "la-forme-écrite-par-protocole"],
        ["Lexique", "-lexique"],
      ],
      calls: [
        {
          label: "Lire la dernière mesure en gRPC-Web",
          verb: "POST",
          path: TELEMETRY_LATEST_PATH,
          // Une réponse gRPC-Web tient en quelques dizaines d'octets : les
          // garder tous, message de fin compris.
          run: (live) =>
            probeRequest(latestGrpcWeb(machine), live, FRAME_BYTES_KEPT),
        },
      ],
    },
    {
      id: "socket",
      short: "La page suit",
      gesture: "socket.on()",
      title: "La page suit par la socket, pas par gRPC",
      text: "Le relais reçoit chaque mesure par `Push` et la publie sur un canal de la socket CBOR de la démo, celle de la Sonde. La page s'y abonne comme à n'importe quel canal : aucune bibliothèque gRPC à charger. Sans page abonnée, le relais ne construit aucune trame.",
      excerpts: [
        { file: RELAY, region: "grpc-relay-publish" },
        { file: CHANNEL, region: "grpc-channel" },
        { file: CLIENT, region: "client-follow" },
        { file: SHARED, region: "grpc-frames" },
      ],
      expect: "une trame par mesure, tant que la machine pousse",
      shows: "socket",
      docs: [["Performance et mémoire", "-performance--mémoire"]],
      calls: [],
    },
    {
      id: "get",
      short: "Sans bibliothèque",
      gesture: "NO_SIDE_EFFECTS",
      title: "Le même appel, sans bibliothèque",
      text: "`Latest` est déclarée sans effet de bord : le serveur la sert aussi en `GET`, le message dans l'adresse. Un cache, `curl` ou `fetch` savent la lire. `Push`, qui écrit, refuse le `GET`.",
      excerpts: [
        { file: CLIENT, region: "client-latest-json" },
        { file: CONTROLLER, region: "grpc-latest" },
        { file: SHARED, region: "grpc-shared" },
      ],
      expect: "Latest : 200 ; Push en GET : 405",
      shows: "curl",
      docs: [
        ["Ce que la déclaration engage", "ce-que-la-déclaration-engage"],
        [
          "Le navigateur ne rouvre pas le CSRF",
          "le-navigateur-ne-rouvre-pas-le-csrf",
        ],
      ],
      calls: [
        {
          label: "Latest en GET, JSON",
          verb: "GET",
          path: TELEMETRY_LATEST_PATH,
          run: (live) => probeRequest(latestJson(machine), live),
        },
        {
          label: "Push en GET",
          verb: "GET",
          path: TELEMETRY_PUSH_PATH,
          run: (live) => probeRequest(pushByGet(), live),
        },
      ],
    },
    {
      id: "refuse",
      short: "Refuser",
      gesture: "@RequireScope",
      title: "Refuser, et s'arrêter proprement",
      text: "`Push` est sous une zone du pare-feu : sans jeton, refus avant le contrôleur (16 `UNAUTHENTICATED`). Un jeton sans le scope est refusé par `@RequireScope` (7 `PERMISSION_DENIED`). En Connect, un flux répond en 200 et porte son verdict dans le message de fin, après 5 octets d'enveloppe. Une méthode hors du contrat n'a pas de route : 404, que le corps traduit en `unimplemented` pour un client gRPC.",
      excerpts: [
        { file: SECURITY, region: "telemetry-area" },
        { file: SECURITY, region: "telemetry-grant" },
        { file: CLIENT, region: "client-refused" },
      ],
      expect: "200, et « unauthenticated » dans le message de fin",
      shows: "refusals",
      docs: [
        ["Refus et codes", "-refus-et-codes"],
        [
          "Refus avant ta route",
          "refus-avant-ta-route--chemin-inconnu-débit-hôte",
        ],
        ["Protéger une méthode", "protéger-une-méthode"],
        ["Arrêt du serveur", "arrêt-du-serveur"],
      ],
      calls: [
        {
          label: "Push sans jeton",
          verb: "POST",
          path: TELEMETRY_PUSH_PATH,
          run: (live) => probeRequest(pushWithoutToken(), live),
        },
        {
          label: "Une méthode hors du contrat",
          verb: "POST",
          path: `/${TELEMETRY_SERVICE}/Reset`,
          run: (live) => probeRequest(unknownMethod(), live),
        },
      ],
    },
  ];
}

/**
 * Page d'apprentissage « gRPC » (`/demo/grpc`) : une machine pousse sa
 * température en gRPC, la page la trace en direct. En tête, la machine ; puis
 * les sept gestes (mise en page du kit, `kit/StepsLesson.tsx`).
 *
 * Guide pour un agent : le contrat est `proto/demo/telemetry/v1/telemetry.proto`,
 * le contrôleur `TelemetryController.ts`, le relais `TelemetryRelayService.ts`,
 * la machine la commande `npx nodefony demo:sensor:push`. La page suit par la
 * socket de la démo (`useTelemetry.ts`) et n'appelle le service que par
 * `fetch` (`grpcClient.ts`) ; les visuels sont dans `GrpcVisuals.tsx`.
 */
export function GrpcLesson({ about }: { about: IDemoAbout | null }) {
  const version = docsVersion(about);
  const view = useTelemetry();
  const machine = view.pushing.at(0) ?? view.last?.machine ?? DEFAULT_MACHINE;
  const [frame, setFrame] = useState<Uint8Array | null>(null);
  const steps = buildSteps(machine);
  const grpcDoc = (anchor = ""): string =>
    `${docUrl(version, "modules/framework/grpc")}${version !== null && anchor !== "" ? `#${anchor}` : ""}`;
  // Le navigateur rend l'adresse absolue : celle que `curl` doit viser.
  const curl = `curl '${latestJson(machine).url}'`;

  const fields = (step: IGrpcStep): ReactNode => (
    <>
      {step.shows === "machine" && (
        <div className="grpc-step-run">
          <p role="status">
            {view.pushing.length > 0
              ? `Machine connectée : ${view.pushing.join(", ")}.`
              : "Aucune machine connectée : lance-la, la page le verra."}
          </p>
          <CopyLine text={`${PUSH_COMMAND} --count 20`} />
        </div>
      )}
      {step.shows === "frame" && frame !== null && <WireFrame frame={frame} />}
      {step.shows === "socket" && <SocketLog lines={view.log} />}
      {step.shows === "curl" && <CopyLine text={curl} />}
      {step.shows === "refusals" && <Refusals />}
      <p className="grpc-doc">
        Doc :{" "}
        {(step.docs ?? []).map(([label, anchor], index) => (
          <span key={anchor}>
            {index > 0 && " · "}
            <a href={grpcDoc(anchor)}>{label}</a>
          </span>
        ))}
      </p>
    </>
  );

  return (
    <main className="lesson steps-page">
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <a href="/demo">Démo</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">gRPC</span>
      </nav>

      <header className="steps-head">
        <span className={`lvl ${LEVELS.advanced.className}`}>
          {LEVELS.advanced.label}
        </span>
        <h1>gRPC — une machine pousse, la page trace en direct</h1>
        <p>
          La machine entre par <strong>gRPC</strong> : un contrat{" "}
          <code>.proto</code> qu'un programme écrit dans n'importe quel langage
          sait appeler, servi sur les serveurs déjà ouverts. La page suit par la
          socket de la démo. Deux transports, chacun pour ce qu'il fait le mieux
          — et aucun port neuf.
        </p>
      </header>

      <LivePanel view={view} />

      <StepsLesson
        steps={steps}
        label="Les sept gestes"
        prefix={`/${TELEMETRY_SERVICE}`}
        fields={fields}
        onResult={(result, step) => {
          if (step === "frame" && result.bytes !== undefined) {
            setFrame(result.bytes);
          }
        }}
      />

      <details className="steps-more">
        <summary>Le code entier, couche par couche</summary>
        <LessonCode
          lesson={GRPC_LESSON}
          doc={{ href: grpcDoc(), label: "gRPC — la doc complète" }}
        />
      </details>

      <section className="grpc-next" aria-labelledby="grpc-next-title">
        <h2 id="grpc-next-title" className="lesson-step">
          La suite : deux normes qui parlent gRPC
        </h2>
        <div className="grpc-next-cols">
          <article className="is-a2a">
            <h3>Un agent parle à un agent : A2A</h3>
            <p>
              A2A (<em>Agent2Agent</em>, projet de la Linux Foundation) est le
              protocole par lequel deux agents IA se confient des tâches. Sa
              version 1.0.1 a trois liaisons officielles, dont gRPC, avec un
              contrat publié. Nodefony le sert par le même geste que cette
              machine : le contrat généré depuis le dépôt d'A2A, puis{" "}
              <code>@GrpcService(A2AService)</code>.
            </p>
            <pre className="copy-text">{`service A2AService {
  rpc SendMessage(SendMessageRequest) returns (SendMessageResponse);
  rpc SendStreamingMessage(SendMessageRequest)
      returns (stream StreamResponse);
  rpc GetTask(GetTaskRequest) returns (Task);
  // … et d'autres méthodes
}`}</pre>
            <p>
              Ce qui n'est pas là : Nodefony ne fournit pas d'agent A2A prêt à
              l'emploi. Le contrat se sert, la logique de l'agent reste à
              écrire.
            </p>
          </article>
          <article className="is-gnmi">
            <h3>Une machine pousse sa télémétrie : gNMI</h3>
            <p>
              gNMI (OpenConfig) est la norme par laquelle routeurs et
              commutateurs poussent leurs mesures en flux gRPC. Le geste de
              cette démo, côté réseau. Le sens diffère : en gNMI, le client
              s'abonne et l'équipement sert le flux ; ici, la machine ouvre
              l'appel et pousse (flux client). Les deux se servent avec{" "}
              <code>@GrpcService</code>.
            </p>
            <pre className="copy-text">{`service gNMI {
  rpc Capabilities(CapabilityRequest) returns (CapabilityResponse);
  rpc Get(GetRequest) returns (GetResponse);
  rpc Set(SetRequest) returns (SetResponse);
  rpc Subscribe(stream SubscribeRequest)
      returns (stream SubscribeResponse);
}`}</pre>
          </article>
        </div>
      </section>

      <section className="lesson-traps" aria-labelledby="lesson-traps-title">
        <div>
          <h2 id="lesson-traps-title" className="lesson-step">
            Les pièges
          </h2>
          <ul>
            <li>
              <strong>gRPC natif exige HTTP/2.</strong> La machine vise le port
              TLS (5152 en développement) ; Connect, lui, passe aussi en
              HTTP/1.1.
            </li>
            <li>
              <strong>Un refus de flux arrive en 200.</strong> En Connect, le
              verdict est dans le message de fin : lire le corps, pas le seul
              statut.
            </li>
            <li>
              <strong>Le code généré ne s'édite pas.</strong> Changer le
              contrat, puis <code>buf generate</code> : une retouche à la main
              disparaît à la génération suivante.
            </li>
            <li>
              <strong>
                Un script Node isolé ne connaît pas le certificat de
                développement.
              </strong>{" "}
              La commande le reconnaît d'office ; un script le déclare (
              <code>NODE_EXTRA_CA_CERTS</code>).
            </li>
          </ul>
        </div>
        <aside className="further" aria-label="Pour aller plus loin">
          <h2 className="lesson-step">Pour aller plus loin</h2>
          <a href={grpcDoc()}>gRPC — servir un service déclaré par un module</a>
          <a
            href={repoFileUrl(
              version,
              "src/packages/@nodefony/devkit/skills/nodefony-add-grpc-service/SKILL.md",
            )}
          >
            Skill d'agent : nodefony-add-grpc-service
          </a>
          <a
            href={repoFileUrl(
              version,
              "docs/adr/0026-service-grpc-declare-par-un-module.md",
            )}
          >
            ADR-0026 : le pourquoi de chaque choix
          </a>
          <a href="https://a2a-protocol.org/">A2A (Agent2Agent)</a>
          <a href="https://github.com/openconfig/reference">
            gNMI (OpenConfig)
          </a>
          <a href="https://github.com/fullstorydev/grpcurl">
            grpcurl : le même appel hors JavaScript
          </a>
          <a href={`${REPO_URL}/issues/745`}>
            Le relais sur plusieurs processus (#745)
          </a>
          <a href="/demo/sensor">La Sonde : la même pompe, par la socket</a>
        </aside>
      </section>
    </main>
  );
}
