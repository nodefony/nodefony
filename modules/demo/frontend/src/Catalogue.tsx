import { Fragment, type CSSProperties } from "react";
import {
  DEMOS,
  DEMO_RUBRICS,
  type DemoId,
  type DemoLevel,
  type DemoRubric,
  type IDemoEntry,
} from "../../demos";
import type { IDemoPulse } from "./pulse";

/** Étiquette et classe de chaque niveau. */
export const LEVELS: Record<DemoLevel, { label: string; className: string }> = {
  beginner: { label: "Débutant", className: "l1" },
  intermediate: { label: "Intermédiaire", className: "l2" },
  advanced: { label: "Avancé", className: "l3" },
};

/** Ancre et couleur de chaque rubrique (la nav du haut vise `#realtime`). */
const RUBRIC_STYLE: Record<DemoRubric, { anchor: string; accent: string }> = {
  realtime: { anchor: "realtime", accent: "var(--cyan)" },
  games: { anchor: "jeux", accent: "var(--amber)" },
  transports: { anchor: "flux", accent: "var(--blue)" },
  programs: { anchor: "programmes", accent: "var(--violet)" },
};

/**
 * L'état vivant d'une carte, lu dans le pouls (`demo:pulse`). Une démo sans
 * entrée ici n'en montre pas — en ajouter une : un champ dans `IDemoPulse`
 * (`pulse.ts`), son compteur dans `DemoPulseService`, sa ligne ici.
 */
const LIVE: Partial<Record<DemoId, (pulse: IDemoPulse) => string>> = {
  chat: ({ chat }) => `${chat.messages} message${chat.messages > 1 ? "s" : ""}`,
  partner: ({ partner }) =>
    `${partner.calls} appel${partner.calls > 1 ? "s" : ""} reçu${partner.calls > 1 ? "s" : ""}`,
};

/** Ancre de la carte d'une démo, visée par les onglets de métier. */
export function demoAnchor(id: string): string {
  return `demo-${id}`;
}

/**
 * Catalogue des démos, lu dans `modules/demo/demos.ts` — l'index que lit
 * aussi l'agent de l'application. Une démo `soon` est une carte grisée
 * « Démo à venir » : la fonctionnalité existe, sa démo pas encore.
 */
export function Catalogue({ pulse }: { pulse: IDemoPulse | null }) {
  return (
    <section id="catalogue">
      <div className="sec-head">
        <p className="kicker">Catalogue</p>
        <h2>
          {DEMOS.length} démos, {DEMO_RUBRICS.length} rubriques
        </h2>
        <p>
          Lu dans <code>modules/demo/demos.ts</code>, l'index que lit aussi
          l'agent de l'application. Chaque carte dit son niveau ; une carte
          grisée est une démo à venir.
        </p>
      </div>
      {DEMO_RUBRICS.map((rubric) => {
        const style = RUBRIC_STYLE[rubric.id];
        const accent: CSSProperties & Record<"--accent", string> = {
          "--accent": style.accent,
        };
        return (
          <div
            key={rubric.id}
            className="level"
            id={style.anchor}
            style={accent}
          >
            <h3>
              <span className="dot" />
              {rubric.title} <small>{rubric.summary}</small>
            </h3>
            <div className="grid">
              {DEMOS.filter((demo) => demo.rubric === rubric.id).map((demo) => (
                <DemoCard key={demo.id} demo={demo} pulse={pulse} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

/**
 * Une carte : un lien vers la page de la démo quand elle en a une ; sinon,
 * la commande qui la montre ; grisée quand elle est à venir.
 */
function DemoCard({
  demo,
  pulse,
}: {
  demo: IDemoEntry & { id: DemoId };
  pulse: IDemoPulse | null;
}) {
  const level = LEVELS[demo.level];
  const live = pulse === null ? undefined : LIVE[demo.id]?.(pulse);
  const body = (
    <>
      <div className="top">
        <h4>{demo.title}</h4>
        {demo.tag !== undefined && demo.status === "ready" && (
          <span className="pill">{demo.tag}</span>
        )}
      </div>
      <p>
        <Inline text={demo.teaches} />
      </p>
      {live !== undefined && (
        <span className="live" title="Depuis le démarrage de ce serveur">
          {live}
        </span>
      )}
      {demo.status === "ready" &&
        demo.path === undefined &&
        demo.command !== undefined && (
          <code className="cmd">{demo.command}</code>
        )}
      <div className="foot">
        <span className={`lvl ${level.className}`}>{level.label}</span>
        <span className="go">{footAction(demo)}</span>
      </div>
    </>
  );
  if (demo.status === "soon") {
    return (
      <div className="card soon" id={demoAnchor(demo.id)} aria-disabled="true">
        {body}
      </div>
    );
  }
  if (demo.path !== undefined) {
    return (
      <a className="card" id={demoAnchor(demo.id)} href={demo.path}>
        {body}
      </a>
    );
  }
  return (
    <div className="card" id={demoAnchor(demo.id)}>
      {body}
    </div>
  );
}

/** Ce que propose le pied d'une carte. */
function footAction(demo: IDemoEntry): string {
  if (demo.status === "soon") return "Démo à venir";
  return demo.path !== undefined ? "Ouvrir →" : "En ligne de commande";
}

/** Rend les segments entre accents graves en `<code>`, le reste en texte. */
export function Inline({ text }: { text: string }) {
  // Clé = position du segment dans le texte : stable, et propre au contenu.
  let offset = 0;
  const segments = text.split("`").map((part, rank) => {
    const segment = { part, code: rank % 2 === 1, at: offset };
    offset += part.length + 1;
    return segment;
  });
  return (
    <>
      {segments.map((segment) =>
        segment.code ? (
          <code key={segment.at}>{segment.part}</code>
        ) : (
          <Fragment key={segment.at}>{segment.part}</Fragment>
        ),
      )}
    </>
  );
}
