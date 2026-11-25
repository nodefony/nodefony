/*
 * Feuille de la page d'accueil — PARTAGÉE par les quatre fronts (React, Vue,
 * Angular, Svelte) et par l'accueil d'une application sans front. Mêmes jetons,
 * même en-tête, mêmes cartes que la démo : une application neuve ressemble à
 * ce que montre le framework. Seule la couleur du front vient d'`accent.css`.
 *
 * Classes préfixées `nf-` : `.card`, `.btn` ou `.grid` entreraient en
 * collision avec la première bibliothèque d'interface que tu ajouteras.
 *
 * C'est TA page : retouche ou remplace ce fichier comme ton propre code.
 */
:root {
  --blue: #0067ba;
  --link: var(--blue);
  --cyan: #00699f;
  --green: #3b7430;
  --bg: #e9f0f8;
  --bg-soft: #dde7f3;
  --fg: #0a2440;
  --muted: #3d5571;
  --card: #f7fafd;
  --border: #c4d4e6;
  --code-bg: #0a2440;
  --code-fg: #d9e6f5;
  --wash-blue: rgba(0, 160, 242, 0.16);
  --wash-green: rgba(68, 132, 56, 0.1);
  --shadow:
    0 1px 2px rgba(10, 36, 64, 0.06), 0 8px 24px rgba(0, 103, 186, 0.08);
  --shadow-hover:
    0 2px 4px rgba(10, 36, 64, 0.08), 0 14px 34px rgba(0, 103, 186, 0.2);
  --spring: linear(
    0,
    0.009,
    0.035 2.1%,
    0.141 4.4%,
    0.723 12.9%,
    0.938 16.7%,
    1.017 19.4%,
    1.067,
    1.084 26.3%,
    1.077 29.4%,
    1.006 41.1%,
    0.993 46.5%,
    1
  );
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --blue: #096bbf;
    --link: color-mix(in srgb, var(--blue) 50%, var(--fg));
    --cyan: #1ea0ec;
    --green: #4a8b3e;
    --wash-blue: rgba(30, 160, 236, 0.08);
    --wash-green: rgba(74, 139, 62, 0.06);
    --bg: #0a0f1c;
    --bg-soft: #0e1524;
    --fg: #e8edf6;
    --muted: #93a1ba;
    --card: #111828;
    --border: #223046;
    --code-bg: #0b1220;
    --code-fg: #cfe0f2;
    --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.35);
    --shadow-hover:
      0 2px 4px rgba(0, 0, 0, 0.3), 0 14px 34px rgba(30, 160, 236, 0.18);
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --blue: #096bbf;
  --link: color-mix(in srgb, var(--blue) 50%, var(--fg));
  --cyan: #1ea0ec;
  --green: #4a8b3e;
  --wash-blue: rgba(30, 160, 236, 0.08);
  --wash-green: rgba(74, 139, 62, 0.06);
  --bg: #0a0f1c;
  --bg-soft: #0e1524;
  --fg: #e8edf6;
  --muted: #93a1ba;
  --card: #111828;
  --border: #223046;
  --code-bg: #0b1220;
  --code-fg: #cfe0f2;
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.35);
  --shadow-hover:
    0 2px 4px rgba(0, 0, 0, 0.3), 0 14px 34px rgba(30, 160, 236, 0.18);
  color-scheme: dark;
}
:root[data-theme="light"] {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}
html {
  scrollbar-gutter: stable;
}
/* Police, fond et encre sur la PAGE : le premier élément rendu par n'importe
   quel front en hérite, aucune enveloppe à ne pas oublier. */
body {
  margin: 0;
  min-height: 100vh;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
  font-size: 15px;
  line-height: 1.6;
  color: var(--fg);
  background:
    radial-gradient(
      1100px 520px at 30% -12%,
      var(--wash-blue),
      transparent 62%
    ),
    radial-gradient(900px 460px at 78% -8%, var(--wash-green), transparent 60%),
    var(--bg);
  /* La barre de debug (développement) publie sa hauteur : la page la réserve. */
  padding-bottom: var(--nodefony-debugbar-height, 0px);
}
app-root {
  display: block;
}
a {
  color: var(--link);
}
a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 3px;
  border-radius: 4px;
}
/* Le code de l'ACCUEIL seulement : une pastille sur tout `code` de la page
   imposerait son style aux pages que tu ajouteras (la démo a les siennes). */
.nf-main code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85em;
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
}
p,
li {
  text-wrap: pretty;
}

/* ─── En-tête : la marque, puis les outils et le compte ─────────────────── */
.nf-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px max(16px, env(safe-area-inset-right, 0px)) 12px
    max(16px, env(safe-area-inset-left, 0px));
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.nf-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--fg);
  font-weight: 700;
}
.nf-brand img {
  height: 30px;
  width: auto;
}
.nf-brand .nf-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 1px 9px;
}
.nf-topnav {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.nf-topnav a {
  text-decoration: none;
  /* La barre est translucide : `--muted` mêlé au texte tient 4,5:1 quel que
     soit le dessous. */
  color: color-mix(in srgb, var(--muted) 80%, var(--fg));
  font-size: 0.9rem;
  font-weight: 500;
  padding: 7px 12px;
  border-radius: 8px;
}
.nf-topnav a:hover {
  color: var(--fg);
  background: var(--bg-soft);
}
/* Les liens qui SORTENT de l'application : marqués d'une flèche. */
.nf-topnav a.nf-ext::after {
  content: " ↗";
  font-size: 0.8em;
  opacity: 0.7;
}
.nf-topnav-sep {
  flex: none;
  width: 1px;
  height: 18px;
  margin-inline: 6px;
  background: var(--border);
}
.nf-topbar-tools {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}
.nf-topnav + .nf-topbar-tools {
  margin-left: 0;
}
/* Les outils d'affichage en UN groupe : thème, barre de debug. */
.nf-tools {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--card);
}
.nf-tool {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}
.nf-tool:hover {
  color: var(--fg);
  background: var(--bg-soft);
}
/* Bouton ENFONCÉ (thème sombre actif, barre de debug cachée) : creusé dans
   le groupe — ombre intérieure, fond de l'accent, icône à l'accent. L'état
   se lit aussi par `aria-pressed`, jamais par la couleur seule. */
.nf-tool[aria-pressed="true"] {
  color: var(--link);
  background: color-mix(in srgb, var(--blue) 26%, var(--bg-soft));
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.18),
    inset 0 0 0 1px color-mix(in srgb, var(--blue) 35%, transparent);
}
.nf-tool[aria-pressed="true"] svg {
  transform: translateY(1px);
}
/* Le geste lui-même : la touche s'enfonce sous le doigt. */
.nf-tool:active {
  transform: scale(0.92);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.22);
}
.nf-tool {
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.12s ease;
}
.nf-tool svg {
  width: 17px;
  height: 17px;
}
@media (max-width: 720px) {
  .nf-topbar {
    flex-wrap: wrap;
  }
  .nf-topnav {
    order: 3;
    flex-basis: 100%;
    margin-left: 0;
  }
}
/* Téléphone : la marque et les outils tiennent sur UNE ligne. */
@media (max-width: 520px) {
  .nf-brand .nf-tag {
    display: none;
  }
}
.nf-topbar-tools a.nf-login {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  color: #fff;
  background: var(--blue);
}
.nf-account {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nf-session {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}
.nf-session::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ea043;
}
.nf-account-out {
  min-height: 36px;
  padding: 6px 12px;
  font: inherit;
  font-size: 0.85rem;
  color: var(--fg);
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}
.nf-account-out:hover {
  background: var(--bg-soft);
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */
.nf-main {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 max(16px, env(safe-area-inset-right, 0px)) 40px
    max(16px, env(safe-area-inset-left, 0px));
}
.nf-hero {
  position: relative;
  isolation: isolate;
  text-align: center;
  padding-block: clamp(44px, 8vw, 84px) clamp(28px, 5vw, 48px);
}
/* Deux halos, le bleu et le vert du logo, qui dérivent derrière lui. */
.nf-hero::before,
.nf-hero::after {
  content: "";
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  pointer-events: none;
}
.nf-hero::before {
  width: 420px;
  height: 300px;
  top: 4%;
  left: calc(50% - 360px);
  background: color-mix(in srgb, var(--blue) 26%, transparent);
}
.nf-hero::after {
  width: 360px;
  height: 280px;
  top: 10%;
  left: calc(50% - 20px);
  background: color-mix(in srgb, var(--green) 18%, transparent);
}
.nf-hero-logo {
  height: 80px;
  width: auto;
  filter: drop-shadow(
    0 10px 28px color-mix(in srgb, var(--blue) 35%, transparent)
  );
}
.nf-hero h1 {
  margin: 18px auto 10px;
  max-width: 860px;
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 1.12;
  letter-spacing: -0.028em;
  text-wrap: balance;
  background-image: linear-gradient(
    100deg,
    var(--fg) 0 42%,
    color-mix(in srgb, var(--cyan) 70%, var(--fg)) 50%,
    var(--fg) 58% 100%
  );
  background-size: 260% 100%;
  background-position: 0% 0;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.nf-hero .nf-sub {
  opacity: 0.82;
  font-size: clamp(1rem, 2vw, 1.18rem);
  font-weight: 500;
  margin: 0 auto 8px;
  max-width: 700px;
}
.nf-hero .nf-sig {
  color: var(--muted);
  max-width: 640px;
  margin: 0 auto;
  text-wrap: balance;
}
.nf-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
}
.nf-badge {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--muted);
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 999px;
  padding: 4px 12px;
}
.nf-badge.nf-agentic {
  color: color-mix(in srgb, var(--green) 50%, var(--fg));
  border-color: color-mix(in srgb, var(--green) 45%, var(--border));
}
/* Le front de l'application : son logo dans sa couleur, le texte reste à
   l'encre (la couleur de marque seule ne tient pas 4,5:1 sur ce fond). */
.nf-badge.nf-front {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--fg);
  border-color: color-mix(in srgb, var(--nf-front) 55%, var(--border));
}
.nf-badge.nf-front svg {
  width: 14px;
  height: 14px;
  /* Le cyan de React sur le fond clair s'effaçait : un cran plus sombre en
     clair, la couleur pure en sombre. */
  color: color-mix(in srgb, var(--nf-front) 60%, #000);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .nf-badge.nf-front svg {
    color: var(--nf-front);
  }
}
:root[data-theme="dark"] .nf-badge.nf-front svg {
  color: var(--nf-front);
}
/* Commande d'installation : bordure en dégradé conique qui tourne. */
@property --spin {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}
.nf-install {
  position: relative;
  display: inline-flex;
  gap: 12px;
  margin-top: 24px;
  max-width: 100%;
  overflow-x: auto;
  font-family: ui-monospace, Menlo, monospace;
  font-size: 0.92rem;
  color: var(--code-fg);
  background: var(--code-bg);
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: var(--shadow);
  white-space: nowrap;
}
.nf-install::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 13px;
  padding: 1px;
  pointer-events: none;
  background: conic-gradient(
    from var(--spin),
    transparent 0 55%,
    var(--cyan),
    var(--green),
    transparent 85%
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.nf-install .nf-p {
  color: var(--cyan);
  user-select: none;
}
.nf-install b {
  color: #8fd18a;
  font-weight: 600;
}
/* La démo non installée se nomme sous le haut de page : la commande d'une app
   jetable qui la porte (développement seulement). */
.nf-learn {
  margin: 26px auto 0;
  max-width: 640px;
  color: var(--muted);
  font-size: 0.92rem;
}
.nf-cta {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;
}
.nf-btn {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  border: 0;
  border-radius: 10px;
  padding: 11px 22px;
}
.nf-btn.nf-primary {
  color: #fff;
  background: var(--blue);
}

/* ─── Sections et cartes (celles de la démo) ────────────────────────────── */
.nf-section {
  padding-block: clamp(30px, 5vw, 50px);
}
/* Bande pleine largeur sans débordement : l'ombre peint jusqu'aux bords, le
   clip-path la retient à la hauteur de la section. */
.nf-band {
  box-shadow: 0 0 0 100vmax var(--bg-soft);
  clip-path: inset(0 -100vmax);
  background: var(--bg-soft);
}
.nf-sec-head {
  max-width: 720px;
  margin: 0 0 24px;
}
.nf-kicker {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: color-mix(in srgb, var(--accent, var(--blue)) 50%, var(--fg));
}
.nf-sec-head h2 {
  margin: 0 0 8px;
  font-size: clamp(1.4rem, 2.8vw, 1.85rem);
  letter-spacing: -0.02em;
  text-wrap: balance;
}
.nf-sec-head p {
  margin: 0;
  color: var(--muted);
}
.nf-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
.nf-card {
  --accent: var(--cyan);
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-decoration: none;
  color: var(--fg);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  box-shadow: var(--shadow);
  min-width: 0;
  transition:
    transform 0.5s var(--spring),
    box-shadow 0.3s ease,
    border-color 0.3s ease,
    opacity 0.3s ease;
}
/* Lumière qui suit le pointeur (`--mx`/`--my`, posés par la page). */
.nf-card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  background: radial-gradient(
    320px circle at var(--mx, 50%) var(--my, 50%),
    color-mix(in srgb, var(--accent) 14%, transparent),
    transparent 70%
  );
}
.nf-card:hover::before {
  opacity: 1;
}
.nf-card:hover {
  border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
  box-shadow: var(--shadow-hover);
}
.nf-grid:has(.nf-card:hover) .nf-card:not(:hover) {
  opacity: 0.62;
}
.nf-card h3 {
  margin: 0;
  font-size: 1.05rem;
}
.nf-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.88rem;
}
.nf-card .nf-go {
  margin-top: auto;
  padding-top: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--accent) 55%, var(--fg));
  transition: letter-spacing 0.3s ease;
}
a.nf-card:hover .nf-go {
  letter-spacing: 0.02em;
}
.nf-creds {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
}
/* Un identifiant se recopie : jamais coupé en deux sur un téléphone. */
.nf-creds code {
  white-space: nowrap;
}
/* Sélecteur d’habillages de la page de connexion : un formulaire GET, qui
   marche sans JavaScript, dans tous les fronts. */
.nf-skins {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 6px;
}
.nf-skins select,
.nf-skins button {
  min-height: 36px;
  font: inherit;
  font-size: 0.88rem;
  border: 1px solid var(--border);
  border-radius: 8px;
}
.nf-skins select {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  color: var(--fg);
  background: var(--bg-soft);
}
.nf-skins button {
  padding: 6px 14px;
  font-weight: 600;
  color: #fff;
  background: var(--blue);
  border-color: transparent;
  cursor: pointer;
}
/* La carte de la garantie de production : en vert. */
.nf-card.nf-safe {
  --accent: var(--green);
}
.nf-note {
  margin: 18px 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 0.85rem;
}

/* ─── Mouvement — seulement si l'utilisateur ne l'a pas refusé ──────────── */
@media (prefers-reduced-motion: no-preference) {
  @keyframes nf-drift {
    50% {
      transform: translate(40px, 18px) scale(1.08);
    }
  }
  @keyframes nf-spin {
    to {
      --spin: 360deg;
    }
  }
  @keyframes nf-logo-in {
    from {
      opacity: 0;
      transform: translateY(18px) scale(0.82);
      filter: blur(8px);
    }
  }
  @keyframes nf-sheen {
    from {
      background-position: 100% 0;
    }
    to {
      background-position: 0% 0;
    }
  }
  @keyframes nf-title-in {
    from {
      opacity: 0;
      transform: translateY(14px);
      letter-spacing: -0.05em;
    }
  }
  @keyframes nf-bar {
    to {
      box-shadow: 0 6px 24px rgba(14, 23, 38, 0.08);
      background: color-mix(in srgb, var(--bg) 92%, transparent);
    }
  }
  @keyframes nf-rise {
    from {
      opacity: 0.5;
      transform: translateY(28px) scale(0.985);
    }
  }
  .nf-hero::before {
    animation: nf-drift 14s ease-in-out infinite;
  }
  .nf-hero::after {
    animation: nf-drift 17s ease-in-out infinite reverse;
  }
  .nf-install::before {
    animation: nf-spin 6s linear infinite;
  }
  .nf-hero-logo {
    animation: nf-logo-in 1.1s var(--spring) backwards;
  }
  .nf-hero h1 {
    animation:
      nf-title-in 0.9s 0.15s cubic-bezier(0.2, 0.8, 0.2, 1) backwards,
      nf-sheen 2.2s 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  }
  .nf-card:hover {
    transform: translateY(-4px);
  }
  @supports (animation-timeline: scroll()) {
    .nf-topbar {
      animation: nf-bar linear both;
      animation-timeline: scroll(root);
      animation-range: 0 160px;
    }
    .nf-sec-head,
    .nf-card {
      animation: nf-rise linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 55%;
    }
  }
}

@media (max-width: 520px) {
  .nf-install {
    white-space: normal;
    text-align: left;
    font-size: 0.78rem;
    padding: 11px 14px;
  }
}
