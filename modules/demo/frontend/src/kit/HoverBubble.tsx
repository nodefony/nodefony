import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

/**
 * Une bulle qui s'ouvre au survol ou au focus d'un élément — jamais l'élément
 * lui-même : un lien, une pastille, une pièce.
 *
 * Guide pour un agent : brique du KIT, qui suit WCAG 1.4.13 (contenu au
 * survol ou au focus). La bulle est un `popover="manual"` (couche supérieure,
 * ni coupée par un `overflow` ni masquée par un voisin) portant
 * `role="tooltip"` ; l'élément déclencheur reçoit `aria-describedby` vers
 * elle. Elle s'ouvre au focus clavier tout de suite, au survol après
 * `BUBBLE_OPEN_DELAY_MS`, se ferme par Échap, à la sortie du pointeur
 * (`BUBBLE_CLOSE_DELAY_MS` laissés pour passer sur la bulle : elle reste
 * survolable) ou du focus, et ne prend JAMAIS le focus : son contenu n'est pas
 * interactif. Au toucher, le 1er appui ouvre (`onClick` du déclencheur
 * annule le geste), le 2e suit le lien. Rien n'est alloué fermée : ni
 * élément, ni écouteur de document — ils n'existent que pendant l'ouverture,
 * et sont retirés à la fermeture et au démontage.
 *
 * @param bubble - le contenu : un élément, monté (donc exécuté) SEULEMENT bulle ouverte
 * @param trigger - le déclencheur, reçoit `aria-describedby` et `onClick`
 */
export function HoverBubble({
  bubble,
  trigger,
}: {
  bubble: ReactNode;
  trigger: (anchor: IBubbleAnchor) => ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const host = useRef<HTMLSpanElement>(null);
  const pop = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);
  const touched = useRef(false);

  const clear = () => {
    if (timer.current === null) return;
    window.clearTimeout(timer.current);
    timer.current = null;
  };
  const later = (next: boolean, delay: number) => {
    clear();
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setOpen(next);
    }, delay);
  };
  useEffect(() => clear, []);

  // Échap et appui ailleurs ferment — écouteurs posés bulle ouverte seulement.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        host.current?.contains(event.target) !== true
      )
        setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  // La bulle va en couche supérieure et se place sous (ou sur) le déclencheur ;
  // son contenu peut grandir (un aperçu qui arrive) : on la replace alors.
  // Couche supérieure = coordonnées de la FENÊTRE : quand un conteneur défile
  // (le fil du salon, la page), le déclencheur bouge et la bulle non — elle
  // le suit donc à chaque défilement, et se ferme quand il sort de la vue.
  useLayoutEffect(() => {
    const bubbleEl = pop.current;
    const anchorEl = host.current;
    if (!open || bubbleEl === null || anchorEl === null) return;
    if (typeof bubbleEl.showPopover === "function") bubbleEl.showPopover();
    const place = () => {
      const anchor = anchorEl.getBoundingClientRect();
      if (!inView(anchorEl, anchor)) {
        setOpen(false);
        return;
      }
      const width = bubbleEl.offsetWidth;
      const height = bubbleEl.offsetHeight;
      const left = Math.max(
        BUBBLE_MARGIN,
        Math.min(anchor.left, window.innerWidth - width - BUBBLE_MARGIN),
      );
      const below = anchor.bottom + BUBBLE_GAP;
      const top =
        below + height + BUBBLE_MARGIN > window.innerHeight &&
        anchor.top - height - BUBBLE_GAP > BUBBLE_MARGIN
          ? anchor.top - height - BUBBLE_GAP
          : below;
      bubbleEl.style.left = `${left}px`;
      bubbleEl.style.top = `${top}px`;
    };
    place();
    const watcher = new ResizeObserver(place);
    watcher.observe(bubbleEl);
    // Capture : le défilement d'un conteneur ne remonte pas jusqu'au document.
    const options: AddEventListenerOptions = { capture: true, passive: true };
    document.addEventListener("scroll", place, options);
    window.addEventListener("resize", place, options);
    return () => {
      watcher.disconnect();
      document.removeEventListener("scroll", place, options);
      window.removeEventListener("resize", place, options);
    };
  }, [open]);

  return (
    <span
      ref={host}
      className="bubble-host"
      onPointerDown={(event) => {
        touched.current = event.pointerType === "touch";
      }}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch")
          later(true, open ? 0 : BUBBLE_OPEN_DELAY_MS);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") later(false, BUBBLE_CLOSE_DELAY_MS);
      }}
      onFocus={() => {
        clear();
        setOpen(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          clear();
          setOpen(false);
        }
      }}
    >
      {trigger({
        "aria-describedby": open ? id : undefined,
        onClick: (event) => {
          // Au toucher, le 1er appui montre la bulle ; le 2e suit le lien.
          if (touched.current && !open) {
            event.preventDefault();
            setOpen(true);
          }
          touched.current = false;
        },
      })}
      {open && (
        <span
          ref={pop}
          id={id}
          className="bubble"
          popover="manual"
          role="tooltip"
        >
          {bubble}
        </span>
      )}
    </span>
  );
}

/**
 * Le déclencheur est-il encore visible ? Dans la fenêtre, et dans chaque
 * conteneur qui le coupe (`overflow` autre que `visible`) — le fil d'un salon
 * qui défile le cache sans qu'il quitte la fenêtre.
 *
 * @param el - le déclencheur
 * @param box - sa boîte, déjà mesurée
 */
export function inView(el: Element, box: DOMRect): boolean {
  if (box.bottom <= 0 || box.top >= window.innerHeight) return false;
  for (let up = el.parentElement; up !== null; up = up.parentElement) {
    if (getComputedStyle(up).overflowY === "visible") continue;
    const clip = up.getBoundingClientRect();
    if (box.bottom <= clip.top || box.top >= clip.bottom) return false;
  }
  return true;
}

/** Ce que le déclencheur d'une bulle doit porter. */
export interface IBubbleAnchor {
  "aria-describedby": string | undefined;
  onClick: (event: MouseEvent<HTMLElement>) => void;
}

/** Le survol ouvre la bulle après 400 ms : passer la souris dessus n'ouvre rien. */
export const BUBBLE_OPEN_DELAY_MS = 400;

/** Temps laissé au pointeur pour passer du déclencheur à la bulle. */
export const BUBBLE_CLOSE_DELAY_MS = 150;

/** Écart entre le déclencheur et la bulle, en pixels. */
const BUBBLE_GAP = 4;

/** Marge minimale entre la bulle et le bord de la fenêtre. */
const BUBBLE_MARGIN = 8;
