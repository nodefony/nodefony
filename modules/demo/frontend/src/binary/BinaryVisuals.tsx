import { useEffect, useRef, type PointerEvent, type RefObject } from "react";
import { describeCodec } from "nodefony/client";
import type { IProbeChunk } from "../kit/probe";
import { PAYLOAD_LIMIT, SAMPLE_SIZES, type IDigest } from "./binaryDemo";
import {
  WIRE_CBOR,
  WIRE_TEXT,
  formatBytes,
  readCloses,
  readOffers,
  readWire,
  sizeRows,
  throughput,
  typicalFrame,
  type IWireLine,
} from "./wire";

/**
 * Temps réel binaire — ce que la page DESSINE de ce qui a voyagé : les deux
 * connexions, l'oscilloscope, le débit, les tailles et les temps mesurés, la
 * jauge de `maxPayload`, le terrain du jeu.
 *
 * Guide pour un agent : chaque graphe tire ses nombres du relevé de la sonde
 * (`wire.ts`) ou de ce que le code client remet (`binaryClient.ts`) — jamais
 * d'un calcul. Deux séries au plus, toujours nommées : CBOR (bleu) et texte
 * (ambre), couleurs `--wire-cbor` / `--wire-text` de `demo.css`.
 */

/** La résolution de `performance.now()` dans une page ordinaire, en ms. */
const CLOCK_MS = 0.1;

/** Le nom affiché de chaque compteur. */
const SERIES: Record<string, string> = {
  [WIRE_CBOR]: "CBOR",
  [WIRE_TEXT]: "texte",
};

/** La légende : une pastille de couleur par série, et son nom. */
function Legend({ labels }: { labels: readonly string[] }) {
  return (
    <span className="wire-legend">
      {labels.map((label) => (
        <span key={label}>
          <i className={`wire-chip is-${label}`} aria-hidden="true" />
          {SERIES[label] ?? label}
        </span>
      ))}
    </span>
  );
}

/**
 * Les deux connexions côte à côte : ce que le navigateur a OFFERT au
 * handshake (vu par la sonde) et ce que l'accueil a RETENU (`socket.codec`).
 *
 * @param chunks - le relevé de la sonde
 * @param codecs - le codec retenu par compteur, remis par le code client
 */
export function CodecPair({
  chunks,
  codecs,
}: {
  chunks: readonly IProbeChunk[];
  codecs: Partial<Record<string, string>>;
}) {
  const offers = readOffers(chunks);
  const labels = [WIRE_CBOR, WIRE_TEXT].filter(
    (label) => offers[label] !== undefined,
  );
  if (labels.length === 0) return null;
  return (
    <figure className="wire-figure codec-pair">
      <figcaption>
        <strong>Deux connexions, un serveur</strong> — l'offre part au
        handshake, le choix revient dans l'accueil
      </figcaption>
      {labels.map((label) => {
        const retained = codecs[label];
        return (
          <div key={label} className={`codec-row is-${label}`}>
            <span className="codec-name">{SERIES[label]}</span>
            <span className="codec-offer">
              offre&nbsp;: <code>{offers[label]}</code>
            </span>
            <span className="codec-retained">
              retenu&nbsp;:{" "}
              {retained === undefined ? "…" : describeCodec(retained)}
            </span>
          </div>
        );
      })}
    </figure>
  );
}

/**
 * L'oscilloscope : la dernière trame de vibrations, 256 Int16 lus par
 * `readSamples`, sur l'échelle entière d'un Int16.
 *
 * @param samples - les mesures de la trame
 * @param rpm - la vitesse que la trame annonce
 */
export function Oscilloscope({
  samples,
  rpm,
}: {
  samples: Int16Array | null;
  rpm: number | null;
}) {
  if (samples === null) return null;
  const width = 512;
  const height = 140;
  const points = Array.from(samples, (value, i) => {
    const x = (i / Math.max(1, samples.length - 1)) * width;
    const y = height / 2 - (value / 32_768) * (height / 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const peak = samples.reduce(
    (max, value) => Math.max(max, Math.abs(value)),
    0,
  );
  const label = `${samples.length} mesures Int16 (${samples.byteLength} octets), crête ${peak}, ${rpm ?? "?"} tr/min`;
  return (
    <figure className="wire-figure oscilloscope">
      <figcaption>
        <strong>Accéléromètre de la machine</strong> — {label}
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        <line
          className="wire-axis"
          x1="0"
          x2={width}
          y1={height / 2}
          y2={height / 2}
        />
        <polyline className="osc-trace" points={points} />
      </svg>
    </figure>
  );
}

/**
 * Le débit REÇU, fenêtre par fenêtre, une courbe par connexion : la somme
 * des octets des trames réellement arrivées.
 *
 * @param chunks - le relevé de la sonde
 */
export function RateChart({ chunks }: { chunks: readonly IProbeChunk[] }) {
  const lines = readWire(chunks);
  const series = [WIRE_CBOR, WIRE_TEXT]
    .map((label) => ({ label, points: throughput(lines, label) }))
    .filter((entry) => entry.points.length > 1);
  if (series.length === 0) return null;
  const all = series.flatMap((entry) => entry.points);
  const top = Math.max(...all.map((point) => point.perSecond), 1);
  const first = Math.min(...all.map((point) => point.at));
  const last = Math.max(...all.map((point) => point.at));
  const width = 512;
  const height = 120;
  const x = (at: number) => ((at - first) / Math.max(1, last - first)) * width;
  const y = (value: number) => height - (value / top) * (height - 8);
  const summary = series
    .map(
      (entry) =>
        `${SERIES[entry.label] ?? entry.label} ${formatBytes(Math.round(entry.points.reduce((sum, point) => sum + point.perSecond, 0) / entry.points.length))}/s en moyenne`,
    )
    .join(" · ");
  return (
    <figure className="wire-figure rate-chart">
      <figcaption>
        <strong>Débit reçu</strong> — {summary}{" "}
        {series.length > 1 && <Legend labels={series.map((s) => s.label)} />}
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={summary}>
        <line className="wire-axis" x1="0" x2={width} y1={height} y2={height} />
        {series.map((entry) => (
          <polyline
            key={entry.label}
            className={`rate-line is-${entry.label}`}
            points={entry.points
              .map(
                (point) =>
                  `${x(point.at).toFixed(1)},${y(point.perSecond).toFixed(1)}`,
              )
              .join(" ")}
          >
            <title>{SERIES[entry.label]}</title>
          </polyline>
        ))}
      </svg>
      <p className="wire-scale">
        <span>0</span>
        <span>{formatBytes(Math.round(top))}/s</span>
      </p>
    </figure>
  );
}

/** Une barre de la comparaison, et sa valeur écrite à côté. */
function Bar({
  label,
  share,
  text,
}: {
  label: string;
  share: number;
  text: string;
}) {
  return (
    <span className="wire-bar-row">
      <span
        className={`wire-bar is-${label}`}
        style={{ width: `${Math.max(1, share * 100)}%` }}
        title={`${SERIES[label] ?? label} : ${text}`}
      />
      <span className="wire-bar-value">{text}</span>
    </span>
  );
}

/**
 * Taille sur le fil, ou temps de la socket, charge par charge : CBOR et
 * texte côte à côte, chaque paire à sa propre échelle — de 64 octets à
 * 1 Mio, une échelle commune écraserait les petites charges.
 *
 * @param chunks - le relevé du geste « le fil mesuré »
 * @param metric - `bytes` : la trame reçue ; `ms` : le temps de la socket
 */
export function WireComparison({
  chunks,
  metric,
}: {
  chunks: readonly IProbeChunk[];
  metric: "bytes" | "ms";
}) {
  const rows = sizeRows(readWire(chunks), SAMPLE_SIZES).filter(
    (row) => row.cbor !== null || row.text !== null,
  );
  if (rows.length === 0) return null;
  const value = (line: IWireLine | null) =>
    line === null ? null : metric === "bytes" ? line.bytes : (line.ms ?? 0);
  // L'horloge d'une page ne voit pas sous 0,1 ms : en deçà, rien à affirmer.
  const blind = (number: number | null) =>
    metric === "ms" && number !== null && number < CLOCK_MS;
  const write = (number: number | null) =>
    number === null
      ? "…"
      : metric === "bytes"
        ? formatBytes(number)
        : blind(number)
          ? "<\u00a00,1\u00a0ms"
          : `${number.toFixed(1).replace(".", ",")}\u00a0ms`;
  const wins = rows.filter((row) => {
    const cbor = value(row.cbor);
    const text = value(row.text);
    return cbor !== null && text !== null && cbor < text;
  }).length;
  const caption =
    metric === "bytes"
      ? `Taille de la trame reçue — CBOR plus petit sur ${wins} charge(s) sur ${rows.length}`
      : `Temps que la socket passe sur la trame, décodage compris — CBOR plus rapide sur ${wins} charge(s) sur ${rows.length}`;
  return (
    <figure className="wire-figure wire-comparison">
      <figcaption>
        <strong>{caption}</strong> <Legend labels={[WIRE_CBOR, WIRE_TEXT]} />
      </figcaption>
      <div className="wire-rows">
        {rows.map((row) => {
          const cbor = value(row.cbor);
          const text = value(row.text);
          const top = Math.max(cbor ?? 0, text ?? 0, Number.EPSILON);
          const gap =
            cbor !== null && text !== null && !blind(cbor) && !blind(text)
              ? Math.round((1 - cbor / text) * 100)
              : null;
          return (
            <div key={row.size} className="wire-row">
              <span className="wire-row-size">
                charge {formatBytes(row.size)}
                {gap !== null && (
                  <small>
                    {gap > 0 ? `−${gap}` : gap < 0 ? `+${-gap}` : "±0"}&nbsp;%
                  </small>
                )}
              </span>
              <span className="wire-row-bars">
                <Bar
                  label={WIRE_CBOR}
                  share={(cbor ?? 0) / top}
                  text={write(cbor)}
                />
                <Bar
                  label={WIRE_TEXT}
                  share={(text ?? 0) / top}
                  text={write(text)}
                />
              </span>
            </div>
          );
        })}
      </div>
      {metric === "ms" && (
        <p className="wire-note">
          Une seule mesure par trame, dans CE navigateur, dont l'horloge ne voit
          pas sous 0,1 ms : l'ordre de grandeur compte, pas la décimale.
          Relancer donne d'autres chiffres.
        </p>
      )}
    </figure>
  );
}

/**
 * Un canevas où dessiner à la souris, au doigt ou au stylet — ses octets
 * PNG partent au serveur. Il naît avec un dessin : il n'est jamais vide.
 *
 * @param canvas - la référence que la page lit au moment d'envoyer
 */
export function DrawPad({
  canvas,
}: {
  canvas: RefObject<HTMLCanvasElement | null>;
}) {
  const drawing = useRef(false);
  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (context === null || context === undefined) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 240, 150);
    context.strokeStyle = "#096bbf";
    context.lineWidth = 6;
    context.lineCap = "round";
    context.beginPath();
    context.arc(120, 75, 40, 0.2, Math.PI * 1.8);
    context.stroke();
  }, [canvas]);
  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) / box.width) * 240,
      y: ((event.clientY - box.top) / box.height) * 150,
    };
  };
  return (
    <figure className="wire-figure draw-pad">
      <figcaption>
        <strong>Ton dessin</strong> — dessine, puis envoie : ce sont ses octets
        PNG qui partent
      </figcaption>
      <canvas
        ref={canvas}
        width={240}
        height={150}
        aria-label="Canevas de dessin"
        onPointerDown={(event) => {
          drawing.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          const context = event.currentTarget.getContext("2d");
          const { x, y } = point(event);
          context?.beginPath();
          context?.moveTo(x, y);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return;
          const context = event.currentTarget.getContext("2d");
          const { x, y } = point(event);
          context?.lineTo(x, y);
          context?.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
      />
    </figure>
  );
}

/**
 * L'empreinte des octets, des deux côtés : celle que le serveur a calculée
 * sur ce qu'il a reçu, celle que le navigateur a calculée sur ce qu'il a
 * envoyé.
 *
 * @param result - ce que `sendBytes` a rendu, ou `null`
 */
export function DigestMatch({
  result,
}: {
  result: { server: IDigest; local: string } | null;
}) {
  if (result === null) return null;
  const same = result.server.sha256 === result.local;
  return (
    <figure
      className={`wire-figure digest-match ${same ? "is-same" : "is-different"}`}
    >
      <figcaption>
        <strong>{same ? "✓ Mêmes octets" : "✗ Octets différents"}</strong> —{" "}
        {formatBytes(result.server.size)} reçus par le serveur
      </figcaption>
      <dl>
        <dt>serveur</dt>
        <dd>
          <code>{result.server.sha256}</code>
        </dd>
        <dt>navigateur</dt>
        <dd>
          <code>{result.local}</code>
        </dd>
      </dl>
    </figure>
  );
}

/**
 * La jauge de `maxPayload` : la plus grosse trame ENVOYÉE, mesurée sur le
 * fil, face à la limite du serveur — et ce que le serveur en a fait.
 *
 * @param chunks - le relevé d'un envoi
 */
export function PayloadGauge({ chunks }: { chunks: readonly IProbeChunk[] }) {
  const sent = readWire(chunks).filter((line) => line.dir === "out");
  const biggest = sent.reduce<IWireLine | null>(
    (max, line) => (max === null || line.bytes > max.bytes ? line : max),
    null,
  );
  if (biggest === null) return null;
  const close = readCloses(chunks)[biggest.label];
  const refused = close === 1009;
  const scale = Math.max(PAYLOAD_LIMIT * 1.6, biggest.bytes);
  const text = `${formatBytes(biggest.bytes)} envoyés en ${SERIES[biggest.label] ?? biggest.label}, limite ${formatBytes(PAYLOAD_LIMIT)}`;
  return (
    <figure
      className={`wire-figure payload-gauge ${refused ? "is-refused" : "is-passed"}`}
    >
      <figcaption>
        <strong>
          {refused
            ? "Refusé — fermeture 1009, trop gros"
            : "Passé sous la limite"}
        </strong>{" "}
        — {text}
      </figcaption>
      <div className="gauge-track" role="img" aria-label={text}>
        <span
          className={`gauge-fill is-${biggest.label}`}
          style={{ width: `${(biggest.bytes / scale) * 100}%` }}
        />
        <span
          className="gauge-limit"
          style={{ left: `${(PAYLOAD_LIMIT / scale) * 100}%` }}
        >
          <span>maxPayload</span>
        </span>
      </div>
    </figure>
  );
}

/**
 * Le terrain du jeu : 64 sprites placés par les Float32 de la dernière
 * image reçue, et ce que pèse une image sur chaque connexion.
 *
 * @param positions - x, y entrelacés, de 0 à 1 ; `null` avant la première
 * @param chunks - le relevé, pour le poids d'une image
 * @param hz - images par seconde
 */
export function GameField({
  positions,
  chunks,
  hz,
}: {
  positions: Float32Array | null;
  chunks: readonly IProbeChunk[];
  hz: number;
}) {
  if (positions === null) return null;
  const lines = readWire(chunks);
  const weights = [WIRE_CBOR, WIRE_TEXT].flatMap((label) => {
    const bytes = typicalFrame(lines, label);
    return bytes === null
      ? []
      : [
          `${SERIES[label]} ${formatBytes(bytes)} par image, ${formatBytes(bytes * hz)}/s`,
        ];
  });
  const sprites = Array.from(
    { length: positions.length / 2 },
    // Le rang EST l'identité : le sprite n°i garde sa place dans chaque image.
    (_, i) => ({
      id: i,
      x: positions[i * 2] ?? 0,
      y: positions[i * 2 + 1] ?? 0,
    }),
  );
  const label = `${sprites.length} sprites — ${weights.join(" · ")}`;
  return (
    <figure className="wire-figure game-field">
      <figcaption>
        <strong>Le terrain</strong> — {label}
      </figcaption>
      <svg viewBox="0 0 320 200" role="img" aria-label={label}>
        <rect
          className="game-ground"
          x="0"
          y="0"
          width="320"
          height="200"
          rx="8"
        />
        {sprites.map((sprite) => (
          <circle
            key={sprite.id}
            className={sprite.id % 2 === 0 ? "sprite is-even" : "sprite is-odd"}
            cx={6 + sprite.x * 308}
            cy={6 + sprite.y * 188}
            r="4"
          />
        ))}
      </svg>
    </figure>
  );
}
