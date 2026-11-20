import { detectBlocks } from "./detect";
import { collectLinks, parseMarkdown } from "./markdown";

/**
 * Les adresses des liens d'un message, dans l'ordre où la page les montre :
 * le rang d'un lien est son indice d'aperçu (`LINK_INDEX_MAX` au plus).
 *
 * Guide pour un agent : brique du KIT. La page ET le serveur comptent avec
 * CETTE règle : les liens des blocs de nature `text` seulement (`detect.ts`),
 * lus par `parseMarkdown`. Une adresse dans un bloc de code, un JSON ou un
 * tableau n'est pas un lien — la page ne la rend pas cliquable, donc elle n'a
 * pas de rang.
 *
 * @param text - le texte brut du message
 * @returns les adresses `http:`/`https:`, dans l'ordre
 */
// #region chat-link-rank
export function messageLinks(text: string): string[] {
  const links: string[] = [];
  for (const block of detectBlocks(text))
    if (block.nature === "text")
      links.push(...collectLinks(parseMarkdown(block.source)));
  return links;
}
// #endregion
