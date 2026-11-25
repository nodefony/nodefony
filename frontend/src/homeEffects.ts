/**
 * Les gestes de l'accueil, écrits UNE fois pour tous les fronts : le thème
 * clair/sombre, la lumière qui suit le pointeur sur les cartes, la barre de
 * debug, la présence de la démo. La page de chaque front ne fait que les
 * brancher sur son cycle de vie.
 *
 * Le reste du mouvement (halos, apparition au défilement, ombre de l'en-tête)
 * est en CSS pur, dans `showcase.css`, et s'éteint quand l'utilisateur a
 * demandé à réduire les animations.
 */

const THEME_KEY = "nf-theme";

/**
 * Le thème à appliquer : celui choisi dans ce navigateur, sinon celui du système.
 *
 * @returns `true` pour le thème sombre
 */
export function readDarkTheme(): boolean {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === "dark";
  } catch {
    // Stockage refusé (navigation privée, politique) : on suit le système.
  }
  return matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Applique un thème à la page et le retient pour ce navigateur.
 *
 * @param dark - `true` pour le thème sombre
 * @param remember - `false` pour l'appliquer sans le retenir (premier rendu)
 */
export function applyDarkTheme(dark: boolean, remember = true): void {
  document.documentElement.dataset["theme"] = dark ? "dark" : "light";
  if (!remember) return;
  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch {
    // Stockage refusé : le choix vaut pour cette page seulement.
  }
}

/**
 * Lumière qui suit le pointeur sur les cartes : UN écouteur pour toute la page,
 * un calcul par image au plus.
 *
 * @param selector - les éléments éclairés (`.nf-card`)
 * @returns la fonction qui retire l'écouteur
 */
export function startPointerLight(selector: string): () => void {
  let frame = 0;
  let target: HTMLElement | null = null;
  let x = 0;
  let y = 0;
  const paint = (): void => {
    frame = 0;
    if (target === null) return;
    const box = target.getBoundingClientRect();
    target.style.setProperty("--mx", `${x - box.left}px`);
    target.style.setProperty("--my", `${y - box.top}px`);
  };
  const onMove = (event: PointerEvent): void => {
    const found =
      event.target instanceof Element ? event.target.closest(selector) : null;
    target = found instanceof HTMLElement ? found : null;
    x = event.clientX;
    y = event.clientY;
    if (target !== null && frame === 0) frame = requestAnimationFrame(paint);
  };
  document.addEventListener("pointermove", onMove, { passive: true });
  return () => {
    document.removeEventListener("pointermove", onMove);
    cancelAnimationFrame(frame);
  };
}

/** La barre de debug du développement, vue de la page. */
export interface IDebugBarHandle {
  isVisible(): boolean;
  setVisible(visible: boolean): void;
}

/**
 * La poignée que publie la barre de debug (développement), vérifiée avant usage.
 *
 * @returns la poignée, ou `null` hors développement ou avant son injection
 */
export function findDebugBar(): IDebugBarHandle | null {
  const handle: unknown = Reflect.get(globalThis, "__NODEFONY_DEBUGBAR__");
  if (typeof handle !== "object" || handle === null) return null;
  if (!("isVisible" in handle) || !("setVisible" in handle)) return null;
  const { isVisible, setVisible } = handle;
  if (typeof isVisible !== "function" || typeof setVisible !== "function") {
    return null;
  }
  return {
    isVisible: () => isVisible.call(handle) === true,
    setVisible: (visible) => void setVisible.call(handle, visible),
  };
}

/**
 * La page de la démo, si elle est chargée — CONSTATÉ par le serveur, qui la
 * nomme dans la page (`<meta name="nodefony-demo">`, posée par
 * `AppController`). Suit l'ajout ou le retrait du module, sans requête :
 * une sonde HTTP qui échoue s'inscrit en erreur dans la console du navigateur.
 *
 * @returns l'adresse de la démo, ou `null` si elle n'est pas chargée
 */
export function findDemo(): string | null {
  const meta = document.querySelector('meta[name="nodefony-demo"]');
  return meta?.getAttribute("content") ?? null;
}
