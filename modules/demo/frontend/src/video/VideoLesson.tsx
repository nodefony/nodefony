import { useState, type ReactNode } from "react";
import { docsVersion, docUrl, type IDemoAbout } from "../about";
import { LEVELS } from "../Catalogue";
import { LessonCode } from "../lesson/LessonCode";
import type { LessonFile } from "../lesson/lesson";
import { probeHttp, type IProbeChunk, type IProbeResult } from "../kit/probe";
import { StepsLesson, type ILessonStep } from "../kit/StepsLesson";
import { RANGE_BYTES, SAMPLE_VIDEO, VIDEO_PATH } from "./videoDemo";
import { VIDEO_LESSON, type VideoExcerpt } from "./videoTabs";
import { FileMap, VideoPlayer } from "./VideoVisuals";

const CONTROLLER =
  "nodefony/controllers/VideoController.ts" satisfies LessonFile;
const SHARED = "frontend/src/video/videoDemo.ts" satisfies LessonFile;
const PAGE = "frontend/src/video/VideoLesson.tsx" satisfies LessonFile;
const VISUALS = "frontend/src/video/VideoVisuals.tsx" satisfies LessonFile;

/** La vidéo d'essai, et sa version à télécharger. */
const SAMPLE = `${VIDEO_PATH}/${SAMPLE_VIDEO}`;
const DOWNLOAD = `${SAMPLE}/download`;

/**
 * Un geste de la leçon ; `player` montre le lecteur au-dessus des appels,
 * `noMap` retire la carte du fichier (le geste ne lit pas la vidéo).
 */
interface IVideoStep extends ILessonStep<VideoExcerpt> {
  player?: boolean;
  noMap?: boolean;
}

/** `GET` avec un en-tête `Range`, et ce qui revient. */
function ranged(
  url: string,
  range: string,
  live: (chunks: readonly IProbeChunk[]) => void,
) {
  return probeHttp(url, { headers: { range } }, live);
}

// #region client-if-range
// Reprendre la version qu'on a : lire son `ETag` par un `HEAD`
// (aucun octet du corps ne voyage), puis le renvoyer en `If-Range`
// avec la plage — ou en `If-None-Match` pour savoir si elle a changé.
async function currentEtag(): Promise<string> {
  const head = await fetch(SAMPLE, { method: "HEAD", cache: "no-store" });
  return head.headers.get("etag") ?? "";
}
// #endregion

/** Les sept gestes. */
const STEPS: readonly [IVideoStep, ...IVideoStep[]] = [
  {
    id: "play",
    short: "Lire la vidéo",
    gesture: "renderMediaStream()",
    title: "Une ligne, et le lecteur saute où il veut",
    text: "Le lecteur ne télécharge pas la vidéo d'un bloc : il demande des MORCEAUX, et l'action n'a qu'à désigner le fichier. Sautez à 0:20 : le minuteur s'y affiche sans attendre ce qui précède. Sans `Range`, la réponse est entière (200) et annonce `Accept-Ranges: bytes` : « vous pourrez demander des plages ».",
    excerpts: [
      { file: CONTROLLER, region: "video-serve" },
      { file: VISUALS, region: "client-player" },
      { file: VISUALS, region: "client-buffered" },
    ],
    expect: "200, Accept-Ranges: bytes",
    player: true,
    calls: [
      {
        label: "Sans Range : tout le fichier",
        verb: "GET",
        path: SAMPLE,
        run: (live) => probeHttp(SAMPLE, {}, live),
      },
    ],
  },
  {
    id: "range",
    short: "Une plage",
    gesture: "Range: bytes=0-99",
    title: "Demander un morceau",
    text: `\`Range: bytes=0-99\` demande les ${RANGE_BYTES} premiers octets : la réponse est un 206, \`Content-Range\` dit lesquels et sur combien. On y lit \`ftyp\` puis \`moov\` : l'en-tête du MP4, et son index, placé en tête pour que le lecteur sache tout de suite où est chaque instant.`,
    excerpts: [
      { file: CONTROLLER, region: "video-serve" },
      { file: VISUALS, region: "client-range" },
    ],
    expect: "206, Content-Range: bytes 0-99/…",
    calls: [
      {
        label: "Les 100 premiers octets",
        verb: "GET",
        path: SAMPLE,
        run: (live) => ranged(SAMPLE, `bytes=0-${RANGE_BYTES - 1}`, live),
      },
      {
        label: "100 octets au milieu",
        verb: "GET",
        path: SAMPLE,
        run: (live) => ranged(SAMPLE, "bytes=40000-40099", live),
      },
    ],
  },
  {
    id: "edges",
    short: "Ouverte, par la fin",
    gesture: "bytes=N- · bytes=-N",
    title: "Jusqu'au bout, ou les derniers octets",
    text: "Sans fin, `bytes=40000-` va jusqu'au dernier octet : c'est ce que demande un lecteur qui saute. Sans début, `bytes=-100` désigne les 100 DERNIERS octets, sans connaître la taille.",
    excerpts: [
      { file: CONTROLLER, region: "video-serve" },
      { file: VISUALS, region: "client-range" },
    ],
    expect: "206 les deux fois",
    calls: [
      {
        label: "De l'octet 40 000 à la fin",
        verb: "GET",
        path: SAMPLE,
        run: (live) => ranged(SAMPLE, "bytes=40000-", live),
      },
      {
        label: "Les 100 derniers octets",
        verb: "GET",
        path: SAMPLE,
        run: (live) => ranged(SAMPLE, `bytes=-${RANGE_BYTES}`, live),
      },
    ],
  },
  {
    id: "refuse",
    short: "Refus, ou ignoré",
    gesture: "416 · 200",
    title: "Une plage impossible, un en-tête invalide",
    text: "Une plage hors du fichier reçoit 416, et `Content-Range: bytes */taille` donne la taille pour réessayer. Un `Range` illisible, ou plusieurs plages à la fois, est IGNORÉ : la vidéo part entière (200). Jamais une erreur serveur pour un en-tête que le client a mal écrit.",
    excerpts: [{ file: CONTROLLER, region: "video-serve" }],
    expect: "416, puis 200 deux fois",
    calls: [
      {
        label: "Au-delà de la fin",
        verb: "GET",
        path: SAMPLE,
        run: (live) => ranged(SAMPLE, "bytes=999999999-", live),
      },
      {
        label: "Range illisible",
        verb: "GET",
        path: SAMPLE,
        run: (live) => ranged(SAMPLE, "bytes=abc", live),
      },
      {
        label: "Deux plages à la fois",
        verb: "GET",
        path: SAMPLE,
        run: (live) => ranged(SAMPLE, "bytes=0-9,20-29", live),
      },
    ],
  },
  {
    id: "validators",
    short: "Reprendre sans recoller",
    gesture: "If-Range · ETag",
    title: "Reprendre la MÊME version",
    text: "Un lecteur qui reprend après une coupure envoie `If-Range` avec l'`ETag` qu'il a déjà : si le fichier n'a pas changé, il reçoit la suite (206) ; s'il a changé, la vidéo repart entière (200) — jamais deux versions recollées. Et `If-None-Match` sur la version qu'on a déjà : 304, sans corps.",
    excerpts: [
      { file: CONTROLLER, region: "video-serve" },
      { file: PAGE, region: "client-if-range" },
    ],
    expect: "206, 200, puis 304",
    calls: [
      {
        label: "If-Range : la bonne version",
        verb: "GET",
        path: SAMPLE,
        run: async (live) =>
          probeHttp(
            SAMPLE,
            {
              headers: {
                range: `bytes=0-${RANGE_BYTES - 1}`,
                "if-range": await currentEtag(),
              },
            },
            live,
          ),
      },
      {
        label: "If-Range : une version périmée",
        verb: "GET",
        path: SAMPLE,
        run: (live) =>
          probeHttp(
            SAMPLE,
            {
              headers: {
                range: `bytes=0-${RANGE_BYTES - 1}`,
                "if-range": '"version-perimee"',
              },
            },
            live,
          ),
      },
      {
        label: "If-None-Match : déjà en cache",
        verb: "GET",
        path: SAMPLE,
        run: async (live) =>
          probeHttp(
            SAMPLE,
            { headers: { "if-none-match": await currentEtag() } },
            live,
          ),
      },
    ],
  },
  {
    id: "download",
    short: "Télécharger",
    gesture: "renderFileDownload()",
    title: "Un téléchargement n'est pas une lecture",
    text: "`renderFileDownload()` sert le même fichier en pièce à enregistrer (`attachment`) : le fichier ENTIER, même quand `Range` est demandé. C'est voulu pour un téléchargement ; pour un lecteur, c'est `renderMediaStream()`.",
    excerpts: [{ file: CONTROLLER, region: "video-download" }],
    expect: "200 malgré Range, attachment",
    calls: [
      {
        label: "Range demandé, ignoré",
        verb: "GET",
        path: DOWNLOAD,
        run: (live) => ranged(DOWNLOAD, `bytes=0-${RANGE_BYTES - 1}`, live),
      },
    ],
  },
  {
    id: "folder",
    short: "Le dossier media/",
    gesture: "schema: { params }",
    title: "Le dossier, et les noms qu'on refuse",
    text: "Toute vidéo déposée dans `media/` du module est listée et servie de la même façon. Le nom vient de l'adresse : le schéma n'accepte qu'un NOM de vidéo, jamais un chemin — `../package.json` est refusé avant l'action. Un nom valide mais absent : 404.",
    excerpts: [
      { file: CONTROLLER, region: "video-list" },
      { file: SHARED, region: "video-shared" },
    ],
    expect: "la liste, puis 422 et 404",
    noMap: true,
    calls: [
      {
        label: "Ce que contient media/",
        verb: "GET",
        path: VIDEO_PATH,
        run: (live) => probeHttp(VIDEO_PATH, {}, live),
      },
      {
        label: "Un chemin au lieu d'un nom",
        verb: "GET",
        path: `${VIDEO_PATH}/..%2Fpackage.json`,
        run: (live) => probeHttp(`${VIDEO_PATH}/..%2Fpackage.json`, {}, live),
      },
      {
        label: "Une vidéo absente",
        verb: "GET",
        path: `${VIDEO_PATH}/absente.mp4`,
        run: (live) => probeHttp(`${VIDEO_PATH}/absente.mp4`, {}, live),
      },
    ],
  },
];

/**
 * Page d'apprentissage « Vidéo par plages » (`/demo/video`) : la carte des
 * sept gestes, puis UN geste à l'écran (mise en page du kit,
 * `kit/StepsLesson.tsx`). Chaque appel interroge la vraie vidéo du serveur.
 *
 * Guide pour un agent : le contrôleur est `VideoController.ts`, la lecture
 * passe par la sonde du kit (`probeHttp` de `kit/probe.ts`), qui montre les
 * en-têtes envoyés et un corps binaire en hexadécimal.
 */
export function VideoLesson({ about }: { about: IDemoAbout | null }) {
  const version = docsVersion(about);
  // La dernière réponse de CHAQUE geste : la carte du fichier la dessine.
  const [last, setLast] = useState<Record<string, IProbeResult>>({});
  const visuals = (step: IVideoStep): ReactNode => (
    <>
      {step.player === true && <VideoPlayer url={SAMPLE} />}
      {step.noMap !== true && (
        <FileMap url={SAMPLE} result={last[step.id] ?? null} />
      )}
    </>
  );
  return (
    <main className="lesson steps-page">
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <a href="/demo">Démo</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Vidéo par plages</span>
      </nav>

      <header className="steps-head">
        <span className={`lvl ${LEVELS.intermediate.className}`}>
          {LEVELS.intermediate.label}
        </span>
        <h1>Vidéo par plages — sauter sans tout télécharger</h1>
        <p>
          Un lecteur vidéo ne télécharge pas le fichier d'un bloc : il demande
          une <strong>plage</strong> d'octets, et le serveur répond{" "}
          <code>206</code> avec ce morceau seulement. C'est ce qui permet de
          sauter à la vingtième seconde sans attendre les dix-neuf premières —
          et au serveur de ne jamais charger la vidéo en mémoire.
        </p>
      </header>

      <StepsLesson
        steps={STEPS}
        label="Les sept gestes"
        prefix={VIDEO_PATH}
        fields={visuals}
        onResult={(result, step) =>
          setLast((done) => ({ ...done, [step]: result }))
        }
      />

      <details className="steps-more">
        <summary>Le contrôleur entier, et la page, couche par couche</summary>
        <LessonCode
          lesson={VIDEO_LESSON}
          doc={{
            href: docUrl(version, "modules/http/byte-stream"),
            label: "Flux d'octets et fichiers — la doc complète",
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
              <strong>Lire la vidéo en mémoire pour l'envoyer.</strong>{" "}
              <code>readFile()</code> puis <code>render()</code> : une vidéo de
              2 Go coûte 2 Go par spectateur. Un fichier part toujours en flux.
            </li>
            <li>
              <strong>Servir sans plages.</strong> <code>streamFile()</code>{" "}
              envoie le fichier, mais sans <code>Accept-Ranges</code> le lecteur
              ne sait pas sauter plus loin que ce qu'il a reçu.
            </li>
            <li>
              <strong>Un nom pris tel quel dans l'adresse.</strong>{" "}
              <code>../</code> sort du dossier : valider un NOM, jamais accepter
              un chemin.
            </li>
            <li>
              <strong>L'index en fin de fichier.</strong> Un MP4 dont{" "}
              <code>moov</code> est à la fin oblige le lecteur à demander la fin
              avant de jouer : l'encoder avec <code>-movflags +faststart</code>.
            </li>
          </ul>
        </div>
        <aside className="further" aria-label="Pour aller plus loin">
          <h2 className="lesson-step">Pour aller plus loin</h2>
          <a href={docUrl(version, "modules/http/byte-stream")}>
            Flux d'octets et fichiers — @nodefony/http
          </a>
          <a href="/demo/first-steps#file">
            Premiers pas : un fichier du disque, ETag et 304
          </a>
          <a href="/demo/sse">Flux SSE : le serveur pousse des événements</a>
        </aside>
      </section>
    </main>
  );
}
