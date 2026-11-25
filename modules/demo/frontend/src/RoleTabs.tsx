import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { DEMOS, type IDemoEntry } from "../../demos";
import { docUrl, repoFileUrl } from "./about";
import { demoAnchor } from "./Catalogue";
import { tabTargetIndex } from "./effects";
import { ROLES, ROLES_DOC_PAGE, type Role, type RoleId } from "./roles";

/** Icône de chaque métier (trait, 24 × 24). */
const ROLE_ICONS: Record<RoleId, ReactNode> = {
  dt: (
    <>
      <path d="M3 7h18v13H3z" />
      <path d="M8 7V4h8v3" />
      <path d="M3 12h18" />
    </>
  ),
  ops: (
    <>
      <rect x="3" y="3" width="18" height="7" rx="1.5" />
      <rect x="3" y="14" width="18" height="7" rx="1.5" />
      <path d="M7 6.5h.01M7 17.5h.01" />
    </>
  ),
  arch: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  front: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  back: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </>
  ),
};

function RoleIcon({ id }: { id: RoleId }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ROLE_ICONS[id]}
    </svg>
  );
}

/**
 * « Selon qui tu es » — un onglet par métier, UN panneau paysage.
 *
 * Patron WAI-ARIA « tabs » à activation automatique : clic, flèches,
 * Début/Fin ; seul l'onglet choisi est dans l'ordre de tabulation. Le
 * changement passe par une View Transition quand le navigateur la connaît et
 * que l'utilisateur n'a pas demandé moins d'animation.
 *
 * @param version - version de Nodefony installée, pour viser la doc de CETTE version
 */
export function RoleTabs({ version }: { version: string | null }) {
  const [selected, setSelected] = useState<RoleId>(ROLES[0].id);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: RoleId, focusIndex: number | null) => {
    const apply = () => flushSync(() => setSelected(id));
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (typeof document.startViewTransition === "function" && !reduce) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
    if (focusIndex !== null) tabs.current[focusIndex]?.focus();
  };

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const next = tabTargetIndex(event.key, index, ROLES.length);
    const role = next === null ? undefined : ROLES[next];
    if (next === null || role === undefined) return;
    event.preventDefault();
    select(role.id, next);
  };

  return (
    <section id="roles">
      <div className="sec-head">
        <p className="kicker">Par où commencer</p>
        <h2>Selon qui tu es</h2>
        <p>
          Les cinq parcours de la documentation. Les développeurs partent des
          démos ; les autres métiers, de la doc qui les concerne.
        </p>
      </div>
      <div className="rswitch">
        <div className="rtabs" role="tablist" aria-label="Choisir son métier">
          <span className="rtabs-hint" aria-hidden="true">
            Ton métier
          </span>
          {ROLES.map((role, index) => (
            <button
              key={role.id}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              className="rtab"
              id={`rtab-${role.id}`}
              aria-controls={`rpanel-${role.id}`}
              aria-selected={role.id === selected}
              tabIndex={role.id === selected ? 0 : -1}
              onClick={() => select(role.id, null)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <RoleIcon id={role.id} />
              <span>{role.label}</span>
            </button>
          ))}
        </div>
        {ROLES.map((role) => (
          <RolePanel
            key={role.id}
            role={role}
            hidden={role.id !== selected}
            version={version}
          />
        ))}
      </div>
    </section>
  );
}

function RolePanel({
  role,
  hidden,
  version,
}: {
  role: Role & { id: RoleId };
  hidden: boolean;
  version: string | null;
}) {
  return (
    <div
      className="rpanel"
      role="tabpanel"
      id={`rpanel-${role.id}`}
      aria-labelledby={`rtab-${role.id}`}
      hidden={hidden}
      data-kind={role.kind}
    >
      <div className="rpanel-side">
        <span className="rpanel-ic">
          <RoleIcon id={role.id} />
        </span>
        <h3>{role.label}</h3>
        <p>{role.summary}</p>
        <span className="rpanel-meta">{panelMeta(role)}</span>
        <a className="rpanel-cta" href={docUrl(version, ROLES_DOC_PAGE)}>
          Parcours complet <span aria-hidden="true">→</span>
        </a>
      </div>
      {role.kind === "doc" ? (
        <div className="rpanel-list">
          {role.links.map((link) => (
            <a
              key={link.title}
              className="ritem"
              href={
                link.repoFile !== undefined
                  ? repoFileUrl(version, link.repoFile)
                  : docUrl(version, link.page)
              }
            >
              <span className="ritem-t">{link.title}</span>
              <span className="ritem-d">{link.description}</span>
              <span className="ritem-go" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="rpanel-list steps">
          {role.steps.map((step, index) => (
            <DemoStep
              key={step.demo}
              rank={index + 1}
              demo={step.demo}
              description={step.description}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Ce que le panneau promet : un nombre de pages, ou de démos ouvrables. */
function panelMeta(role: Role): string {
  if (role.kind === "doc") return `${role.links.length} pages de documentation`;
  const ready = role.steps.filter((step) => isReady(step.demo)).length;
  if (ready === 0) return "Démos à venir";
  return `${ready} démo${ready > 1 ? "s" : ""} à ouvrir dans l'ordre`;
}

function isReady(id: string): boolean {
  const demos: readonly IDemoEntry[] = DEMOS;
  return demos.some((demo) => demo.id === id && demo.status === "ready");
}

/** Une étape d'un parcours de développeur : sa carte au catalogue, ou grisée. */
function DemoStep({
  rank,
  demo,
  description,
}: {
  rank: number;
  demo: string;
  description: string;
}) {
  // Élargi au type de l'index : une démo peut redevenir « à venir », même
  // quand aucune ne l'est aujourd'hui.
  const entry: IDemoEntry | undefined = DEMOS.find(
    (candidate) => candidate.id === demo,
  );
  if (entry === undefined) return null;
  const content = (
    <>
      <span className="step">{rank}</span>
      <span className="ritem-t">{entry.title}</span>
      <span className="ritem-d">{description}</span>
    </>
  );
  if (entry.status === "soon") {
    return (
      <div className="ritem soon" aria-disabled="true">
        {content}
        <span className="ritem-go" aria-hidden="true">
          démo à venir
        </span>
      </div>
    );
  }
  return (
    <a className="ritem" href={`#${demoAnchor(entry.id)}`}>
      {content}
      <span className="ritem-go" aria-hidden="true">
        →
      </span>
    </a>
  );
}
