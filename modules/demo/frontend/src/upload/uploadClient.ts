import {
  formatBody,
  pickHeaders,
  type IProbeChunk,
  type IProbeResult,
} from "../kit/probe";
import { formatSize } from "../kit/preview";
import { reprDigestSha256 } from "./uploadDemo";

/**
 * Le côté navigateur de « Envoi de fichiers » : envoyer en suivant la
 * progression, calculer l'empreinte d'un fichier, relire un fichier rangé et
 * vérifier qu'il est revenu intact.
 *
 * Guide pour un agent : utilisé par `UploadLesson.tsx`. Chaque fonction rend
 * un `IProbeResult` (forme de la sonde du kit, `kit/probe.ts`) pour
 * s'afficher sous le bouton qui l'a lancée. Les blocs `// #region` sont CITÉS
 * par la page : les renommer casse le test du module.
 */

/** Un avancement d'envoi : octets partis sur le total, à l'instant `at`. */
export interface IUploadProgress {
  at: number;
  loaded: number;
  total: number;
}

// #region client-progress
/**
 * Envoie un formulaire et suit sa PROGRESSION. `fetch` ne dit pas où en est
 * l'envoi d'un corps ; `XMLHttpRequest` le dit, par `upload.onprogress`.
 * Le navigateur pose seul `Content-Type: multipart/form-data` et sa
 * frontière : ne jamais l'écrire à la main.
 *
 * @param url - la route d'envoi (même origine que la page)
 * @param form - les fichiers et les champs
 * @param onProgress - appelé à chaque avancement
 * @returns ce que le serveur a répondu ; ne rejette jamais
 */
export function sendWithProgress(
  url: string,
  form: FormData,
  onProgress: (progress: IUploadProgress) => void,
): Promise<IProbeResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const start = performance.now();
    const since = () => Math.round(performance.now() - start);
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable)
        onProgress({ at: since(), loaded: event.loaded, total: event.total });
    });
    xhr.addEventListener("loadend", () => {
      resolve(xhrResult(xhr, `POST ${url}`, since()));
    });
    xhr.open("POST", url);
    xhr.send(form);
  });
}
// #endregion

/** Une ligne de la frise : « 37 % — 2,2 Mo / 6 Mo ». */
export function progressLine(progress: IUploadProgress): IProbeChunk {
  const percent = Math.round((progress.loaded / progress.total) * 100);
  return {
    at: progress.at,
    text: `${percent} % — ${formatSize(progress.loaded)} / ${formatSize(progress.total)}`,
  };
}

/** La réponse d'un `XMLHttpRequest` terminé, dans la forme de la sonde. */
function xhrResult(
  xhr: XMLHttpRequest,
  request: string,
  ms: number,
): IProbeResult {
  if (xhr.status === 0) {
    return {
      request,
      sent: [],
      status: null,
      ms,
      headers: [],
      body: "",
      chunks: [],
      redirected: false,
      finalUrl: null,
      error: "envoi interrompu",
    };
  }
  const headers = new Headers();
  for (const line of xhr.getAllResponseHeaders().trim().split(/\r?\n/u)) {
    const colon = line.indexOf(":");
    if (colon > 0)
      headers.append(line.slice(0, colon).trim(), line.slice(colon + 1).trim());
  }
  return {
    request,
    sent: [],
    status: xhr.status,
    ms,
    headers: pickHeaders(headers),
    body: formatBody(xhr.responseText, headers.get("content-type")),
    chunks: [],
    redirected: false,
    finalUrl: null,
    error: null,
  };
}

// #region client-digest
/**
 * L'empreinte SHA-256 d'un fichier, en hexadécimal, calculée par le
 * navigateur (`crypto.subtle`) AVANT l'envoi : la même que celle que le
 * serveur calcule pendant la réception, si rien ne s'est perdu en route.
 */
export async function sha256Hex(data: Blob | ArrayBuffer): Promise<string> {
  const bytes = data instanceof Blob ? await data.arrayBuffer() : data;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  let hex = "";
  for (const byte of digest) hex += byte.toString(16).padStart(2, "0");
  return hex;
}
// #endregion

// #region client-readback
/**
 * Relit un fichier rangé et compare TROIS empreintes : celle des octets
 * relus, celle que le serveur annonce (`Repr-Digest`, RFC 9530), et celle du
 * fichier d'origine calculée avant l'envoi, quand la page la connaît.
 *
 * @param url - l'adresse du fichier rangé
 * @param before - l'empreinte calculée avant l'envoi, ou `null`
 * @returns la réponse, et le constat des empreintes en guise de corps
 */
export async function readBack(
  url: string,
  before: string | null,
): Promise<IProbeResult> {
  const start = performance.now();
  const response = await fetch(url, { cache: "no-store" });
  const bytes = await response.arrayBuffer();
  const ms = Math.round(performance.now() - start);
  const reread = await sha256Hex(bytes);
  const announced = reprDigestSha256(response.headers.get("repr-digest"));
  const lines = [
    `${bytes.byteLength} octets relus`,
    `relus        ${reread}`,
    `Repr-Digest  ${announced ?? "(absent)"}`,
    `avant envoi  ${before ?? "(inconnue : fichier envoyé ailleurs)"}`,
    reread === announced && (before === null || before === reread)
      ? "✓ identiques : le fichier est revenu tel qu'il est parti"
      : "✗ différentes : le fichier a changé en route",
  ];
  return {
    request: `GET ${new URL(url, window.location.href).pathname}`,
    sent: [],
    status: response.status,
    ms,
    headers: pickHeaders(response.headers),
    body: response.ok ? lines.join("\n") : new TextDecoder().decode(bytes),
    chunks: [],
    redirected: false,
    finalUrl: null,
    error: null,
  };
}
// #endregion
