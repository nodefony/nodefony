import { formatSize } from "../kit/preview";
import { utf8ByteLength } from "../kit/utf8";
import {
  ATTACHMENT_MAX_BYTES,
  ATTACHMENT_MAX_COUNT,
  MESSAGE_MAX_BYTES,
} from "./chatContract";

/**
 * Les règles des pièces jointes du salon — pures, lues par la page ET par le
 * serveur : une seule définition de « trop gros », « trop de pièces » et
 * « ce que devient un collage ».
 *
 * Guide pour un agent : la page s'en sert pour PRÉVENIR (chip refusée avant
 * l'envoi), le serveur pour DÉCIDER (`ChatController.attach` les rejoue) — le
 * navigateur n'est jamais cru. Aucune dépendance : le fichier entre tel quel
 * dans le paquet du navigateur.
 */

// #region chat-paste
/**
 * Ce que devient un texte collé dans le champ :
 * - `text` — collé tel quel, comme partout ;
 * - `code` — du code (un fichier copié depuis l'éditeur) : entouré d'un bloc
 *   ```` ``` ````, pour que le salon le montre en code, à la largeur du fil,
 *   au lieu de l'interpréter en Markdown ;
 * - `piece` — plus lourd qu'un message (`MESSAGE_MAX_BYTES`), ou impossible à
 *   entourer (il contient lui-même une clôture) : une pièce « texte collé ».
 *
 * Un collage reste un MESSAGE tant qu'il en a la taille : c'est ce qu'on
 * attend d'un chat, et ce que l'autre lit sans ouvrir de fichier.
 *
 * @param text - le texte du presse-papiers
 */
export function pasteRoute(text: string): "text" | "code" | "piece" {
  if (utf8ByteLength(text) + PASTE_FENCE_BYTES > MESSAGE_MAX_BYTES)
    return "piece";
  if (!looksLikeCode(text)) return "text";
  return /^\s*```/mu.test(text) ? "piece" : "code";
}

/** Les octets qu'ajoute la clôture : deux lignes ```` ``` ```` et leurs sauts. */
const PASTE_FENCE_BYTES = 10;
// #endregion

/** Un mot qui ouvre une ligne de code dans la plupart des langages. */
const CODE_LEAD =
  /^\s*(import|export|const|let|var|function|class|interface|type|return|if|for|while|def|package|public|private|#include|use|fn|async|await)\b/u;

/**
 * Ce texte est-il du code ? Au moins trois lignes non vides, dont deux sur
 * cinq indentées, terminées par `;` `{` `}` `,` `(` `)`, ou ouvertes par un
 * mot de code. Une prose de plusieurs paragraphes n'y ressemble pas : ses
 * lignes ne s'indentent pas et finissent par un point.
 */
export function looksLikeCode(text: string): boolean {
  let lines = 0;
  let coded = 0;
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    lines += 1;
    if (
      /^(\t| {2,})\S/u.test(line) ||
      /[;{}(),[\]]\s*$/u.test(line) ||
      CODE_LEAD.test(line)
    )
      coded += 1;
  }
  return lines >= 3 && coded * 5 >= lines * 2;
}

/**
 * Entoure un collage de code d'un bloc ```` ``` ```` sur ses propres lignes,
 * sans ses sauts de ligne finaux.
 *
 * @param text - le code collé (`pasteRoute` a rendu `code`)
 */
export function fencePaste(text: string): string {
  return `\`\`\`\n${text.replace(/\r\n?/gu, "\n").replace(/\n+$/u, "")}\n\`\`\`\n`;
}

/** Le nom du fichier né d'un collage. */
export function pastedFileName(index: number): string {
  return `texte-collé-${index}.txt`;
}

// #region chat-attach-rules
/**
 * Un texte trop lourd pour un message : plus de `MESSAGE_MAX_BYTES` octets
 * UTF-8. La SEULE écriture de la règle — le schéma d'envoi (`SendBody`), le
 * compositeur et le contrôleur l'appellent. `null` quand le texte passe.
 *
 * @param text - le texte du message
 */
export function textProblem(text: string): string | null {
  const bytes = utf8ByteLength(text);
  return bytes > MESSAGE_MAX_BYTES
    ? `texte trop long (${formatSize(bytes)} pour ${formatSize(MESSAGE_MAX_BYTES)}) — joins-le en fichier`
    : null;
}

/**
 * Ce qui empêche un envoi : rien à envoyer, un texte trop lourd, trop de
 * pièces, une pièce trop grosse ou vide. `null` quand l'envoi passe.
 *
 * @param text - le texte du message, déjà rogné
 * @param files - les pièces (nom et taille suffisent)
 */
export function attachmentProblem(
  text: string,
  files: readonly { name: string; size: number }[],
): string | null {
  if (text === "" && files.length === 0) return "message vide";
  const tooLong = textProblem(text);
  if (tooLong !== null) return tooLong;
  if (files.length > ATTACHMENT_MAX_COUNT)
    return `au plus ${ATTACHMENT_MAX_COUNT} pièces par message`;
  for (const file of files) {
    if (file.size === 0) return `« ${file.name} » est vide`;
    if (file.size > ATTACHMENT_MAX_BYTES)
      return `« ${file.name} » dépasse ${formatSize(ATTACHMENT_MAX_BYTES)}`;
  }
  return null;
}
// #endregion

/** Les émoticônes du sélecteur : de l'Unicode, aucune bibliothèque. */
export const EMOJIS: readonly { char: string; label: string }[] = [
  { char: "😀", label: "sourire" },
  { char: "😂", label: "rire aux larmes" },
  { char: "😉", label: "clin d'œil" },
  { char: "😍", label: "yeux en cœur" },
  { char: "🤔", label: "pensif" },
  { char: "😮", label: "surpris" },
  { char: "😢", label: "triste" },
  { char: "😡", label: "en colère" },
  { char: "👍", label: "pouce levé" },
  { char: "👎", label: "pouce baissé" },
  { char: "👏", label: "applaudissements" },
  { char: "🙏", label: "merci" },
  { char: "🎉", label: "fête" },
  { char: "🔥", label: "feu" },
  { char: "✅", label: "validé" },
  { char: "❌", label: "refusé" },
  { char: "⚠️", label: "attention" },
  { char: "🚀", label: "fusée" },
  { char: "🐛", label: "bogue" },
  { char: "💡", label: "idée" },
  { char: "❤️", label: "cœur" },
  { char: "👀", label: "regard" },
  { char: "☕", label: "café" },
  { char: "🙂", label: "sourire léger" },
];

/**
 * Insère un texte à la place de la sélection, et rend où poser le curseur.
 *
 * @param value - le texte du champ
 * @param start - début de la sélection
 * @param end - fin de la sélection
 * @param insert - ce qu'on insère
 */
export function insertAt(
  value: string,
  start: number,
  end: number,
  insert: string,
): { value: string; caret: number } {
  return {
    value: value.slice(0, start) + insert + value.slice(end),
    caret: start + insert.length,
  };
}
