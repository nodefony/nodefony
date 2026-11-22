/**
 * Ce que l'accueil de la démo affiche dans sa barre : l'identité de
 * l'application et la version de Nodefony INSTALLÉE — lues au démarrage du
 * serveur, jamais écrites en dur dans la page.
 *
 * Type PARTAGÉ : le contrôleur `DemoController` (`/demo/api/about`) le
 * produit, la page le consomme. Une seule déclaration, donc une seule vérité.
 */
export interface IDemoAbout {
  app: { name: string; version: string };
  nodefony: { version: string };
  /** Page de connexion de l'application (`loginPage.path`), `null` si désactivée. */
  loginPath: string | null;
  /**
   * La version de la DOCUMENTATION à lier : celle de Nodefony installé, ou
   * `DOCS_NEXT` quand Nodefony tourne depuis ses sources (`docsVersionFor`).
   */
  docs: string;
}

/**
 * Le dossier du site qui porte la doc du DÉVELOPPEMENT (branche `dev`) :
 * celle d'un Nodefony lu depuis ses sources, plus récent que sa dernière
 * publication.
 */
export const DOCS_NEXT = "next";

/**
 * La version de la documentation qui décrit le Nodefony qui tourne.
 *
 * Un paquet installé par npm vit sous `node_modules` : sa doc est celle de sa
 * version. Hors de `node_modules` (le dépôt du framework, une application
 * LIÉE à lui), le code est plus récent que le numéro qu'il porte — une page
 * née depuis la dernière publication n'existe qu'en `next`. La règle se
 * CONSTATE sur le chemin réel du paquet, elle ne se déduit pas du numéro.
 *
 * @param packagePath - chemin RÉEL (liens résolus) d'un fichier du paquet `nodefony`
 * @param version - `Nodefony.version`
 * @returns la version à lier, ou `DOCS_NEXT`
 */
export function docsVersionFor(packagePath: string, version: string): string {
  return packagePath.split(/[\\/]/u).includes("node_modules")
    ? version
    : DOCS_NEXT;
}

/**
 * La version de la doc que les liens d'une page visent.
 *
 * @param about - ce que `/demo/api/about` a rendu, ou `null` tant qu'il n'est pas lu
 */
export function docsVersion(about: IDemoAbout | null): string | null {
  return about?.docs ?? null;
}

/** Route servie par `DemoController.about`. */
export const DEMO_ABOUT_PATH = "/demo/api/about";

/** Site de la documentation publique (une publication par dossier). */
const SITE_URL = "https://nodefony.net/";

/** Dépôt du framework. */
export const REPO_URL = "https://github.com/nodefony/nodefony-core";

/**
 * Valide une réponse de `/demo/api/about` sans la croire sur parole.
 *
 * @param value - corps JSON reçu
 * @returns l'objet typé, ou `null` s'il n'a pas la forme attendue
 */
export function parseDemoAbout(value: unknown): IDemoAbout | null {
  if (typeof value !== "object" || value === null) return null;
  if (!("app" in value) || !("nodefony" in value)) return null;
  const { app, nodefony } = value;
  if (typeof app !== "object" || app === null) return null;
  if (typeof nodefony !== "object" || nodefony === null) return null;
  if (!("name" in app) || !("version" in app) || !("version" in nodefony)) {
    return null;
  }
  const { name, version } = app;
  const nfVersion = nodefony.version;
  if (
    typeof name !== "string" ||
    typeof version !== "string" ||
    typeof nfVersion !== "string"
  ) {
    return null;
  }
  const loginPath =
    "loginPath" in value && typeof value.loginPath === "string"
      ? value.loginPath
      : null;
  const docs =
    "docs" in value && typeof value.docs === "string" ? value.docs : nfVersion;
  return {
    app: { name, version },
    nodefony: { version: nfVersion },
    loginPath,
    docs,
  };
}

/**
 * Lien vers une page de la documentation publique, À LA VERSION installée :
 * le site garde chaque publication dans son dossier, et le développement
 * dans `next/`.
 *
 * @param version - version de la doc (`docsVersion(about)`) ;
 *   `null` tant qu'elle n'est pas lue : l'accueil du site, faute de mieux
 * @param page - chemin de la page sous `docs/` (vide : l'accueil de la doc)
 */
export function docUrl(version: string | null, page = ""): string {
  if (version === null) return SITE_URL;
  const base = `${SITE_URL}${version}/docs/`;
  return page === "" ? base : `${base}${page}/`;
}

/**
 * Lien vers un fichier du dépôt du framework, à l'étiquette de la version
 * installée (`v<version>`), sur la branche `dev` pour `DOCS_NEXT` ; `main`
 * — la dernière publication — tant qu'elle n'est pas lue.
 *
 * @param version - version de la doc (`docsVersion(about)`), ou `null`
 * @param file - chemin du fichier à la racine du dépôt (`LICENSE.txt`)
 */
export function repoFileUrl(version: string | null, file: string): string {
  const ref =
    version === null ? "main" : version === DOCS_NEXT ? "dev" : `v${version}`;
  return `${REPO_URL}/blob/${ref}/${file}`;
}
