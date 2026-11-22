import { useEffect, useRef, useState } from "react";
import type { IProbeResult } from "../kit/probe";
import { BOX_ROLES, describeReceived, readBox, type IMp4Box } from "./fileMap";

/**
 * Ce que les octets disent, en IMAGE : la carte du fichier (ses boîtes MP4,
 * et le morceau qu'une réponse a fait voyager), et la frise du lecteur (ce
 * qu'il a chargé, où il en est).
 *
 * Guide pour un agent : la carte lit les boîtes elle-même, par plages de
 * 8 octets (`Range`) — sa construction est déjà une démonstration. Les
 * calculs vivent dans `fileMap.ts`, sans écran.
 */

// #region client-range
// Demander un morceau, côté client : `fetch` avec `Range`. Un 206
// dit que le serveur a servi la plage ; `Content-Range` porte la
// taille du fichier. La carte lit ainsi chaque boîte du MP4 par
// 8 octets — l'en-tête de la suivante est à `at + size`.
async function loadBoxes(url: string): Promise<IMp4Box[]> {
  const boxes: IMp4Box[] = [];
  let at = 0;
  let total = Number.POSITIVE_INFINITY;
  while (at < total && boxes.length < 8) {
    const response = await fetch(url, {
      headers: { range: `bytes=${at}-${at + 7}` },
      cache: "no-store",
    });
    if (response.status !== 206) break;
    total = Number(
      /\/(\d+)$/u.exec(response.headers.get("content-range") ?? "")?.[1] ??
        Number.NaN,
    );
    if (Number.isNaN(total)) break;
    const box = readBox(
      new Uint8Array(await response.arrayBuffer()),
      at,
      total,
    );
    if (box === null) break;
    boxes.push(box);
    at += box.size;
  }
  return boxes;
}
// #endregion

/** Position et largeur, en % du fichier ; jamais moins qu'un trait visible. */
function place(start: number, size: number, total: number) {
  return {
    left: `${(start / total) * 100}%`,
    width: `max(3px, ${(size / total) * 100}%)`,
  };
}

/**
 * La carte du fichier : une barre = toute la vidéo, découpée en boîtes, et
 * le morceau que la dernière réponse a apporté, surligné.
 *
 * @param url - la vidéo
 * @param result - la dernière réponse du geste, ou `null` avant tout appel
 */
export function FileMap({
  url,
  result,
}: {
  url: string;
  result: IProbeResult | null;
}) {
  const [boxes, setBoxes] = useState<IMp4Box[] | null>(null);
  useEffect(() => {
    let live = true;
    void loadBoxes(url).then((found) => {
      if (live) setBoxes(found);
    });
    return () => {
      live = false;
    };
  }, [url]);
  const total = boxes?.reduce((sum, box) => sum + box.size, 0) ?? 0;
  const received = result === null ? null : describeReceived(result);
  const span = received?.span ?? null;
  const name = url.split("/").at(-1) ?? url;
  return (
    <figure className="file-map">
      <figcaption>
        <strong>{name}</strong>
        {total > 0 && <span> — {total.toLocaleString("fr-FR")} octets</span>}
      </figcaption>
      <div
        className="file-map-bar"
        role="img"
        aria-label={
          received?.text ??
          "Le fichier entier ; un appel y surligne le morceau reçu."
        }
      >
        {boxes?.map((box) => (
          <span
            key={box.start}
            className={`file-map-box box-${box.type}`}
            style={place(box.start, box.size, total)}
          />
        ))}
        {span !== null && total > 0 && (
          <span
            className="file-map-got"
            style={place(span.start, span.end - span.start + 1, total)}
          />
        )}
      </div>
      <div className="file-map-scale" aria-hidden="true">
        <span>octet 0</span>
        <span>{total > 0 ? total.toLocaleString("fr-FR") : ""}</span>
      </div>
      <ul className="file-map-legend">
        {boxes?.map((box) => (
          <li key={box.start}>
            <span className={`file-map-chip box-${box.type}`} />
            {BOX_ROLES[box.type] ?? "boîte"} <code>{box.type}</code>{" "}
            {box.size.toLocaleString("fr-FR")} o
          </li>
        ))}
        <li>
          <span className="file-map-chip file-map-chip-got" />
          reçu
        </li>
      </ul>
      <p className={`file-map-note${span === null ? " is-none" : ""}`}>
        {received?.text ??
          "Lancez un appel : la barre montre quelle part du fichier a voyagé."}
      </p>
    </figure>
  );
}

/** Ce qu'un lecteur a chargé, en secondes. */
interface IPlayback {
  duration: number;
  current: number;
  buffered: { start: number; end: number }[];
}

/**
 * Le lecteur, et sa frise : les morceaux déjà chargés et la tête de lecture.
 * Sur une longue vidéo, un saut fait apparaître un nouvel îlot, sans remplir
 * le trou d'avant ; la vidéo d'essai, petite, se charge vite en entier.
 *
 * @param url - la vidéo
 */
export function VideoPlayer({ url }: { url: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<IPlayback | null>(null);
  useEffect(() => {
    const video = ref.current;
    if (video === null) return;
    // #region client-buffered
    // Ce que le lecteur a déjà, en secondes : `video.buffered`, une
    // liste d'intervalles. Relue à chaque progrès, saut ou instant.
    const read = () => {
      if (!Number.isFinite(video.duration)) return;
      const buffered: IPlayback["buffered"] = [];
      for (let index = 0; index < video.buffered.length; index += 1) {
        buffered.push({
          start: video.buffered.start(index),
          end: video.buffered.end(index),
        });
      }
      setState({
        duration: video.duration,
        current: video.currentTime,
        buffered,
      });
    };
    const events = ["loadedmetadata", "progress", "timeupdate", "seeked"];
    for (const name of events) video.addEventListener(name, read);
    // #endregion
    read();
    return () => {
      for (const name of events) video.removeEventListener(name, read);
    };
  }, []);
  const at = (seconds: number) =>
    state === null ? "0%" : `${(seconds / state.duration) * 100}%`;
  // #region client-player
  // Tout le code client d'un lecteur : un `<video>` et l'adresse de
  // la route. C'est le NAVIGATEUR qui envoie `Range` — au début,
  // puis à chaque saut. `preload="metadata"` : rien de plus que
  // l'index tant qu'on ne lit pas.
  const player = (
    <video
      ref={ref}
      className="video-player"
      src={url}
      controls
      muted
      preload="metadata"
      aria-label="Vidéo d'essai, sans son : un minuteur de 30 secondes"
    />
  );
  // #endregion
  return (
    <div className="video-box">
      {player}
      <div className="video-timeline" aria-hidden="true">
        {state?.buffered.map((part) => (
          <span
            key={part.start}
            className="video-loaded"
            style={{ left: at(part.start), width: at(part.end - part.start) }}
          />
        ))}
        {state !== null && (
          <span className="video-head" style={{ left: at(state.current) }} />
        )}
      </div>
      <p className="video-caption">
        <span className="file-map-chip video-chip-loaded" /> déjà chargé ·{" "}
        <span className="file-map-chip video-chip-head" /> tête de lecture. La
        vidéo d'essai pèse 78 Ko : le lecteur l'a vite toute. Déposez un long
        film dans <code>media/</code> : la frise se remplit par îlots, là où
        vous sautez, et les trous restent vides.
      </p>
    </div>
  );
}
