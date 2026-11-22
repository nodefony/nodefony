/**
 * Le poids d'un texte en octets UTF-8 — ce que comptent le réseau et la
 * base, quand une longueur JavaScript compte des moitiés de caractère.
 *
 * Guide pour un agent : brique du KIT, pure, lue des DEUX côtés — le schéma
 * du salon la borne (`chatSchemas.ts`, `MESSAGE_MAX_BYTES`), le compositeur
 * l'affiche avant l'envoi. Elle ne passe pas par `TextEncoder` : encoder un
 * message de 64 Kio pour le seul plaisir de le compter allouerait autant.
 */

/**
 * Le nombre d'octets que `TextEncoder` produirait pour ce texte, sans rien
 * allouer. Un demi-caractère isolé (surrogate seul) compte trois octets :
 * l'encodeur le remplace par U+FFFD.
 *
 * @param text - le texte à peser
 * @returns sa longueur en octets UTF-8
 */
export function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      const next = i + 1 < text.length ? text.charCodeAt(i + 1) : 0;
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        i += 1;
      } else bytes += 3;
    } else bytes += 3;
  }
  return bytes;
}
