import { createElement, useMemo, type ReactNode } from "react";
import { detectBlocks } from "./detect";
import { collectLinks, parseMarkdown } from "./markdown";
import { MarkdownText, type ILinkSlot } from "./MarkdownText";
import { NatureBlockView } from "./NatureBlocks";

/**
 * Le texte d'un message, bloc par bloc, chacun rendu selon sa NATURE.
 *
 * Guide pour un agent : brique du KIT. `detectBlocks` (`detect.ts`) découpe le
 * texte brut — la nature se calcule ICI, dans la page, jamais côté serveur —,
 * `NatureBlockView` (`NatureBlocks.tsx`) rend le code, le JSON, le tableau, le
 * diff et la formule, `MarkdownText` le texte. Le rang des liens se poursuit
 * d'un bloc de texte au suivant (`messageLinks.ts` : la même règle côté
 * serveur), pour que `renderLink` reçoive l'indice que le serveur retrouve.
 *
 * @param className - classes du bloc de texte (`room-text`)
 * @param renderLink - rend un lien à la place de l'ancre ordinaire
 */
export function MessageBody({
  text,
  className,
  renderLink,
}: {
  text: string;
  className?: string | undefined;
  renderLink?: ((slot: ILinkSlot) => ReactNode) | undefined;
}) {
  const blocks = useMemo(() => detectBlocks(text), [text]);
  let links = 0;
  // Une liste FIGÉE (recalculée d'un bloc, jamais réordonnée) : sans clés.
  return createElement(
    "div",
    { className: "msg-body" },
    ...blocks.map((block, index) => {
      if (block.nature !== "text")
        return createElement(NatureBlockView, { block });
      const start = links;
      // Le rang ne se compte que s'il y a un bloc de texte après celui-ci.
      if (blocks.slice(index + 1).some((next) => next.nature === "text"))
        links += collectLinks(parseMarkdown(block.source)).length;
      return createElement(MarkdownText, {
        className,
        text: block.source,
        renderLink,
        linkStart: start,
      });
    }),
  );
}
