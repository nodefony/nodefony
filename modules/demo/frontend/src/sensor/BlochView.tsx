import { useEffect, useRef, useState } from "react";
import type { IBlochScene } from "./blochScene";

/** Deux décimales, virgule française. */
const FR2 = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
function fr2(value: number): string {
  return FR2.format(value);
}

/**
 * Sonde — la sphère de Bloch à l'écran : le canvas, le chargement différé de la
 * 3D, la taille, le repli, et l'estimation qui arrive.
 *
 * Guide pour un agent : composant PUR — il reçoit le vecteur de Bloch estimé et
 * celui de l'état visé, calculés par la page (`sensorClient.ts`) à partir de la
 * trame `sensor:tomo` ; il ne connaît pas la socket. Three.js (`blochScene.ts`)
 * est chargé par `import()` au montage, donc payé sur cette seule page. Sans
 * WebGL, ou si le chargement échoue, un texte de repli le dit et la ligne de
 * lecture sous la figure garde l'estimation lisible. `prefers-reduced-motion` :
 * la flèche ne se redessine plus qu'une fois par seconde au lieu de suivre
 * chaque trame.
 *
 * @param estimate - le vecteur de Bloch estimé, `null` avant les premiers tirs
 * @param projected - l'estimation brute sortait de la boule et a été ramenée dessus
 * @param target - le vecteur de Bloch de l'état préparé (référence STABLE : la scène
 *   est recréée si ses composantes changent)
 */
export function BlochView(props: {
  estimate: readonly [number, number, number] | null;
  projected: boolean;
  target: readonly [number, number, number];
}) {
  const { estimate, projected, target } = props;
  const [tx, ty, tz] = target;
  const box = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const scene = useRef<IBlochScene | null>(null);
  const reducedMotion = useRef(false);
  const lastPush = useRef(0);
  const [status, setStatus] = useState<
    "loading" | "ready" | "no-webgl" | "failed"
  >("loading");

  // #region sensor-bloch-view
  useEffect(() => {
    const element = canvas.current;
    if (element === null) return;
    let alive = true;
    reducedMotion.current = matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setStatus("loading");
    // La 3D arrive après le reste : la page et la socket n'attendent pas Three.js.
    import("./blochScene")
      .then(({ createBlochScene }) => {
        if (!alive) return;
        let view: IBlochScene;
        try {
          // `WebGLRenderer` lève si le navigateur ne donne pas de contexte WebGL.
          view = createBlochScene(element, [tx, ty, tz]);
        } catch {
          setStatus("no-webgl");
          return;
        }
        scene.current = view;
        const rect = element.getBoundingClientRect();
        view.resize(rect.width, rect.height);
        setStatus("ready");
      })
      .catch(() => {
        if (alive) setStatus("failed");
      });
    return () => {
      alive = false;
      scene.current?.dispose();
      scene.current = null;
    };
  }, [tx, ty, tz]);
  // #endregion

  useEffect(() => {
    const element = box.current;
    if (element === null) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries.at(0);
      if (entry === undefined) return;
      scene.current?.resize(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const view = scene.current;
    if (view === null || status !== "ready" || estimate === null) return;
    if (!reducedMotion.current) {
      view.setEstimate(estimate, projected);
      return;
    }
    // Moins d'animation demandé : au plus une image par seconde, la dernière valeur gagne.
    const wait = lastPush.current + 1000 - performance.now();
    if (wait <= 0) {
      lastPush.current = performance.now();
      view.setEstimate(estimate, projected);
      return;
    }
    const timer = setTimeout(() => {
      lastPush.current = performance.now();
      scene.current?.setEstimate(estimate, projected);
    }, wait);
    return () => clearTimeout(timer);
  }, [estimate, projected, status]);

  const readout =
    estimate === null
      ? "en attente des premiers tirs…"
      : `(${fr2(estimate[0])} ; ${fr2(estimate[1])} ; ${fr2(estimate[2])})${projected ? " · projetée sur la sphère" : ""}`;
  const label = `Sphère de Bloch : état visé (${fr2(tx)} ; ${fr2(ty)} ; ${fr2(tz)}), estimation ${readout}. Glisse ou utilise les flèches pour tourner.`;

  let fallback: string | null;
  switch (status) {
    case "ready":
      fallback = null;
      break;
    case "loading":
      fallback = "Chargement de la sphère de Bloch…";
      break;
    case "no-webgl":
      fallback =
        "WebGL indisponible : la sphère ne peut pas s'afficher ici. L'estimation reste lisible ci-dessous.";
      break;
    case "failed":
      fallback =
        "La vue 3D n'a pas pu se charger. L'estimation reste lisible ci-dessous.";
      break;
  }

  return (
    <div className="sensor-bloch-view">
      <div className="sensor-bloch" ref={box}>
        <canvas ref={canvas} tabIndex={0} aria-label={label} />
        {fallback === null ? null : (
          <p className="sensor-bloch-fallback" role="status">
            {fallback}
          </p>
        )}
      </div>
      <p className="sensor-bloch-readout">
        vecteur de Bloch estimé <b>{readout}</b>
        {status === "ready" ? " · glisse pour tourner la sphère" : ""}
      </p>
    </div>
  );
}
