import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Inline } from "../Catalogue";
import { tabTargetIndex } from "../effects";
import { Excerpt } from "../lesson/LessonCode";
import type { ILessonExcerpt } from "../lesson/lesson";
import { ProbeResult } from "./ProbeResult";
import type { IProbeChunk, IProbeResult } from "./probe";

/** Un appel qu'un bouton lance : sa méthode, son chemin, et l'appel lui-même. */
export interface IStepCall {
  label: string;
  verb: "GET" | "POST" | "WS" | "SSE";
  /** Chemin affiché sous le libellé. */
  path: string;
  run: (
    live: (chunks: readonly IProbeChunk[]) => void,
  ) => Promise<IProbeResult>;
  /** Raison de ne pas pouvoir l'appeler encore, ou `null`. */
  blocked?: string | null;
}

/** Un geste : son nom court pour la carte, l'explication, le code, les appels. */
export interface ILessonStep<E extends ILessonExcerpt = ILessonExcerpt> {
  id: string;
  /** Nom court, sur la carte. */
  short: string;
  /** Ce qu'on écrit pour ce geste, sur la carte. */
  gesture: string;
  title: string;
  text: string;
  /** Les extraits montrés à gauche, dans l'ordre. */
  excerpts: readonly E[];
  expect: string;
  calls: readonly IStepCall[];
}

/** L'appel en cours : son geste, son bouton, les morceaux déjà reçus. */
interface ILive {
  step: string;
  call: string;
  chunks: readonly IProbeChunk[];
}

/** Le geste que l'adresse désigne (`#stream`), sinon le premier. */
function initialStep(steps: readonly ILessonStep[]): number {
  const index = steps.findIndex(
    (step) => `#${step.id}` === window.location.hash,
  );
  return index === -1 ? 0 : index;
}

/**
 * La mise en page des leçons « à gestes » : la CARTE des gestes en haut,
 * puis UN geste à l'écran — son code à gauche, ses appels à droite, chaque
 * réponse sous le bouton qui l'a produite. Rien à faire défiler pour passer d'un geste à l'autre ; l'adresse
 * garde le geste choisi (`#stream`).
 *
 * Guide pour un agent : brique du KIT, partagée par « Premiers pas » et
 * « Flux SSE ». La page fournit ses gestes et, au besoin, des champs
 * (`fields`) ou des liens (`extra`) propres à un geste ; les appels passent
 * par la sonde (`probe.ts`), affichée par `ProbeResult.tsx`. La carte suit
 * le patron WAI-ARIA « tabs ».
 *
 * @param steps - les gestes, jamais vide
 * @param label - nom accessible de la carte (« Les dix gestes »)
 * @param prefix - préfixe commun des chemins, retiré de leur affichage
 * @param fields - champs à saisir avant d'appeler, ou visuels, pour un geste
 *   donné ; reçoit aussi les morceaux de l'appel EN COURS de ce geste
 * @param extra - liens ajoutés sous les appels d'un geste
 * @param onResult - reçoit chaque résultat et l'`id` de son geste (garder un
 *   `etag`, dessiner ce qui est revenu)
 */
export function StepsLesson<E extends ILessonExcerpt>({
  steps,
  label,
  prefix,
  fields,
  extra,
  onResult,
}: {
  steps: readonly [ILessonStep<E>, ...ILessonStep<E>[]];
  label: string;
  prefix: string;
  fields?: (
    step: ILessonStep<E>,
    live: readonly IProbeChunk[] | null,
  ) => ReactNode;
  extra?: (step: ILessonStep<E>) => ReactNode;
  onResult?: (result: IProbeResult, step: string) => void;
}) {
  const [selected, setSelected] = useState(() => initialStep(steps));
  // Par geste, le dernier résultat de CHAQUE bouton, affiché sous lui.
  const [results, setResults] = useState<
    Record<string, Partial<Record<string, IProbeResult>>>
  >({});
  const [live, setLive] = useState<ILive | null>(null);
  // UNE réponse ouverte à la fois (`geste#bouton`) : lancer un autre appel
  // referme la précédente ; « Fermer » la replie sans rien perdre.
  const [open, setOpen] = useState<string | null>(null);
  const step = steps.at(selected) ?? steps[0];
  // La colonne de code défile quand un geste cite beaucoup : elle doit alors
  // se joindre au clavier (WCAG 2.1.1), et seulement alors — focalisable
  // sans rien à faire défiler, elle ajouterait un arrêt vide à la tabulation.
  const code = useRef<HTMLDivElement | null>(null);
  const [codeScrolls, setCodeScrolls] = useState(false);
  useEffect(() => {
    const element = code.current;
    if (element === null) return undefined;
    const measure = () => {
      setCodeScrolls(element.scrollHeight > element.clientHeight);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => {
      observer.disconnect();
    };
  }, [step.id]);

  const choose = (index: number) => {
    const next = steps.at(index);
    if (next === undefined) return;
    setSelected(index);
    window.history.replaceState(null, "", `#${next.id}`);
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = tabTargetIndex(event.key, index, steps.length);
    if (next === null) return;
    event.preventDefault();
    choose(next);
    document.getElementById(`steps-tab-${steps[next]?.id ?? ""}`)?.focus();
  };
  const run = (call: IStepCall) => {
    const at = { step: step.id, call: call.label };
    setOpen(`${at.step}#${at.call}`);
    setLive({ ...at, chunks: [] });
    void call
      .run((chunks) => setLive({ ...at, chunks }))
      .then((result) => {
        onResult?.(result, at.step);
        setResults((done) => ({
          ...done,
          [at.step]: { ...done[at.step], [at.call]: result },
        }));
        setLive(null);
      });
  };

  return (
    <>
      <div
        className={`steps-map steps-cols-${Math.min(5, Math.ceil(steps.length / 2))}`}
        role="tablist"
        aria-label={label}
      >
        {steps.map((entry, index) => {
          const tried = entry.id in results;
          return (
            <button
              key={entry.id}
              id={`steps-tab-${entry.id}`}
              type="button"
              role="tab"
              aria-selected={index === selected}
              aria-controls="steps-stage"
              tabIndex={index === selected ? 0 : -1}
              className="steps-tab"
              onClick={() => choose(index)}
              onKeyDown={(event) => onTabKey(event, index)}
            >
              <span className="steps-tab-num">{tried ? "✓" : index + 1}</span>
              <span className="steps-tab-title">{entry.short}</span>
              <code className="steps-tab-gesture">{entry.gesture}</code>
              {tried && <span className="sr-only"> (essayé)</span>}
            </button>
          );
        })}
      </div>

      <section
        id="steps-stage"
        role="tabpanel"
        aria-labelledby={`steps-tab-${step.id}`}
        className="steps-stage"
      >
        <div
          ref={code}
          className="steps-code"
          role="region"
          aria-label={`Code du geste ${selected + 1}`}
          tabIndex={codeScrolls ? 0 : undefined}
        >
          {step.excerpts.map((excerpt) => (
            <Excerpt
              key={`${excerpt.file}#${excerpt.region}`}
              excerpt={excerpt}
            />
          ))}
        </div>

        <div className="steps-try">
          <p className="steps-kicker">
            <span>
              Geste {selected + 1} / {steps.length}
            </span>
            <span>Attendu : {step.expect}</span>
          </p>
          <h2>{step.title}</h2>
          <p className="steps-text">
            <Inline text={step.text} />
          </p>
          {fields?.(step, live?.step === step.id ? live.chunks : null)}
          {/* Chaque réponse sous SON bouton, une seule ouverte à la fois : on
              sait toujours quel appel a produit ce qu'on lit. */}
          <div className="calls">
            {step.calls.map((call) => {
              const running =
                live?.step === step.id && live.call === call.label;
              const done = results[step.id]?.[call.label] ?? null;
              const shown = running || open === `${step.id}#${call.label}`;
              return (
                <div key={call.label} className="call-block">
                  <CallButton
                    call={call}
                    prefix={prefix}
                    busy={live !== null}
                    running={running}
                    onRun={run}
                  />
                  <div className="call-result" aria-live="polite">
                    {shown && (running || done !== null) && (
                      <>
                        <ProbeResult
                          result={running ? null : done}
                          live={running ? live.chunks : null}
                        />
                        {!running && (
                          <button
                            type="button"
                            className="call-close"
                            onClick={() => setOpen(null)}
                          >
                            Fermer la réponse
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {extra?.(step)}
          </div>
          <div className="steps-nav">
            <button
              type="button"
              disabled={selected === 0}
              onClick={() => choose(selected - 1)}
            >
              ← {steps[selected - 1]?.short ?? "Précédent"}
            </button>
            <button
              type="button"
              disabled={selected === steps.length - 1}
              onClick={() => choose(selected + 1)}
            >
              {steps[selected + 1]?.short ?? "Suivant"} →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

/** Un appel : la méthode, le libellé, et le chemin qu'il vise. */
function CallButton({
  call,
  prefix,
  busy,
  running,
  onRun,
}: {
  call: IStepCall;
  prefix: string;
  busy: boolean;
  running: boolean;
  onRun: (call: IStepCall) => void;
}) {
  const blocked = call.blocked ?? null;
  // Le chemin sans le préfixe commun : c'est ce qui change d'un appel à l'autre.
  const path = call.path.startsWith(prefix)
    ? call.path.slice(prefix.length)
    : call.path;
  return (
    <button
      type="button"
      className="call"
      disabled={busy || blocked !== null}
      aria-busy={running}
      title={blocked ?? undefined}
      onClick={() => onRun(call)}
    >
      <span className={`call-verb verb-${call.verb.toLowerCase()}`}>
        {call.verb}
      </span>
      <span className="call-text">
        <span className="call-label">{call.label}</span>
        <code className="call-path">{blocked ?? path}</code>
      </span>
      <span className="call-go" aria-hidden="true">
        {running ? "…" : "▶"}
      </span>
    </button>
  );
}
