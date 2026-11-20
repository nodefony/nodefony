import { useCallback, useState } from "react";
import { PARTNER_PATH } from "../../../nodefony/config/security";
import {
  PARTNER_TOKEN_PATH,
  parsePartnerToken,
  tamperSignature,
  type IPartnerTokenResponse,
} from "./partnerApi";

/** Les essais de la page, dans l'ordre où on les fait. */
export type PartnerTrial = "no-token" | "obtain" | "with-token" | "tampered";

/** Ce qu'un essai a rendu : la requête telle que partie, et la réponse. */
export interface ITrialResult {
  request: string;
  /** L'en-tête `Authorization` envoyé, abrégé ; `null` : aucun. */
  authorization: string | null;
  /** `null` : la requête n'a pas abouti (réseau). */
  status: number | null;
  /** Le corps, mis en forme quand c'est du JSON. */
  body: string;
  /** L'en-tête `WWW-Authenticate` d'un refus (RFC 6750 §3). */
  challenge: string | null;
}

/** L'état de la page : le jeton obtenu, et le résultat de chaque essai. */
export interface IPartnerLab {
  token: IPartnerTokenResponse | null;
  results: Partial<Record<PartnerTrial, ITrialResult>>;
  busy: PartnerTrial | null;
  run: (trial: PartnerTrial) => void;
}

const WHOAMI_PATH = `${PARTNER_PATH}/whoami`;

/** Un jeton abrégé pour l'affichage : assez pour le reconnaître. */
function abbreviate(token: string): string {
  return `Bearer ${token.slice(0, 16)}…${token.slice(-8)}`;
}

/** Le corps d'une réponse lu comme JSON ; `null` s'il n'en est pas. */
function parseJson(text: string): unknown {
  try {
    const value: unknown = JSON.parse(text);
    return value;
  } catch {
    return null;
  }
}

/**
 * Le corps à afficher : indenté quand c'est du JSON ; pour un refus, le seul
 * `message` du serveur — en développement, la réponse d'erreur porte aussi
 * la pile, illisible ici.
 */
function display(text: string, ok: boolean): string {
  const parsed = parseJson(text);
  if (
    !ok &&
    typeof parsed === "object" &&
    parsed !== null &&
    "message" in parsed &&
    typeof parsed.message === "string"
  ) {
    return parsed.message;
  }
  return parsed === null ? text : JSON.stringify(parsed, null, 2);
}

// #region partner-fetch-client
/**
 * Un appel de PROGRAMME : le jeton dans `Authorization`. Le cookie de
 * session part aussi (même origine) — et la zone `demo-partner` l'ignore :
 * elle ne connaît que les jetons.
 */
async function callPartner(
  path: string,
  accessToken: string | null,
): Promise<ITrialResult> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (accessToken !== null) headers.authorization = `Bearer ${accessToken}`;
  const response = await fetch(path, { headers, credentials: "same-origin" });
  return {
    request: `GET ${path}`,
    authorization: accessToken === null ? null : abbreviate(accessToken),
    status: response.status,
    body: display(await response.text(), response.ok),
    challenge: response.headers.get("www-authenticate"),
  };
}
// #endregion

/** Le jeton remis par le guichet, et la trace de la requête qui l'a obtenu. */
async function obtainToken(): Promise<{
  result: ITrialResult;
  token: IPartnerTokenResponse | null;
}> {
  const response = await fetch(PARTNER_TOKEN_PATH, {
    method: "POST",
    headers: { accept: "application/json" },
    credentials: "same-origin",
  });
  const text = await response.text();
  const token = response.ok ? parsePartnerToken(parseJson(text)) : null;
  return {
    token,
    result: {
      request: `POST ${PARTNER_TOKEN_PATH}`,
      authorization: null,
      status: response.status,
      // Le jeton lui-même s'affiche décodé, pas en clair dans la trace.
      body:
        token === null
          ? display(text, response.ok)
          : "(jeton reçu — décodé ci-dessous)",
      challenge: response.headers.get("www-authenticate"),
    },
  };
}

/**
 * Les quatre essais de la page partenaire : sans jeton, obtenir un jeton,
 * avec le jeton, avec un jeton altéré.
 *
 * Guide pour un agent : utilisé par `PartnerLesson.tsx`. Le jeton vient de
 * `POST PARTNER_TOKEN_PATH` (`partnerApi.ts`, servi par
 * `PartnerTokenController.ts`, session requise) ; il est ensuite présenté en `Authorization: Bearer` à
 * `GET /demo/api/partner/whoami` (`PartnerController.ts`), jamais par un
 * cookie. Un refus rend 401 et l'en-tête `WWW-Authenticate`, lu dans
 * `challenge`.
 */
export function usePartnerLab(): IPartnerLab {
  const [token, setToken] = useState<IPartnerTokenResponse | null>(null);
  const [results, setResults] = useState<IPartnerLab["results"]>({});
  const [busy, setBusy] = useState<PartnerTrial | null>(null);

  const run = useCallback(
    (trial: PartnerTrial) => {
      const record = (result: ITrialResult) =>
        setResults((known) => ({ ...known, [trial]: result }));
      const attempt = async () => {
        if (trial === "obtain") {
          const obtained = await obtainToken();
          setToken(obtained.token);
          record(obtained.result);
          return;
        }
        const path = token?.whoamiPath ?? WHOAMI_PATH;
        const credential =
          trial === "no-token" || token === null
            ? null
            : trial === "tampered"
              ? tamperSignature(token.accessToken)
              : token.accessToken;
        record(await callPartner(path, credential));
      };
      setBusy(trial);
      attempt()
        .catch((error: unknown) =>
          record({
            request:
              trial === "obtain"
                ? `POST ${PARTNER_TOKEN_PATH}`
                : `GET ${WHOAMI_PATH}`,
            authorization: null,
            status: null,
            body:
              error instanceof Error ? error.message : "requête interrompue",
            challenge: null,
          }),
        )
        .finally(() => setBusy(null));
    },
    [token],
  );

  return { token, results, busy, run };
}
