/**
 * Page d'accueil de nodefony — c'est TA page.
 *
 * Ce que voit tout visiteur : la marque, le thème, la session, puis le nom de
 * l'application. Rien de plus en production : ni mot de passe, ni version, ni
 * lien vers la console d'administration.
 *
 * En DÉVELOPPEMENT seulement : la présentation du framework, les liens utiles
 * et où personnaliser la page. Ce contenu vit dans `devHome.ts`, qui vaut
 * `null` dans le build de production — c'est là qu'est la garde, pas ici.
 */
import { useEffect, useState } from "react";
// La liaison React de la connexion : l'état de session en hook, la page de
// connexion servie par le framework (jamais un formulaire recopié ici).
import { useNodefonyLogin } from "nodefony/react";
import { loginPagePath } from "nodefony/client";
import { NODEFONY_LOGO } from "./brand";
import {
  DEV_HOME,
  type IHomeCard,
  type IHomeSection,
  type IHomeText,
} from "./devHome";
import {
  applyDarkTheme,
  findDebugBar,
  findDemo,
  readDarkTheme,
  startPointerLight,
  type IDebugBarHandle,
} from "./homeEffects";
import "./showcase.css";
import "./accent.css";

const MOON = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
const SUN = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

/** Thème clair/sombre : suit le système, un clic l'impose, retenu par ce navigateur. */
function useDarkTheme(): [boolean, () => void] {
  const [dark, setDark] = useState(readDarkTheme);
  useEffect(() => {
    applyDarkTheme(dark, false);
  }, [dark]);
  const toggle = (): void => {
    applyDarkTheme(!dark);
    setDark(!dark);
  };
  return [dark, toggle];
}

/**
 * UN bouton pour la barre de debug : la cacher ou la montrer. La réduire en
 * pastille est le geste de la barre elle-même.
 */
function DebugBarButton() {
  const [bar, setBar] = useState<IDebugBarHandle | null>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    // La barre est injectée à côté de la page : sa poignée arrive après le rendu.
    const frame = requestAnimationFrame(() => {
      const found = findDebugBar();
      setBar(found);
      if (found !== null) setVisible(found.isVisible());
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  if (bar === null) return null;
  return (
    <button
      type="button"
      className="nf-tool"
      aria-pressed={!visible}
      aria-label="Cacher la barre de debug"
      title="Cacher la barre de debug"
      onClick={() => {
        bar.setVisible(!visible);
        setVisible(!visible);
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M8 2l1.9 1.9M16 2l-1.9 1.9" />
        <rect x="7" y="6" width="10" height="14" rx="5" />
        <path d="M12 10v10M3 13h4M17 13h4M4 7l3 2M20 7l-3 2M4 19l3-2M20 19l-3-2" />
      </svg>
    </button>
  );
}

/** Un texte de l'accueil : ses fragments de code rendus dans `<code>`. */
function Rich({ text }: { text: readonly IHomeText[] }) {
  return (
    <>
      {text.map((part, i) =>
        part.code ? <code key={i}>{part.text}</code> : part.text,
      )}
    </>
  );
}

/** Une carte de l'accueil, lien ou non. */
function Card({ card }: { card: IHomeCard }) {
  const className = card.tone === "safe" ? "nf-card nf-safe" : "nf-card";
  const body = (
    <>
      <h3>{card.title}</h3>
      {card.creds !== null && (
        <p className="nf-creds">
          <code>{card.creds.user}</code>
          {card.creds.password !== null && (
            <>
              {" / "}
              <code>{card.creds.password}</code>
            </>
          )}
        </p>
      )}
      <p>
        <Rich text={card.text} />
      </p>
      {card.go !== null && <span className="nf-go">{card.go}</span>}
      {card.skins !== null && (
        <form className="nf-skins" action={card.skins.action} method="get">
          <select
            name="skin"
            defaultValue={card.skins.selected}
            aria-label="Habillage de la page de connexion"
          >
            {card.skins.options.map((skin) => (
              <option key={skin} value={skin}>
                {skin}
              </option>
            ))}
          </select>
          <button type="submit">Voir</button>
        </form>
      )}
    </>
  );
  return card.href !== null ? (
    <a className={className} href={card.href}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** Une section de l'accueil : son titre, son accroche, ses cartes. */
function Section({ section }: { section: IHomeSection }) {
  const titleId = `${section.id}-title`;
  return (
    <section
      className={section.band ? "nf-section nf-band" : "nf-section"}
      aria-labelledby={titleId}
    >
      <div className="nf-sec-head">
        <p className="nf-kicker">{section.kicker}</p>
        <h2 id={titleId}>{section.title}</h2>
        <p>{section.intro}</p>
      </div>
      <div className="nf-grid">
        {section.cards.map((card) => (
          <Card key={card.title} card={card} />
        ))}
      </div>
      {section.note !== null && <p className="nf-note">{section.note}</p>}
    </section>
  );
}

/** Accueil : la marque et la session ; en développement, de quoi démarrer. */
export function App() {
  const { state: login, flow } = useNodefonyLogin();
  // Reprend la session existante au montage (cookie de session, s'il y en a un).
  useEffect(() => {
    void flow.me();
  }, [flow]);
  const logout = async (): Promise<void> => {
    // Session venue d'un fournisseur : suivre son adresse ferme AUSSI la sienne.
    const providerLogout = await flow.logout();
    if (providerLogout !== null) window.location.assign(providerLogout);
  };
  const [dark, toggleTheme] = useDarkTheme();
  // La démo est-elle chargée ? Le serveur le dit dans la page (développement).
  const demo = DEV_HOME === null ? null : findDemo();
  useEffect(() => startPointerLight(".nf-card"), []);
  const dev = DEV_HOME;
  return (
    <>
      <header className="nf-topbar">
        <a className="nf-brand" href="/">
          <img src={NODEFONY_LOGO} alt="" width={30} height={30} />
          <span>nodefony</span>
          {dev !== null && <span className="nf-tag">développement</span>}
        </a>
        {dev !== null && (
          <nav className="nf-topnav" aria-label="Liens de développement">
            {dev.console !== null && (
              <>
                <a href={dev.console.href}>{dev.console.label}</a>
                <span className="nf-topnav-sep" aria-hidden="true" />
              </>
            )}
            {dev.external.map((link) => (
              <a key={link.href} className="nf-ext" href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        )}
        <div className="nf-topbar-tools">
          <div className="nf-tools" role="group" aria-label="Affichage">
            <button
              type="button"
              className="nf-tool"
              onClick={toggleTheme}
              aria-pressed={dark}
              aria-label="Thème sombre"
              title="Thème sombre"
            >
              {dark ? SUN : MOON}
            </button>
            {dev !== null && <DebugBarButton />}
          </div>
          {login.step === "authenticated" && login.user ? (
            <span className="nf-account">
              <span className="nf-session">{login.user.identifier}</span>
              <button
                type="button"
                className="nf-account-out"
                onClick={() => void logout()}
              >
                Se déconnecter
              </button>
            </span>
          ) : (
            <a
              className="nf-login"
              href={loginPagePath(location.pathname + location.search)}
            >
              Se connecter
            </a>
          )}
        </div>
      </header>

      <main className="nf-main">
        <div className="nf-hero">
          <img
            className="nf-hero-logo"
            src={NODEFONY_LOGO}
            alt=""
            width={80}
            height={80}
          />
          {dev !== null ? (
            <>
              <h1>{dev.hero.title}</h1>
              <p className="nf-sub">{dev.hero.sub}</p>
              <p className="nf-sig">{dev.hero.sig}</p>
              <div className="nf-badges">
                <span className="nf-badge nf-agentic">{dev.hero.lead}</span>
                <span className="nf-badge nf-front">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={dev.front.logo} />
                  </svg>
                  {dev.front.name} {dev.front.version}
                </span>
                {dev.hero.badges.map((badge) => (
                  <span key={badge} className="nf-badge">
                    {badge}
                  </span>
                ))}
              </div>
              <div
                className="nf-install"
                role="img"
                aria-label={`Commande d'installation : ${dev.hero.install.command} ${dev.hero.install.arg}`}
              >
                <span className="nf-p">$</span>
                <span>
                  {dev.hero.install.command} <b>{dev.hero.install.arg}</b>
                </span>
              </div>
              {demo !== null ? (
                <div className="nf-cta">
                  <a className="nf-btn nf-primary" href={demo}>
                    {dev.demoLabel}
                  </a>
                </div>
              ) : (
                <p className="nf-learn">
                  {dev.learn.label} : <code>{dev.learn.command}</code> —{" "}
                  {dev.learn.note}
                </p>
              )}
            </>
          ) : (
            <h1>nodefony</h1>
          )}
        </div>
        {dev?.sections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </main>
    </>
  );
}
