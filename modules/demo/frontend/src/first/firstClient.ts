import { EchoBody, FIRST_PATH } from "./firstSteps";

/**
 * Le code CLIENT de « Premiers pas » : ce qu'une page écrit pour appeler
 * chaque route. Chaque fonction PRÉPARE l'appel — une `Request` : méthode,
 * adresse, en-têtes, corps — ou ouvre la socket.
 *
 * Guide pour un agent : ce code TOURNE — la page passe ces requêtes à la
 * sonde du kit (`probeRequest` de `kit/probe.ts`), qui fait le `fetch` et
 * montre ce qui revient. Les blocs `// #region client-*` sont CITÉS par la
 * page, à côté du contrôleur `FirstStepsController.ts` : les renommer casse
 * le test du module.
 */

// #region client-hello
// Préparer l'appel : une `Request`. Les morceaux de l'adresse
// s'ENCODENT (`encodeURIComponent`) — un prénom avec un espace ou un
// `/` ne casse pas le chemin. La page l'envoie par `fetch(request)`,
// puis lit l'objet rendu : `await response.json()`.
export function helloPath(name: string, lang: "fr" | "en"): string {
  const who = encodeURIComponent(name.trim() || "visiteur");
  return `${FIRST_PATH}/hello/${who}?lang=${lang}`;
}

export function helloRequest(name: string, lang: "fr" | "en"): Request {
  return new Request(helloPath(name, lang));
}
// #endregion

// #region client-get
// Un `GET` tout simple. `cache: "no-store"` : la démo veut voir le
// réseau, pas une copie gardée par le navigateur. Le cookie de
// session part tout seul — même origine.
export function getRequest(path: string): Request {
  return new Request(`${FIRST_PATH}${path}`, { cache: "no-store" });
}
// #endregion

// #region client-echo
// Envoyer du JSON : `POST`, le `Content-Type`, le corps en texte. Le
// schéma `EchoBody` est le MÊME que celui du serveur : la page peut
// vérifier AVANT d'envoyer. Ici elle envoie quand même, pour voir le
// serveur refuser à son tour.
export function echoRequest(body: unknown): Request {
  return new Request(`${FIRST_PATH}/echo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function checkEcho(body: unknown): string[] {
  const checked = EchoBody.safeParse(body);
  return checked.success
    ? []
    : checked.error.issues.map((issue) => issue.path.join(".") || "corps");
}
// #endregion

// #region client-note
// `fetch` SUIT une redirection (`redirect: "follow"`, le défaut) :
// `response.redirected` et `response.url` disent où elle a mené. Le
// cookie de session voyage à chaque saut : le flash s'y lit.
export function noteRequest(): Request {
  return new Request(`${FIRST_PATH}/note`, {
    method: "POST",
    redirect: "follow",
  });
}
// #endregion

// #region client-file
// Garder l'`etag` du fichier reçu, puis le renvoyer en
// `If-None-Match` : rien n'a changé ? 304, et le fichier ne repart
// pas. `response.headers.get("etag")` le lit.
export function sourceRequest(etag: string | null): Request {
  return new Request(`${FIRST_PATH}/source`, {
    cache: "no-store",
    headers: etag === null ? {} : { "if-none-match": etag },
  });
}
// #endregion

// #region client-socket
// La MÊME adresse, en `ws:` (ou `wss:` sous HTTPS) : `new WebSocket`.
// La première trame est la réponse de l'action ; `socket.send()` la
// rappelle.
export function openHello(name: string): WebSocket {
  const url = new URL(helloPath(name, "fr"), window.location.href);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return new WebSocket(url);
}
// #endregion
