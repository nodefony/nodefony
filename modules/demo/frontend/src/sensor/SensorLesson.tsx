import { useEffect, useRef, useState, type ReactNode } from "react";
import type { RealtimeIdentity } from "nodefony/client";
import { docsVersion, docUrl, type IDemoAbout } from "../about";
import { LEVELS } from "../Catalogue";
import { tabTargetIndex } from "../effects";
import { LessonCode } from "../lesson/LessonCode";
import {
  probeRealtime,
  type IProbeChunk,
  type IProbeResult,
  type IWireTap,
} from "../kit/probe";
import { StepsLesson, type ILessonStep } from "../kit/StepsLesson";
import {
  acknowledge,
  degradedNetwork,
  openSensor,
  rawShots,
  setSourceRate,
  watchAlarms,
  watchBell,
  watchCryo,
  watchGamma,
  watchPlant,
  watchTomo,
  type CryoPoint,
  type IPlantScreenFrame,
  type SensorSocket,
} from "./sensorClient";
import {
  ACQUISITION_HZ,
  BELL_RUN_PAIRS,
  CRYO_ACCELERATION,
  DEAD_TIME_US,
  MACHINES,
  MXC_ALARM_K,
  QUANTITIES,
  SENSOR_PATH,
  SENSOR_SOCKET,
  sourceRate,
  TOMO_RUN_SHOTS,
  type IAlarmBoard,
  type IBellFrame,
  type IGammaFrame,
  type ITomoFrame,
} from "./sensorDemo";
import { SENSOR_LESSON, type SensorExcerpt } from "./sensorTabs";
import { blochEstimate, blochTarget, chsh, measuredRate } from "./sensorStats";
import {
  BellChart,
  CryoChart,
  PlantChart,
  SpectrumChart,
  type IBellPoint,
  type IPlantPoint,
} from "./SensorCharts";
import { BlochView } from "./BlochView";
import "./sensor.css";
import "./sensorPage.css";

const CONTROLLER = "nodefony/controllers/SensorController.ts";
const SERVICE = "nodefony/service/SensorService.ts";
const CLIENT = "frontend/src/sensor/sensorClient.ts";
const SHARED = "frontend/src/sensor/sensorDemo.ts";

/** L'usine garde deux minutes d'historique à l'écran. */
const PLANT_SPAN = 120;

/** Les trois écrans de l'usine : cadence désirée, et le réseau qu'ils voient. */
const SCREENS = [
  { id: "control", label: "Salle de contrôle", desired: 100, degraded: false },
  {
    id: "tablet",
    label: "Tablette du chef d'équipe",
    desired: 1000,
    degraded: false,
  },
  {
    id: "phone",
    label: "Téléphone d'astreinte",
    desired: 1000,
    degraded: true,
  },
] as const;

/** Points où la courbe de Bell s'enrichit : à peu près trois par décade. */
const BELL_MARKS = [
  100, 200, 500, 1000, 2000, 5000, 10_000, 20_000, 50_000, 100_000, 200_000,
];

/** Le banc d'un geste. */
type Bench = "plant" | "lab" | "quantum";

/** Ce que la page mesure d'un écran d'usine. */
interface IScreenStats {
  ms: number;
  frames: number;
  bytes: number;
  since: number;
}

interface ISensorStep extends ILessonStep<SensorExcerpt> {
  bench: Bench;
}

/** Ce que la page affiche de l'usine. */
interface IPlantView {
  latest: IPlantScreenFrame | null;
  points: IPlantPoint[];
  origin: number;
  screens: Partial<Record<string, IScreenStats>>;
}

const BENCHES: readonly { id: Bench; label: string; text: string }[] = [
  {
    id: "plant",
    label: "Usine",
    text: "Quatre machines, trois grandeurs chacune, lues 50 fois par seconde. Trois écrans à trois cadences, des alarmes qui suivent ISA-18.2.",
  },
  {
    id: "lab",
    label: "Expérience",
    text: "Un analyseur multicanal sur une source de césium 137, et la mise en froid d'un cryostat à dilution.",
  },
  {
    id: "quantum",
    label: "Quantique",
    text: "Un test de Bell sur des paires de photons intriqués, et la tomographie d'un qubit.",
  },
];

/** Une écoute de la sonde sur la socket de la page. */
function onSocket(
  socket: { tap: IWireTap },
  run: () => Promise<string>,
): (live: (chunks: readonly IProbeChunk[]) => void) => Promise<IProbeResult> {
  return (live) =>
    probeRealtime(
      SENSOR_SOCKET,
      async ({ attach }) => {
        attach(socket.tap);
        return run();
      },
      live,
    );
}

/** Les neuf gestes, banc par banc. */
function buildSteps(
  app: ReturnType<typeof openSensor>,
  board: IAlarmBoard | null,
  signedIn: boolean,
): readonly ISensorStep[] {
  const pending =
    board?.alarms.find(
      (a) => a.state === "unacknowledged" || a.state === "returned",
    ) ?? null;
  const login = signedIn ? null : "connexion requise pour acquitter";
  return [
    {
      bench: "plant",
      id: "acquire",
      short: "La mesure datée",
      gesture: "process.hrtime.bigint()",
      title: "Une mesure datée par le serveur",
      text: `Le service lit tous les capteurs ${ACQUISITION_HZ} fois par seconde, à pas fixe, et date chaque fenêtre sur \`hrtime\` : une horloge monotone, qu'un réglage de l'heure système ne fait pas reculer. Sur une vraie chaîne, la date d'acquisition appartient au matériel ; ici, au service.`,
      excerpts: [
        { file: SERVICE, region: "sensor-acquisition" },
        { file: "nodefony/kit/fixedStep.ts", region: "kit-fixed-step" },
        { file: SERVICE, region: "sensor-step" },
      ],
      expect: "quatre machines, une fenêtre par seconde",
      calls: [],
    },
    {
      bench: "plant",
      id: "screens",
      short: "Trois cadences",
      gesture: "sensor:plant:<ms>",
      title: "Trois écrans, trois cadences, aucun ne freine les autres",
      text: "Chaque écran s'abonne à la cadence qu'il désire. Le téléphone d'astreinte voit un réseau dégradé (simulé dans la page) : l'AIMD du framework le fait reculer seul d'un cran à chaque famine, puis remonter quand ça redevient sain. Chaque cadence est un canal distinct : la salle de contrôle garde ses dix trames par seconde.",
      excerpts: [
        { file: CONTROLLER, region: "sensor-rate-channel" },
        { file: CLIENT, region: "sensor-screen" },
        { file: CLIENT, region: "sensor-degraded" },
      ],
      expect: "100 ms et 1 s tenus, le téléphone recule",
      calls: [],
    },
    {
      bench: "plant",
      id: "window",
      short: "Réduire",
      gesture: "windowRecord",
      title: "L'écran ne reçoit jamais l'échantillon brut",
      text: "Une heure de vibration à 50 Hz, c'est 180 000 échantillons par série. Chaque cadence reçoit la réduction de SA période : minimum, maximum, moyenne — 12 octets par série, 144 pour l'usine entière. Une heure d'historique tient en 3 600 fenêtres.",
      excerpts: [
        { file: "nodefony/sensor/plant.ts", region: "sensor-window" },
        { file: SERVICE, region: "sensor-watch-plant" },
        { file: SHARED, region: "sensor-plant" },
        { file: CLIENT, region: "sensor-read-plant" },
      ],
      expect: "une bande min → max et sa moyenne",
      calls: [],
    },
    {
      bench: "plant",
      id: "alarm",
      short: "Alarme",
      gesture: "MovingAverage",
      title: "Seuil, hystérésis, et moyenne glissante",
      text: "Le roulement de la machine 3 se dégrade. Jugée échantillon par échantillon, l'alarme battrait des centaines de fois : le bruit dépasse la largeur de l'hystérésis. Jugée sur la moyenne d'une seconde, elle se lève UNE fois, à l'entrée en zone C (ISO 10816-3, 4,5 mm/s), et ne retombe que sous 4,2.",
      excerpts: [
        { file: "nodefony/sensor/alarms.ts", region: "sensor-moving-average" },
        { file: "nodefony/sensor/alarms.ts", region: "sensor-alarm-engine" },
        { file: SHARED, region: "sensor-alarms" },
      ],
      expect: "une alarme par dégradation, pas cent",
      calls: [],
    },
    {
      bench: "plant",
      id: "ack",
      short: "Acquitter",
      gesture: "this.user",
      title: "Acquitter, sous session, et le tracer",
      text: "Lire est public ; acquitter exige une session. La page n'envoie que l'identifiant de l'alarme : le nom écrit au journal vient de la session, côté serveur. Le journal part sur tous les écrans à la fois.",
      excerpts: [
        { file: CONTROLLER, region: "sensor-write" },
        { file: SERVICE, region: "sensor-ack" },
        { file: CLIENT, region: "sensor-ack-client" },
      ],
      expect: "« active, acquittée », signé de ton identifiant",
      calls: [
        {
          label:
            pending === null
              ? "Aucune alarme à acquitter"
              : `Acquitter « ${pending.source} »`,
          verb: "WS",
          path: SENSOR_SOCKET,
          blocked:
            login ?? (pending === null ? "aucune alarme en attente" : null),
          run: onSocket(app, async () => {
            if (pending === null) return "aucune alarme en attente";
            const ok = await acknowledge(app.socket, pending.id);
            return ok
              ? `« ${pending.source} » acquittée`
              : "déjà acquittée, ou retombée entre-temps";
          }),
        },
      ],
    },
    {
      bench: "lab",
      id: "gamma",
      short: "Spectre",
      gesture: "deltaRecord",
      title: "Le spectre en octets — et quand le binaire perd",
      text: "Dix fois par seconde, seuls les canaux touchés voyagent, 4 octets chacun. Le spectre entier, en `u32`, ne part qu'à l'abonnement : 1 024 canaux dont la plupart sont presque vides pèsent PLUS en binaire (4 octets) qu'en texte (« 0, » : 2 caractères). Le temps mort se règle : au-delà de quelques dizaines de milliers de coups par seconde, le détecteur rate des photons, et le temps vif corrige.",
      excerpts: [
        { file: SHARED, region: "sensor-gamma" },
        { file: "nodefony/sensor/gamma.ts", region: "sensor-gamma-source" },
        { file: SERVICE, region: "sensor-spectrum" },
        { file: CLIENT, region: "sensor-gamma-client" },
      ],
      expect: "le pic à 661,7 keV, le front Compton à 477 keV",
      calls: [
        {
          label: "Demander le spectre entier",
          verb: "WS",
          path: SENSOR_SOCKET,
          run: onSocket(app, async () => {
            const whole = await app.socket.request("sensor:spectrum", {});
            return `${whole.s.byteLength} octets de comptes (1 024 × u32), ${whole.live.toFixed(1)} s de temps vif`;
          }),
        },
      ],
    },
    {
      bench: "lab",
      id: "cryo",
      short: "Cryostat",
      gesture: "CRYO_ACCELERATION",
      title: "Le contrôle lent d'un cryostat",
      text: `La mise en froid d'un cryostat à dilution, en temps accéléré ×${CRYO_ACCELERATION} : 32 heures en 3 minutes 12 secondes. Quatre étages sur une échelle logarithmique, de 300 K à 10 mK. Une remontée de pression du vide d'isolement réchauffe la chambre de mélange : l'alarme passe par la MÊME mécanique que l'usine. Le verrouillage qui couperait la circulation reste dans l'automate ; la page l'affiche, Nodefony ne le commande pas.`,
      excerpts: [
        { file: "nodefony/sensor/cryostat.ts", region: "sensor-cryostat" },
        { file: SHARED, region: "sensor-cryo" },
      ],
      expect: "base sous 12 mK vers 27 h, alarme vers 29 h",
      calls: [],
    },
    {
      bench: "quantum",
      id: "bell",
      short: "Bell",
      gesture: "chsh(counts)",
      title: "Le test de Bell, et le modèle local à côté",
      text: "Des paires de photons intriqués, un réglage de polariseurs tiré au hasard à chaque paire. S = E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′). Une théorie locale ne dépasse jamais 2 : la courbe orange, un vrai modèle local sur les mêmes réglages, plafonne. La mécanique quantique monte vers 2,71 — pas 2√2 : une vraie source n'a pas une visibilité parfaite.",
      excerpts: [
        { file: "nodefony/sensor/quantum.ts", region: "sensor-bell" },
        { file: "frontend/src/sensor/sensorStats.ts", region: "sensor-chsh" },
        { file: SHARED, region: "sensor-quantum" },
      ],
      expect: "S ≈ 2,71, des dizaines de σ au-dessus de 2",
      calls: [],
    },
    {
      bench: "quantum",
      id: "tomo",
      short: "Tomographie",
      gesture: "blochEstimate(n, plus)",
      title: "La tomographie d'un qubit",
      text: "Chaque tir mesure le qubit dans la base X, Y ou Z. La moyenne des tirs donne le vecteur de Bloch. Au début, le hasard le fait sortir de la sphère — un état impossible : à 10 tirs par base, environ une estimation sur deux. On la projette sur la boule, et on le dit. Les tirs bruts voyagent en bits : 1 000 tirs, 125 octets.",
      excerpts: [
        { file: "nodefony/sensor/quantum.ts", region: "sensor-tomography" },
        {
          file: "frontend/src/sensor/sensorStats.ts",
          region: "sensor-bloch-estimate",
        },
        {
          file: "frontend/src/sensor/BlochView.tsx",
          region: "sensor-bloch-view",
        },
        { file: CLIENT, region: "sensor-shots-client" },
      ],
      expect: "fidélité vers 0,975",
      calls: [
        {
          label: "Tirs bruts de la base Z",
          verb: "WS",
          path: SENSOR_SOCKET,
          run: onSocket(app, async () => {
            const shots = await rawShots(app.socket, 2);
            return `${shots.count} tirs en ${shots.bits.byteLength} octets`;
          }),
        },
      ],
    },
  ];
}

/** Les gestes d'un banc, jamais vide. */
function benchSteps(
  steps: readonly ISensorStep[],
  bench: Bench,
): readonly [ISensorStep, ...ISensorStep[]] | null {
  const list = steps.filter((step) => step.bench === bench);
  const first = list.at(0);
  return first === undefined ? null : [first, ...list.slice(1)];
}

/** Le banc qui porte le geste de l'adresse (`#gamma`), sinon l'usine. */
function initialBench(steps: readonly ISensorStep[]): Bench {
  return (
    steps.find((step) => `#${step.id}` === window.location.hash)?.bench ??
    "plant"
  );
}

/**
 * Page d'apprentissage « Sonde » (`/demo/sensor`) : trois bancs — usine,
 * expérience, quantique —, neuf gestes, une socket CBOR.
 *
 * Guide pour un agent : le contrôleur est `SensorController.ts`, la sonde
 * `SensorService.ts` et ses simulations `nodefony/sensor/` ; le code client,
 * `sensorClient.ts` ; les calculs isomorphes, `sensorStats.ts` ; les figures,
 * `SensorCharts.tsx` et `BlochView.tsx`. Un banc ne s'abonne que tant que son
 * onglet est affiché : côté serveur, ce que personne ne regarde ne tourne pas.
 */
export function SensorLesson({ about }: { about: IDemoAbout | null }) {
  const version = docsVersion(about);
  const [app] = useState(openSensor);
  const [identity, setIdentity] = useState<RealtimeIdentity | null>(null);
  const [board, setBoard] = useState<IAlarmBoard | null>(null);
  useEffect(() => {
    const off = app.socket.onIdentity(setIdentity);
    app.socket.connect().catch(() => {
      // La reconnexion automatique prend le relais.
    });
    return () => {
      off();
      app.socket.disconnect();
    };
  }, [app]);
  useEffect(() => watchAlarms(app.socket, setBoard), [app]);

  const signedIn = identity?.authenticated === true;
  const steps = buildSteps(app, board, signedIn);
  const [bench, setBench] = useState<Bench>(() => initialBench(steps));
  const shown = benchSteps(steps, bench);

  const chooseBench = (index: number) => {
    const next = BENCHES.at(index);
    if (next === undefined) return;
    setBench(next.id);
    const first = benchSteps(steps, next.id)?.[0];
    if (first !== undefined)
      window.history.replaceState(null, "", `#${first.id}`);
  };

  return (
    <main className="lesson steps-page sensor-page">
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <a href="/demo">Démo</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Sonde</span>
      </nav>

      <header className="steps-head">
        <span className={`lvl ${LEVELS.intermediate.className}`}>
          {LEVELS.intermediate.label}
        </span>
        <h1>Sonde : une usine et un laboratoire sur la même socket</h1>
        <p>
          Une machine pousse ses mesures ; trois écrans les suivent, chacun à la
          cadence qu'il peut tenir. Le même service alimente un analyseur
          multicanal, un cryostat, un test de Bell et la tomographie d'un qubit.
        </p>
        <aside
          className="sensor-honest"
          aria-label="Ce qui est simulé, ce qui est réel"
        >
          <h2>Ce qui est simulé, ce qui est réel</h2>
          <p>
            Les mesures sont <strong>simulées selon la physique</strong> ; le
            transport, l'enregistrement et l'affichage sont{" "}
            <strong>réels</strong>. Nodefony tient la{" "}
            <strong>supervision</strong> — afficher, enregistrer, alerter,
            partager. Le déclenchement, la lecture des détecteurs et les
            verrouillages de sécurité restent au matériel (FPGA, automate) :
            Node n'est pas un système temps réel dur.
          </p>
        </aside>
      </header>

      <div className="sensor-benches" role="tablist" aria-label="Les bancs">
        {BENCHES.map((entry, index) => (
          <button
            key={entry.id}
            id={`sensor-bench-${entry.id}`}
            type="button"
            role="tab"
            aria-selected={entry.id === bench}
            tabIndex={entry.id === bench ? 0 : -1}
            className="sensor-bench-tab"
            onClick={() => chooseBench(index)}
            onKeyDown={(event) => {
              const next = tabTargetIndex(event.key, index, BENCHES.length);
              if (next === null) return;
              event.preventDefault();
              chooseBench(next);
              document
                .getElementById(`sensor-bench-${BENCHES.at(next)?.id ?? ""}`)
                ?.focus();
            }}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <p className="sensor-bench-text">
        {BENCHES.find((b) => b.id === bench)?.text}
      </p>

      {bench === "plant" && (
        <PlantBench socket={app.socket} board={board} shown={shown} />
      )}
      {bench === "lab" && (
        <LabBench
          socket={app.socket}
          board={board}
          signedIn={signedIn}
          shown={shown}
        />
      )}
      {bench === "quantum" && (
        <QuantumBench socket={app.socket} shown={shown} />
      )}

      <details className="steps-more">
        <summary>Le contrôleur entier, et la page, couche par couche</summary>
        <LessonCode
          lesson={SENSOR_LESSON}
          doc={{
            href: docUrl(
              version,
              "modules/realtime/cadence-et-contre-pression",
            ),
            label: "Cadence adaptative et contre-pression — la doc complète",
          }}
        />
      </details>

      <section className="lesson-traps" aria-labelledby="lesson-traps-title">
        <div>
          <h2 id="lesson-traps-title" className="lesson-step">
            Les pièges
          </h2>
          <ul>
            <li>
              <strong>
                Un seuil sur l'échantillon brut bat comme un cœur.
              </strong>{" "}
              L'hystérésis seule ne suffit pas quand le bruit dépasse sa largeur
              : juger une moyenne glissante.
            </li>
            <li>
              <strong>Le binaire ne gagne pas toujours.</strong> Un tableau
              plein de petits nombres pèse plus en <code>u32</code> qu'en texte
              : n'envoyer que ce qui a changé.
            </li>
            <li>
              <strong>Un écran lent ne doit ralentir personne.</strong> Une
              cadence par canal : le hub ne fait jamais attendre la salle de
              contrôle pour un téléphone.
            </li>
            <li>
              <strong>Node supervise, il ne protège pas.</strong> Un
              verrouillage de sécurité vit dans l'automate ; le serveur peut
              tomber, le cryostat reste protégé.
            </li>
          </ul>
        </div>
        <aside className="further" aria-label="Pour aller plus loin">
          <h2 className="lesson-step">Pour aller plus loin</h2>
          <a
            href={docUrl(
              version,
              "modules/realtime/cadence-et-contre-pression",
            )}
          >
            Cadence adaptative et contre-pression — @nodefony/realtime
          </a>
          <a href={docUrl(version, "modules/realtime/protocole")}>
            Des octets dans la charge — le protocole
          </a>
          <a href="/demo/binary">Temps réel binaire : CBOR, mesuré</a>
        </aside>
      </section>
    </main>
  );
}

/** Ce que chaque banc reçoit de la page. */
interface IBenchProps {
  socket: SensorSocket;
  shown: readonly [ISensorStep, ...ISensorStep[]] | null;
}

/** Les gestes d'un banc, mis en page par le kit. */
function BenchSteps({
  shown,
  visual,
}: Omit<IBenchProps, "socket"> & {
  visual: (step: ILessonStep<SensorExcerpt>) => ReactNode;
}) {
  if (shown === null) return null;
  return (
    <StepsLesson
      steps={shown}
      label="Les gestes du banc"
      prefix={SENSOR_PATH}
      fields={(step) => visual(step)}
    />
  );
}

// ─── Usine ──────────────────────────────────────────────────────────────────

function PlantBench({
  socket,
  board,
  shown,
}: IBenchProps & { board: IAlarmBoard | null }) {
  const [view, setView] = useState<IPlantView>(() => ({
    latest: null,
    points: [],
    origin: 0,
    screens: {},
  }));
  useEffect(() => {
    const stops = SCREENS.map((screen) =>
      watchPlant(
        socket,
        screen.desired,
        (frame) =>
          setView((before) => {
            const stats = before.screens[screen.id];
            const screens = {
              ...before.screens,
              [screen.id]: {
                ms: frame.ms,
                frames: (stats?.frames ?? 0) + 1,
                bytes: (stats?.bytes ?? 0) + frame.bytes,
                since: stats?.since ?? performance.now(),
              },
            };
            if (screen.id !== "tablet") return { ...before, screens };
            const origin = before.origin === 0 ? frame.t : before.origin;
            const m3 = frame.readings.find(
              (r) => r.machine === 3 && r.quantity === "vibration",
            );
            const points =
              m3 === undefined
                ? before.points
                : [
                    ...before.points,
                    {
                      t: (frame.t - origin) / 1000,
                      min: m3.min,
                      max: m3.max,
                      mean: m3.mean,
                    },
                  ].filter(
                    (p) => p.t >= (frame.t - origin) / 1000 - PLANT_SPAN,
                  );
            return { latest: frame, points, origin, screens };
          }),
        (ms) =>
          setView((before) => {
            const stats = before.screens[screen.id];
            return {
              ...before,
              screens: {
                ...before.screens,
                [screen.id]: {
                  ms,
                  frames: stats?.frames ?? 0,
                  bytes: stats?.bytes ?? 0,
                  since: stats?.since ?? performance.now(),
                },
              },
            };
          }),
        screen.degraded ? degradedNetwork() : undefined,
      ),
    );
    return () => stops.forEach((stop) => stop());
  }, [socket]);

  const first = view.points.at(0)?.t ?? 0;
  const alarms = (board?.journal ?? [])
    .filter(
      (e) =>
        e.id === "vibration-3" &&
        e.state === "unacknowledged" &&
        view.origin > 0,
    )
    .map((e) => (e.t - view.origin) / 1000 - first);
  const points = view.points.map((p) => ({ ...p, t: p.t - first }));

  const visual = (step: ILessonStep<SensorExcerpt>): ReactNode => {
    if (step.id === "acquire") return <Machines frame={view.latest} />;
    if (step.id === "screens") return <Screens stats={view.screens} />;
    if (step.id === "ack") return <Journal board={board} />;
    return (
      <PlantChart
        points={points}
        spanSeconds={PLANT_SPAN}
        alarms={step.id === "alarm" ? alarms : []}
        unit="mm/s RMS"
      />
    );
  };
  return <BenchSteps shown={shown} visual={visual} />;
}

/** Les quatre machines, la dernière fenêtre d'une seconde. */
function Machines({ frame }: { frame: IPlantScreenFrame | null }) {
  if (frame === null)
    return <p className="sensor-wait">En attente de la première fenêtre…</p>;
  return (
    <div className="sensor-machines">
      {MACHINES.map((machine) => (
        <div key={machine.id} className="sensor-machine">
          <b>
            M{machine.id} · {machine.name}
          </b>
          <dl>
            {QUANTITIES.map((q) => {
              const r = frame.readings.find(
                (x) => x.machine === machine.id && x.quantity === q.id,
              );
              return (
                <div key={q.id}>
                  <dt>{q.label}</dt>
                  <dd>
                    {r === undefined
                      ? "—"
                      : r.mean.toFixed(q.id === "vibration" ? 2 : 1)}{" "}
                    <small>{q.unit}</small>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
      <p className="sensor-note">
        Fenêtre close à {new Date(frame.t).toLocaleTimeString("fr-FR")},{" "}
        {frame.n} échantillons par série, {frame.bytes} octets de mesures.
      </p>
    </div>
  );
}

/** Les trois écrans : cadence tenue, trames et octets par seconde. */
function Screens({ stats }: { stats: Partial<Record<string, IScreenStats>> }) {
  return (
    <div className="sensor-screens">
      {SCREENS.map((screen) => {
        const s = stats[screen.id];
        const seconds =
          s === undefined ? 0 : (performance.now() - s.since) / 1000;
        const fps = s === undefined || seconds < 1 ? 0 : s.frames / seconds;
        const bps = s === undefined || seconds < 1 ? 0 : s.bytes / seconds;
        return (
          <div
            key={screen.id}
            className={`sensor-screen${screen.degraded ? " is-degraded" : ""}`}
          >
            <b>{screen.label}</b>
            <code>sensor:plant:{s?.ms ?? screen.desired}</code>
            <span>
              {fps.toFixed(fps < 1 ? 2 : 1)} trame/s · {Math.round(bps)} o/s de
              mesures
            </span>
            <small>
              {screen.degraded
                ? `réseau dégradé simulé — désirée ${screen.desired} ms, tenue ${s?.ms ?? screen.desired} ms`
                : `cadence désirée ${screen.desired} ms`}
            </small>
          </div>
        );
      })}
    </div>
  );
}

/** Les alarmes en attente et le journal. */
function Journal({ board }: { board: IAlarmBoard | null }) {
  const labels: Record<string, string> = {
    normal: "normale",
    unacknowledged: "active, non acquittée",
    acknowledged: "active, acquittée",
    returned: "revenue, non acquittée",
  };
  const rows = (board?.journal ?? []).slice(-8).reverse();
  return (
    <div className="sensor-journal">
      <table>
        <caption>
          Journal des alarmes (ISA-18.2), les plus récentes en haut
        </caption>
        <thead>
          <tr>
            <th>Heure</th>
            <th>Source</th>
            <th>État</th>
            <th>Par</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4}>Aucun changement pour l'instant.</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.seq}>
                <td>{new Date(row.t).toLocaleTimeString("fr-FR")}</td>
                <td>{row.source}</td>
                <td className={`sensor-state is-${row.state}`}>
                  {labels[row.state] ?? row.state}
                </td>
                <td>{row.by ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Expérience ─────────────────────────────────────────────────────────────

function LabBench({
  socket,
  board,
  signedIn,
  shown,
}: IBenchProps & { board: IAlarmBoard | null; signedIn: boolean }) {
  const [gamma, setGamma] = useState<{
    counts: Uint32Array;
    frame: IGammaFrame | null;
  } | null>(null);
  const [cryo, setCryo] = useState<{
    run: number;
    points: readonly CryoPoint[];
    phase: string;
  }>({
    run: -1,
    points: [],
    phase: "cooldown",
  });
  const [rate, setRate] = useState<number>(sourceRate.default);
  const [rateError, setRateError] = useState<string | null>(null);
  useEffect(() => {
    let stop: (() => void) | null = null;
    let live = true;
    void watchGamma(socket, (counts, frame) =>
      setGamma((before) => ({
        counts: new Uint32Array(counts),
        frame: frame ?? before?.frame ?? null,
      })),
    ).then((off) => {
      if (live) stop = off;
      else off();
    });
    return () => {
      live = false;
      stop?.();
    };
  }, [socket]);
  useEffect(() => {
    let stop: (() => void) | null = null;
    let live = true;
    void watchCryo(socket, (run, points, frame) =>
      setCryo((before) => ({
        run,
        points,
        phase: frame?.phase ?? before.phase,
      })),
    ).then((off) => {
      if (live) stop = off;
      else off();
    });
    return () => {
      live = false;
      stop?.();
    };
  }, [socket]);

  const baseAt = cryo.points.find((p) => p.h > 22 && p.mxc < 0.012)?.h ?? null;
  const cryoAlarms = cryo.points
    .filter(
      (p, i) =>
        p.mxc >= MXC_ALARM_K &&
        (cryo.points.at(i - 1)?.mxc ?? 1) < MXC_ALARM_K &&
        i > 0,
    )
    .map((p) => p.h);
  const mxcAlarm = board?.alarms.find((a) => a.id === "cryo-mxc");
  const frame = gamma?.frame ?? null;

  const visual = (step: ILessonStep<SensorExcerpt>): ReactNode => {
    if (step.id === "gamma") {
      return (
        <>
          {gamma !== null && (
            <SpectrumChart counts={gamma.counts} live={frame?.live ?? 0} />
          )}
          <div className="sensor-figures">
            <Figure
              value={`${Math.round(frame?.trueRate ?? rate).toLocaleString("fr-FR")} /s`}
              label="coups vrais (activité)"
            />
            <Figure
              value={`${Math.round(frame?.measuredRate ?? 0).toLocaleString("fr-FR")} /s`}
              label="coups mesurés, après temps mort"
            />
            <Figure
              value={`${((1 - measuredRate(frame?.trueRate ?? rate, DEAD_TIME_US) / (frame?.trueRate ?? rate)) * 100).toFixed(1)} %`}
              label={`temps mort, τ = ${DEAD_TIME_US} µs`}
            />
            <Figure
              value={`${(frame?.live ?? 0).toFixed(1)} s / ${(frame?.real ?? 0).toFixed(1)} s`}
              label="temps vif / temps d'horloge"
            />
            <Figure
              value={`${frame?.d.byteLength ?? 0} o`}
              label="la dernière trame (canaux touchés)"
            />
          </div>
          <label className="sensor-slider" htmlFor="sensor-rate">
            Activité de la source : {rate.toLocaleString("fr-FR")} coups vrais
            par seconde
            <input
              id="sensor-rate"
              type="range"
              min={Math.log10(sourceRate.min)}
              max={Math.log10(sourceRate.max)}
              step="any"
              value={Math.log10(rate)}
              disabled={!signedIn}
              onChange={(event) =>
                setRate(Math.round(10 ** Number(event.target.value)))
              }
              onPointerUp={() => {
                setRateError(null);
                setSourceRate(socket, rate).catch((error: unknown) =>
                  setRateError(
                    error instanceof Error ? error.message : String(error),
                  ),
                );
              }}
            />
            {!signedIn && (
              <small>
                Se connecter pour régler la source : elle est la même pour tous
                les écrans.
              </small>
            )}
            {rateError !== null && <small role="alert">{rateError}</small>}
          </label>
        </>
      );
    }
    return (
      <>
        <CryoChart
          points={cryo.points}
          condenseAt={22}
          baseAt={baseAt}
          alarms={cryoAlarms}
        />
        <div className="sensor-figures">
          <Figure value={phaseLabel(cryo.phase)} label="phase" />
          <Figure
            value={`${((cryo.points.at(-1)?.mxc ?? 0) * 1000).toFixed(1)} mK`}
            label="chambre de mélange"
          />
          <Figure
            value={`${(cryo.points.at(-1)?.h ?? 0).toFixed(1)} h`}
            label={`heure simulée (×${CRYO_ACCELERATION})`}
          />
          <Figure
            value={mxcAlarm === undefined ? "—" : stateLabel(mxcAlarm.state)}
            label="alarme MXC > 50 mK"
          />
        </div>
      </>
    );
  };
  return <BenchSteps shown={shown} visual={visual} />;
}

function phaseLabel(phase: string): string {
  if (phase === "condensing") return "condensation";
  if (phase === "base") return "température de base";
  if (phase === "leak") return "remontée de pression";
  return "mise en froid";
}

function stateLabel(state: string): string {
  if (state === "unacknowledged") return "active";
  if (state === "acknowledged") return "acquittée";
  if (state === "returned") return "revenue";
  return "normale";
}

/** Un chiffre et ce qu'il mesure. */
function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="sensor-figure">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

// ─── Quantique ──────────────────────────────────────────────────────────────

function QuantumBench({ socket, shown }: IBenchProps) {
  const [bell, setBell] = useState<IBellFrame | null>(null);
  const [series, setSeries] = useState<{
    quantum: IBellPoint[];
    local: IBellPoint[];
  }>({ quantum: [], local: [] });
  const [tomo, setTomo] = useState<ITomoFrame | null>(null);
  const mark = useRef({ run: -1, next: 0 });
  useEffect(
    () =>
      watchBell(socket, (frame) => {
        setBell(frame);
        if (frame.run !== mark.current.run) {
          mark.current = { run: frame.run, next: 0 };
          setSeries({ quantum: [], local: [] });
        }
        const pairs = frame.quantum.n.reduce((a, b) => a + b, 0);
        const target = BELL_MARKS.at(mark.current.next);
        if (target !== undefined && pairs >= target) {
          mark.current.next += 1;
          const q = chsh(frame.quantum);
          const l = chsh(frame.local);
          setSeries((before) => ({
            quantum: [...before.quantum, { pairs, S: q.S, sigma: q.sigma }],
            local: [...before.local, { pairs, S: l.S, sigma: l.sigma }],
          }));
        }
      }),
    [socket],
  );
  useEffect(() => watchTomo(socket, setTomo), [socket]);

  const visual = (step: ILessonStep<SensorExcerpt>): ReactNode => {
    if (step.id === "bell") {
      const q = bell === null ? null : chsh(bell.quantum);
      const l = bell === null ? null : chsh(bell.local);
      const pairs = bell?.quantum.n.reduce((a, b) => a + b, 0) ?? 0;
      return (
        <>
          <BellChart quantum={series.quantum} local={series.local} />
          <div className="sensor-figures">
            <Figure
              value={
                q === null ? "—" : `${q.S.toFixed(3)} ± ${q.sigma.toFixed(3)}`
              }
              label="S, mécanique quantique"
            />
            <Figure
              value={
                q === null || q.sigma === 0
                  ? "—"
                  : `${((q.S - 2) / q.sigma).toFixed(0)} σ`
              }
              label="au-dessus de la borne locale"
            />
            <Figure
              value={
                l === null ? "—" : `${l.S.toFixed(3)} ± ${l.sigma.toFixed(3)}`
              }
              label="S, modèle local"
            />
            <Figure
              value={`${pairs.toLocaleString("fr-FR")} / ${BELL_RUN_PAIRS.toLocaleString("fr-FR")}`}
              label="paires du run"
            />
          </div>
        </>
      );
    }
    const estimate = tomo === null ? null : blochEstimate(tomo.n, tomo.plus);
    return (
      <>
        <BlochView
          estimate={estimate?.estimate ?? null}
          projected={estimate?.projected ?? false}
          target={blochTarget()}
        />
        <div className="sensor-figures">
          <Figure
            value={`${tomo?.n[2] ?? 0} / ${TOMO_RUN_SHOTS}`}
            label="tirs par base"
          />
          <Figure
            value={
              estimate === null
                ? "—"
                : `${estimate.fidelity.toFixed(3)} ± ${estimate.fidelitySigma.toFixed(3)}`
            }
            label="fidélité à l'état visé"
          />
          <Figure
            value={
              estimate === null
                ? "—"
                : `${estimate.norm.toFixed(3)}${estimate.projected ? " → projeté" : ""}`
            }
            label="|r| brut (au-delà de 1 : hors de la sphère)"
          />
        </div>
      </>
    );
  };
  return <BenchSteps shown={shown} visual={visual} />;
}
