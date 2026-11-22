import type { IProbeResult } from "../kit/probe";

/**
 * Ce que la carte du fichier dessine, calculé sans écran : les boîtes d'un
 * MP4, et la part du fichier qu'une réponse a fait voyager.
 *
 * Guide pour un agent : fonctions PURES, éprouvées par le test du module ;
 * `VideoVisuals.tsx` les affiche.
 */

/** Une boîte de tête d'un MP4 : `ftyp`, `moov`, `mdat`… */
export interface IMp4Box {
  type: string;
  start: number;
  size: number;
}

/** Ce qu'une boîte contient, dit simplement. */
export const BOX_ROLES: Readonly<Record<string, string>> = {
  ftyp: "en-tête",
  moov: "index",
  mdat: "images",
  free: "vide",
};

/**
 * Lit l'en-tête d'une boîte (8 octets : taille sur 4, type sur 4).
 *
 * @param bytes - au moins 8 octets, lus à `start`
 * @param start - position de la boîte dans le fichier
 * @param total - taille du fichier : une taille 0 veut dire « jusqu'au bout »
 * @returns la boîte, ou `null` si l'en-tête est illisible
 */
export function readBox(
  bytes: Uint8Array,
  start: number,
  total: number,
): IMp4Box | null {
  if (bytes.length < 8) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, 8);
  const declared = view.getUint32(0);
  const type = String.fromCharCode(...bytes.subarray(4, 8));
  if (!/^[\w ]{4}$/u.test(type)) return null;
  const size = declared === 0 ? total - start : declared;
  // 1 = taille sur 64 bits, rare pour un petit fichier : non suivi ici.
  if (size < 8) return null;
  return { type, start, size: Math.min(size, total - start) };
}

/** Ce qu'une réponse a fait voyager du fichier. */
export interface IReceived {
  /** Premier et dernier octet reçus, ou `null` : rien de la vidéo. */
  span: { start: number; end: number } | null;
  /** Taille du fichier, quand la réponse la dit. */
  total: number | null;
  /** La phrase qui l'explique. */
  text: string;
}

const nf = new Intl.NumberFormat("fr-FR");

/** Un en-tête de la réponse, par son nom. */
function header(result: IProbeResult, name: string): string | null {
  return result.headers.find(([key]) => key === name)?.[1] ?? null;
}

/**
 * La part du fichier qu'une réponse a portée, et sa lecture en une phrase.
 *
 * @param result - la réponse, telle que la sonde l'a reçue
 */
export function describeReceived(result: IProbeResult): IReceived {
  const range = header(result, "content-range");
  const length = Number(header(result, "content-length") ?? Number.NaN);
  const type = header(result, "content-type") ?? "";
  if (result.status === 206 && range !== null) {
    const match = /^bytes (\d+)-(\d+)\/(\d+)$/u.exec(range);
    if (match !== null) {
      const start = Number(match[1]);
      const end = Number(match[2]);
      const total = Number(match[3]);
      const count = end - start + 1;
      const part = ((count / total) * 100).toLocaleString("fr-FR", {
        maximumFractionDigits: 1,
      });
      return {
        span: { start, end },
        total,
        text: `206 — un MORCEAU : octets ${nf.format(start)} à ${nf.format(end)}, soit ${nf.format(count)} octets (${part} % du fichier).`,
      };
    }
  }
  if (result.status === 416) {
    const total = Number(/\/(\d+)$/u.exec(range ?? "")?.[1] ?? Number.NaN);
    return {
      span: null,
      total: Number.isNaN(total) ? null : total,
      text: `416 — RIEN : la plage demandée commence après le dernier octet${Number.isNaN(total) ? "" : ` (le fichier en a ${nf.format(total)})`}.`,
    };
  }
  if (result.status === 304) {
    return {
      span: null,
      total: null,
      text: "304 — RIEN n'a voyagé : la version du navigateur est la bonne, il la garde.",
    };
  }
  if (result.status === 200 && type.startsWith("video/") && length > 0) {
    return {
      span: { start: 0, end: length - 1 },
      total: length,
      text: `200 — TOUT le fichier : ${nf.format(length)} octets, d'un seul bloc.`,
    };
  }
  return {
    span: null,
    total: null,
    text: "Cette réponse ne porte pas de vidéo.",
  };
}
