/**
 * Les textes de l'accueil en DÉVELOPPEMENT : la présentation du framework, les
 * liens vers la console et la documentation, le compte de ton poste, et où
 * personnaliser la page.
 *
 * Données pures, sans dépendance au moteur de rendu : la même source sert la
 * page du front (par `devHome.ts`, qui les retire du build de production).
 *
 * C'est TA page : retire ce fichier (et ses usages) quand tu n'en as plus
 * besoin.
 */

/** Un fragment de texte de l'accueil : du texte simple, ou du code. */
export interface IHomeText {
  readonly text: string;
  readonly code: boolean;
}

/** Une carte de l'accueil, lien ou non. */
export interface IHomeCard {
  readonly title: string;
  readonly text: readonly IHomeText[];
  /** Adresse si la carte est un lien, sinon `null`. */
  readonly href: string | null;
  /** Invitation affichée au pied d'une carte-lien (« Ouvrir /nodefony → »). */
  readonly go: string | null;
  /** Identifiant et mot de passe à recopier (`null` = mot de passe inconnu ici). */
  readonly creds: {
    readonly user: string;
    readonly password: string | null;
  } | null;
  /** Teinte de la carte : `safe` = la garantie de production, en vert. */
  readonly tone: "safe" | null;
  /**
   * Sélecteur d'habillages de la page de connexion : un formulaire `GET` vers
   * `action`, qui marche sans JavaScript. `null` = pas de sélecteur.
   */
  readonly skins: {
    readonly action: string;
    readonly options: readonly string[];
    readonly selected: string;
  } | null;
}

/** Une section de l'accueil : un titre, une accroche, des cartes. */
export interface IHomeSection {
  readonly id: string;
  readonly kicker: string;
  readonly title: string;
  readonly intro: string;
  /** `true` = bande pleine largeur, sur le fond adouci. */
  readonly band: boolean;
  readonly cards: readonly IHomeCard[];
  readonly note: string | null;
}

/** Tout le contenu de développement de l'accueil. */
export interface IHomeContent {
  /** Console d'administration, ou `null` quand l'application n'en a pas. */
  readonly console: { readonly label: string; readonly href: string } | null;
  /** Liens qui SORTENT de l'application (documentation, sources). */
  readonly external: readonly {
    readonly label: string;
    readonly href: string;
  }[];
  /** Le bouton de la démo, montré seulement si elle est chargée. */
  readonly demoLabel: string;
  /**
   * Sinon, la démo se NOMME : la commande d'une application jetable qui la
   * porte — la question de `create app` passe vite, cette page reste.
   */
  readonly learn: {
    readonly label: string;
    readonly command: string;
    readonly note: string;
  };
  readonly hero: {
    /** Le premier badge, mis en avant. */
    readonly lead: string;
    readonly title: string;
    readonly sub: string;
    readonly sig: string;
    readonly badges: readonly string[];
    readonly install: { readonly command: string; readonly arg: string };
  };
  readonly sections: readonly IHomeSection[];
}

/**
 * Compose un texte d'accueil : les valeurs interpolées deviennent du code.
 * rich`Celui de l'onglet : ${"public/favicon.ico"}.`
 */
function rich(
  strings: TemplateStringsArray,
  ...codes: readonly string[]
): IHomeText[] {
  const out: IHomeText[] = [];
  strings.forEach((text, i) => {
    if (text !== "") out.push({ text, code: false });
    // `at()` : `undefined` après la dernière valeur, quelle que soit la
    // configuration de l'index (`noUncheckedIndexedAccess`).
    const code = codes.at(i);
    if (code !== undefined) out.push({ text: code, code: true });
  });
  return out;
}

/**
 * Le contenu de développement de l'accueil. Une FONCTION, pas une constante :
 * jamais appelée, elle disparaît du bundle de production avec tout ce qu'elle
 * porte — mot de passe compris.
 *
 * @returns un contenu neuf à chaque appel
 */
export function homeContent(): IHomeContent {
  return {
    console: { label: "Console", href: "/nodefony" },
    external: [
      { label: "Documentation", href: "https://nodefony.net/" },
      { label: "GitHub", href: "https://github.com/nodefony/nodefony-core" },
    ],
    demoLabel: "Voir les démos",
    learn: {
      label: "Pour apprendre",
      command: "npm create nodefony essai -- --demo",
      note: "une app jetable avec les démos commentées",
    },
    hero: {
      lead: "Agentic ready",
      title: "Le framework Node.js fullstack",
      sub: "Temps réel natif · développement agentic-ready · socle TypeScript isomorphe",
      sig: "Une action de contrôleur. Deux transports. La même session, la même sécurité, le même code.",
      badges: [
        "Node.js 24.16+ ou 26+",
        "TypeScript strict",
        "ESM only",
        "Licence Apache 2.0",
      ],
      install: { command: "npm create nodefony", arg: "mon-app" },
    },
    sections: [
      {
        id: "nf-start",
        kicker: "Développement",
        title: "Pour commencer",
        intro: "Le compte de ton poste et la console d'administration.",
        band: true,
        cards: [
          {
            title: "Compte de développement",
            text: rich`Défini dans ${"nodefony/security/provisionUsers.ts"}, tiré au hasard pour cette application. Créé au premier démarrage — si ${"NF_ADMIN_PASSWORD"} figurait alors dans ${".env"}, c'est lui le mot de passe.`,
            creds: { user: "admin", password: "3cjn-5eyz-j7dd" },
            href: null,
            go: null,
            tone: null,
            skins: null,
          },
          {
            title: "Console d'administration",
            text: rich`L'état réel de l'application : routes, services, configuration effective, journal.`,
            href: "/nodefony",
            go: "Ouvrir /nodefony →",
            creds: null,
            tone: null,
            skins: null,
          },
          {
            title: "En production",
            text: rich`Aucun mot de passe par défaut (staging compris) : ${"admin"} n'est créé que si ${"NF_ADMIN_PASSWORD"} est posé. Sans lui, aucun compte — un avertissement au démarrage renvoie à ${"npx nodefony security:user:add admin --admin"}. Le démarrage n'est jamais bloqué.`,
            href: null,
            go: null,
            creds: null,
            tone: "safe",
            skins: null,
          },
        ],
        note: null,
      },
      {
        id: "nf-custom",
        kicker: "Personnaliser",
        title: "C'est ta page",
        intro: "Où changer l'accueil, la marque et la page de connexion.",
        band: false,
        cards: [
          {
            title: "Accueil",
            text: rich`${"frontend/src/App.tsx"} pour le contenu, ${"frontend/src/showcase.css"} pour le style, ${"frontend/src/homeContent.ts"} pour ces sections de développement.`,
            href: null,
            go: null,
            creds: null,
            tone: null,
            skins: null,
          },
          {
            title: "Logo",
            text: rich`Celui de la page : ${"frontend/src/brand.ts"}. Celui de l'onglet : ${"public/favicon.ico"}.`,
            href: null,
            go: null,
            creds: null,
            tone: null,
            skins: null,
          },
          {
            title: "Page de connexion",
            text: rich`${"loginPage"} dans ${"nodefony/config/security.ts"} : ${"title"}, ${"logo"}, ${"stylesheet"}, ${"skin"}. Choisis un habillage pour le voir :`,
            href: null,
            go: null,
            creds: null,
            tone: null,
            skins: {
              action: "/login",
              options: [
                "frontispiece",
                "ledger",
                "horizon",
                "console",
                "blueprint",
                "dots",
                "minimal",
                "enterprise",
                "photo-card",
              ],
              selected: "horizon",
            },
          },
        ],
        note: "Ces sections n'existent qu'en développement : le build de production les retire.",
      },
    ],
  };
}
