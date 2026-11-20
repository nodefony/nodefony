import { useEffect, useState } from "react";

/**
 * Ce que seule la démo anime : la section en cours de lecture et la navigation
 * au clavier dans les onglets. Les gestes de l'accueil — thème, lumière sous le
 * pointeur, barre de debug — viennent de `homeEffects.ts`, partagé avec
 * l'accueil de l'application ; le reste du mouvement est du CSS piloté par le
 * défilement, dans `showcase.css` et `demo.css`.
 */

/**
 * Touche → index de l'onglet visé, relatif à l'onglet courant (patron WAI-ARIA
 * « tabs » : flèches, Début, Fin). Partagé par tous les onglets de la démo.
 *
 * @param key - `event.key` de la touche pressée
 * @param index - index de l'onglet qui a le focus
 * @param count - nombre d'onglets
 * @returns l'index visé, ou `null` si la touche ne déplace pas
 */
export function tabTargetIndex(
  key: string,
  index: number,
  count: number,
): number | null {
  switch (key) {
    case "ArrowRight":
      return (index + 1) % count;
    case "ArrowLeft":
      return (index - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

/**
 * Section en cours de lecture, pour la marquer dans la navigation : UN
 * observateur, déclenché quand une section traverse le milieu de l'écran.
 *
 * @param ids - identifiants des sections suivies
 * @returns l'identifiant de la section courante, ou `null` au-dessus de la première
 */
export function useCurrentSection(ids: readonly string[]): string | null {
  const [current, setCurrent] = useState<string | null>(null);
  const key = ids.join(" ");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of key.split(" ")) {
      const section = document.getElementById(id);
      if (section !== null) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [key]);
  return current;
}
