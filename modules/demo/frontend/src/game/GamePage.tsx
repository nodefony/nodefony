import type { ReactNode } from "react";
import { docUrl } from "../about";
import { LEVELS } from "../Catalogue";
import { LessonCode } from "../lesson/LessonCode";
import type { ILesson } from "../lesson/lesson";

/**
 * La page d'un jeu : la mise en page que les jeux de la démo partagent — le jeu
 * EN TÊTE, jouable sans rien lire, puis comment il marche, le code couche par
 * couche, les pièges.
 *
 * Guide pour un agent : un jeu neuf fournit son écran (`stage`), ses quatre
 * points « comment ça marche », sa leçon (`ILesson`, ses régions citées) et
 * ses pièges ; la page ne change pas.
 */

/** Un point de « comment ça marche ». */
export interface IGameHow {
  title: string;
  text: ReactNode;
}

/** Un lien de « pour aller plus loin ». */
export interface IGameLink {
  href: string;
  label: string;
}

// #region game-page
/** La page d'un jeu : titre, écran, mécanique, code, pièges. */
export function GamePage({
  crumb,
  title,
  intro,
  stage,
  how,
  lesson,
  version,
  traps,
  further,
}: {
  crumb: string;
  title: string;
  intro: ReactNode;
  stage: ReactNode;
  how: readonly IGameHow[];
  lesson: ILesson;
  version: string | null;
  traps: readonly IGameHow[];
  further: readonly IGameLink[];
}) {
  return (
    <main className="lesson game-page">
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <a href="/demo">Démo</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{crumb}</span>
      </nav>

      <header className="game-head">
        <span className={`lvl ${LEVELS.advanced.className}`}>
          {LEVELS.advanced.label}
        </span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>

      {stage}

      <section className="game-how" aria-labelledby="game-how-title">
        <h2 id="game-how-title" className="lesson-step">
          Comment ça marche
        </h2>
        <ol>
          {how.map((point) => (
            <li key={point.title}>
              <strong>{point.title}</strong>
              <span>{point.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <details className="steps-more" open>
        <summary>Le code, couche par couche</summary>
        <LessonCode
          lesson={lesson}
          doc={{
            href: docUrl(version, "modules/realtime/cas-d-usage"),
            label: "Les cas d'usage du temps réel — la doc complète",
          }}
        />
      </details>

      <section className="lesson-traps" aria-labelledby="game-traps-title">
        <div>
          <h2 id="game-traps-title" className="lesson-step">
            Les pièges
          </h2>
          <ul>
            {traps.map((trap) => (
              <li key={trap.title}>
                <strong>{trap.title}</strong> {trap.text}
              </li>
            ))}
          </ul>
        </div>
        <aside className="further" aria-label="Pour aller plus loin">
          <h2 className="lesson-step">Pour aller plus loin</h2>
          {further.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </aside>
      </section>
    </main>
  );
}
// #endregion
