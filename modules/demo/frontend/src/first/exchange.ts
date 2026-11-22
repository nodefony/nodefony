import type { IProbeResult } from "../kit/probe";

/**
 * Ce qu'un aller-retour page ↔ serveur VEUT DIRE, en une phrase : le statut
 * lu comme un humain le lirait, et ce que le corps contient.
 *
 * Guide pour un agent : pur, sans écran — l'entrée est le résultat de la
 * sonde (`kit/probe.ts`) ; `FirstVisuals.tsx` le dessine.
 */

/** Le ton de l'échange : sa couleur à l'écran. */
export type ExchangeTone = "ok" | "redirect" | "cache" | "refused" | "error";

/** L'échange, lu. */
export interface IExchange {
  tone: ExchangeTone;
  /** Le statut tel qu'il s'affiche : `200`, `101`, ou `—` sans réponse. */
  status: string;
  /** Ce que le corps contient : « du JSON », « un flux »… */
  body: string;
  phrase: string;
}

/** Ce que porte un corps, d'après son type. */
function bodyKind(result: IProbeResult): string {
  if (result.status === 101) return "des trames";
  const header = (name: string) =>
    result.headers.find(([key]) => key === name)?.[1] ?? null;
  if (header("content-disposition")?.startsWith("attachment") === true) {
    return "un fichier à enregistrer";
  }
  const type = header("content-type");
  if (result.body === "" || type === null) return "rien";
  if (type.includes("json")) return "du JSON";
  if (type.includes("html")) return "du HTML";
  if (type.includes("event-stream")) return "un flux";
  if (type.startsWith("text/")) return "du texte";
  return "des octets";
}

/**
 * Lit un résultat de la sonde comme un humain : ce qui s'est passé, et
 * pourquoi.
 *
 * @param result - ce que le navigateur a reçu
 */
export function describeExchange(result: IProbeResult): IExchange {
  const body = bodyKind(result);
  const { status } = result;
  if (status === null) {
    return {
      tone: "error",
      status: "—",
      body: "rien",
      phrase: `Aucune réponse : ${result.error ?? "la requête n'a pas abouti"}.`,
    };
  }
  const code = String(status);
  if (status === 101) {
    return {
      tone: "ok",
      status: code,
      body,
      phrase: `Socket ouverte : ${result.chunks.length} trame(s) reçue(s) sur la même connexion.`,
    };
  }
  if (result.redirected) {
    return {
      tone: "redirect",
      status: code,
      body,
      phrase: `Redirigé : le navigateur a suivi jusqu'à ${result.finalUrl ?? "une autre adresse"}, qui a répondu ${code}.`,
    };
  }
  if (status === 304) {
    return {
      tone: "cache",
      status: code,
      body: "rien",
      phrase: "304 — rien n'a voyagé : la page garde sa copie.",
    };
  }
  if (status === 422) {
    return {
      tone: "refused",
      status: code,
      body,
      phrase: "422 — refusé AVANT l'action : le corps ne suit pas le schéma.",
    };
  }
  if (status === 404) {
    return {
      tone: "refused",
      status: code,
      body,
      phrase: "404 — introuvable : l'action a levé une erreur avec ce statut.",
    };
  }
  if (status === 401 || status === 403) {
    return {
      tone: "refused",
      status: code,
      body,
      phrase: `${code} — non autorisé : le pare-feu a refusé avant l'action.`,
    };
  }
  if (status >= 200 && status < 300) {
    const parts =
      result.chunks.length > 1
        ? `, en ${result.chunks.length} morceaux sur ${result.ms} ms`
        : "";
    return {
      tone: "ok",
      status: code,
      body,
      phrase: `${code} — ${body} reçu${parts}.`,
    };
  }
  return {
    tone: status >= 500 ? "error" : "refused",
    status: code,
    body,
    phrase: `${code} — la réponse le dit dans son corps.`,
  };
}
