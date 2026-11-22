import { z } from "zod";
import { decodeText, sniffContainer, sniffImage } from "../kit/preview";

/**
 * Ce que la page « Envoi de fichiers » et son contrôleur partagent : le
 * chemin des routes, les bornes, la forme d'un fichier rangé, et la façon de
 * reconnaître un fichier à ses octets. Écrit UNE fois, importé des deux côtés.
 *
 * Guide pour un agent : le contrôleur est
 * `nodefony/controllers/UploadController.ts`, le rangement
 * `nodefony/service/UploadService.ts`, la page
 * `frontend/src/upload/UploadLesson.tsx`. Les blocs `// #region` sont CITÉS
 * par la page : les renommer casse le test du module.
 */

// #region upload-shared
/** Préfixe de toutes les routes de la leçon. */
export const UPLOAD_PATH = "/demo/api/upload";

/** Taille maximale d'UN fichier : 8 Mio. */
export const UPLOAD_MAX_BYTES = 8_388_608;

/** Fichiers par envoi. */
export const UPLOAD_MAX_FILES = 3;

/** Fichiers gardés par compte : au-delà, le plus ancien sort. */
export const UPLOAD_KEEP = 5;

/** Le champ texte qui accompagne les fichiers d'un envoi multipart. */
export const UploadBody = z.strictObject({
  label: z.string().max(80).optional(),
});

/** Le nom d'un fichier envoyé en corps brut, porté par l'adresse. */
export const RawQuery = z.strictObject({
  name: z.string().min(1).max(120),
});

/** Un fichier rangé : un identifiant tiré par le serveur, jamais un nom. */
export const UploadParams = z.strictObject({ id: z.uuid() });

/** Ce que prouvent les octets d'un fichier. */
export type UploadKind = "image" | "pdf" | "archive" | "texte" | "binaire";

/** Un fichier rangé, tel que la liste et l'envoi le rendent. */
export interface IStoredFile {
  id: string;
  /** Le nom donné par le client : une étiquette, jamais un chemin. */
  name: string;
  /** Taille en octets. */
  size: number;
  /** Le type que le client a DÉCLARÉ, gardé pour comparaison. */
  declared: string | null;
  /** Le type que prouvent les octets : celui que la relecture sert. */
  type: string;
  kind: UploadKind;
  /** Empreinte SHA-256, en hexadécimal, calculée pendant la réception. */
  sha256: string;
  /** Date de réception (ms). */
  at: number;
}

/** La réponse d'un envoi multipart. */
export interface IUploadReply {
  label: string | null;
  files: IStoredFile[];
}
// #endregion

// #region upload-kind
/** Octets lus en tête d'un fichier pour le reconnaître. */
export const KIND_HEAD_BYTES = 512;

/**
 * Ce que prouvent les premiers octets d'un fichier — le MÊME code que
 * l'aperçu des pièces du chat (`kit/preview.ts`). Le nom et le type envoyés
 * par le client ne comptent pas : un `.txt` qui commence par l'en-tête PNG
 * est une image.
 *
 * @param head - les `KIND_HEAD_BYTES` premiers octets, ou moins
 */
export function kindOf(head: Uint8Array): { kind: UploadKind; type: string } {
  const image = sniffImage(head);
  if (image !== null) return { kind: "image", type: image };
  switch (sniffContainer(head)) {
    case "pdf":
      return { kind: "pdf", type: "application/pdf" };
    case "zip":
      return { kind: "archive", type: "application/zip" };
    case "gzip":
      return { kind: "archive", type: "application/gzip" };
    case "tar":
      return { kind: "archive", type: "application/x-tar" };
    case null:
      break;
  }
  return decodeText(head, true) === null
    ? { kind: "binaire", type: "application/octet-stream" }
    : { kind: "texte", type: "text/plain; charset=utf-8" };
}
// #endregion

/**
 * L'empreinte annoncée par l'en-tête `Repr-Digest` (RFC 9530), en
 * hexadécimal : `sha-256=:<base64>:`. `null` si l'en-tête n'en porte pas.
 *
 * @param header - la valeur de l'en-tête, ou `null`
 */
export function reprDigestSha256(header: string | null): string | null {
  const match = /(?:^|,)\s*sha-256=:([A-Za-z0-9+/=]+):/u.exec(header ?? "");
  if (match?.[1] === undefined) return null;
  const binary = atob(match[1]);
  let hex = "";
  for (let i = 0; i < binary.length; i++) {
    hex += binary.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return hex;
}
