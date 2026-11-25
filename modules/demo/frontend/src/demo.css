/*
 * Feuille de la démo — reprise de la maquette validée (#747). Le logo arrive
 * par `--demo-logo`, posé par la page depuis le paquet (`brand.ts`) : jamais
 * une copie embarquée ici.
 *
 * Les jetons (couleurs des deux thèmes, ombres, ressort), la page (police,
 * fond, liens, focus) et les effets de l'accueil viennent de `showcase.css`,
 * la feuille de l'accueil de l'application, chargée AVANT celle-ci : une seule
 * source, la démo et l'application ne peuvent plus diverger. Ne vivent ici que
 * les jetons propres à la démo.
 */
:root {
  --amber: #8a5a10;
  --violet: #6b3fb0;
  /* Un refus, une erreur (leçon MCP) — jamais une série de graphe. */
  --danger: #a81e26;
  /* L'encre posée SUR un fond --danger (bouton plein) : 4,5:1 au moins. */
  --on-danger: #fff;
  /* Ma bulle du chat : un VOILE translucide de l'accent, le fond passe. */
  --accent-bubble: color-mix(in srgb, var(--blue) 16%, transparent);
  /* Séries des graphes du fil (validées CVD) : CBOR, texte. */
  --wire-cbor: #0067ba;
  --wire-text: #8a5a10;
  /* Le pied de page : un bandeau marine, celui du bleu du logo. */
  --footer-bg: #0a2440;
  --footer-fg: #c9d6e8;
  --footer-link: #8fcdf7;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --amber: #b7791f;
    --violet: #7c4dbd;
    --footer-bg: #060a14;
    --footer-fg: #c9d6e8;
    --footer-link: #8fcdf7;
    --danger: #e0646a;
    --on-danger: #1b0a0b;
    /* Ma bulle en sombre : l'accent DÉSATURÉ par la surface (Material, thème
       sombre) — plein, il éblouissait. Le blanc y garde un contraste élevé. */
    --accent-bubble: color-mix(in srgb, var(--blue) 30%, transparent);
    --wire-cbor: #3d9be6;
  }
}
:root[data-theme="dark"] {
  --amber: #b7791f;
  --violet: #7c4dbd;
  --footer-bg: #060a14;
  --footer-fg: #c9d6e8;
  --footer-link: #8fcdf7;
  --wire-cbor: #3d9be6;
  --danger: #e0646a;
  --on-danger: #1b0a0b;
  /* Ma bulle en sombre : un voile plus dense, toujours translucide. */
  --accent-bubble: color-mix(in srgb, var(--blue) 30%, transparent);
}
body::before {
  content: "";
  position: fixed;
  inset: 0 0 auto;
  height: env(safe-area-inset-top, 0px);
  z-index: 30;
  background: var(--bg);
}
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85em;
}

.topbar {
  position: sticky;
  top: env(safe-area-inset-top, 0px);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  padding-block: 12px;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--fg);
  font-weight: 700;
}
.brand .tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 1px 9px;
}
.topnav {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.topnav a {
  text-decoration: none;
  /* La barre est translucide : sur un contenu gris, `--muted` seul tombait
     à 4,44:1. Mêlé au texte, il tient 4,5:1 quel que soit le dessous. */
  color: color-mix(in srgb, var(--muted) 80%, var(--fg));
  font-size: 0.9rem;
  font-weight: 500;
  padding: 7px 12px;
  border-radius: 8px;
}
.topnav a:hover {
  color: var(--fg);
  background: var(--bg-soft);
}
.brand .tag.ver {
  font-variant-numeric: tabular-nums;
  color: color-mix(in srgb, var(--blue) 50%, var(--fg));
  border-color: color-mix(in srgb, var(--blue) 35%, var(--border));
}
/* Les liens qui SORTENT de la démo : même style, marqués d'une flèche. */
.topnav a.ext::after {
  content: " ↗";
  font-size: 0.8em;
  opacity: 0.7;
}
.topnav-sep {
  flex: none;
  width: 1px;
  height: 18px;
  margin-inline: 6px;
  background: var(--border);
}
/* À droite : les outils d'affichage en UN groupe, puis le compte. */
.topbar-tools {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
}
/* La largeur du compte connecté (« 👤 admin · Se déconnecter »), réservée
   avant que la session soit lue : l'en-tête se met en page UNE fois. */
.account-slot {
  display: flex;
  align-items: center;
  min-inline-size: 210px;
}
/* Logo, menu et outils tiennent sur UNE ligne à 1 484 px près : la moindre
   variation (badge de version lu après coup, nom du compte) faisait basculer
   les outils sur une seconde ligne en plein chargement. Sous 1 700 px, ils
   ont leur ligne d'emblée — la mise en page ne se décide plus au pixel. */
@media (max-width: 1699px) {
  .topbar-tools {
    flex-basis: 100%;
  }
}
.topbar-tools a.login {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  color: #fff;
  background: var(--blue);
}
/* Le compte connecté : l'identifiant, puis la déconnexion. */
.account {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 6px;
}
.account-who {
  max-width: 16ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 600;
}
.account-out {
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
.account-out:hover {
  background: var(--bg-soft);
}

main {
  max-width: 1080px;
  margin: 0 auto;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  padding-block: 0 40px;
}
.hero {
  text-align: center;
  padding-block: clamp(44px, 8vw, 84px) clamp(28px, 5vw, 48px);
}
.hero h1 {
  margin: 0 auto 10px;
  max-width: 860px;
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 1.12;
  letter-spacing: -0.028em;
  text-wrap: balance;
}
.hero .sub {
  opacity: 0.82;
  font-size: clamp(1rem, 2vw, 1.18rem);
  font-weight: 500;
  margin: 0 auto 8px;
  max-width: 700px;
}
.hero .sig {
  color: var(--muted);
  max-width: 640px;
  margin: 0 auto;
}
.hero-logo {
  height: 80px;
  width: auto;
}
.hero h1 {
  margin-top: 18px;
}
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
}
.badge {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--muted);
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 999px;
  padding: 4px 12px;
}
.badge.agentic {
  color: color-mix(in srgb, var(--green) 50%, var(--fg));
  border-color: color-mix(in srgb, var(--green) 45%, var(--border));
}
.badges {
  align-items: center;
}
.roles {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr);
}
@media (min-width: 960px) {
  .roles {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
@media (min-width: 600px) and (max-width: 959px) {
  .roles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .role:last-child {
    grid-column: 1 / -1;
  }
}
.role {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  min-width: 0;
}
.role h3 {
  margin: 0;
  font-size: 0.98rem;
}
.role p {
  margin: 0;
  color: var(--muted);
  font-size: 0.84rem;
}
.role ol {
  margin: 0;
  padding-left: 18px;
  font-size: 0.84rem;
  display: grid;
  gap: 2px;
}
.role a,
footer a {
  color: color-mix(in srgb, var(--blue) 50%, var(--fg));
}
.role .docs {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 4px;
  font-size: 0.84rem;
}
.role .docs a {
  text-decoration: none;
}
.role .docs a:hover {
  text-decoration: underline;
}
.role .docs a::before {
  content: "\2197  ";
  color: var(--muted);
}
.role a.all {
  margin-top: auto;
  padding-top: 4px;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
}
@media (max-width: 520px) {
  .install {
    white-space: normal;
    text-align: left;
  }
}
.hero .sig {
  text-wrap: balance;
}
@media (max-width: 520px) {
  .install {
    font-size: 0.78rem;
    padding: 11px 14px;
  }
}
.install b {
  color: #8fd18a;
  font-weight: 600;
}
.install {
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
.install .p {
  color: var(--cyan);
}
.cta {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;
}
.btn {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  /* Un `<button>` porte une bordure native : remise à zéro, sinon un
     liseré clair double le bouton plein. `.btn.ghost` pose la sienne. */
  border: 0;
  border-radius: 10px;
  padding: 11px 22px;
}
.btn.primary {
  color: #fff;
  background: var(--blue);
}
.btn.ghost {
  color: var(--fg);
  border: 1px solid var(--border);
  background: var(--card);
}

section {
  padding-block: clamp(30px, 5vw, 50px);
}
.sec-head {
  max-width: 720px;
  margin: 0 0 24px;
}
.kicker {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: color-mix(in srgb, var(--accent, var(--blue)) 50%, var(--fg));
}
.sec-head h2 {
  margin: 0 0 8px;
  font-size: clamp(1.4rem, 2.8vw, 1.85rem);
  letter-spacing: -0.02em;
  text-wrap: balance;
}
.sec-head p {
  margin: 0;
  color: var(--muted);
}

.level {
  margin-top: 26px;
}
.level h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px;
  font-size: 0.95rem;
}
.level h3 .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
}
.level h3 small {
  color: var(--muted);
  font-weight: 500;
}
.grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}
.card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-decoration: none;
  color: var(--fg);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  box-shadow: var(--shadow);
  min-width: 0;
}
a.card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-hover);
}
.card .top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card h4 {
  margin: 0;
  font-size: 1.05rem;
}
.card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.88rem;
}
.pill {
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 999px;
  padding: 2px 9px;
  white-space: nowrap;
  color: color-mix(in srgb, var(--accent) 55%, var(--fg));
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}
.pill.soon {
  color: var(--muted);
  background: var(--bg-soft);
}
.live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--fg);
}
.live::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ea043;
}
.card .go {
  margin-top: auto;
  padding-top: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--accent) 55%, var(--fg));
}
.card.soon {
  box-shadow: none;
  background: transparent;
  border-style: dashed;
}
.card.soon .go {
  color: var(--muted);
}

.features {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 820px) {
  .features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .features {
    grid-template-columns: minmax(0, 1fr);
  }
}
.feature {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
}
.feature h3 {
  margin: 0 0 4px;
  font-size: 1rem;
}
.feature p {
  margin: 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.agents-panel {
  --accent: var(--green);
  border: 1px solid color-mix(in srgb, var(--green) 34%, var(--border));
  border-radius: 18px;
  padding: clamp(20px, 4vw, 36px);
  background: var(--card);
}
.agents-panel pre {
  margin: 16px 0 0;
  /* Passe à la ligne plutôt que défiler : un bloc qui défile devrait être
     atteignable au clavier, et un `pre` n'est pas interactif. */
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: var(--code-bg);
  color: var(--code-fg);
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 0.82rem;
  line-height: 1.5;
}
.agents-panel ul {
  margin: 16px 0 0;
  padding-left: 18px;
  color: var(--muted);
  font-size: 0.9rem;
}

/*
 * Bandes pleine largeur sans débordement : l'ombre peint le fond jusqu'aux
 * bords de l'écran, le clip-path la retient à la hauteur de la section — la
 * page ne défile jamais de côté.
 */
#catalogue,
#agents,
footer {
  box-shadow: 0 0 0 100vmax var(--band-bg);
  clip-path: inset(0 -100vmax);
  background: var(--band-bg);
}
#catalogue,
#agents {
  --band-bg: var(--bg-soft);
}
main:has(> footer) {
  padding-bottom: 0;
}
footer {
  --band-bg: var(--footer-bg);
  margin-top: 0;
  padding-block: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
  justify-content: space-between;
  color: var(--footer-fg);
  font-size: 0.85rem;
}
footer a {
  text-decoration: none;
}
footer a,
footer code {
  color: var(--footer-link);
}
/* ═══ Effets — CSS natif, piloté par le défilement (aucun écouteur de scroll).
   `--spin`, `--spring` et la place de la barre de debug viennent de
   `showcase.css`. ═══ */
html {
  scroll-behavior: smooth;
  scroll-padding-top: 84px;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--muted) 45%, transparent) transparent;
}
::selection {
  background: color-mix(in srgb, var(--cyan) 30%, transparent);
}
pre {
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
}

/* Fil de lecture : la progression dans la page, sur l'horloge du défilement. */
.reading {
  position: fixed;
  top: env(safe-area-inset-top, 0px);
  left: 0;
  right: 0;
  height: 2px;
  z-index: 35;
  transform-origin: 0 50%;
  transform: scaleX(0);
  pointer-events: none;
  background: linear-gradient(90deg, var(--blue), var(--cyan), var(--green));
}

/* Fond du hero : deux halos qui dérivent lentement derrière le logo. */
.hero {
  position: relative;
  isolation: isolate;
}
.hero::before,
.hero::after {
  content: "";
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  pointer-events: none;
}
.hero::before {
  width: 420px;
  height: 300px;
  top: 4%;
  left: calc(50% - 360px);
  background: color-mix(in srgb, var(--blue) 26%, transparent);
}
.hero::after {
  width: 360px;
  height: 280px;
  top: 10%;
  left: calc(50% - 20px);
  background: color-mix(in srgb, var(--green) 18%, transparent);
}
.hero h1 {
  background: linear-gradient(
    180deg,
    var(--fg) 55%,
    color-mix(in srgb, var(--fg) 62%, var(--blue))
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Commande d'installation : bordure en dégradé conique qui tourne. */
.install {
  position: relative;
  border: 0;
}
.install::before {
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

/* Cartes : lumière qui suit le pointeur, élévation à ressort, voisines atténuées. */
.card,
.role,
.feature {
  position: relative;
  isolation: isolate;
  transition:
    transform 0.5s var(--spring),
    box-shadow 0.3s ease,
    border-color 0.3s ease,
    opacity 0.3s ease;
}
.card::before,
.role::before {
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
    color-mix(in srgb, var(--accent, var(--cyan)) 14%, transparent),
    transparent 70%
  );
}
.card:hover::before,
.role:hover::before {
  opacity: 1;
}
.grid:has(a.card:hover) .card:not(:hover),
.roles:has(.role:hover) .role:not(:hover) {
  opacity: 0.62;
}
.role:hover {
  border-color: color-mix(in srgb, var(--cyan) 45%, var(--border));
}
.card .go {
  transition: letter-spacing 0.3s ease;
}
a.card:hover .go {
  letter-spacing: 0.02em;
}

/* « En direct » : un anneau qui respire. */
.live::before {
  box-shadow: 0 0 0 0 rgba(46, 160, 67, 0.55);
}

/* Lien de navigation de la section en cours (posé par l'observateur). */
.topnav a[aria-current="true"] {
  color: var(--fg);
  background: var(--bg-soft);
}

@media print {
  *,
  *::before,
  *::after {
    animation: none !important;
  }
  .reading {
    display: none;
  }
}
@media (prefers-reduced-motion: no-preference) {
  @keyframes nf-read {
    to {
      transform: scaleX(1);
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
  @keyframes nf-ping {
    70% {
      box-shadow: 0 0 0 7px rgba(46, 160, 67, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(46, 160, 67, 0);
    }
  }
  .hero::before {
    animation: nf-drift 14s ease-in-out infinite;
  }
  .hero::after {
    animation: nf-drift 17s ease-in-out infinite reverse;
  }
  .install::before {
    animation: nf-spin 6s linear infinite;
  }
  .live::before {
    animation: nf-ping 2.2s ease-out infinite;
  }
  a.card:hover,
  .role:hover {
    transform: translateY(-4px);
  }
  @supports (animation-timeline: scroll()) {
    .reading {
      animation: nf-read linear both;
      animation-timeline: scroll(root);
    }
    .topbar {
      animation: nf-bar linear both;
      animation-timeline: scroll(root);
      animation-range: 0 160px;
    }
    .sec-head,
    .level,
    .role,
    .feature,
    .agents-panel {
      animation: nf-rise linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 55%;
    }
  }
}
/* Catalogue : 4 démos par niveau → 4 colonnes, sans trou. */
.grid {
  grid-template-columns: minmax(0, 1fr);
}
@media (min-width: 560px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1000px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
/* Démo à venir : grisée (pas d'opacité — le texte doit rester lisible). */
.card.soon {
  filter: grayscale(1);
  background: var(--bg-soft);
  border-style: dashed;
  box-shadow: none;
  cursor: default;
}
.card.soon h4 {
  color: var(--muted);
}
.card.soon::before {
  display: none;
}
/* Niveau de la démo : étiquette en pied de carte (D6). */
.card .foot {
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card .foot .go {
  margin: 0;
  padding: 0;
}
/* Démo sans page : sa commande, sur sa propre ligne, au-dessus du pied. */
.card .cmd {
  margin-top: auto;
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}
.card .cmd + .foot {
  margin-top: 0;
}
.lvl {
  font-size: 0.72rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
}
.lvl::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.lvl.l1::before {
  background: var(--green);
}
.lvl.l2::before {
  background: var(--blue);
}
.lvl.l3::before {
  background: var(--violet);
}
.lvl.l3::after {
  content: "";
}
/* ═══ La marque qui reste : relais logo + titre → barre du haut ═══
   Une seule ligne de temps (--hero), celle de la marque qui SORT de l'écran ;
   timeline-scope la rend visible à la barre, qui n'est pas son ancêtre. */
body {
  timeline-scope: --hero;
}
.hero-mark {
  view-timeline: --hero block;
  display: grid;
  justify-items: center;
}
.brand-logo {
  width: 22px;
  height: 34px;
  background: var(--demo-logo) center / contain no-repeat;
  flex: none;
}
.brand-mini {
  font-weight: 600;
  font-size: 0.86rem;
  color: var(--muted);
  white-space: nowrap;
  padding-left: 10px;
  border-left: 1px solid var(--border);
}
@media (max-width: 1279px) {
  .brand-mini {
    display: none;
  }
}
.hero-logo {
  filter: drop-shadow(
    0 10px 28px color-mix(in srgb, var(--blue) 35%, transparent)
  );
}
.hero h1 {
  background-image: linear-gradient(
    100deg,
    var(--fg) 0 42%,
    color-mix(in srgb, var(--cyan) 70%, var(--fg)) 50%,
    var(--fg) 58% 100%
  );
  background-size: 260% 100%;
  background-position: 0% 0;
}
@media (prefers-reduced-motion: no-preference) {
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
  .hero-logo {
    animation: nf-logo-in 1.1s var(--spring) backwards;
  }
  .hero h1 {
    animation:
      nf-title-in 0.9s 0.15s cubic-bezier(0.2, 0.8, 0.2, 1) backwards,
      nf-sheen 2.2s 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  }
  @supports (animation-timeline: view()) {
    @keyframes nf-mark-out {
      to {
        opacity: 0;
        transform: translateY(-36px) scale(0.55);
        filter: blur(6px);
      }
    }
    @keyframes nf-brand-in {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.4);
      }
    }
    @keyframes nf-mini-in {
      from {
        opacity: 0;
        transform: translateX(-12px);
        clip-path: inset(0 100% 0 0);
      }
    }
    .hero-mark {
      animation: nf-mark-out linear both;
      animation-timeline: --hero;
      animation-range: exit 0% exit 100%;
    }
  }
}
/* ═══ Outils d'affichage : thème, puis la barre de debug (développement) ═══ */
.tools {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--card);
}
.dbg-btn {
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
.dbg-btn svg {
  width: 17px;
  height: 17px;
}
.dbg-btn:hover {
  background: var(--bg-soft);
  color: var(--fg);
}
.dbg-btn[aria-pressed="true"] {
  color: color-mix(in srgb, var(--blue) 55%, var(--fg));
  background: color-mix(in srgb, var(--blue) 12%, transparent);
}
.dbg-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
/* Pastille : la barre réduite dans un coin — elle ne réserve plus de hauteur. */
@media (prefers-reduced-motion: no-preference) {
  body {
    transition: padding-bottom 0.25s ease;
  }
}

/* ═══ Téléphone : la barre du haut tient sur UNE ligne, la navigation défile ═══ */
@media (max-width: 1199px) {
  .topbar {
    flex-wrap: nowrap;
    gap: 10px;
  }
  .brand {
    flex: none;
  }
  .brand .tag:not(.ver) {
    display: none;
  }
  .topnav {
    flex-wrap: nowrap;
    overflow-x: auto;
    min-width: 0;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
    -webkit-mask-image: linear-gradient(90deg, #000 88%, transparent);
    mask-image: linear-gradient(90deg, #000 88%, transparent);
  }
  .topnav::-webkit-scrollbar {
    display: none;
  }
  .topnav a {
    flex: none;
    white-space: nowrap;
  }
}
@media (max-width: 520px) {
  .install {
    display: flex;
    width: 100%;
    overflow: visible;
  }
  .install span:last-child {
    min-width: 0;
    overflow-wrap: anywhere;
    white-space: normal;
  }
}
/* Téléphone étroit : identité et outils en haut, la navigation dessous. */
@media (max-width: 640px) {
  .topbar {
    flex-wrap: wrap;
    row-gap: 8px;
  }
  .topbar-tools {
    margin-left: auto;
    gap: 6px;
  }
  .topbar-tools a.login {
    padding: 7px 10px;
  }
  /* La version reste lisible dans « À propos » : ici, la place va aux outils. */
  .brand .tag.ver {
    display: none;
  }
  .topnav {
    order: 3;
    flex-basis: 100%;
    margin-left: 0;
  }
}
/* Une option ne se coupe pas : « --demo » sur deux lignes se lirait « - » puis « -demo ». */
.install b {
  white-space: nowrap;
}
/* ═══ Identité de la barre : application ↔ Nodefony, au défilement ═══
   Les deux identités partagent UNE case de grille : la plus large fixe la
   place, aucune ne pousse la navigation quand l'autre apparaît. */
.brand {
  display: grid;
  align-items: center;
}
.brand .id {
  grid-area: 1 / 1;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}
/* Opacité SEULE, jamais `visibility` : les deux identités restent dans
   l'arbre d'accessibilité, et le nom du lien contient le texte visible
   avant comme après la bascule (WCAG 2.5.3). */
.brand .id-nf {
  opacity: 0;
}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    @keyframes nf-id-out {
      to {
        opacity: 0;
        transform: translateY(-10px);
        filter: blur(3px);
      }
    }
    @keyframes nf-id-in {
      from {
        opacity: 0;
        transform: translateY(10px);
        filter: blur(3px);
      }
      to {
        opacity: 1;
        visibility: visible;
      }
    }
    .brand .id-app {
      animation: nf-id-out linear both;
      animation-timeline: --hero;
      animation-range: exit 30% exit 65%;
    }
    .brand .id-nf {
      animation: nf-id-in linear both;
      animation-timeline: --hero;
      animation-range: exit 45% exit 100%;
    }
  }
}
/* Sans ligne de temps (Firefox) ou mouvement réduit : l'application seule. */
/* ═══ « Selon qui tu es » : onglets de métier + UN panneau paysage ═══ */
.rswitch {
  --r-accent: var(--blue);
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--card);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.rtabs {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg-soft) 70%, var(--card));
  overflow-x: auto;
  scrollbar-width: none;
}
.rtab {
  flex: 1 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--muted);
  background: transparent;
  border: 0;
  border-radius: 12px;
  padding: 11px 16px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}
.rtab svg {
  width: 18px;
  height: 18px;
  flex: none;
}
.rtab:hover {
  color: var(--fg);
  background: color-mix(in srgb, var(--card) 70%, transparent);
}
.rtab[aria-selected="true"] {
  color: var(--fg);
  background: var(--card);
  box-shadow:
    0 1px 2px rgba(14, 23, 38, 0.08),
    0 0 0 1px var(--border);
}
.rtab[aria-selected="true"] svg {
  color: color-mix(in srgb, var(--blue) 70%, var(--fg));
}
.rpanel {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 22px;
  padding: clamp(20px, 3vw, 32px);
  view-transition-name: rpanel;
}
.rpanel[hidden] {
  display: none;
}
@media (min-width: 860px) {
  .rpanel {
    grid-template-columns: minmax(0, 5fr) minmax(0, 8fr);
    gap: 36px;
    min-height: 300px;
  }
}
.rpanel-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}
.rpanel-ic {
  display: inline-grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  color: color-mix(in srgb, var(--blue) 75%, var(--fg));
  background: color-mix(in srgb, var(--blue) 11%, transparent);
}
.rpanel[data-kind="demo"] .rpanel-ic {
  color: color-mix(in srgb, var(--green) 75%, var(--fg));
  background: color-mix(in srgb, var(--green) 12%, transparent);
}
.rpanel-ic svg {
  width: 24px;
  height: 24px;
}
.rpanel-side h3 {
  margin: 4px 0 0;
  font-size: clamp(1.25rem, 2.2vw, 1.55rem);
  letter-spacing: -0.02em;
}
.rpanel-side p {
  margin: 0;
  color: var(--muted);
  font-size: 0.98rem;
  max-width: 36ch;
}
.rpanel-meta {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--muted);
}
.rpanel-cta {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  color: #fff;
  background: var(--blue);
  border-radius: 10px;
  padding: 10px 18px;
  transition:
    transform 0.4s var(--spring),
    background 0.2s ease;
}
.rpanel-cta:hover {
  background: color-mix(in srgb, var(--blue) 86%, #000);
}
.rpanel-list {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
}
@media (min-width: 560px) {
  .rpanel-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.ritem {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: "t go" "d d";
  gap: 4px 10px;
  text-decoration: none;
  color: var(--fg);
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.45s var(--spring);
}
.steps .ritem {
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas: "n t go" "n d d";
}
.ritem-t {
  grid-area: t;
  font-weight: 650;
  font-size: 0.95rem;
}
.ritem-d {
  grid-area: d;
  color: var(--muted);
  font-size: 0.85rem;
  line-height: 1.45;
}
.ritem-go {
  grid-area: go;
  font-size: 0.8rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--blue) 55%, var(--fg));
  transition: transform 0.3s var(--spring);
}
.step {
  grid-area: n;
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: color-mix(in srgb, var(--green) 60%, var(--fg));
  background: color-mix(in srgb, var(--green) 13%, transparent);
}
a.ritem:hover {
  border-color: color-mix(in srgb, var(--cyan) 50%, var(--border));
  background: var(--card);
}
a.ritem:hover .ritem-go {
  transform: translate(3px, -1px);
}
.ritem.soon {
  filter: grayscale(1);
  background: var(--bg-soft);
  border-style: dashed;
}
.ritem.soon .ritem-t {
  color: var(--muted);
}
.ritem.soon .ritem-go {
  color: var(--muted);
  font-weight: 500;
}
@media (prefers-reduced-motion: no-preference) {
  a.ritem:hover,
  .rpanel-cta:hover {
    transform: translateY(-2px);
  }
  ::view-transition-old(rpanel) {
    animation: nf-vt-out 0.18s ease both;
  }
  ::view-transition-new(rpanel) {
    animation: nf-vt-in 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
  @keyframes nf-vt-out {
    to {
      opacity: 0;
      transform: translateX(-12px);
    }
  }
  @keyframes nf-vt-in {
    from {
      opacity: 0;
      transform: translateX(14px);
    }
  }
}
/* Titre de carte : jamais écrasé par sa pastille — elle passe à la ligne. */
.card .top {
  flex-wrap: wrap;
  align-items: flex-start;
  row-gap: 6px;
}
.card h4 {
  flex: 1 1 auto;
}
/* Onglets : se lisent comme CLIQUABLES, sans crier. */
.rtabs {
  align-items: center;
}
.rtabs-hint {
  flex: none;
  padding: 0 6px 0 8px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}
.rtab {
  position: relative;
  border: 1px solid color-mix(in srgb, var(--border) 85%, transparent);
  background: color-mix(in srgb, var(--card) 55%, transparent);
}
.rtab:hover {
  border-color: color-mix(in srgb, var(--cyan) 45%, var(--border));
  color: var(--fg);
}
.rtab::after {
  content: "";
  position: absolute;
  left: 22%;
  right: 22%;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--blue);
  transform: scaleX(0);
  transition: transform 0.35s var(--spring);
}
.rtab[aria-selected="true"] {
  border-color: var(--border);
}
.rtab[aria-selected="true"]::after {
  transform: scaleX(1);
}
@media (prefers-reduced-motion: no-preference) {
  .rtab {
    transition:
      color 0.2s ease,
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.35s var(--spring);
  }
  .rtab:not([aria-selected="true"]):hover {
    transform: translateY(-1px);
  }
}
@media (max-width: 760px) {
  .rtabs-hint {
    display: none;
  }
}

/* ═══ Page d'apprentissage (/demo/chat…) : le gabarit commun des démos ═══ */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
.lesson {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-top: 24px;
}
.crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--muted);
}
.crumbs .sock {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.crumbs .sock::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--muted);
}
.crumbs .sock-connected::before {
  background: #2ea043;
}
/* Les sections d'une leçon se suivent de près : l'espacement est celui de
   `.lesson`, pas la marge des sections de l'accueil. */
.lesson section {
  padding-block: 0;
}
.lesson-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.lesson-meta .lesson-step {
  margin: 0;
}
.lesson-intro {
  max-width: 800px;
}
.lesson-intro h1 {
  margin: 8px 0 12px;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  line-height: 1.2;
}
.lesson-intro p {
  margin: 0;
  line-height: 1.6;
}
.lesson-step {
  margin: 0 0 12px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}
.room {
  display: flex;
  flex-direction: column;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.room-unread {
  flex: none;
  min-width: 1.35rem;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-align: center;
  /* Blanc sur le bleu de la page : ≥ 5:1 dans les deux thèmes. */
  color: #fff;
  background: var(--blue);
}
.room-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
}
.room-typing {
  min-height: 34px;
  padding: 0 16px 8px;
}
.typing-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 10px;
  font-size: 0.82rem;
  color: var(--fg);
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 999px;
  box-shadow: var(--shadow);
}
.typing-dots {
  display: inline-flex;
  gap: 3px;
}
.typing-dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyan);
}
@media (prefers-reduced-motion: no-preference) {
  .typing-pill {
    animation: nf-typing-in 0.18s ease-out;
  }
  .typing-dots i {
    animation: nf-typing 1.2s ease-in-out infinite;
  }
  .typing-dots i:nth-child(2) {
    animation-delay: 0.15s;
  }
  .typing-dots i:nth-child(3) {
    animation-delay: 0.3s;
  }
  @keyframes nf-typing-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
  }
  @keyframes nf-typing {
    0%,
    60%,
    100% {
      opacity: 0.35;
      transform: translateY(0);
    }
    30% {
      opacity: 1;
      transform: translateY(-3px);
    }
  }
}
.room-list {
  list-style: none;
  margin: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
/* La liste DÉFILE dans sa propre hauteur, le champ d'écriture reste visible.
   Pas d'`overscroll-behavior: contain` : arrivée au bout, la molette rend la
   main à la page — aucune zone ne la retient. Ses messages se joignent au
   clavier (↑/↓), ce qui la rend atteignable (WCAG 2.1.1). */
.room-log-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.room-log {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
}
.room-unseen {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.35rem 0.9rem;
  color: #fff;
  background: var(--blue);
  border: none;
  border-radius: 999px;
  box-shadow: var(--shadow);
  cursor: pointer;
}
.room-unseen:focus-visible {
  outline: 2px solid var(--fg);
  outline-offset: 2px;
}
/* Enfant DIRECT : les listes d'un message (Markdown, archive) gardent leur flux. */
.room-list > li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.room-meta {
  font-size: 0.78rem;
  color: var(--muted);
}
.room-meta strong {
  color: var(--fg);
}
.room-text {
  overflow-wrap: anywhere;
}
/* Un message : un seul arrêt de tabulation pour la liste (↑/↓), le menu
   d'actions en haut à droite, visible au survol, au focus, et toujours sur
   un écran sans survol (tactile). */
.room-msg {
  position: relative;
  /* Ajusté à sa bulle : le bouton d'actions se pose juste à côté d'elle. */
  align-self: flex-start;
  width: fit-content;
  max-width: 100%;
  /* Enfant direct de la liste : la règle `.room-list > li` le met en colonne. */
  align-items: flex-start;
  padding: 2px 44px 2px 8px;
  margin: 0 -8px;
  border-radius: 10px;
}
/* MES messages à droite, ceux des autres à gauche : la position, la forme de
   la bulle et « Vous » portent la différence — jamais la couleur seule
   (WCAG 1.4.1). */
.room-msg.is-mine {
  align-self: flex-end;
  align-items: flex-end;
  padding: 2px 8px 2px 44px;
}
/* Un groupe du même auteur : serré sous le message précédent. */
.room-list > li.room-msg.is-continued {
  margin-top: -9px;
}
.room-msg:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 1px;
}
.msg-bubble {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  /* Une bulle de texte garde une ligne lisible (~80 caractères) ; une bulle
     qui porte du code ou une pièce prend TOUT le fil (plus bas). */
  max-width: min(100%, 80ch);
  padding: 6px 12px;
  /* Celle des autres : une surface ÉLEVÉE, neutre et sans bordure — un
     voile du texte sur la carte (l'élévation du thème sombre de Material) ;
     en clair, le même calcul donne un gris léger. */
  background: color-mix(in srgb, var(--fg) 7%, transparent);
  border: 1px solid transparent;
  border-radius: 14px 14px 14px 4px;
  overflow-wrap: anywhere;
}
/* La MIENNE : un voile translucide de l'accent et un filet de la même
   teinte — le fond passe, rien n'éblouit, en clair comme en sombre. Le texte
   garde la couleur de la page (du blanc sur un voile clair ne se lirait
   plus). Une bulle retirée ou en cours de modification reste neutre. */
.is-mine:not(.is-retracted) .msg-bubble:not(.is-editing) {
  background: var(--accent-bubble);
  border-color: color-mix(in srgb, var(--blue) 28%, transparent);
}
.is-mine .msg-bubble {
  border-radius: 14px 14px 4px 14px;
}
.is-continued.is-other .msg-bubble {
  border-top-left-radius: 4px;
}
.is-continued.is-mine .msg-bubble {
  border-top-right-radius: 4px;
}
.msg-bubble.is-editing {
  width: 100%;
  max-width: 100%;
}
.room-msg:has(.is-editing) {
  width: 100%;
}
.is-retracted .msg-bubble {
  background: transparent;
  border: 1px dashed var(--border);
}
.is-other:hover .msg-bubble,
.is-other:focus-within .msg-bubble {
  background: color-mix(in srgb, var(--fg) 10%, transparent);
}
/* UNE règle pour toute boîte dans une boîte. Une SURFACE déjà encadrée —
   bulle de message, aperçu de l'éditeur, bulle de survol — ne double pas le
   cadre de ce qu'elle porte : un bloc (JSON, tableau, code, diff, formule)
   y perd son cadre, une pièce son cadre et son fond. Les fonds propres d'un
   bloc (le code sombre, le JSON) restent les siens. */
:is(.msg-bubble, .md-preview, .bubble) :is(.nb, .att-box) {
  border-color: transparent;
}
:is(.msg-bubble, .md-preview, .bubble) :is(.att-box, .att-pill) {
  background: transparent;
}
:is(.msg-bubble, .md-preview, .bubble) .att-pill,
:is(.msg-bubble, .md-preview, .bubble) .nb-copy {
  border-color: color-mix(in srgb, var(--border) 60%, transparent);
}
:is(.msg-bubble, .md-preview, .bubble) .nb-table :is(th, td) {
  border-color: color-mix(in srgb, var(--border) 55%, transparent);
}
/* Une bulle de message qui porte un bloc ou une pièce s'ALLÈGE : un voile à
   peine marqué et une marge fine. `:not(.bubble *)` : ce que montre une
   bulle de SURVOL ne compte pas — sinon l'ouvrir changerait la forme du
   message, la pastille quitterait le pointeur, la bulle se fermerait, et
   tout recommencerait (clignotement). */
.msg-bubble:has(:is(.nb, .att-box):not(.bubble *)) {
  padding: 4px;
  background: color-mix(in srgb, var(--fg) 3%, transparent);
}
/* Du code, un tableau, une pièce : la bulle prend toute la largeur du fil. */
.room-msg:has(.msg-bubble :is(.nb, .att-box):not(.bubble *)) {
  width: 100%;
}
.msg-bubble:has(:is(.nb, .att-box):not(.bubble *)) {
  width: 100%;
  max-width: 100%;
}
.is-mine:not(.is-retracted)
  .msg-bubble:not(.is-editing):has(:is(.nb, .att-box):not(.bubble *)) {
  background: color-mix(in srgb, var(--blue) 8%, transparent);
  border-color: color-mix(in srgb, var(--blue) 18%, transparent);
}
.msg-actions {
  position: absolute;
  top: 2px;
  right: 4px;
}
.is-mine .msg-actions {
  right: auto;
  left: 4px;
}
.msg-menu-btn {
  font: inherit;
  min-width: 28px;
  min-height: 28px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--card);
  color: var(--fg);
  cursor: pointer;
  opacity: 0;
}
.room-msg:hover .msg-menu-btn,
.room-msg:focus-within .msg-menu-btn,
.room-msg.is-active .msg-menu-btn,
.msg-menu-btn[aria-expanded="true"] {
  opacity: 1;
}
/* Au doigt, pas de survol : le bouton n'existe que sur le message touché
   (ou actif) — un ⋯ par message encombrait le petit écran, et un bouton
   transparent restait touchable sans se voir. */
@media (hover: none) {
  .msg-menu-btn {
    opacity: 1;
    visibility: hidden;
  }
  .room-msg:focus-within .msg-menu-btn,
  .room-msg.is-active .msg-menu-btn,
  .msg-menu-btn[aria-expanded="true"] {
    visibility: visible;
  }
}
/* Placé par rapport à l'ÉCRAN (le composant calcule `top`/`left`) : la
   liste qui défile ne le coupe plus. */
.msg-menu {
  position: fixed;
  z-index: 30;
  min-width: 200px;
  padding: 4px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow);
}
.msg-menu-react {
  display: flex;
  gap: 2px;
  padding-bottom: 4px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--border);
}
.msg-menu-react [role="menuitemcheckbox"] {
  display: grid;
  place-items: center;
  min-width: 30px;
  min-height: 30px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 1.05rem;
}
.msg-menu-react [aria-checked="true"] {
  background: color-mix(in srgb, var(--link) 22%, var(--card));
}
.msg-menu-item {
  padding: 6px 10px;
  min-height: 30px;
  border-radius: 7px;
  cursor: pointer;
}
.msg-menu [role^="menuitem"]:hover,
.msg-menu [role^="menuitem"]:focus {
  outline: none;
  background: color-mix(in srgb, var(--link) 18%, var(--card));
}
.room-edited {
  font-style: italic;
}
/* La citation d'un message auquel on répond : un bloc qui se voit — fond
   teinté, barre bleue, « Réponse à X » puis l'extrait. Le même dans la liste
   et au-dessus du champ. */
.room-quote,
.composer-reply-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.room-quote {
  font: inherit;
  text-align: left;
  color: var(--fg);
  background: color-mix(in srgb, var(--blue) 8%, transparent);
  border: none;
  border-left: 3px solid var(--blue);
  border-radius: 0 7px 7px 0;
  padding: 4px 10px;
  margin: 3px 0 4px;
  max-width: min(100%, 560px);
}
button.room-quote {
  cursor: pointer;
}
button.room-quote:hover {
  background: color-mix(in srgb, var(--blue) 15%, transparent);
}
button.room-quote:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}
.quote-head {
  font-size: 0.78rem;
  color: var(--muted);
}
.quote-head strong {
  color: color-mix(in srgb, var(--blue) 50%, var(--fg));
}
.quote-text {
  font-size: 0.88rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Le message cité où l'on vient de sauter : surligné un instant. */
.room-msg.is-flash {
  animation: msg-flash 1.6s ease-out;
}
@keyframes msg-flash {
  from {
    background: color-mix(in srgb, var(--blue) 28%, transparent);
  }
  to {
    background: transparent;
  }
}
@media (prefers-reduced-motion: reduce) {
  .room-msg.is-flash {
    animation: none;
    background: color-mix(in srgb, var(--blue) 18%, transparent);
  }
}
.room-retracted {
  margin: 0;
  font-style: italic;
  color: var(--muted);
}
.msg-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}
.msg-chip {
  font: inherit;
  font-size: 0.82rem;
  min-height: 26px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--card);
  color: var(--fg);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
button.msg-chip {
  cursor: pointer;
}
button.msg-chip[aria-pressed="true"] {
  border-color: var(--link);
  background: color-mix(in srgb, var(--link) 18%, var(--card));
}
.msg-confirm {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.88rem;
}
.room-btn.is-danger {
  color: var(--on-danger);
  background: var(--danger);
  border-color: var(--danger);
}
.msg-edit-actions {
  display: inline-flex;
  gap: 6px;
}
.room-msg .room-error {
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: var(--danger);
}
.composer-reply {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px;
  padding: 4px 4px 4px 10px;
  background: color-mix(in srgb, var(--blue) 9%, var(--card));
  border-left: 3px solid var(--blue);
  border-radius: 0 7px 7px 0;
}
.composer-reply-body {
  flex: 1;
}
/* Les liens du salon (message, téléchargement) : le bleu mêlé au texte, lisible
   dans les deux thèmes — le bleu seul tombe à 3,3:1 sur le fond sombre. */
.room-list a {
  color: color-mix(in srgb, var(--blue) 50%, var(--fg));
}
/* Le Markdown du salon : des marges courtes, un message reste compact. */
.md p,
.md ul,
.md ol,
.md blockquote,
.md pre {
  margin: 0 0 4px;
}
.md > :last-child {
  margin-bottom: 0;
}
.md ul,
.md ol {
  padding-left: 1.4em;
}
.md blockquote {
  padding-left: 10px;
  color: var(--muted);
  border-left: 3px solid var(--border);
}
.md code {
  padding: 1px 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88em;
  background: var(--bg-soft);
  border-radius: 4px;
}
.md pre {
  padding: 8px 10px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.md pre code {
  padding: 0;
  background: none;
}
.room-empty {
  color: var(--muted);
}
.room-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  background: var(--bg-soft);
}
.room-foot p {
  flex: 1 1 220px;
  margin: 0;
  font-size: 0.9rem;
}
.room-foot .room-error {
  flex-basis: 100%;
  margin: 0;
  color: #c62828;
}
/* La zone d'écriture : pastilles en attente au-dessus, outils, champ, envoi. */
.composer {
  flex-direction: column;
  align-items: stretch;
  /* Le champ est COLLÉ au salon : pas de bande autour, un seul trait en haut. */
  padding: 0;
  gap: 0;
  border-top: 0;
  background: none;
}
.composer .md-editor {
  border-width: 1px 0 0;
  border-radius: 0;
}
/* Actif : un contour intérieur — il ne déborde pas d'un bord collé. */
.composer .md-editor:focus-within {
  border-top-color: color-mix(in srgb, var(--fg) 45%, var(--border));
}
.composer .room-error {
  padding: 0 16px 10px;
}
.composer.dragging {
  outline: 2px dashed var(--cyan);
  outline-offset: -6px;
}
/* L'éditeur Markdown du kit : UNE boîte — pièces, champ, puis la barre. */
.md-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
}
/* Actif : le trait s'ASSOMBRIT, sobrement — ni couleur criarde ni halo ; le
   curseur clignotant dit le reste. Les contours francs restent à la
   navigation au CLAVIER (`:focus-visible` des boutons et des onglets). */
.md-editor:focus-within {
  border-color: color-mix(in srgb, var(--fg) 45%, var(--border));
}
.md-editor textarea {
  min-height: 48px;
  max-height: 240px;
  padding: 6px 6px 2px;
  font: inherit;
  line-height: 1.45;
  color: var(--fg);
  background: none;
  border: 0;
  outline: none;
  resize: none;
  field-sizing: content;
}
/* L'aperçu prend la place du champ, sans seconde boîte : même marge. */
.md-preview {
  min-height: 48px;
  max-height: 240px;
  overflow: auto;
  padding: 6px 6px 2px;
}
.md-empty {
  margin: 0;
  color: var(--muted);
}
.md-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}
.md-formats {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-left: 4px;
  padding-left: 6px;
  border-left: 1px solid var(--border);
}
.md-tool {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  font-size: 0.95rem;
  color: var(--fg);
  background: none;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.md-tool:hover:not(:disabled),
.md-tool[aria-expanded="true"] {
  background: var(--bg-soft);
}
.md-tool:disabled {
  opacity: 0.45;
  cursor: default;
}
.md-tool-b {
  font-weight: 700;
}
.md-tool-i {
  font-style: italic;
  font-family: Georgia, serif;
}
.md-tool-e {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
.md-spacer {
  flex: 1 1 auto;
}
.md-bar {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  min-width: 0;
}
/* Les noms proposés sous une @mention en cours, au-dessus de la boîte. */
.md-mentions {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 8px;
  z-index: 5;
  min-width: 180px;
  max-width: calc(100% - 16px);
  margin: 0;
  padding: 4px;
  list-style: none;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow);
}
.md-mentions [role="option"] {
  min-height: 32px;
  padding: 6px 10px;
  overflow: hidden;
  border-radius: 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.md-mentions [role="option"]:hover,
.md-mentions [aria-selected="true"] {
  color: var(--fg);
  background: color-mix(in srgb, var(--link) 18%, var(--card));
}
/* Écrire / Aperçu : des onglets en tête du champ, comme un commentaire de
   forge. L'onglet choisi se fond dans le champ ; l'autre reste en retrait. */
.md-tabs {
  display: flex;
  /* Collés au bord HAUT du champ : la marge du champ est annulée. */
  margin: -8px -8px 0;
  padding: 0 8px;
  background: var(--bg-soft);
  border-bottom: 1px solid var(--border);
  border-radius: inherit;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.md-tabs [role="tab"] {
  min-height: 36px;
  padding: 0 14px;
  margin-bottom: -1px;
  font: inherit;
  font-size: 0.85rem;
  color: var(--muted);
  background: none;
  /* Pas de bord haut : celui du champ en tient lieu. */
  border: 1px solid transparent;
  border-top: 0;
  cursor: pointer;
}
.md-tabs [role="tab"]:hover {
  color: var(--fg);
}
.md-tabs [role="tab"][aria-selected="true"] {
  color: var(--fg);
  font-weight: 600;
  /* Se fond dans le champ : même fond, aucun trait dessous. */
  background: var(--card);
  border-left-color: var(--border);
  border-right-color: var(--border);
  border-bottom-color: var(--card);
}
.md-tabs [role="tab"]:first-child[aria-selected="true"] {
  margin-left: -8px;
  padding-left: 22px;
  border-left-color: transparent;
}
/* Le contour de focus se pose DEDANS : autour d'un onglet ou du panneau, il
   doublerait leur bord. */
.md-tabs [role="tab"]:focus-visible,
.md-preview:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: -3px;
}
.md-write {
  display: flex;
  flex-direction: column;
}
.md-write[hidden],
.md-preview[hidden] {
  display: none;
}
.md-send {
  margin-left: 6px;
}
.emoji-wrap {
  position: relative;
}
.emoji-grid {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(6, 40px);
  gap: 2px;
  padding: 6px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow);
}
.emoji-grid button {
  width: 40px;
  height: 40px;
  font-size: 1.25rem;
  background: none;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}
.emoji-grid button:hover,
.emoji-grid button:focus-visible {
  background: var(--bg-soft);
}
/* Les pièces en attente : les mêmes boîtes que le salon, et un retrait. */
.pending {
  list-style: none;
  margin: 0;
  padding: 0 0 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 1px solid var(--border);
}
.pending-piece {
  position: relative;
  width: min(420px, 100%);
}
/* La croix de retrait a sa place : le nom et la taille ne passent pas dessous. */
.pending-piece .att-head {
  padding-right: 32px;
}
.pending-reading {
  position: absolute;
  left: 10px;
  bottom: 8px;
  font-size: 0.78rem;
  color: var(--muted);
}
.pending-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  color: var(--muted);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 50%;
  cursor: pointer;
}
.pending-remove:hover {
  color: var(--fg);
}
.att-pre {
  margin: 4px 0 0;
  padding: 6px 8px;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--code-fg);
  background: var(--code-bg);
  border-radius: 6px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
/* Les pièces d'un message, dans la fenêtre du salon. */
.att-list {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.att-thumb {
  padding: 0;
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  cursor: zoom-in;
}
.att-thumb img {
  display: block;
  max-width: 220px;
  max-height: 160px;
  object-fit: cover;
}
.att-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: min(420px, 100%);
  padding: 10px 12px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.88rem;
}
.att-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.att-head strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.att-size {
  margin-left: auto;
  flex: none;
  color: var(--muted);
  font-size: 0.78rem;
}
.att-pre {
  margin: 0;
}
.att-actions {
  display: flex;
  gap: 14px;
  font-size: 0.82rem;
}
.att-actions button {
  padding: 0;
  font: inherit;
  color: inherit;
  text-decoration: underline;
  background: none;
  border: 0;
  cursor: pointer;
}
.att-gone {
  color: var(--muted);
  font-style: italic;
}
.att-dialog {
  max-width: min(92vw, 1200px);
  padding: 12px;
  color: var(--fg);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.att-dialog::backdrop {
  background: rgba(10, 15, 28, 0.7);
}
.att-dialog img {
  display: block;
  max-width: 100%;
  max-height: 80vh;
  margin: 0 auto;
}
.att-dialog p {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 0 0;
  font-size: 0.85rem;
}
/* La barre d'une visionneuse : en haut, le nom à gauche, les gestes à droite. */
.att-dialog .att-dialog-bar {
  justify-content: flex-start;
  align-items: center;
  margin: 0 0 8px;
}
.att-dialog-bar strong {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* La visionneuse d'un texte : la fenêtre a la taille de l'écran, la barre
   reste en haut, seul le texte défile — numéros et code côte à côte, sans
   retour à la ligne (une ligne de code coupée ne se lit plus). */
.att-dialog.att-viewer {
  width: min(96vw, 1400px);
  max-width: none;
  height: 90dvh;
  padding: 0;
  overflow: hidden;
}
.att-dialog.att-viewer[open] {
  display: flex;
  flex-direction: column;
}
.att-viewer .att-dialog-bar {
  flex: none;
  margin: 0;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}
.att-viewer > .att-note {
  margin: 16px;
}
.att-viewer-body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: flex-start;
  overflow: auto;
  background: var(--code-bg);
}
.att-viewer-body pre {
  margin: 0;
  padding: 12px 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  white-space: pre;
}
.att-gutter {
  position: sticky;
  left: 0;
  flex: none;
  text-align: right;
  color: var(--muted);
  background: var(--code-bg);
  border-right: 1px solid var(--border);
  user-select: none;
}
.att-code {
  flex: 1;
  color: var(--code-fg);
}
/* Les aperçus : PDF, archive, document, tableur. */
.att-pdf iframe {
  display: block;
  width: min(88vw, 1000px);
  height: 78vh;
  background: #fff;
  border: 0;
}
.att-note {
  margin: 0;
  color: var(--muted);
  font-size: 0.8rem;
}
.att-entries {
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
.att-entries li {
  display: flex;
  gap: 8px;
  min-width: 0;
}
.att-entry-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.att-more {
  color: var(--muted);
}
.att-doc p {
  margin: 0 0 6px;
}
.att-doc p:last-child {
  margin-bottom: 0;
}
/* Pas de défilement horizontal (le clavier ne l'atteindrait pas) : les
   cellules se replient dans la largeur de la boîte. */
.att-sheet {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 0.78rem;
}
.att-sheet td {
  padding: 3px 6px;
  overflow-wrap: anywhere;
  vertical-align: top;
  border: 1px solid var(--border);
}
.lesson-traps {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.lesson-traps > div {
  flex: 2 1 520px;
  min-width: 0;
}
.lesson-traps ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.lesson-traps li {
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  line-height: 1.5;
}
.further {
  flex: 1 1 280px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--cyan) 12%, var(--card));
  line-height: 1.5;
}
.further .lesson-step {
  margin: 0;
}
/* Le bleu brut tombe sous 3:1 sur le fond sombre : mêlé au texte, il passe
   dans les deux thèmes (même règle que le lien Documentation du haut). */
.further a,
.crumbs a {
  color: color-mix(in srgb, var(--blue) 50%, var(--fg));
}
.further code,
.lesson-traps code,
.step-summary code {
  overflow-wrap: anywhere;
}

/* Section 3 de la leçon : un onglet par étape du cookbook, le code cité. */
.lesson-code > p {
  margin: 0 0 14px;
  color: var(--muted);
}
.steps {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.step-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 6px 12px;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  cursor: pointer;
}
.step-tab:hover {
  color: var(--fg);
}
.step-tab[aria-selected="true"] {
  color: var(--fg);
  background: var(--card);
  border-color: color-mix(in srgb, var(--blue) 55%, var(--border));
}
.step-tab.soon {
  border-style: dashed;
}
.step-num {
  display: inline-grid;
  place-items: center;
  width: 1.4em;
  height: 1.4em;
  border-radius: 50%;
  font-size: 0.8em;
  background: color-mix(in srgb, var(--blue) 18%, transparent);
}
.step-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.step-summary,
.step-soon {
  margin: 0;
}
.step-soon {
  color: var(--muted);
  font-style: italic;
}
.excerpt {
  margin: 0;
  min-width: 0;
}
.excerpt figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 0.8rem;
  color: var(--muted);
}
.excerpt pre {
  margin: 0;
  /* Passe à la ligne plutôt que défiler : un `pre` n'est pas interactif. */
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding: 14px 16px;
  font-size: 0.9rem;
  line-height: 1.55;
  background: var(--code-bg);
  color: var(--code-fg);
  border-radius: 10px;
}
.step-doc {
  align-self: flex-start;
  color: color-mix(in srgb, var(--blue) 50%, var(--fg));
}

/* Coloration des extraits (highlight.ts) — le fond du code est sombre dans
   les deux thèmes : une seule palette, chaque teinte au-delà de 7:1. */
.tok-comment {
  color: #9fb0c8;
  font-style: italic;
}
.tok-string {
  color: #b5e3a0;
}
.tok-keyword {
  color: #d2b8ff;
}
.tok-decorator {
  color: #ffd27a;
  font-weight: 700;
}
.tok-type {
  color: #8fdcff;
}
.tok-number {
  color: #ffbf98;
}
.block-text code,
.tab-decorators dd code {
  font-size: 0.92em;
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--bg-soft);
}
/* Un onglet : des paragraphes qui suivent la logique métier, chacun suivi
   du code qu'il explique. */
.block + .block {
  margin-top: 22px;
}
.block-text {
  margin: 0 0 10px;
  max-width: 78ch;
  line-height: 1.6;
}
.excerpt-file {
  font-weight: 600;
  color: var(--fg);
}
.excerpt-step {
  padding: 0 8px;
  color: var(--fg);
  border-radius: 999px;
  background: color-mix(in srgb, var(--blue) 14%, transparent);
}
/* Les décorateurs de l'onglet : une ligne chacun, sans carte. */
.tab-decorators {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 14px;
  margin: 24px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  font-size: 0.88rem;
}
.tab-decorators > div {
  display: contents;
}
.tab-decorators dt code {
  font-weight: 700;
  color: color-mix(in srgb, var(--violet) 60%, var(--fg));
}
.tab-decorators dd {
  margin: 0;
  line-height: 1.5;
}
.decorator-from {
  color: var(--muted);
  font-size: 0.92em;
}

/* Page « API entre programmes » : les essais, dans l'ordre, chacun avec sa
   réponse réelle. */
.trials {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.trial {
  padding: 16px 18px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
}
.trial-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.trial-head h3 {
  margin: 0;
  font-size: 1.02rem;
}
.trial-num {
  display: inline-grid;
  place-items: center;
  width: 1.7em;
  height: 1.7em;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  background: color-mix(in srgb, var(--blue) 18%, transparent);
}
.trial-expect {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--muted);
}
.trial > p {
  margin: 8px 0 12px;
  line-height: 1.55;
}
.trial > p code,
.trial-hint code {
  font-size: 0.92em;
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--bg-soft);
}
.trial-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.trial-actions button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.trial-hint {
  font-size: 0.85rem;
  color: var(--muted);
}
.trial-result,
.claims {
  margin-top: 12px;
}
.trial-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
}
.status {
  min-width: 3ch;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
  text-align: center;
}
/* Mêlées au texte : lisibles dans les deux thèmes. */
.status.ok {
  color: color-mix(in srgb, var(--green) 55%, var(--fg));
  background: color-mix(in srgb, var(--green) 16%, transparent);
}
.status.ko {
  color: color-mix(in srgb, #c62828 60%, var(--fg));
  background: color-mix(in srgb, #c62828 14%, transparent);
}
.trial-headers {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 12px;
  margin: 0 0 8px;
  font-size: 0.84rem;
}
.trial-headers dt {
  color: var(--muted);
}
.trial-headers dd {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
}
.trial-result pre {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding: 12px 14px;
  font-size: 0.85rem;
  line-height: 1.5;
  background: var(--code-bg);
  color: var(--code-fg);
  border-radius: 10px;
}
.claims > p {
  margin: 0 0 8px;
  font-size: 0.88rem;
}
.claims dl {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
  gap: 8px;
  margin: 0;
}
.claims dl > div {
  min-width: 0;
  padding: 8px 10px;
  background: var(--bg-soft);
  border-radius: 8px;
}
.claims dt {
  font-size: 0.78rem;
  color: var(--muted);
}
.claims dd {
  margin: 2px 0 0;
  font-size: 0.86rem;
  overflow-wrap: anywhere;
}
/* Bouton secondaire sur une carte : le bleu brut tombe à 3:1 en sombre. */
.trial-actions .btn:not(.primary) {
  color: color-mix(in srgb, var(--blue) 50%, var(--fg));
  border-color: color-mix(in srgb, var(--blue) 45%, var(--border));
}

/* Sonde du kit (`kit/ProbeResult.tsx`) : en-têtes groupés par paire — le
   groupe s'efface, la grille garde ses deux colonnes. */
.trial-headers > div {
  display: contents;
}
/* Le lecteur de « Vidéo par plages », au-dessus des appels du geste, et sa
   frise : ce qui est chargé (îlots), où en est la lecture (trait). */
.video-box {
  margin: 0 0 14px;
}
.video-player {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 10px;
}
.video-timeline {
  position: relative;
  height: 10px;
  margin: 8px 0 6px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 5px;
  overflow: hidden;
}
.video-loaded {
  position: absolute;
  top: 0;
  bottom: 0;
  background: color-mix(in srgb, var(--green) 70%, transparent);
}
.video-head {
  position: absolute;
  top: -1px;
  bottom: -1px;
  width: 3px;
  margin-left: -1px;
  background: var(--cyan);
}
.video-caption {
  margin: 0;
  font-size: 0.82rem;
  color: var(--muted);
}

/* La carte du fichier : une barre = toute la vidéo, ses boîtes MP4, et le
   morceau que la dernière réponse a fait voyager (cadre ambre). */
.file-map {
  margin: 0 0 14px;
  padding: 12px 14px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.file-map figcaption {
  margin: 0 0 8px;
  font-size: 0.86rem;
}
.file-map-bar {
  position: relative;
  height: 28px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}
.file-map-box {
  position: absolute;
  top: 0;
  bottom: 0;
  border-right: 1px solid var(--card);
}
.box-ftyp {
  background: var(--violet);
}
.box-moov {
  background: var(--blue);
}
.box-mdat {
  background: color-mix(in srgb, var(--green) 45%, var(--card));
}
.box-free {
  background: var(--border);
}
.file-map-got {
  position: absolute;
  top: 2px;
  bottom: 2px;
  background: color-mix(in srgb, var(--amber) 55%, transparent);
  outline: 2px solid var(--amber);
  border-radius: 3px;
}
.file-map-scale {
  display: flex;
  justify-content: space-between;
  margin: 4px 0 8px;
  font-size: 0.75rem;
  color: var(--muted);
}
.file-map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 0 0 8px;
  padding: 0;
  list-style: none;
  font-size: 0.8rem;
  color: var(--muted);
}
.file-map-chip {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  vertical-align: -1px;
  border-radius: 2px;
}
.file-map-chip-got {
  background: color-mix(in srgb, var(--amber) 55%, transparent);
  outline: 2px solid var(--amber);
}
.video-chip-loaded {
  background: color-mix(in srgb, var(--green) 70%, transparent);
}
.video-chip-head {
  width: 3px;
  background: var(--cyan);
}
.file-map-note {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}
.file-map-note.is-none {
  color: var(--muted);
  font-weight: 500;
}
/* L'aller-retour d'un geste de « Premiers pas » : la page envoie, le
   serveur répond ; la couleur suit le sens du statut. */
.exchange {
  --tone: var(--green);
  margin: 0 0 14px;
  padding: 12px 14px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-left: 4px solid var(--tone);
  border-radius: 12px;
}
.exchange.tone-redirect {
  --tone: var(--blue);
}
.exchange.tone-cache {
  --tone: var(--cyan);
}
.exchange.tone-refused {
  --tone: var(--amber);
}
.exchange.tone-error {
  --tone: var(--muted);
}
.exchange-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
}
.exchange-end {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
}
.exchange-arrow {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 0 10px 6px;
  border-bottom: 2px solid var(--tone);
  font-size: 0.8rem;
  text-align: center;
  overflow-wrap: anywhere;
}
.exchange-arrow.is-out {
  border-color: var(--muted);
}
.exchange-arrow::after {
  content: "";
  position: absolute;
  bottom: -6px;
  border: 5px solid transparent;
}
.exchange-arrow.is-out::after {
  right: -4px;
  border-left: 7px solid var(--muted);
}
.exchange-arrow.is-back::after {
  left: -4px;
  border-right: 7px solid var(--tone);
}
.exchange-arrow small {
  color: var(--muted);
}
.exchange-chunks {
  position: relative;
  height: 12px;
  margin: 8px 6px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 6px;
}
.exchange-chunks > span {
  position: absolute;
  top: 1px;
  bottom: 1px;
  width: 4px;
  margin-left: -2px;
  background: var(--tone);
  border-radius: 2px;
}
.exchange figcaption {
  margin: 4px 0 0;
  font-size: 0.9rem;
  font-weight: 600;
}
.echo-check {
  margin: 0 0 14px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.86rem;
  background: var(--bg-soft);
  border: 1px solid var(--border);
}
.echo-check p {
  margin: 0 0 4px;
}
.echo-check ul {
  margin: 0;
  padding-left: 18px;
}
.echo-check .is-ok::marker {
  content: "✓ ";
  color: var(--green);
}
.echo-check .is-bad::marker {
  content: "✗ ";
  color: var(--amber);
}

/* La frise d'un flux SSE : une bande par connexion ouverte, un repère par
   événement (bleu), battement (gris), coupure (ambre) ou fermeture. */
.sse-timeline {
  margin: 0 0 14px;
  padding: 12px 14px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.sse-timeline figcaption {
  margin: 0 0 4px;
  font-size: 0.86rem;
}
.sse-track {
  position: relative;
  height: 14px;
  margin: 26px 6px 24px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 7px;
}
.sse-link {
  position: absolute;
  top: 2px;
  bottom: 2px;
  background: color-mix(in srgb, var(--green) 55%, transparent);
  border-radius: 5px;
}
.sse-mark {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  border: 2px solid var(--card);
}
.sse-event {
  background: var(--blue);
}
.sse-comment {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border: 0;
  background: var(--muted);
}
.sse-cut {
  background: var(--amber);
  border-radius: 2px;
}
.sse-close {
  background: var(--fg);
  border-radius: 2px;
}
.sse-mark-label {
  position: absolute;
  bottom: 13px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: var(--muted);
  white-space: nowrap;
}
.sse-mark-label.is-low {
  top: 13px;
  bottom: auto;
}
.sse-mark-label.is-start {
  left: 0;
  transform: none;
}
.sse-mark-label.is-end {
  left: auto;
  right: 0;
  transform: none;
}
.sse-chip-link {
  background: color-mix(in srgb, var(--green) 55%, transparent);
}
.sse-chip-event {
  background: var(--blue);
  border-radius: 50%;
}
.sse-chip-comment {
  width: 6px;
  height: 6px;
  background: var(--muted);
  border-radius: 50%;
}
.sse-chip-cut {
  background: var(--amber);
}
.sse-chip-close {
  background: var(--fg);
}
.sse-heard {
  margin: 0 0 14px;
  font-size: 0.86rem;
  color: var(--muted);
}
/* Ce que le code client fait des données : une barre, une réponse. */
.sse-build,
.sse-answer {
  margin: 0 0 14px;
  padding: 12px 14px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.sse-build figcaption,
.sse-answer figcaption {
  margin: 0 0 8px;
  font-size: 0.86rem;
}
.sse-build-bar {
  height: 14px;
  margin: 0 0 6px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 7px;
  overflow: hidden;
}
.sse-build-bar > span {
  display: block;
  height: 100%;
  background: var(--green);
  transition: width 0.3s ease;
}
.sse-answer p {
  margin: 0;
  line-height: 1.5;
}
.sse-caret {
  display: inline-block;
  width: 8px;
  height: 1em;
  margin-left: 3px;
  vertical-align: -2px;
  background: var(--blue);
  animation: sse-blink 1s steps(1) infinite;
}
@keyframes sse-blink {
  50% {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sse-build-bar > span {
    transition: none;
  }
  .sse-caret {
    animation: none;
  }
}
/* Les en-têtes ENVOYÉS, au-dessus de la réponse : une flèche et un filet
   les distinguent de ceux reçus. */
.probe-sent {
  padding: 6px 10px;
  border-left: 3px solid var(--blue);
  background: var(--bg-soft);
  border-radius: 0 8px 8px 0;
}
.probe-sent dt::before {
  content: "→ ";
}
.status.pending {
  color: var(--muted);
  background: var(--bg-soft);
}
.probe-ms {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--muted);
}
.probe-redirect {
  margin: 0 0 8px;
  font-size: 0.86rem;
}
.probe-chunks {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 12px 14px;
  list-style: none;
  font-size: 0.85rem;
  background: var(--code-bg);
  color: var(--code-fg);
  border-radius: 10px;
}
.probe-chunks li {
  display: flex;
  gap: 12px;
  animation: probe-in 180ms ease-out;
}
.probe-at {
  min-width: 7ch;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}
@keyframes probe-in {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .probe-chunks li {
    animation: none;
  }
}

/* Leçons à gestes (kit/StepsLesson.tsx — Premiers pas, Flux SSE) : la CARTE
   des gestes, puis un geste à l'écran — son code à gauche, ses appels et
   leurs réponses à droite. */
.steps-page {
  gap: 18px;
}
.steps-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
}
.steps-head h1 {
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 1.8rem);
}
.steps-head p {
  flex-basis: 100%;
  margin: 0;
  max-width: 72ch;
  color: var(--muted);
  line-height: 1.55;
}
.steps-map {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}
/* Deux rangées au plus : sept gestes tiennent en 4 + 3, dix en 5 + 5. */
.steps-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.steps-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.steps-tab {
  /* Ancre le « (essayé) » invisible (`.sr-only`, absolu) : sans elle, il se
     place contre la page et l'élargit dès qu'un onglet hors champ du
     bandeau mobile est essayé. */
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  column-gap: 10px;
  row-gap: 2px;
  padding: 10px 12px;
  text-align: left;
  font: inherit;
  color: var(--fg);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.15s;
}
.steps-tab:hover {
  border-color: color-mix(in srgb, var(--blue) 45%, var(--border));
  transform: translateY(-1px);
}
.steps-tab:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}
.steps-tab[aria-selected="true"] {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--blue) 16%, transparent);
}
.steps-tab-num {
  grid-row: span 2;
  display: grid;
  place-items: center;
  width: 1.9em;
  height: 1.9em;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 700;
  background: color-mix(in srgb, var(--blue) 14%, transparent);
}
.steps-tab[aria-selected="true"] .steps-tab-num {
  color: #fff;
  background: var(--blue);
}
.steps-tab-title {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.2;
}
.steps-tab-gesture {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.74rem;
  color: var(--muted);
}

.steps-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}
/* Le code tient dans l'écran : il défile DANS sa colonne. Arrivé en bout,
   le défilement passe à la page (pas de `overscroll-behavior: contain`) :
   sinon la molette posée sur le code ne mène plus jamais au bas de page. */
.steps-code {
  position: sticky;
  top: 76px;
  display: grid;
  gap: 12px;
  max-height: calc(100vh - 96px);
  overflow: auto;
}
.steps-code .excerpt {
  margin: 0;
}
/* Plus serré que dans les autres pages : la colonne est étroite, et une
   ligne de code qui se replie se lit mal. */
.steps-code .excerpt pre {
  padding: 12px 14px;
  font-size: 0.78rem;
}
.steps-try {
  display: grid;
  gap: 12px;
  padding: 16px 18px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
}
.steps-kicker {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 6px;
  margin: 0;
  font-size: 0.8rem;
  color: var(--muted);
}
.steps-try h2 {
  margin: 0;
  font-size: 1.2rem;
}
.steps-text {
  margin: 0;
  line-height: 1.55;
}
.steps-text code {
  font-size: 0.92em;
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--bg-soft);
}
.steps-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.steps-fields label {
  display: grid;
  gap: 4px;
  font-size: 0.82rem;
  color: var(--muted);
}
.steps-fields input {
  width: 11rem;
  min-width: 0;
  padding: 7px 10px;
  font: inherit;
  color: var(--fg);
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 8px;
}
/* Un champ fichier porte son bouton ET « Aucun fichier choisi » : la largeur
   des champs texte le tronquait. */
.steps-fields input[type="file"] {
  width: auto;
  max-width: 100%;
}
/* Le fichier choisi sur le poste, sous son champ. */
.upload-chosen {
  flex-basis: 100%;
  margin: 0;
  font-size: 0.86rem;
  color: var(--muted);
  overflow-wrap: anywhere;
}
.upload-chosen strong {
  color: var(--fg);
}

/* Un appel : la méthode en pastille, le libellé, le chemin visé. */
.calls {
  display: grid;
  gap: 8px;
}
.call {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 9px 14px 9px 10px;
  text-align: left;
  text-decoration: none;
  font: inherit;
  color: var(--fg);
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s,
    transform 0.15s;
}
.call:hover:not(:disabled) {
  background: var(--card);
  border-color: color-mix(in srgb, var(--blue) 50%, var(--border));
  transform: translateX(2px);
}
.call:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}
.call:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.call[aria-busy="true"] {
  opacity: 1;
  border-color: var(--blue);
}
.call-verb {
  min-width: 4.6ch;
  padding: 4px 7px;
  border-radius: 6px;
  text-align: center;
  font:
    700 0.72rem/1 ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
  letter-spacing: 0.03em;
}
.verb-get {
  color: color-mix(in srgb, var(--green) 62%, var(--fg));
  background: color-mix(in srgb, var(--green) 16%, transparent);
}
.verb-post {
  color: color-mix(in srgb, var(--amber) 58%, var(--fg));
  background: color-mix(in srgb, var(--amber) 18%, transparent);
}
.verb-ws {
  color: color-mix(in srgb, var(--violet) 62%, var(--fg));
  background: color-mix(in srgb, var(--violet) 16%, transparent);
}
.verb-sse {
  color: color-mix(in srgb, var(--blue) 62%, var(--fg));
  background: color-mix(in srgb, var(--blue) 16%, transparent);
}
.call-text {
  display: grid;
  min-width: 0;
}
.call-label {
  font-size: 0.93rem;
  font-weight: 600;
}
.call-path {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.76rem;
  color: var(--muted);
}
.call-go {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--muted);
}
.steps-link {
  justify-self: start;
  font-size: 0.88rem;
  color: color-mix(in srgb, var(--blue) 55%, var(--fg));
}
/* Les réponses défilent dans le panneau : le panneau garde sa place. */
/* Un appel et SA réponse, d'un seul bloc. La réponse ne défile pas dans
   une boîte : c'est la page qui défile (aucune zone où la molette s'accroche). */
.call-block {
  display: grid;
  gap: 6px;
}
.call-result:empty {
  display: none;
}
.call-result .trial-result {
  margin: 0 0 6px;
}
.call-close {
  justify-self: end;
  font: inherit;
  font-size: 0.82rem;
  color: var(--muted);
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
}
.call-close:hover {
  color: var(--fg);
  border-color: var(--fg);
}
.call-result {
  display: grid;
}
.steps-nav {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.steps-nav button {
  padding: 6px 10px;
  font: inherit;
  font-size: 0.86rem;
  color: color-mix(in srgb, var(--blue) 55%, var(--fg));
  background: none;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.steps-nav button:hover:not(:disabled) {
  background: var(--bg-soft);
}
.steps-nav button:disabled {
  visibility: hidden;
}
.steps-more {
  padding: 12px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
}
.steps-more > summary {
  cursor: pointer;
  font-weight: 600;
}
.steps-more[open] > summary {
  margin-bottom: 12px;
}

@media (max-width: 1000px) {
  .steps-map {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .steps-stage {
    grid-template-columns: minmax(0, 1fr);
  }
  /* Une colonne : le panneau d'essai d'abord, le code ensuite. */
  .steps-try {
    order: -1;
  }
  .steps-code {
    position: static;
    max-height: 60vh;
  }
}
/* Téléphone : la carte devient un bandeau qui défile de côté, pour que
   le geste choisi reste dans le premier écran. */
@media (max-width: 600px) {
  .steps-map {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 4px;
  }
  .steps-tab {
    flex: 0 0 62%;
    scroll-snap-align: start;
  }
}
@media (prefers-reduced-motion: reduce) {
  .steps-tab,
  .call {
    transition: none;
  }
}

/* Les constantes d'un extrait, et leur valeur lue dans les sources. */
.excerpt-consts {
  display: grid;
  gap: 4px;
  margin: 8px 0 0;
  padding: 10px 14px;
  font-size: 0.84rem;
  background: var(--bg-soft);
  border-radius: 10px;
}
.excerpt-consts > div {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  min-width: 0;
}
.excerpt-consts dt code {
  font-weight: 700;
}
.excerpt-consts dt::after {
  content: " =";
  color: var(--muted);
}
.excerpt-consts dd {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
}
.excerpt-consts dd span {
  color: var(--muted);
  font-size: 0.92em;
}
/* Un réglage (terminal, .env, journal) : montré, pas cité d'un fichier. */
.snippet-label {
  font-weight: 600;
  color: var(--fg);
}

/* Temps réel binaire : les visuels du fil (BinaryVisuals.tsx). Deux séries,
   toujours nommées : CBOR (--wire-cbor) et texte (--wire-text). */
.wire-figure {
  margin: 0 0 14px;
  padding: 12px 14px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.wire-figure figcaption {
  margin: 0 0 8px;
  font-size: 0.86rem;
}
.wire-figure svg {
  display: block;
  width: 100%;
  height: auto;
}
.wire-legend {
  display: inline-flex;
  gap: 12px;
  color: var(--muted);
  font-size: 0.8rem;
}
.wire-legend > span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.wire-chip {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}
.wire-chip.is-cbor,
.wire-bar.is-cbor,
.gauge-fill.is-cbor {
  background: var(--wire-cbor);
}
.wire-chip.is-texte,
.wire-bar.is-texte,
.gauge-fill.is-texte {
  background: var(--wire-text);
}
.wire-axis {
  stroke: var(--border);
  stroke-width: 1;
}
.osc-trace,
.rate-line {
  fill: none;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.osc-trace,
.rate-line.is-cbor {
  stroke: var(--wire-cbor);
}
.rate-line.is-texte {
  stroke: var(--wire-text);
}
.wire-scale {
  display: flex;
  justify-content: space-between;
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 0.75rem;
}
.codec-row {
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  gap: 2px 10px;
  padding: 8px 0;
  border-top: 1px solid var(--border);
  font-size: 0.84rem;
}
.codec-name {
  grid-row: span 2;
  font-weight: 700;
}
.codec-row.is-cbor .codec-name {
  color: var(--wire-cbor);
}
.codec-offer code {
  overflow-wrap: anywhere;
}
.wire-rows {
  display: grid;
  gap: 10px;
}
.wire-row {
  display: grid;
  grid-template-columns: 7.5rem 1fr;
  gap: 10px;
  align-items: center;
  font-size: 0.8rem;
}
.wire-row-size small {
  display: block;
  color: var(--muted);
}
.wire-row-bars {
  display: grid;
  gap: 3px;
}
.wire-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wire-bar {
  height: 10px;
  border-radius: 0 4px 4px 0;
}
.wire-bar-value {
  white-space: nowrap;
  color: var(--fg);
}
.wire-note {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 0.78rem;
}
.draw-pad canvas {
  display: block;
  width: min(100%, 360px);
  aspect-ratio: 240 / 150;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #ffffff;
  touch-action: none;
  cursor: crosshair;
}
.digest-match dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 10px;
  margin: 0;
  font-size: 0.78rem;
}
.digest-match dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.digest-match.is-same strong {
  color: var(--green);
}
.digest-match.is-different strong,
.payload-gauge.is-refused strong {
  color: var(--amber);
}
.gauge-track {
  position: relative;
  height: 16px;
  margin: 8px 0 22px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.gauge-fill {
  position: absolute;
  inset: 2px auto 2px 2px;
  border-radius: 0 4px 4px 0;
}
.gauge-limit {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 2px;
  background: var(--fg);
}
.gauge-limit span {
  position: absolute;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.72rem;
  color: var(--muted);
  white-space: nowrap;
}
.game-ground {
  fill: var(--card);
  stroke: var(--border);
}
.sprite {
  stroke: var(--card);
  stroke-width: 1;
}
.sprite.is-even {
  fill: var(--wire-cbor);
}
.sprite.is-odd {
  fill: var(--violet);
}
/* « Une connexion, un codec » : ce qu'offre le handshake, ce que garde la connexion. */
.codec-explain {
  flex-basis: 100%;
  max-width: 72ch;
  margin: 4px 0 0;
  padding: 12px 16px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-left: 3px solid var(--wire-cbor);
  border-radius: 10px;
  font-size: 0.9rem;
  line-height: 1.5;
}
.codec-explain h2 {
  margin: 0 0 6px;
  font-size: 0.95rem;
}
.codec-explain ol {
  margin: 0 0 8px;
  padding-left: 1.3rem;
}
.codec-explain li + li {
  margin-top: 4px;
}
.codec-explain p {
  margin: 0;
  color: var(--fg);
}
/* Leçon MCP : outils, trames, progression, chaîne du jeton, publics, fil. */
.mcp-pill {
  --accent: var(--muted);
}
.mcp-pill.is-read {
  --accent: var(--green);
}
.mcp-pill.is-write {
  --accent: var(--amber);
}
.mcp-pill.is-danger {
  --accent: var(--danger);
}
.mcp-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.mcp-frame,
.copy-text {
  margin: 6px 0 0;
  padding: 8px 10px;
  max-height: 260px;
  overflow: auto;
  font:
    0.78rem/1.5 ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: var(--card);
  border: 1px solid var(--border);
  border-left: 3px solid var(--blue);
  border-radius: 8px;
}
.mcp-frame.is-in {
  border-left-color: var(--green);
}
.mcp-frame.is-err {
  border-left-color: var(--danger);
}
.mcp-instructions {
  margin: 0 0 10px;
  padding: 8px 12px;
  font-size: 0.84rem;
  border-left: 3px solid var(--violet);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--violet) 7%, transparent);
}
.mcp-cards {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.mcp-card,
.mcp-door {
  display: grid;
  gap: 6px;
  align-content: start;
  min-width: 0;
  padding: 10px 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
}
.mcp-name {
  font-weight: 700;
}
.mcp-desc,
.mcp-empty,
.mcp-label {
  font-size: 0.84rem;
  color: var(--muted);
}
.mcp-empty,
.mcp-label {
  margin: 8px 0 0;
}
.mcp-bubbles {
  display: grid;
  gap: 8px;
}
.mcp-bubble {
  display: grid;
  gap: 2px;
  max-width: 92%;
  margin: 0;
  padding: 8px 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.mcp-meta {
  font-size: 0.76rem;
  color: var(--muted);
}
.mcp-two {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 10px;
}
.mcp-two > div {
  min-width: 0;
}
.mcp-bar {
  height: 10px;
  overflow: hidden;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 999px;
}
.mcp-bar > i {
  display: block;
  height: 100%;
  background: var(--blue);
  border-radius: 999px;
}
@media (prefers-reduced-motion: no-preference) {
  .mcp-bar > i {
    transition: width 0.3s ease;
  }
}
.mcp-timeline {
  display: grid;
  gap: 2px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  font:
    0.78rem ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
}
.mcp-timeline li {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 8px;
  font-variant-numeric: tabular-nums;
}
.mcp-at {
  text-align: right;
  color: var(--muted);
}
.mcp-outcome {
  margin: 10px 0 0;
  font-size: 0.86rem;
}
.mcp-chain ol {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 1.3rem;
}
.mcp-chain li {
  min-width: 0;
  font-size: 0.86rem;
}
.mcp-chain li.is-ok b {
  color: var(--green);
}
.mcp-chain li.is-stop b {
  color: var(--danger);
}
.mcp-scroll {
  overflow-x: auto;
}
.mcp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
}
.mcp-table th,
.mcp-table td {
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.mcp-table thead th {
  font-size: 0.72rem;
  color: var(--muted);
}
.mcp-table .is-served {
  color: var(--green);
  font-weight: 600;
}
.mcp-table .is-absent {
  color: var(--muted);
}
.mcp-table .is-refused {
  color: var(--danger);
  font-weight: 600;
}
.copy-line {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.mcp-steps {
  display: grid;
  gap: 12px;
  margin: 8px 0 0;
  padding-left: 1.4rem;
  font-size: 0.9rem;
}
.mcp-steps li {
  min-width: 0;
}
.mcp-steps .copy-line,
.mcp-steps .mcp-desc {
  margin-top: 6px;
}
.mcp-steps .mcp-desc {
  display: block;
}
.mcp-steps .mcp-desc code {
  white-space: nowrap;
}
.copy-line .copy-text {
  flex: 1;
  min-width: 0;
  margin: 0;
}

/* ── Jeux (Météores, Prisme) ─────────────────────────────────────────────
 * Mise en page COMMUNE aux jeux (`game/GamePage.tsx`). La scène reste
 * sombre dans les deux thèmes, voulu : c'est un ciel, une arène. Ses
 * surimpressions ont donc leurs propres couleurs, lisibles sur ce fond-là. */
.game-page {
  --game-ink: #e9e6ff;
  --game-muted: #b4aedb;
  --game-ground: #0b0a1a;
  --game-glass: rgba(11, 10, 26, 0.78);
  --game-edge: #2c2852;
}
.game-head {
  display: grid;
  gap: 10px;
  margin-block-end: 18px;
}
.game-head h1 {
  margin: 0;
  text-wrap: balance;
}
.game-head p {
  margin: 0;
  max-inline-size: 68ch;
  color: var(--muted);
}
.game-stage {
  display: grid;
  gap: 10px;
}
.game-board {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-block-size: 32px;
  font-variant-numeric: tabular-nums;
}
.game-chip {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--card);
  font-size: 0.9rem;
  font-weight: 600;
}
.game-team {
  background: var(--game-ground);
  border-color: var(--game-edge);
}
.game-health {
  position: relative;
  inline-size: 140px;
  block-size: 12px;
  border-radius: 999px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  overflow: hidden;
}
.game-health > span {
  position: absolute;
  inset: 0 auto 0 0;
  background: linear-gradient(90deg, #ff5a5a, #ffb547 40%, #3ee6ff);
  transition: inline-size 0.25s ease-out;
}
.game-canvas {
  position: relative;
  inline-size: 100%;
  max-inline-size: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 12px;
  overflow: hidden;
  background: var(--game-ground);
  border: 1px solid var(--game-edge);
  touch-action: none;
}
@media (max-width: 640px) {
  .game-canvas {
    aspect-ratio: 4 / 5;
  }
}
.game-canvas canvas {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  outline: none;
  cursor: crosshair;
}
.game-canvas canvas:focus-visible {
  box-shadow: inset 0 0 0 2px #ffb547;
}
.game-hint,
.game-banner {
  position: absolute;
  inset-inline: 0;
  margin: 0 auto;
  inline-size: fit-content;
  max-inline-size: calc(100% - 32px);
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--game-glass);
  border: 1px solid var(--game-edge);
  color: var(--game-ink);
  text-align: center;
  pointer-events: none;
}
.game-hint {
  inset-block-end: 14px;
  font-size: 0.92rem;
}
.game-banner {
  inset-block-start: 40%;
  font-size: clamp(1.1rem, 3vw, 1.6rem);
  font-weight: 700;
  color: #ffb547;
}
.game-hud {
  position: absolute;
  inset-block-start: 10px;
  inset-inline-end: 10px;
  min-inline-size: 220px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--game-glass);
  border: 1px solid var(--game-edge);
  color: var(--game-ink);
  font-family: var(--mono, ui-monospace, Menlo, Consolas, monospace);
  font-size: 12px;
  backdrop-filter: blur(6px);
  pointer-events: none;
}
.game-hud h2 {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #3ee6ff;
}
.game-hud dl {
  margin: 0;
  display: grid;
  gap: 2px;
}
.game-hud dl > div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  font-variant-numeric: tabular-nums;
}
.game-hud dt {
  color: var(--game-muted);
}
.game-hud dd {
  margin: 0;
}
@media (max-width: 640px) {
  .game-hud {
    inset-block-start: auto;
    inset-block-end: 10px;
    min-inline-size: 0;
    font-size: 10.5px;
  }
}
.game-how ol {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.game-how li {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
}
.game-how li span {
  color: var(--muted);
}
@media (prefers-reduced-motion: reduce) {
  .game-health > span {
    transition: none;
  }
}

/* ── Le panneau « Dans le salon » (chat/ChatPeople.tsx) ──────────────────
   Tout effet est du CSS sur `opacity` ou `transform` : joué par le
   compositeur, sans re-rendu React ni repeinture. Le mouvement est rare et
   porteur de sens (arrivée, départ, frappe), et coupé sous
   `prefers-reduced-motion`. `contain: content` isole le panneau : une
   arrivée ne recalcule pas la mise en page du salon. */
.people {
  contain: content;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.875rem 0.75rem;
  background: var(--bg-soft);
  border-left: 1px solid var(--border);
  min-width: 0;
}
.people-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.people-title {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.people-toggle {
  display: none;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--fg);
  cursor: pointer;
  font-variant-numeric: tabular-nums;
}
.people-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}
.people-count {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
}
.people-total {
  font-size: 1.9rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  min-width: 2ch;
}
.people-split {
  display: grid;
  font-size: 0.74rem;
  line-height: 1.35;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.people-search input {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  font-size: 0.85rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--fg);
}
.people-search input:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 0;
}
.people-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1px;
}
.person {
  position: relative;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
  padding: 0.35rem 0.4rem;
  border-radius: 7px;
}
/* Le voile d'arrivée : un pseudo-élément dont seule l'OPACITÉ s'anime. */
.person::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--wash-green);
  opacity: 0;
  pointer-events: none;
}
.person:hover,
.person:focus-within {
  background: var(--card);
}
.person.is-me {
  background: var(--card);
}
.person-avatar {
  position: relative;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #fff;
  background: var(--muted);
}
/* La pastille « en ligne » : une forme EN PLUS de la couleur (WCAG 1.4.1). */
.person-avatar::after {
  content: "";
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--green);
  border: 2px solid var(--bg-soft);
}
.person.is-anonymous .person-avatar {
  background: transparent;
  border: 1.5px dashed var(--muted);
  color: var(--muted);
}
.person.is-anonymous .person-avatar::after {
  display: none;
}
.person-who {
  display: grid;
  min-width: 0;
  line-height: 1.25;
}
.person-name {
  font-size: 0.88rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.person-sub {
  font-size: 0.7rem;
  color: var(--muted);
  min-height: 1em;
}
.person.is-arrived .person-sub {
  color: color-mix(in srgb, var(--green) 70%, var(--fg));
}
.person-tabs {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--muted);
  font-size: 0.66rem;
  font-variant-numeric: tabular-nums;
}
.person-tabs i {
  display: block;
  width: 6px;
  height: 9px;
  border-radius: 1.5px;
  border: 1.5px solid currentColor;
}
.person-actions {
  position: absolute;
  right: 0.3rem;
  top: 50%;
  display: flex;
  gap: 2px;
  padding-left: 0.4rem;
  background: var(--card);
  opacity: 0;
  transform: translate(4px, -50%);
  pointer-events: none;
}
.person:hover .person-actions,
.person:focus-within .person-actions {
  opacity: 1;
  transform: translate(0, -50%);
  pointer-events: auto;
}
.person-actions button {
  width: 26px;
  height: 26px;
  font: inherit;
  font-size: 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--fg);
  cursor: pointer;
}
.person-actions button:hover {
  border-color: var(--blue);
  color: var(--link);
}
.person-actions button:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 1px;
}
.person.is-left .person-name {
  color: var(--muted);
  font-weight: 500;
}
/* Membres d'un salon privé (D51) : la pastille dit l'état par sa FORME —
   pleine dans le salon, en anneau en ligne ailleurs, absente pour un absent. */
.person.is-online .person-avatar::after {
  background: var(--bg-soft);
  border-color: var(--green);
}
.person.is-away .person-avatar {
  opacity: 0.55;
}
.person.is-away .person-avatar::after {
  display: none;
}
.person.is-away .person-name {
  color: var(--muted);
  font-weight: 500;
}
.person-role {
  margin-left: 0.35rem;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}
.people-subtitle {
  margin: 0.6rem 0 0.2rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}
.person-actions button.is-danger:hover {
  border-color: var(--danger);
  color: var(--danger);
}
.people-note,
.people-empty {
  margin: 0;
  font-size: 0.8rem;
  color: var(--muted);
}
.people-state {
  margin: 0;
  font-size: 0.74rem;
  color: var(--muted);
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
}
.people-state.is-partial {
  color: color-mix(in srgb, var(--amber) 60%, var(--fg));
  background: color-mix(in srgb, var(--amber) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--amber) 35%, transparent);
}
.person-sub .typing-dots {
  margin-right: 0.25rem;
}

@media (prefers-reduced-motion: no-preference) {
  .person::before {
    transition: opacity 0.6s ease-out;
  }
  .person.is-arrived::before {
    animation: person-arrive 2s ease-out both;
    /* La durée vraie vient de la ligne (ARRIVAL_MARK_MS, style en ligne). */
    animation-duration: inherit;
  }
  .person.is-left {
    animation: person-leave 3s ease-in both;
  }
  .person-actions {
    transition:
      opacity 0.15s ease-out,
      transform 0.15s ease-out;
  }
}
@keyframes person-arrive {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes person-leave {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.35;
  }
}
/* Sous `reduce` : pas d'animation, l'état reste lisible par le texte seul
   (« vient d'arriver », « vient de partir »). */
@media (prefers-reduced-motion: reduce) {
  .person.is-left {
    opacity: 0.6;
  }
}

/* Écran étroit : le panneau se replie derrière le bouton « N présents ». */
@media (max-width: 760px) {
  .people {
    border-left: 0;
    border-top: 1px solid var(--border);
  }
  .people-toggle {
    display: inline-block;
  }
  .people-body {
    display: none;
  }
  .people-body.is-open {
    display: flex;
  }
}

/* ── Le salon à trois colonnes : salons · flux · présents ──────────────── */
/* Le salon a SA hauteur, comme une messagerie : la liste défile dedans,
   le rail et le panneau des présents aussi s'ils débordent. */
.room.room-layout {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr) 240px;
  grid-template-rows: clamp(460px, 74dvh, 860px);
  align-items: stretch;
}
/* Sur un grand écran, le salon SORT de la colonne de la leçon : il prend la
   largeur de la fenêtre (jusqu'à 1600 px), centré — un chat a besoin de la
   place que la prose n'a pas. 48 px de marge absorbent la barre de
   défilement que `100vw` compte. */
@media (min-width: 1180px) {
  .room.room-layout:not(.is-expanded) {
    --room-width: min(calc(100vw - 48px), 1600px);
    width: var(--room-width);
    max-width: none;
    margin-inline: calc((100% - var(--room-width)) / 2);
  }
}
/* Agrandi : ses colonnes prennent la hauteur. */
.room.room-layout.is-expanded {
  grid-template-rows: minmax(0, 1fr);
  height: 100dvh;
  border: 0;
  border-radius: 0;
}
/* Agrandi : le salon couvre la fenêtre SOUS l'en-tête du site (son `top`,
   mesuré, est posé par la page) — le menu reste visible. */
.room.room-layout.is-expanded {
  position: fixed;
  inset: 0;
  /* La barre de debug (développement) publie sa hauteur : le salon s'arrête
     au-dessus, « Envoyer » n'est jamais caché. 0 sans barre. */
  bottom: var(--nodefony-debugbar-height, 0px);
  height: auto;
  z-index: 60;
}
.room-layout > .room-rail,
.room-layout > .people {
  min-height: 0;
  overflow-y: auto;
}
.room-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
.room-rail {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 0.6rem;
  background: var(--bg-soft);
  border-right: 1px solid var(--border);
  min-width: 0;
}
.room-rail-title {
  margin: 0 0.4rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.room-rail ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2px;
}
.room-link {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  padding: 0.45rem 0.55rem;
  border: 0;
  border-radius: 7px;
  background: none;
  color: var(--muted);
  font: inherit;
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
}
.room-link:hover {
  background: var(--card);
  color: var(--fg);
}
.room-link:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 1px;
}
.room-link.is-current {
  background: var(--card);
  color: var(--fg);
  font-weight: 600;
}
.room-link-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.room-live {
  flex: none;
  font-size: 0.66rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  color: color-mix(in srgb, var(--green) 70%, var(--fg));
  background: var(--wash-green);
}
.room-head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem 0.75rem;
}
.room-head-count {
  font-size: 0.8rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.room-event {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.room-refusal {
  margin: 1.5rem 1rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  color: color-mix(in srgb, var(--amber) 60%, var(--fg));
  background: color-mix(in srgb, var(--amber) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--amber) 35%, transparent);
}
@media (max-width: 1020px) {
  .room.room-layout {
    grid-template-columns: minmax(0, 1fr) 220px;
    grid-template-rows: auto clamp(440px, 72dvh, 820px);
  }
  .room.room-layout.is-expanded {
    grid-template-rows: auto minmax(0, 1fr);
  }
  .room-rail {
    grid-column: 1 / -1;
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }
  .room-rail ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
  .room-link {
    width: auto;
  }
}
@media (max-width: 760px) {
  .room.room-layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
  }
  .room-main {
    height: clamp(420px, 78dvh, 760px);
  }
  .room.room-layout.is-expanded {
    grid-template-rows: none;
    overflow-y: auto;
  }
  .room-layout.is-expanded .room-main {
    height: 100dvh;
  }
}

/* Les formulaires du chat : boutons compacts, rail, invitation, boîtes natives. */
.room-btn {
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--fg);
  cursor: pointer;
}
.room-btn:hover {
  border-color: var(--blue);
}
.room-btn[aria-pressed="true"] {
  border-color: var(--blue);
  background: color-mix(in srgb, var(--blue) 14%, var(--card));
}
.room-btn.is-primary {
  color: #fff;
  background: var(--blue);
  border-color: var(--blue);
}
.room-btn:disabled {
  opacity: 0.6;
  cursor: progress;
}
.room-btn:focus-visible,
.room-rail-add:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}
.room-rail-add {
  font: inherit;
  font-size: 0.85rem;
  text-align: left;
  padding: 0.4rem 0.55rem;
  border: 1px dashed var(--border);
  border-radius: 7px;
  background: none;
  color: var(--link);
  cursor: pointer;
}
.room-rail-add:hover {
  background: var(--card);
}
.room-invite {
  display: grid;
  gap: 0.35rem;
  padding: 0.55rem 0.6rem;
  font-size: 0.82rem;
  border-radius: 8px;
  border: 1px dashed color-mix(in srgb, var(--amber) 55%, transparent);
  background: color-mix(in srgb, var(--amber) 10%, transparent);
}
.room-invite-actions,
.room-head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.room-head-actions {
  margin-left: auto;
}
.room-notice {
  margin: 0.5rem 1rem 0;
  font-size: 0.85rem;
  color: var(--danger);
}
.room-dialog {
  width: min(28rem, calc(100vw - 2rem));
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  color: var(--fg);
  box-shadow: var(--shadow);
}
.room-dialog::backdrop {
  background: rgb(10 36 64 / 0.45);
}
.room-dialog form {
  display: grid;
  gap: 0.9rem;
  padding: 1.1rem 1.2rem;
}
.room-dialog header {
  display: grid;
  gap: 0.25rem;
}
.room-dialog h3 {
  margin: 0;
  font-size: 1.05rem;
}
.room-dialog header p,
.form-hint {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 400;
  color: var(--muted);
}
.form-field {
  display: grid;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}
.form-field > label,
.form-field > legend {
  font-size: 0.85rem;
  font-weight: 600;
}
fieldset.form-field > label {
  font-weight: 400;
}
.form-field input:not([type="radio"]),
.form-field textarea {
  font: inherit;
  padding: 0.45rem 0.6rem;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--fg);
  min-width: 0;
}
.form-field input:focus-visible,
.form-field textarea:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 1px;
}
.form-field [aria-invalid="true"] {
  border-color: var(--danger);
}
.form-error {
  min-height: 1em;
  font-size: 0.8rem;
  color: var(--danger);
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.form-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.form-chips li {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.1rem 0.25rem 0.1rem 0.6rem;
  font-size: 0.82rem;
  border-radius: 999px;
  background: var(--wash-blue);
}
.form-chips button {
  border: 0;
  background: none;
  color: var(--muted);
  font: inherit;
  cursor: pointer;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
@media (max-width: 520px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Lot 4 du chat — natures en ligne, blocs par nature, bulles, pastilles.
   Les teintes du code reprennent `.tok-<kind>` (highlight.ts) ; les autres se
   mêlent à `--fg` pour tenir le contraste dans les deux thèmes. Les effets
   n'animent que `opacity` et `transform`. */
.msg-body > * + * {
  margin-top: 4px;
}
.md-mention {
  padding: 0 4px;
  font-weight: 600;
  color: color-mix(in srgb, var(--blue) 50%, var(--fg));
  background: color-mix(in srgb, var(--blue) 14%, transparent);
  border-radius: 4px;
}
.md-swatch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88em;
}
.md-swatch-dot {
  display: inline-block;
  width: 0.9em;
  height: 0.9em;
  border: 1px solid color-mix(in srgb, var(--fg) 60%, transparent);
  border-radius: 3px;
}
.md-date {
  white-space: nowrap;
  border-bottom: 1px dotted var(--muted);
}
.room-list a.md-domain {
  padding: 0 8px;
  text-decoration: none;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 999px;
}
.math-raw {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88em;
}
.math-block {
  margin: 4px 0;
  overflow-wrap: anywhere;
  text-align: center;
}
pre.math-raw {
  white-space: pre-wrap;
}
.nb {
  margin: 4px 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 8px;
}
.nb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 3px 8px;
  font-size: 0.75rem;
  color: var(--muted);
  background: var(--bg-soft);
}
.nb-copy {
  min-height: 24px;
  padding: 0 8px;
  font: inherit;
  color: var(--fg);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
}
.nb pre {
  margin: 0;
  padding: 8px 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85em;
  color: var(--code-fg);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: var(--code-bg);
}
.nb pre code {
  padding: 0;
  background: none;
}
/* Du code se lit sans retour à la ligne : une ligne trop longue défile
   SUR LE CÔTÉ dans son bloc (le défilement vertical reste celui du fil). */
.nb-code pre {
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: auto;
  line-height: 1.5;
}
/* Replié : les premières lignes, qui s'effacent vers le bouton. */
.nb-code.is-folded pre {
  overflow-y: hidden;
  mask-image: linear-gradient(to bottom, #000 70%, transparent);
}
.nb-fold {
  display: block;
  width: 100%;
  padding: 6px 10px;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--fg);
  background: var(--bg-soft);
  border: 0;
  border-top: 1px solid var(--border);
  cursor: pointer;
}
.nb-fold:hover {
  background: var(--card);
}
.nb-fold:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: -2px;
}
.tok-added {
  color: #b5e3a0;
}
.tok-removed {
  color: #ffb3b3;
}
.diff-line {
  display: block;
  min-height: 1.4em;
}
.diff-add {
  background: color-mix(in srgb, #3fb950 24%, transparent);
}
.diff-del {
  background: color-mix(in srgb, #f85149 26%, transparent);
}
.diff-hunk {
  color: #9fb0c8;
}
.diff-file {
  font-weight: 700;
}
.json-tree {
  padding: 8px 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85em;
  overflow-wrap: anywhere;
  background: var(--card);
}
.json-node > summary {
  cursor: pointer;
}
.json-children {
  margin-left: 0.4em;
  padding-left: 1.1em;
  border-left: 1px solid var(--border);
}
.json-key {
  color: color-mix(in srgb, var(--blue) 50%, var(--fg));
}
.json-string {
  color: color-mix(in srgb, var(--green) 50%, var(--fg));
}
.json-number {
  color: color-mix(in srgb, var(--amber) 50%, var(--fg));
}
.json-literal {
  color: var(--muted);
}
.nb-table {
  width: 100%;
  font-size: 0.85em;
  border-collapse: collapse;
}
.nb-table th,
.nb-table td {
  padding: 3px 8px;
  text-align: left;
  overflow-wrap: anywhere;
  border-top: 1px solid var(--border);
}
.nb-table th {
  background: var(--bg-soft);
}
.nb-csv .att-note {
  margin: 0;
  padding: 4px 8px;
}
.nb-math {
  padding: 4px 8px;
  background: var(--card);
}
/* Bulles (D32) : couche supérieure, posée par `HoverBubble` ; jamais de
   défilement, jamais le focus. */
.bubble {
  position: fixed;
  inset: auto;
  display: block;
  box-sizing: border-box;
  max-width: min(28rem, calc(100vw - 16px));
  margin: 0;
  padding: 8px 10px;
  overflow: visible;
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--fg);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow);
}
/* Les lignes d'un texte joint ne se coupent pas : du code coupé ne se lit
   plus. Trop longues, elles défilent sur le côté. */
.att-text .att-pre {
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: auto;
}
/* L'aperçu d'une pièce au survol : assez large pour LIRE ses lignes, et
   aucune n'est coupée en deux — une ligne trop longue s'arrête au bord. */
.bubble:has(.att-box) {
  width: min(44rem, calc(100vw - 16px));
  max-width: none;
}
.bubble .att-box,
.att-box.att-text {
  width: 100%;
  max-width: none;
}
.bubble .att-pre {
  max-height: none;
  white-space: pre;
  overflow: hidden;
  font-size: 0.78rem;
  line-height: 1.5;
}
@media (prefers-reduced-motion: no-preference) {
  .bubble {
    animation: bubble-in 120ms ease-out;
  }
}
@keyframes bubble-in {
  from {
    opacity: 0;
  }
}
.link-bubble {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.link-url,
.link-desc {
  overflow-wrap: anywhere;
}
.link-url,
.link-note {
  font-size: 0.8rem;
  color: var(--muted);
}
.att-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  max-width: 100%;
  padding: 2px 10px;
  font: inherit;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 999px;
}
.att-pill[aria-expanded="true"] {
  border-color: var(--accent, var(--border));
}
.att-unfolded {
  margin-top: 6px;
}
.att-pill-name {
  overflow-wrap: anywhere;
  font-weight: 600;
}
