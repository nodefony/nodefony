import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type katexType from "katex";

/** Une macro se développe au plus 100 fois (le défaut de KaTeX : 1000). */
export const MATH_MAX_EXPAND = 100;

/** Une taille écrite par l'auteur ne dépasse pas 20 em. */
export const MATH_MAX_SIZE = 20;

/** Le module KaTeX, importé une fois ; reprend après un échec réseau. */
let loading: Promise<typeof katexType> | null = null;

/** Charge KaTeX, au premier appel seulement. */
function loadKatex(): Promise<typeof katexType> {
  if (loading === null) {
    loading = import("katex").then((module) => module.default);
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

/**
 * Une formule TeX, rendue par KaTeX — chargé au PREMIER usage seulement.
 *
 * Guide pour un agent : brique du KIT. `katex` s'importe par `import()` à la
 * première formule d'une page (0 octet sinon, D33). Avant son arrivée, la
 * formule s'affiche en TEXTE à chasse fixe ; KaTeX construit ensuite ses
 * propres nœuds dans l'élément qu'on lui prête (`katex.render`, jamais une
 * chaîne HTML injectée). Le message vient d'un autre utilisateur : les
 * options ferment tout ce qui sort de la formule — `trust: false` (ni lien ni
 * image ni style imposé), `strict: "ignore"`, `maxExpand` et `maxSize`
 * bornés (une macro qui s'appelle elle-même ne boucle pas). La sortie est du
 * MathML seul : le navigateur le rend et le lecteur d'écran le lit, sans
 * feuille de style ni police à servir.
 *
 * @param tex - la formule, sans `$`
 * @param display - formule centrée (bloc) plutôt qu'en ligne
 */
export function MathView({
  tex,
  display = false,
}: {
  tex: string;
  display?: boolean;
}) {
  const [katex, setKatex] = useState<typeof katexType | null>(null);
  const target = useRef<HTMLElement>(null);
  useEffect(() => {
    let alive = true;
    loadKatex().then(
      (loaded) => {
        if (alive) setKatex(loaded);
      },
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, []);
  // #region chat-katex
  useLayoutEffect(() => {
    if (katex === null || target.current === null) return;
    katex.render(tex, target.current, {
      displayMode: display,
      throwOnError: false,
      trust: false,
      strict: "ignore",
      output: "mathml",
      maxExpand: MATH_MAX_EXPAND,
      maxSize: MATH_MAX_SIZE,
    });
  }, [katex, tex, display]);
  // #endregion
  if (katex === null)
    return createElement(
      display ? "pre" : "code",
      { className: display ? "math math-block math-raw" : "math math-raw" },
      tex,
    );
  return createElement(display ? "div" : "span", {
    ref: target,
    className: display ? "math math-block" : "math",
  });
}
