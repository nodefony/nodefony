import { useEffect, useRef, type RefObject } from "react";

/**
 * La boucle d'affichage et la taille d'un canvas : la brique React que les jeux
 * de la démo partagent.
 *
 * Guide pour un agent : `requestAnimationFrame` suit l'écran (60 images/s, ou
 * plus), indépendamment du serveur ; le rappel reçoit le temps écoulé et
 * l'instant, et la boucle s'arrête au démontage. La taille vient d'un
 * `ResizeObserver` : un canvas suit son conteneur, téléphone compris.
 */

/** Le temps écoulé est borné : un onglet revenu au premier plan ne fait pas un bond. */
const MAX_DT = 0.1;

// #region game-loop
/** Appelle `frame(dt, now)` à chaque image, jusqu'au démontage. */
export function useGameLoop(frame: (dt: number, now: number) => void): void {
  const latest = useRef(frame);
  latest.current = frame;
  useEffect(() => {
    let last = performance.now();
    let handle = requestAnimationFrame(function tick(now) {
      const dt = Math.min(MAX_DT, (now - last) / 1000);
      last = now;
      latest.current(dt, now);
      handle = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(handle);
  }, []);
}
// #endregion

/** Appelle `onSize(largeur, hauteur)` à chaque changement de taille de l'élément. */
export function useElementSize(
  ref: RefObject<HTMLElement | null>,
  onSize: (width: number, height: number) => void,
): void {
  const latest = useRef(onSize);
  latest.current = onSize;
  useEffect(() => {
    const element = ref.current;
    if (element === null) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries.at(0);
      if (entry === undefined) return;
      latest.current(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
}

/** Le visiteur a-t-il demandé moins d'animation ? Un téléphone a-t-il peu de puissance ? */
export function displayPrefs(): { reducedMotion: boolean; lowPower: boolean } {
  return {
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    lowPower: matchMedia("(pointer: coarse)").matches || innerWidth < 640,
  };
}
