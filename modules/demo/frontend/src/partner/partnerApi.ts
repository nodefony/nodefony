/**
 * Le contrat de la page `/demo/partner` avec son guichet de jetons —
 * PARTAGÉ : `PartnerTokenController` (serveur) et la page l'importent tous
 * les deux, aucun type n'est recopié.
 *
 * Guide pour un agent : la page décode le jeton pour MONTRER ce qu'il porte ;
 * elle ne le vérifie pas — c'est le travail du firewall, côté serveur, et un
 * client ne doit jamais fonder une décision sur un jeton qu'il a décodé.
 */

// #region partner-token-contract
/** Le guichet : `POST`, sous session (zone `demo`), hors de la zone `demo-partner` du firewall. */
export const PARTNER_TOKEN_PATH = "/demo/api/token";

/** Ce que rend le guichet. */
export interface IPartnerTokenResponse {
  accessToken: string;
  /** Durée de vie, en secondes. */
  expiresIn: number;
  /** Audience du jeton : l'adresse absolue de l'API partenaire. */
  resource: string;
  /** Chemin de `whoami`, à appeler avec le jeton. */
  whoamiPath: string;
}
// #endregion

/**
 * Lit la réponse du guichet sans la croire sur parole.
 *
 * @returns la réponse typée, ou `null` si une clé manque
 */
export function parsePartnerToken(
  value: unknown,
): IPartnerTokenResponse | null {
  if (typeof value !== "object" || value === null) return null;
  if (
    !("accessToken" in value) ||
    !("expiresIn" in value) ||
    !("resource" in value) ||
    !("whoamiPath" in value)
  ) {
    return null;
  }
  const { accessToken, expiresIn, resource, whoamiPath } = value;
  if (
    typeof accessToken !== "string" ||
    typeof expiresIn !== "number" ||
    typeof resource !== "string" ||
    typeof whoamiPath !== "string"
  ) {
    return null;
  }
  return { accessToken, expiresIn, resource, whoamiPath };
}

/**
 * Les revendications d'un JWT, décodées POUR L'AFFICHAGE (RFC 7519 §3) — sans
 * vérifier la signature.
 *
 * @returns l'objet des revendications, ou `null` si le jeton n'a pas trois
 *   parties ou que la charge n'est pas un objet JSON
 */
export function decodeClaims(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  const payload = parts.at(1);
  if (parts.length !== 3 || payload === undefined) return null;
  try {
    const base64 = payload.replace(/-/gu, "+").replace(/_/gu, "/");
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const claims: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (
      typeof claims !== "object" ||
      claims === null ||
      Array.isArray(claims)
    ) {
      return null;
    }
    return Object.fromEntries(Object.entries(claims));
  } catch {
    return null;
  }
}

/**
 * Le même jeton, un caractère de sa SIGNATURE changé — au milieu, parce que
 * le dernier caractère base64url porte des bits de remplissage qu'un décodeur
 * peut ignorer.
 */
export function tamperSignature(token: string): string {
  const cut = token.lastIndexOf(".");
  const middle = cut + Math.max(1, Math.floor((token.length - cut) / 2));
  const replaced = token[middle] === "A" ? "B" : "A";
  return token.slice(0, middle) + replaced + token.slice(middle + 1);
}
