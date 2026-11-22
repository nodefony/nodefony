import { CopyLine } from "../kit/CopyLine";
import { DEFAULT_MACHINE, PUSH_COMMAND } from "./grpcDemo";
import { readGrpcFrame, type WirePart } from "./grpcWire";
import { CURVE_POINTS, type ITelemetryView } from "./useTelemetry";

/**
 * Les visuels de la leçon gRPC : la machine en direct, une trame octet par
 * octet, et les refus.
 *
 * Guide pour un agent : des composants SANS état réseau — la leçon
 * (`GrpcLesson.tsx`) leur passe ce que la socket (`useTelemetry.ts`) ou la
 * sonde ont reçu. Rien n'est inventé : la courbe est faite des mesures
 * relayées, la trame des octets que le serveur a rendus.
 */

/** Largeur et hauteur du dessin de la courbe, en unités du `viewBox`. */
const CURVE_W = 600;
const CURVE_H = 150;

/** Écart minimal de l'échelle verticale, en °C : sous lui, le bruit de mesure remplirait le cadre. */
const CURVE_MIN_SPAN = 0.2;

/**
 * Le tracé de la courbe, mis à l'échelle de ses propres extrêmes ; `min` et
 * `max` sont les VRAIES bornes des mesures, celles que la légende annonce.
 */
function curvePath(values: readonly number[]): {
  points: string;
  area: string;
  min: number;
  max: number;
} {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  // Une courbe plate reste au milieu du cadre, sans grossir le bruit.
  const span = Math.max(max - min, CURVE_MIN_SPAN);
  const floor = (min + max - span) / 2;
  const step = CURVE_W / (CURVE_POINTS - 1);
  const points = values
    .map((value, index) => {
      const x = (CURVE_POINTS - values.length + index) * step;
      const y = CURVE_H - ((value - floor) / span) * CURVE_H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  // L'aire sous la courbe : la ligne, puis le bas du cadre, de droite à gauche.
  const first = (CURVE_POINTS - values.length) * step;
  const area =
    values.length > 1
      ? `${points} ${CURVE_W},${CURVE_H} ${first.toFixed(1)},${CURVE_H}`
      : "";
  return { points, area, min, max };
}

/**
 * La machine en direct : est-elle connectée, sa dernière mesure, la courbe,
 * et la commande qui la lance.
 */
export function LivePanel({ view }: { view: ITelemetryView }) {
  const machine = view.pushing.at(0) ?? view.last?.machine ?? DEFAULT_MACHINE;
  const connected = view.pushing.length > 0;
  const { points, area, min, max } = curvePath(view.curve);
  return (
    <section className="grpc-live" aria-labelledby="grpc-live-title">
      <header className="grpc-live-head">
        <h2 id="grpc-live-title">{machine} · température</h2>
        <span
          className={`pill grpc-state ${connected ? "is-on" : "is-off"}`}
          role="status"
        >
          {connected
            ? "machine connectée"
            : view.online
              ? "en attente de la machine"
              : "socket fermée"}
        </span>
      </header>
      <dl className="grpc-metrics">
        <div className="is-last">
          <dt>dernière</dt>
          <dd>
            {view.last === null ? "—" : `${view.last.celsius.toFixed(2)} °C`}
          </dd>
        </div>
        <div className="is-count">
          <dt>reçues</dt>
          <dd>{view.received}</dd>
        </div>
        <div className="is-rate">
          <dt>cadence</dt>
          <dd>{view.rate} /s</dd>
        </div>
      </dl>
      <figure className="grpc-curve">
        <svg
          viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={
            view.curve.length === 0
              ? "Courbe vide : aucune mesure reçue"
              : `Courbe des ${view.curve.length} dernières mesures, de ${min.toFixed(2)} à ${max.toFixed(2)} °C`
          }
        >
          <defs>
            <linearGradient id="grpc-curve-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="grpc-fill-top" />
              <stop offset="100%" className="grpc-fill-bottom" />
            </linearGradient>
          </defs>
          {view.curve.length > 1 && (
            <>
              <polygon points={area} fill="url(#grpc-curve-fill)" />
              <polyline
                points={points}
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>
        <figcaption>
          {view.curve.length === 0
            ? "La courbe se trace dès que la machine pousse."
            : `${view.curve.length} dernières mesures · de ${min.toFixed(2)} à ${max.toFixed(2)} °C`}
        </figcaption>
      </figure>
      <div className="grpc-run">
        <p>
          Lancer la machine dans un <strong>second terminal</strong>, à la
          racine de l'application :
        </p>
        <CopyLine text={PUSH_COMMAND} />
        {view.closed !== null && (
          <p className="grpc-closed" role="status">
            Flux de {view.closed.machine} fermé : {view.closed.accepted} mesures
            retenues par le serveur.
          </p>
        )}
      </div>
    </section>
  );
}

/** Les trames du canal, telles que la page les a reçues. */
export function SocketLog({ lines }: { lines: readonly string[] }) {
  return (
    <figure className="grpc-log">
      <figcaption>
        Ce que la page reçoit par la socket (
        {lines.length === 0
          ? "rien encore"
          : `les ${lines.length} dernières trames`}
        )
      </figcaption>
      <pre>{lines.length === 0 ? "—" : lines.join("\n")}</pre>
    </figure>
  );
}

/** Des octets en hexadécimal, séparés d'une espace. */
function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    " ",
  );
}

/** Légende de chaque nature d'octets. */
const PART_LABEL: Record<WirePart, string> = {
  envelope: "enveloppe gRPC",
  key: "clés et longueurs",
  text: "texte",
  number: "nombres",
  trailer: "statut de fin",
  rest: "non lu",
};

/**
 * Une réponse gRPC-Web octet par octet, telle que reçue : la mesure
 * enveloppée, puis le message de fin qui porte le statut.
 *
 * @param frame - le corps reçu, tel quel
 */
export function WireFrame({ frame }: { frame: Uint8Array }) {
  const segments = readGrpcFrame(frame);
  // Le message de fin commence au premier drapeau 0x80.
  const fin =
    segments.find((segment) => segment.label.startsWith("drapeau 0x80"))
      ?.start ?? frame.byteLength;
  const parts = new Map<WirePart, number>();
  for (const segment of segments) {
    parts.set(
      segment.part,
      (parts.get(segment.part) ?? 0) + segment.end - segment.start,
    );
  }
  return (
    <figure className="grpc-wire">
      <figcaption>
        <strong>{frame.byteLength} octets reçus</strong> : la mesure enveloppée
        ({fin} octets), puis le message de fin ({frame.byteLength - fin}). Les
        noms des champs ne voyagent pas — seuls leurs numéros.
      </figcaption>
      <div className="grpc-bytes" aria-hidden="true">
        {segments.map((segment) => (
          <span
            key={segment.start}
            className={`grpc-seg is-${segment.part}`}
            title={segment.label}
          >
            {hex(frame.subarray(segment.start, segment.end))}
          </span>
        ))}
      </div>
      <ul className="grpc-legend">
        {[...parts].map(([part, count]) => (
          <li key={part} className={`is-${part}`}>
            {PART_LABEL[part]} · {count} o
          </li>
        ))}
      </ul>
      <ol className="grpc-segments">
        {segments.map((segment) => (
          <li key={segment.start}>
            <code>{hex(frame.subarray(segment.start, segment.end))}</code>{" "}
            {segment.label}
          </li>
        ))}
      </ol>
    </figure>
  );
}

/** Les refus du service, et qui les prononce. */
export function Refusals() {
  return (
    <figure className="grpc-refusals">
      <figcaption>Qui refuse quoi</figcaption>
      <table>
        <thead>
          <tr>
            <th scope="col">Cas</th>
            <th scope="col">Réponse</th>
            <th scope="col">Qui</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>une machine sans jeton</td>
            <td>
              <code className="grpc-code is-deny">16 UNAUTHENTICATED</code>
            </td>
            <td>le pare-feu, avant le contrôleur</td>
          </tr>
          <tr>
            <td>
              un jeton sans le scope (<code>--as user</code>)
            </td>
            <td>
              <code className="grpc-code is-deny">7 PERMISSION_DENIED</code>
            </td>
            <td>
              <code>@RequireScope</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>Push</code> en <code>GET</code>
            </td>
            <td>
              <code className="grpc-code is-http">405</code>
            </td>
            <td>le service : une méthode qui écrit ne se lit pas</td>
          </tr>
          <tr>
            <td>une méthode hors du contrat</td>
            <td>
              <code className="grpc-code is-absent">unimplemented</code>
            </td>
            <td>le service gRPC, qui ne la connaît pas</td>
          </tr>
          <tr>
            <td>
              la machine a fini (<code>--count</code>)
            </td>
            <td>
              <code className="grpc-code is-ok">{"{ accepted: N }"}</code>
            </td>
            <td>
              <code>Push</code>, à la fin du flux
            </td>
          </tr>
          <tr>
            <td>la machine est coupée (Ctrl+C)</td>
            <td>flux interrompu</td>
            <td>le serveur referme le flux ; la page voit son total</td>
          </tr>
        </tbody>
      </table>
      <CopyLine text={`${PUSH_COMMAND} --as user --count 3`} />
    </figure>
  );
}
