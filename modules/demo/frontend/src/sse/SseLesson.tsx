import { useState, type ReactNode } from "react";
import { docsVersion, docUrl, type IDemoAbout } from "../about";
import { LEVELS } from "../Catalogue";
import { LessonCode } from "../lesson/LessonCode";
import type { LessonFile } from "../lesson/lesson";
import {
  probeHttp,
  probeSse,
  type IProbeChunk,
  type IProbeResult,
} from "../kit/probe";
import { StepsLesson, type ILessonStep } from "../kit/StepsLesson";
import {
  ask,
  followBuild,
  followResume,
  listenClock,
  openStream,
  resumeAfter,
} from "./sseClient";
import { CLOCK_TICKS, SSE_PATH, type BuildEvents } from "./sseDemo";
import { SSE_LESSON, type SseExcerpt } from "./sseTabs";
import { AnswerBubble, BuildBar, SseTimeline } from "./SseVisuals";

const CONTROLLER = "nodefony/controllers/SseController.ts" satisfies LessonFile;
const SHARED = "frontend/src/sse/sseDemo.ts" satisfies LessonFile;
const CLIENT = "frontend/src/sse/sseClient.ts" satisfies LessonFile;
const PROBE = "frontend/src/kit/probe.ts" satisfies LessonFile;

/** Un geste du flux, et ce qu'il montre en plus de la frise. */
interface ISseStep extends ILessonStep<SseExcerpt> {
  asks?: boolean;
  shows?: "build" | "answer";
}

/** Le fil brut : `fetch` en demandant le flux, lu morceau par morceau. */
const RAW: RequestInit = { headers: { accept: "text/event-stream" } };

/** Ce que le code client remet à la page, pour les visuels. */
interface ISseScreen {
  /** Pour un geste, reçoit la dernière donnée que le code client remet. */
  heard: (step: string) => (data: string) => void;
  progress: (progress: BuildEvents["progress"] | null) => void;
  words: (update: (words: readonly string[]) => readonly string[]) => void;
}

/** Les sept gestes ; le dernier lit la question saisie. */
function buildSteps(
  question: string,
  screen: ISseScreen,
): readonly [ISseStep, ...ISseStep[]] {
  return [
    {
      id: "open",
      short: "Ouvrir un flux",
      gesture: "renderSse()",
      title: "Ouvrir un flux, écrire, fermer",
      text: "L'action ouvre une réponse qu'elle ne referme pas tout de suite, et y écrit des événements à son rythme ; la page les lit avec `EventSource`. Le fil brut montre le format : une ligne `data:` par événement, puis une ligne vide.",
      excerpts: [
        { file: CONTROLLER, region: "sse-open" },
        { file: CLIENT, region: "client-open" },
      ],
      expect: "5 événements, puis la fin",
      calls: [
        {
          label: "Lire avec EventSource",
          verb: "SSE",
          path: `${SSE_PATH}/steps`,
          run: (live) =>
            probeSse(
              `${SSE_PATH}/steps`,
              {
                open: (end) =>
                  openStream(`${SSE_PATH}/steps`, screen.heard("open"), end),
              },
              live,
            ),
        },
        {
          label: "Voir le fil brut",
          verb: "GET",
          path: `${SSE_PATH}/steps`,
          run: (live) => probeHttp(`${SSE_PATH}/steps`, RAW, live),
        },
      ],
    },
    {
      id: "named",
      short: "Nommer, typer",
      gesture: '{ event: "progress" }',
      title: "Des événements nommés et typés",
      text: "`event` donne un nom à l'événement : la page écoute `progress` et `done` séparément. La carte `BuildEvents`, partagée avec la page, type le nom ET le contenu ; la page en fait une barre. `done` dit à la page qu'elle peut fermer.",
      excerpts: [
        { file: CONTROLLER, region: "sse-named" },
        { file: CLIENT, region: "client-named" },
        { file: SHARED, region: "sse-shared" },
      ],
      expect: "4 progress, puis done",
      shows: "build",
      calls: [
        {
          label: "Suivre la construction",
          verb: "SSE",
          path: `${SSE_PATH}/build`,
          run: (live) =>
            probeSse(
              `${SSE_PATH}/build`,
              {
                open: (end) => {
                  screen.progress(null);
                  return followBuild(screen.progress, end);
                },
                events: ["progress", "done"],
              },
              live,
            ),
        },
      ],
    },
    {
      id: "resume",
      short: "Reprendre",
      gesture: "id, Last-Event-ID",
      title: "Reprendre après une coupure",
      text: "Chaque événement porte un `id`. Le serveur coupe tous les deux ; le navigateur se reconnecte seul après `retry` ms et renvoie le dernier `id` reçu dans `Last-Event-ID` : le serveur reprend à la suite. Tout envoyé, il répond 204, la seule façon de dire « fini » à `EventSource`.",
      excerpts: [
        { file: CONTROLLER, region: "sse-resume" },
        { file: CLIENT, region: "client-resume" },
      ],
      expect: "3 connexions, 6 événements, puis 204",
      calls: [
        {
          label: "Laisser le navigateur reprendre",
          verb: "SSE",
          path: `${SSE_PATH}/resume`,
          run: (live) =>
            probeSse(`${SSE_PATH}/resume`, { open: followResume }, live),
        },
        {
          label: "Reprendre après l'événement 4",
          verb: "SSE",
          path: `${SSE_PATH}/resume`,
          run: (live) =>
            probeSse(
              `${SSE_PATH}/resume`,
              { open: () => resumeAfter("4") },
              live,
            ),
        },
      ],
    },
    {
      id: "heartbeat",
      short: "Battement",
      gesture: "heartbeat",
      title: "Le battement de cœur",
      text: "3,5 secondes de silence. Un proxy couperait une connexion muette : le battement envoie un commentaire `:` chaque seconde ici, toutes les 15 s par défaut. Le fil brut le montre ; `EventSource` l'ignore et ne voit qu'un événement.",
      excerpts: [
        { file: CONTROLLER, region: "sse-heartbeat" },
        { file: PROBE, region: "probe-http" },
      ],
      expect: "3 battements, puis 1 événement",
      calls: [
        {
          label: "Voir le fil brut",
          verb: "GET",
          path: `${SSE_PATH}/quiet`,
          run: (live) => probeHttp(`${SSE_PATH}/quiet`, RAW, live),
        },
        {
          label: "Lire avec EventSource",
          verb: "SSE",
          path: `${SSE_PATH}/quiet`,
          run: (live) =>
            probeSse(
              `${SSE_PATH}/quiet`,
              {
                open: (end) =>
                  openStream(
                    `${SSE_PATH}/quiet`,
                    screen.heard("heartbeat"),
                    end,
                  ),
              },
              live,
            ),
        },
      ],
    },
    {
      id: "leave",
      short: "Le client part",
      gesture: "sse.closed",
      title: "Un flux sans fin, et le client qui part",
      text: `L'horloge tourne tant que \`sse.closed\` est faux. La page ferme après ${CLOCK_TICKS} tops ; le serveur le voit, sort de sa boucle, et \`onClose\` écrit « client parti après ${CLOCK_TICKS} tops » dans le terminal du serveur.`,
      excerpts: [
        { file: CONTROLLER, region: "sse-leave" },
        { file: CLIENT, region: "client-leave" },
      ],
      expect: `${CLOCK_TICKS} tops, puis la page ferme`,
      calls: [
        {
          label: `Écouter ${CLOCK_TICKS} tops`,
          verb: "SSE",
          path: `${SSE_PATH}/clock`,
          run: (live) =>
            probeSse(
              `${SSE_PATH}/clock`,
              {
                open: (end) =>
                  listenClock(
                    (tick) => screen.heard("leave")(`top ${tick}`),
                    end,
                  ),
              },
              live,
            ),
        },
      ],
    },
    {
      id: "negotiate",
      short: "JSON ou flux",
      gesture: "acceptsSse()",
      title: "Même route, deux réponses",
      text: "`acceptsSse()` lit l'en-tête `Accept` : sans `text/event-stream`, l'action rend un objet, donc du JSON ; avec, elle ouvre le flux. `EventSource` envoie cet en-tête tout seul.",
      excerpts: [
        { file: CONTROLLER, region: "sse-negotiate" },
        { file: CLIENT, region: "client-open" },
      ],
      expect: "JSON, puis un flux",
      calls: [
        {
          label: "Sans Accept : du JSON",
          verb: "GET",
          path: `${SSE_PATH}/status`,
          run: (live) => probeHttp(`${SSE_PATH}/status`, {}, live),
        },
        {
          label: "Accept: text/event-stream",
          verb: "GET",
          path: `${SSE_PATH}/status`,
          run: (live) => probeHttp(`${SSE_PATH}/status`, RAW, live),
        },
        {
          label: "Avec EventSource",
          verb: "SSE",
          path: `${SSE_PATH}/status`,
          run: (live) =>
            probeSse(
              `${SSE_PATH}/status`,
              {
                open: (end) =>
                  openStream(
                    `${SSE_PATH}/status`,
                    screen.heard("negotiate"),
                    end,
                  ),
                events: ["status"],
              },
              live,
            ),
        },
      ],
    },
    {
      id: "post",
      short: "Mot à mot",
      gesture: "@Post + renderSse()",
      title: "Une réponse qui s'écrit mot à mot",
      text: "`EventSource` ne sait faire que `GET`, sans corps. `NodefonySse` (de `nodefony/client`) a la même interface et ajoute méthode, en-têtes et corps : la question part en `POST`, validée par son schéma, et la réponse revient mot à mot sur la même requête. Une question vide est refusée avant l'action.",
      excerpts: [
        { file: CONTROLLER, region: "sse-post" },
        { file: CLIENT, region: "client-post" },
      ],
      expect: "un mot par événement ; vide : 422",
      asks: true,
      shows: "answer",
      calls: [
        {
          label: "Poser la question",
          verb: "POST",
          path: `${SSE_PATH}/answer`,
          run: (live) =>
            probeSse(
              `${SSE_PATH}/answer`,
              {
                open: (end) => {
                  screen.words(() => []);
                  return ask(
                    question,
                    (word) => screen.words((words) => [...words, word]),
                    end,
                  );
                },
                events: ["token", "done"],
              },
              live,
            ),
        },
        {
          label: "Poser une question vide",
          verb: "POST",
          path: `${SSE_PATH}/answer`,
          run: (live) =>
            probeHttp(
              `${SSE_PATH}/answer`,
              {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ question: "" }),
              },
              live,
            ),
        },
      ],
    },
  ];
}

/**
 * Page d'apprentissage « Flux SSE » (`/demo/sse`) : la carte des sept
 * gestes, puis UN geste à l'écran (mise en page du kit,
 * `kit/StepsLesson.tsx`). Chaque appel lit le vrai flux du serveur.
 *
 * Guide pour un agent : le contrôleur est `SseController.ts` ; le code
 * client qui ouvre chaque flux est `sseClient.ts`, écouté par la sonde du kit
 * (`probeSse` de `kit/probe.ts`) ; les visuels sont dans `SseVisuals.tsx`.
 */
export function SseLesson({ about }: { about: IDemoAbout | null }) {
  const version = docsVersion(about);
  const [question, setQuestion] = useState("Qu'est-ce qu'un flux SSE ?");
  // Le dernier résultat de chaque geste : la frise le redessine.
  const [last, setLast] = useState<Partial<Record<string, IProbeResult>>>({});
  const [heard, setHeard] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<BuildEvents["progress"] | null>(
    null,
  );
  const [words, setWords] = useState<readonly string[]>([]);
  const steps = buildSteps(question, {
    heard: (step) => (data) =>
      setHeard((before) => ({ ...before, [step]: data })),
    progress: setProgress,
    words: setWords,
  });

  const fields = (
    step: ISseStep,
    live: readonly IProbeChunk[] | null,
  ): ReactNode => {
    const done = last[step.id] ?? null;
    return (
      <>
        {step.asks === true && (
          <div className="steps-fields">
            <label>
              Question
              <input
                value={question}
                maxLength={120}
                onChange={(event) => setQuestion(event.target.value)}
              />
            </label>
          </div>
        )}
        {step.shows === "build" && <BuildBar progress={progress} />}
        {step.shows === "answer" && (
          <AnswerBubble words={words} writing={live !== null} />
        )}
        {(live !== null || done !== null) && (
          <SseTimeline
            chunks={live ?? done?.chunks ?? []}
            ms={live === null ? (done?.ms ?? null) : null}
          />
        )}
        {step.id in heard && (
          <p className="sse-heard">
            Dernière donnée remise à la page : « {heard[step.id]} »
          </p>
        )}
      </>
    );
  };

  return (
    <main className="lesson steps-page">
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <a href="/demo">Démo</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Flux SSE</span>
      </nav>

      <header className="steps-head">
        <span className={`lvl ${LEVELS.beginner.className}`}>
          {LEVELS.beginner.label}
        </span>
        <h1>Flux SSE — le serveur parle, le navigateur écoute</h1>
        <p>
          Un flux <strong>SSE</strong> est une réponse HTTP qui ne se termine
          pas tout de suite : le serveur y pousse des événements, le navigateur
          les lit au fil de l'eau. Une radio plutôt qu'un téléphone — pour
          parler dans les deux sens, c'est la WebSocket.
        </p>
      </header>

      <StepsLesson
        steps={steps}
        label="Les sept gestes"
        prefix={SSE_PATH}
        fields={fields}
        onResult={(result, step) =>
          setLast((done) => ({ ...done, [step]: result }))
        }
      />

      <details className="steps-more">
        <summary>Le contrôleur entier, et la page, couche par couche</summary>
        <LessonCode
          lesson={SSE_LESSON}
          doc={{
            href: docUrl(version, "modules/http/sse"),
            label: "Flux SSE — la doc complète",
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
              <strong>Une fin de flux est une coupure.</strong>{" "}
              <code>EventSource</code> se reconnecte et rejoue le flux : la page
              ferme sur un événement de fin, ou le serveur répond 204.
            </li>
            <li>
              <strong>Une boucle sans fin teste sse.closed.</strong> Après le
              départ du client, <code>send()</code> ne fait plus rien : sans ce
              test, la boucle tourne pour personne.
            </li>
            <li>
              <strong>Six onglets, et le site ne répond plus.</strong> En
              HTTP/1.1, un navigateur ouvre environ six connexions par origine,
              et chaque flux en garde une. En HTTP/2, ce plafond disparaît.
            </li>
            <li>
              <strong>Un flux ne porte que du texte.</strong> Des octets lèvent
              une erreur : les encoder (base64), ou passer à la WebSocket.
            </li>
          </ul>
        </div>
        <aside className="further" aria-label="Pour aller plus loin">
          <h2 className="lesson-step">Pour aller plus loin</h2>
          <a href={docUrl(version, "modules/http/sse")}>
            Flux SSE — @nodefony/http
          </a>
          <a href="/demo/first-steps#stream">
            Premiers pas : un flux d'octets avec renderStream()
          </a>
          <a href="/demo/chat">Le chat : les deux sens, par WebSocket</a>
        </aside>
      </section>
    </main>
  );
}
