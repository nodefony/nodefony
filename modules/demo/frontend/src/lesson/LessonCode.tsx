import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Inline } from "../Catalogue";
import { tabTargetIndex } from "../effects";
import { highlight } from "../highlight";
import {
  extractRegion,
  layerLabel,
  tabExcerpts,
  type ILesson,
  type ILessonExcerpt,
} from "./lesson";
import { resolveConstants } from "./lessonConstants";
import { LESSON_SOURCES } from "./lessonSources";

/** Ce qu'une page d'apprentissage donne à sa section de code. */
export interface ILessonCodeProps {
  lesson: ILesson;
  /** Le lien de doc sous les onglets. */
  doc: { href: string; label: string };
}

/**
 * Section 3 de toute page d'apprentissage — « le code qui la fait » : un
 * onglet par COUCHE de l'application (config, sécurité, contrôleur…), qui
 * suit la logique métier en paragraphes, chacun suivi du code CITÉ qu'il
 * explique (fichier toujours nommé, constantes résolues). Les décorateurs
 * d'un onglet y sont expliqués en une ligne chacun.
 *
 * Patron WAI-ARIA « tabs » à activation automatique : clic, flèches,
 * Début/Fin ; seul l'onglet choisi est dans l'ordre de tabulation.
 */
export function LessonCode({ lesson, doc }: ILessonCodeProps) {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = lesson.tabs.at(selected) ?? lesson.tabs.at(0);
  if (current === undefined) return null;

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const next = tabTargetIndex(event.key, index, lesson.tabs.length);
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  };

  // Les décorateurs dont la région est citée par CET onglet.
  const shown = tabExcerpts(current);
  const decorators = lesson.decorators.filter((decorator) =>
    shown.some(
      (excerpt) =>
        excerpt.file === decorator.file && excerpt.region === decorator.region,
    ),
  );

  return (
    <section className="lesson-code" aria-labelledby="lesson-code-title">
      <h2 id="lesson-code-title" className="lesson-step">
        3 · Le code qui la fait
      </h2>
      <p>
        Couche par couche, dans l'ordre où on la construit. Chaque extrait est
        lu dans les fichiers de ce module au moment de la construction : c'est
        le code qui tourne au-dessus, pas une copie.
      </p>
      <div
        className="steps"
        role="tablist"
        aria-label="Couches de l'application"
      >
        {lesson.tabs.map((tab, index) => (
          <button
            key={tab.layer}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`layer-tab-${tab.layer}`}
            aria-controls="layer-panel"
            aria-selected={index === selected}
            tabIndex={index === selected ? 0 : -1}
            className="step-tab"
            onClick={() => setSelected(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {layerLabel(tab.layer)}
          </button>
        ))}
      </div>
      <div
        id="layer-panel"
        role="tabpanel"
        aria-labelledby={`layer-tab-${current.layer}`}
        className="step-panel"
      >
        {current.blocks.map((block) => (
          <div
            className="block"
            key={
              block.excerpt === undefined
                ? block.text
                : `${block.excerpt.file}#${block.excerpt.region}`
            }
          >
            <p className="block-text">
              <Inline text={block.text} />
            </p>
            {block.excerpt !== undefined && <Excerpt excerpt={block.excerpt} />}
            {block.snippet !== undefined && (
              <figure className="excerpt snippet">
                <figcaption>
                  <span className="snippet-label">{block.snippet.label}</span>
                </figcaption>
                <pre>
                  <code>{block.snippet.lines.join("\n")}</code>
                </pre>
              </figure>
            )}
          </div>
        ))}
        {decorators.length > 0 && (
          <dl className="tab-decorators" aria-label="Décorateurs de cet onglet">
            {decorators.map((decorator) => (
              <div key={`${decorator.name}|${decorator.region}`}>
                <dt>
                  <code>@{decorator.name}</code>
                </dt>
                <dd>
                  <Inline text={decorator.role} />{" "}
                  <span className="decorator-from">{decorator.from}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}
        <a className="step-doc" href={doc.href}>
          {doc.label}
        </a>
      </div>
    </section>
  );
}

/**
 * Un extrait : son fichier, son texte coloré, et ses constantes résolues.
 * Exporté pour les pages qui montrent le code d'une étape à côté de son essai
 * (« Premiers pas »).
 */
export function Excerpt({ excerpt }: { excerpt: ILessonExcerpt }) {
  const code = extractRegion(LESSON_SOURCES[excerpt.file], excerpt.region);
  const tokens = useMemo(
    () => (code === null ? null : highlight(code)),
    [code],
  );
  const constants = useMemo(
    () => (code === null ? [] : resolveConstants(code, LESSON_SOURCES)),
    [code],
  );
  return (
    <figure className="excerpt">
      <figcaption>
        <code className="excerpt-file">{excerpt.file}</code>
        <span>#{excerpt.region}</span>
        {excerpt.step !== undefined && (
          <span className="excerpt-step">Cookbook · étape {excerpt.step}</span>
        )}
      </figcaption>
      <pre>
        <code>
          {tokens === null
            ? "(région introuvable : voir le test du module)"
            : tokens.map((token) => (
                <span
                  key={token.at}
                  className={
                    token.kind === "plain" ? undefined : `tok-${token.kind}`
                  }
                >
                  {token.text}
                </span>
              ))}
        </code>
      </pre>
      {constants.length > 0 && (
        <dl className="excerpt-consts" aria-label="Constantes de cet extrait">
          {constants.map((constant) => (
            <div key={constant.name}>
              <dt>
                <code>{constant.name}</code>
              </dt>
              <dd>
                <code>{constant.value}</code>
                <span>{constant.file}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </figure>
  );
}
