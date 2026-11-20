import { createElement, type ReactNode } from "react";
import {
  isBareLink,
  parseMarkdown,
  type MdBlock,
  type MdInline,
} from "./markdown";
import { MathView } from "./MathView";
import type { IBubbleAnchor } from "./HoverBubble";

/**
 * Un texte Markdown, mis en forme — le MÊME rendu chez chacun, puisque
 * chaque page analyse le même texte brut (`markdown.ts`). Sert au fil d'un
 * salon comme à l'aperçu de l'éditeur (`MarkdownEditor.tsx`).
 *
 * Guide pour un agent : brique du KIT. React échappe chaque chaîne ; aucun
 * HTML n'est injecté, et `href` n'accepte que `http:`/`https:` (filtré à
 * l'analyse). Les enfants passent en arguments de `createElement` : un texte
 * rendu est figé, jamais réordonné, et n'a donc pas besoin de clés.
 *
 * Les natures en ligne (`@nom`, couleur, date ISO, formule) se rendent en
 * éléments typés ; une adresse nue devient une pastille de domaine. Un lien
 * peut être rendu autrement par l'appelant (`renderLink` : la bulle d'aperçu
 * du salon) — son rang (`index`) suit `collectLinks` (`markdown.ts`).
 *
 * @param className - classes ajoutées à `md`
 * @param renderLink - rend un lien à la place de l'ancre ordinaire
 * @param linkStart - rang du premier lien de ce texte dans son message
 */
export function MarkdownText({
  text,
  className,
  renderLink,
  linkStart = 0,
}: {
  text: string;
  className?: string | undefined;
  renderLink?: ((slot: ILinkSlot) => ReactNode) | undefined;
  linkStart?: number;
}) {
  const walk: IWalk = { next: linkStart, renderLink };
  return createElement(
    "div",
    { className: className === undefined ? "md" : `${className} md` },
    ...parseMarkdown(text).map((node) => block(node, walk)),
  );
}

/** Un lien d'un message, tel que la page le rend. */
export interface ILinkSlot {
  href: string;
  /** Son rang parmi les liens du message (`collectLinks`). */
  index: number;
  /** Le nom de domaine de l'adresse. */
  host: string;
  /** Adresse nue, écrite telle quelle : rendue en pastille de domaine. */
  bare: boolean;
  /** Le texte du lien, déjà en éléments. */
  label: ReactNode[];
}

/** L'état d'un rendu : le rang du prochain lien, et qui rend les liens. */
interface IWalk {
  next: number;
  renderLink: ((slot: ILinkSlot) => ReactNode) | undefined;
}

/** Le domaine d'une adresse `http(s)` ; l'adresse elle-même si elle ne se lit pas. */
function hostOf(href: string): string {
  try {
    return new URL(href).hostname;
  } catch {
    return href;
  }
}

/**
 * L'ancre d'un lien : le texte écrit par l'auteur, ou — pour une adresse
 * nue — son domaine en pastille (l'adresse complète reste le nom accessible).
 */
export function MdLink({
  slot,
  anchor,
}: {
  slot: ILinkSlot;
  anchor?: IBubbleAnchor;
}) {
  return createElement(
    "a",
    {
      href: slot.href,
      target: "_blank",
      rel: "noopener noreferrer",
      className: slot.bare ? "md-domain" : undefined,
      "aria-label": slot.bare ? slot.href : undefined,
      "aria-describedby": anchor?.["aria-describedby"],
      onClick: anchor?.onClick,
    },
    ...(slot.bare ? [slot.host] : slot.label),
  );
}

/** Un bloc, en élément. */
function block(node: MdBlock, walk: IWalk): ReactNode {
  switch (node.type) {
    case "pre":
      return (
        <pre className="md-pre">
          <code>{node.value}</code>
        </pre>
      );
    case "quote":
      return createElement("blockquote", null, ...inline(node.children, walk));
    case "ul":
    case "ol":
      return createElement(
        node.type,
        null,
        ...node.items.map((item) =>
          createElement("li", null, ...inline(item, walk)),
        ),
      );
    case "p":
      return createElement("p", null, ...inline(node.children, walk));
  }
}

/** Les morceaux d'une ligne, en éléments. */
function inline(nodes: readonly MdInline[], walk: IWalk): ReactNode[] {
  return nodes.map((node) => piece(node, walk));
}

/** Une date courte, et la date pleine montrée au survol. */
const DAY = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });
const MOMENT = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});
const DAY_FULL = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" });
const MOMENT_FULL = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "full",
  timeStyle: "long",
});

/** Une date ISO, en heure LOCALE ; une date sans heure reste le jour écrit. */
function dateElement(iso: string, hasTime: boolean): ReactNode {
  const parts = iso.slice(0, 10).split("-").map(Number);
  const when = hasTime
    ? new Date(iso)
    : new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1);
  if (Number.isNaN(when.getTime())) return iso;
  // La forme complète : au survol (`title`) ET en texte pour un lecteur
  // d'écran — un `title` seul ne s'atteint ni au clavier ni au toucher.
  const full = (hasTime ? MOMENT_FULL : DAY_FULL).format(when);
  return createElement(
    "time",
    { dateTime: iso, className: "md-date", title: full },
    createElement(
      "span",
      { "aria-hidden": true },
      (hasTime ? MOMENT : DAY).format(when),
    ),
    createElement("span", { className: "sr-only" }, full),
  );
}

/** Un morceau de ligne, en élément. */
function piece(node: MdInline, walk: IWalk): ReactNode {
  if (typeof node === "string") return node;
  switch (node.type) {
    case "mention":
      return createElement(
        "span",
        { className: "md-mention" },
        `@${node.name}`,
      );
    case "color":
      return createElement(
        "span",
        { className: "md-swatch" },
        createElement("i", {
          className: "md-swatch-dot",
          style: { background: node.value },
          "aria-hidden": true,
        }),
        node.value,
      );
    case "date":
      return dateElement(node.iso, node.hasTime);
    case "math":
      return createElement(MathView, { tex: node.tex });
    case "br":
      return createElement("br");
    case "code":
      return createElement("code", null, node.value);
    case "strong":
      return createElement("strong", null, ...inline(node.children, walk));
    case "em":
      return createElement("em", null, ...inline(node.children, walk));
    case "link": {
      const slot: ILinkSlot = {
        href: node.href,
        index: walk.next,
        host: hostOf(node.href),
        bare: isBareLink(node),
        label: inline(node.children, walk),
      };
      walk.next += 1;
      return walk.renderLink === undefined
        ? createElement(MdLink, { slot })
        : walk.renderLink(slot);
    }
  }
}
