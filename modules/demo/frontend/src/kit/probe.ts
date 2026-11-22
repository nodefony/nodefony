import {
  BrowserWsTransport,
  NodefonySse,
  type IRealtimeTransport,
  type RealtimeFrameData,
  type RealtimeTransportFactory,
} from "nodefony/client";

/**
 * Appeler une route depuis la page et montrer ce qui revient VRAIMENT :
 * statut, en-têtes utiles, durée, et le corps morceau par morceau quand il
 * arrive en flux. Plus la même chose pour une WebSocket (les trames reçues)
 * et pour un flux SSE (les événements, et les reconnexions).
 *
 * Guide pour un agent : brique du KIT, partagée par les démos — « Premiers
 * pas » et « Flux SSE » s'en servent pour chaque geste (`ProbeResult.tsx`
 * l'affiche). Rien n'est simulé : `fetch`, `WebSocket` et `EventSource` du
 * navigateur, contre le serveur
 * qui sert la page. Une redirection est SUIVIE (c'est ce que fait un
 * navigateur) : `redirected` et `finalUrl` disent où elle a mené.
 */

/** Un morceau du corps, horodaté depuis l'envoi de la requête. */
export interface IProbeChunk {
  /** Millisecondes écoulées depuis l'envoi. */
  at: number;
  text: string;
}

/** Ce qu'un appel a rendu, tel que le navigateur l'a reçu. */
export interface IProbeResult {
  /** La requête, telle qu'on l'écrirait : `GET /demo/api/first/web`. */
  request: string;
  /** Les en-têtes de `SENT_HEADERS` que la requête a portés. */
  sent: readonly (readonly [string, string])[];
  /** `null` quand la requête n'a pas abouti (réseau, socket refusée). */
  status: number | null;
  /** Durée totale, corps compris, en millisecondes. */
  ms: number;
  headers: readonly (readonly [string, string])[];
  /** Le corps entier ; JSON remis en forme. */
  body: string;
  chunks: readonly IProbeChunk[];
  redirected: boolean;
  /** Adresse finale, quand une redirection a été suivie. */
  finalUrl: string | null;
  error: string | null;
  /**
   * Les premiers octets d'un corps BINAIRE (`PROBE_BINARY_BYTES` au plus),
   * tels que reçus : une page qui les dessine lit la réponse, pas une copie.
   */
  bytes?: Uint8Array;
}

/** Les en-têtes qui apprennent quelque chose, dans cet ordre. */
export const SHOWN_HEADERS = [
  "content-type",
  "content-length",
  "accept-ranges",
  "content-range",
  "content-disposition",
  "cache-control",
  "etag",
  "last-modified",
  "x-accel-buffering",
  "x-content-type-options",
  "repr-digest",
  "x-demo",
] as const;

/** Les en-têtes de REQUÊTE qui changent la réponse, montrés avec elle. */
export const SENT_HEADERS = [
  "accept",
  "range",
  "if-range",
  "if-none-match",
  "last-event-id",
] as const;

/** Octets montrés d'un corps binaire. */
export const PROBE_BINARY_BYTES = 64;

/** Au-delà, le corps affiché est coupé : la page n'est pas un éditeur. */
export const PROBE_BODY_LIMIT = 6000;

/** Un corps JSON remis en forme ; tout autre texte tel quel, borné. */
export function formatBody(text: string, contentType: string | null): string {
  let shown = text;
  if (contentType?.includes("json") === true) {
    try {
      shown = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      // Pas du JSON valide malgré l'en-tête : montré brut, c'est un constat.
    }
  }
  return shown.length > PROBE_BODY_LIMIT
    ? `${shown.slice(0, PROBE_BODY_LIMIT)}\n… (${shown.length - PROBE_BODY_LIMIT} caractères de plus)`
    : shown;
}

/**
 * Un corps qui se lit comme du texte : JSON, HTML, texte, flux SSE — ou sans
 * type annoncé. Le reste (vidéo, image, octets) se montre en hexadécimal.
 */
export function isTextual(contentType: string | null): boolean {
  if (contentType === null) return true;
  // Un flux gRPC ou Connect ENVELOPPE chaque message (5 octets devant, même
  // en JSON) : le décoder en texte en ferait des caractères de contrôle.
  if (/^application\/(?:grpc|connect\+)/u.test(contentType)) return false;
  return /^text\/|json|xml|javascript|x-www-form-urlencoded/u.test(contentType);
}

/**
 * Les premiers octets d'un corps binaire, comme un éditeur hexadécimal :
 * position, seize octets, puis leur lecture en ASCII (`.` hors imprimable).
 *
 * @param bytes - les premiers octets reçus
 * @param total - la taille totale du corps
 */
export function hexPreview(bytes: Uint8Array, total: number): string {
  const lines = [`${total} octets reçus — les ${bytes.length} premiers :`];
  for (let at = 0; at < bytes.length; at += 16) {
    const row = [...bytes.subarray(at, at + 16)];
    const hex = row.map((byte) => byte.toString(16).padStart(2, "0"));
    const ascii = row
      .map((byte) =>
        byte >= 32 && byte < 127 ? String.fromCharCode(byte) : ".",
      )
      .join("");
    lines.push(
      `${at.toString(16).padStart(8, "0")}  ${hex.join(" ").padEnd(47)}  ${ascii}`,
    );
  }
  return lines.join("\n");
}

/** Les en-têtes de `SENT_HEADERS` que porte `init`. */
export function pickSent(
  init: RequestInit,
): readonly (readonly [string, string])[] {
  const headers = new Headers(init.headers);
  return SENT_HEADERS.flatMap((name) => {
    const value = headers.get(name);
    return value === null ? [] : [[name, value] as const];
  });
}

/** Les en-têtes de `SHOWN_HEADERS` présents dans la réponse. */
export function pickHeaders(
  headers: Headers,
): readonly (readonly [string, string])[] {
  return SHOWN_HEADERS.flatMap((name) => {
    const value = headers.get(name);
    return value === null ? [] : [[name, value] as const];
  });
}

/**
 * Appelle `url` et lit le corps EN FLUX (`probeRequest`). `cache: "no-store"` :
 * la page veut voir le réseau, pas le cache du navigateur.
 *
 * @param url - chemin de la route (même origine que la page)
 * @param init - méthode, en-têtes, corps
 * @param onChunk - appelé à chaque morceau du corps
 * @returns ce que le navigateur a reçu ; ne rejette jamais
 */
export function probeHttp(
  url: string,
  init: RequestInit = {},
  onChunk?: (chunks: readonly IProbeChunk[]) => void,
): Promise<IProbeResult> {
  return probeRequest(
    new Request(url, { cache: "no-store", ...init }),
    onChunk,
  );
}

// #region probe-http
/**
 * Envoie `request` — préparée par le code client de la page — et lit le
 * corps EN FLUX : `onChunk` reçoit chaque morceau à son arrivée, pour
 * l'afficher sans attendre la fin.
 *
 * @param request - méthode, adresse (même origine que la page), en-têtes, corps
 * @param onChunk - appelé à chaque morceau du corps
 * @param keep - octets gardés d'un corps binaire (`bytes`, aperçu hexadécimal)
 * @returns ce que le navigateur a reçu ; ne rejette jamais
 */
export async function probeRequest(
  request: Request,
  onChunk?: (chunks: readonly IProbeChunk[]) => void,
  keep = PROBE_BINARY_BYTES,
): Promise<IProbeResult> {
  const address = new URL(request.url);
  const label = `${request.method} ${address.pathname}${address.search}`;
  const sent = pickSent({ headers: request.headers });
  const start = performance.now();
  const since = () => Math.round(performance.now() - start);
  try {
    const response = await fetch(request);
    const contentType = response.headers.get("content-type");
    // Un corps binaire décodé en texte n'apprend rien : on en garde les
    // premiers octets, et on compte le reste.
    const textual = isTextual(contentType);
    const head = new Uint8Array(keep);
    let received = 0;
    const chunks: IProbeChunk[] = [];
    const decoder = new TextDecoder();
    const reader = response.body?.getReader();
    for (;;) {
      if (reader === undefined) break;
      const { done, value } = await reader.read();
      if (done) break;
      if (received < keep) {
        head.set(value.subarray(0, keep - received), received);
      }
      received += value.byteLength;
      chunks.push({
        at: since(),
        text: textual
          ? decoder.decode(value, { stream: true })
          : `+${value.byteLength} octets`,
      });
      onChunk?.([...chunks]);
    }
    const text = chunks.map((chunk) => chunk.text).join("") + decoder.decode();
    const kept = head.subarray(0, Math.min(received, keep));
    return {
      request: label,
      sent,
      status: response.status,
      ms: since(),
      headers: pickHeaders(response.headers),
      body: textual
        ? formatBody(text, contentType)
        : received === 0
          ? ""
          : hexPreview(kept, received),
      chunks: textual ? chunks : [],
      redirected: response.redirected,
      finalUrl: response.redirected ? new URL(response.url).pathname : null,
      error: null,
      ...(textual ? {} : { bytes: kept }),
    };
  } catch (error) {
    return failed(label, since(), error, sent);
  }
}
// #endregion

// #region probe-socket
/**
 * Écoute la WebSocket que `open` ouvre (le code client de la page), garde
 * la PREMIÈRE trame reçue, envoie `message`, garde la réponse, puis referme.
 *
 * @param path - chemin de la route, pour l'affichage
 * @param message - envoyé une fois la première trame reçue
 * @param open - le code client : ouvre la socket
 * @returns les trames reçues, en `chunks` ; ne rejette jamais
 */
export function probeSocket(
  path: string,
  message: string,
  open: () => WebSocket,
): Promise<IProbeResult> {
  const request = `WEBSOCKET ${path}`;
  const start = performance.now();
  const since = () => Math.round(performance.now() - start);
  return new Promise((resolve) => {
    const chunks: IProbeChunk[] = [];
    let socket: WebSocket;
    try {
      socket = open();
    } catch (error) {
      resolve(failed(request, since(), error));
      return;
    }
    const finish = (error: string | null) => {
      clearTimeout(guard);
      socket.close();
      resolve({
        request,
        sent: [],
        status: error === null ? 101 : null,
        ms: since(),
        headers: [],
        body: chunks
          .map((chunk) => formatBody(chunk.text, "application/json"))
          .join("\n\n"),
        chunks,
        redirected: false,
        finalUrl: null,
        error,
      });
    };
    // Une socket refusée ne lève rien : sans réponse, on conclut au refus.
    const guard = setTimeout(() => finish("aucune trame en 5 s"), 5000);
    socket.addEventListener("message", (event: MessageEvent<unknown>) => {
      chunks.push({
        at: since(),
        text: typeof event.data === "string" ? event.data : "(trame binaire)",
      });
      if (chunks.length === 1) socket.send(message);
      else finish(null);
    });
    socket.addEventListener("error", () => finish("socket refusée"));
  });
}
// #endregion

// #region probe-sse
/** Ce que la sonde écoute sur un flux que le code de la page a ouvert. */
export interface IProbeSseOptions {
  /**
   * Le code CLIENT du geste (`sse/sseClient.ts`) : il ouvre le flux, pose
   * ses écouteurs, le ferme et appelle `end` quand il a fini — la sonde ne
   * fait qu'écouter et noter.
   */
  open: (end: () => void) => EventSource | NodefonySse;
  /** Types d'événements notés, en plus de `message`. */
  events?: readonly string[];
}

/**
 * Note chaque ouverture, chaque événement et chaque coupure du flux que
 * `options.open` a ouvert, horodatés.
 *
 * @param url - chemin de la route, pour l'affichage
 * @param options - le code client qui ouvre, les événements notés
 * @param onChunk - appelé à chaque événement
 * @returns les événements reçus, en `chunks` ; ne rejette jamais
 */
export function probeSse(
  url: string,
  options: IProbeSseOptions,
  onChunk?: (chunks: readonly IProbeChunk[]) => void,
): Promise<IProbeResult> {
  const start = performance.now();
  const since = () => Math.round(performance.now() - start);
  return new Promise((resolve) => {
    const chunks: IProbeChunk[] = [];
    const note = (text: string) => {
      chunks.push({ at: since(), text });
      onChunk?.([...chunks]);
    };
    // Un flux ne s'ouvre qu'en 200 `text/event-stream` : ouvert, c'est un 200.
    let opened = false;
    let closed = false;
    // La page a fini : sa propre fermeture n'est pas un refus du serveur.
    let ending = false;
    let lastId = "";
    let request = `SSE ${url}`;
    const finish = (error: string | null) => {
      if (closed) return;
      closed = true;
      clearTimeout(guard);
      source?.close();
      resolve({
        request,
        sent: [],
        status: opened ? 200 : null,
        ms: since(),
        headers: [],
        body: chunks.map((chunk) => chunk.text).join("\n"),
        chunks,
        redirected: false,
        finalUrl: null,
        error,
      });
    };
    const guard = setTimeout(() => finish("flux non terminé en 15 s"), 15_000);
    let source: EventSource | NodefonySse | null = null;
    try {
      // Différé : les autres écouteurs du MÊME événement (la sonde note
      // `done`) passent avant que la page ne conclue.
      source = options.open(() => {
        ending = true;
        setTimeout(() => {
          if (closed) return;
          note("■ la page a fermé le flux");
          finish(null);
        }, 0);
      });
    } catch (error) {
      chunks.push({ at: since(), text: String(error) });
      finish(error instanceof Error ? error.message : String(error));
      return;
    }
    const client =
      source instanceof NodefonySse ? "NodefonySse" : "EventSource";
    request = `${client} ${url}`;
    const stream = source;
    stream.addEventListener("open", () => {
      note(lastId === "" ? "▶ ouvert" : `▶ rouvert — Last-Event-ID: ${lastId}`);
      opened = true;
    });
    const onEvent = (event: Event) => {
      if (closed || !(event instanceof MessageEvent)) return;
      if (event.lastEventId !== "") lastId = event.lastEventId;
      const id = event.lastEventId === "" ? "" : ` #${event.lastEventId}`;
      note(`${event.type}${id} · ${String(event.data)}`);
    };
    for (const type of ["message", ...(options.events ?? [])]) {
      stream.addEventListener(type, onEvent);
    }
    stream.addEventListener("error", () => {
      if (closed || ending) return;
      if (stream.readyState === EventSource.CLOSED) {
        note("■ réponse sans flux : le client ne se reconnecte plus");
        finish(null);
      } else {
        note("↻ coupé : le client se reconnecte");
      }
    });
  });
}
// #endregion

// #region probe-realtime
/** Ce qu'un relevé reçoit d'un compteur de fil. */
export interface IWireSink {
  /** Une ligne du relevé. */
  note: (text: string) => void;
  /** Un transport est créé, puis fermé : le relevé peut attendre sa fermeture. */
  created: () => void;
  closed: () => void;
  /** Le handshake a réussi. */
  opened: () => void;
}

/**
 * Un compteur de FIL : la fabrique de transport à donner à une socket. Il
 * enveloppe le transport du navigateur (`BrowserWsTransport`) sans rien
 * changer : chaque trame est comptée telle qu'elle passe, en octets —
 * `byteLength` d'une trame binaire, son UTF-8 d'une trame texte. Rien n'est
 * recalculé à partir de la charge. Il vit aussi longtemps que sa socket : un
 * relevé l'écoute le temps d'un geste (`listen`), puis le rend.
 */
export interface IWireTap {
  readonly label: string;
  /** À passer à `NodefonySocket.fromContract(opts, transport)`. */
  readonly transport: RealtimeTransportFactory;
  /** Sa socket est-elle ouverte en ce moment ? */
  readonly open: boolean;
  /** Le relevé qui écoute ; `null` : les trames passent sans être notées. */
  listen: (sink: IWireSink | null) => void;
}

/** Les premiers octets d'une trame, en hexadécimal ; d'une trame texte, ses premiers caractères. */
function frameHead(raw: RealtimeFrameData): string {
  if (typeof raw === "string") {
    return raw.length > 72 ? `${raw.slice(0, 72)}…` : raw;
  }
  const hex = [...raw.subarray(0, 12)].map((byte) =>
    byte.toString(16).padStart(2, "0"),
  );
  return `${hex.join(" ")}${raw.byteLength > 12 ? " …" : ""}`;
}

/** La taille d'une trame sur le fil, en octets. */
function frameBytes(raw: RealtimeFrameData, utf8: TextEncoder): number {
  return typeof raw === "string" ? utf8.encode(raw).byteLength : raw.byteLength;
}

/**
 * Un compteur de fil nommé `label` (`cbor`, `texte`), qui note une ligne par
 * trame : `cbor ← 568 o binaire 0.12 ms · a3 67 …` — le sens, la taille, la
 * nature, le temps que la socket a passé sur une trame reçue (décodage
 * compris), et son début. `wire.ts` relit ces lignes.
 *
 * @param label - le nom du compteur dans le relevé
 */
export function wireTap(label: string): IWireTap {
  const utf8 = new TextEncoder();
  const state: { sink: IWireSink | null; offer: string | null } = {
    sink: null,
    offer: null,
  };
  const kind = (raw: RealtimeFrameData) =>
    typeof raw === "string" ? "texte" : "binaire";
  return {
    label,
    get open() {
      return state.offer !== null;
    },
    listen: (sink) => {
      state.sink = sink;
      // Ouverte avant ce geste : son offre a eu lieu, on la rappelle sans
      // prétendre qu'elle vient de passer.
      if (sink !== null && state.offer !== null) {
        sink.note(`${label} ● déjà ouverte — offre : ${state.offer}`);
      }
    },
    transport: (url, protocols) => {
      const offer = protocols?.join(", ") ?? "rien";
      state.sink?.note(`${label} ▶ offre : ${offer}`);
      state.sink?.created();
      const inner = new BrowserWsTransport(url, protocols);
      const metered: IRealtimeTransport = {
        connect: () => inner.connect(),
        send: (raw) => {
          state.sink?.note(
            `${label} → ${frameBytes(raw, utf8)} o ${kind(raw)} · ${frameHead(raw)}`,
          );
          inner.send(raw);
        },
        close: (code, reason) => inner.close(code, reason),
        get readyState() {
          return inner.readyState;
        },
        get bufferedAmount() {
          return inner.bufferedAmount;
        },
        onOpen: (cb) =>
          inner.onOpen(() => {
            state.offer = offer;
            state.sink?.opened();
            cb();
          }),
        onMessage: (cb) =>
          inner.onMessage((raw) => {
            // La socket décode et distribue la trame dans cet appel : sa
            // durée est ce que la page paie pour elle.
            const before = performance.now();
            cb(raw);
            const ms = (performance.now() - before).toFixed(2);
            state.sink?.note(
              `${label} ← ${frameBytes(raw, utf8)} o ${kind(raw)} ${ms} ms · ${frameHead(raw)}`,
            );
          }),
        onClose: (cb) =>
          inner.onClose((code, reason) => {
            state.offer = null;
            state.sink?.note(
              `${label} ■ fermée ${code}${reason === "" ? "" : ` ${reason}`}`,
            );
            state.sink?.closed();
            cb(code, reason);
          }),
        onError: (cb) => inner.onError(cb),
      };
      return metered;
    },
  };
}

/**
 * Ce qu'une leçon temps réel reçoit pour jouer son geste : un compteur NEUF
 * pour une socket ouverte le temps du geste (`meter`), l'écoute d'un
 * compteur qui vit plus longtemps (`attach`), et de quoi noter un fait.
 */
export interface IRealtimeRun {
  meter: (label: string) => IWireTap;
  attach: (tap: IWireTap) => void;
  note: (text: string) => void;
}

/**
 * Note chaque trame des sockets du geste : celles que le code client ouvre
 * pour l'occasion, et celle que la page garde ouverte, écoutée le temps du
 * geste seulement.
 *
 * @param path - chemin de la socket, pour l'affichage
 * @param run - le code CLIENT du geste ; rend la phrase qui conclut
 * @param onChunk - appelé à chaque trame
 * @returns les trames, en `chunks` ; ne rejette jamais
 */
export async function probeRealtime(
  path: string,
  run: (probe: IRealtimeRun) => Promise<string>,
  onChunk?: (chunks: readonly IProbeChunk[]) => void,
): Promise<IProbeResult> {
  const request = `WEBSOCKET ${path}`;
  const start = performance.now();
  const since = () => Math.round(performance.now() - start);
  const chunks: IProbeChunk[] = [];
  // Un objet, pas des `let` : les rappels des transports le modifient.
  // `owned` : sockets du geste pas encore fermées ; `done` : le relevé est
  // rendu, une note tardive ne le rouvre pas.
  const seen = { opened: false, owned: 0, done: false };
  let drained: (() => void) | null = null;
  const note = (text: string) => {
    if (seen.done) return;
    chunks.push({ at: since(), text });
    onChunk?.([...chunks]);
  };
  // Seules les sockets ouvertes POUR le geste se font attendre à la fin.
  const sink = (owned: boolean): IWireSink => ({
    note,
    opened: () => {
      seen.opened = true;
    },
    created: () => {
      if (owned) seen.owned += 1;
    },
    closed: () => {
      if (!owned) return;
      seen.owned -= 1;
      if (seen.owned === 0) drained?.();
    },
  });
  const attached: IWireTap[] = [];
  const meter = (label: string): IWireTap => {
    const tap = wireTap(label);
    tap.listen(sink(true));
    return tap;
  };
  const attach = (tap: IWireTap) => {
    if (tap.open) seen.opened = true;
    tap.listen(sink(false));
    attached.push(tap);
  };
  let body = "";
  let error: string | null = null;
  try {
    body = await run({ meter, attach, note });
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }
  // La fermeture d'une socket se signale APRÈS `disconnect()` : on l'attend
  // (deux secondes au plus) pour qu'elle figure au relevé.
  if (seen.owned > 0) {
    await new Promise<void>((resolve) => {
      drained = resolve;
      setTimeout(resolve, 2000);
    });
  }
  // La socket gardée continue de vivre : son compteur cesse d'écrire ici.
  for (const tap of attached) tap.listen(null);
  seen.done = true;
  return {
    request,
    sent: [],
    status: seen.opened ? 101 : null,
    ms: since(),
    headers: [],
    body,
    chunks,
    redirected: false,
    finalUrl: null,
    error,
  };
}
// #endregion

/** Le résultat d'un appel qui n'a pas abouti. */
function failed(
  request: string,
  ms: number,
  error: unknown,
  sent: readonly (readonly [string, string])[] = [],
): IProbeResult {
  return {
    request,
    sent,
    status: null,
    ms,
    headers: [],
    body: "",
    chunks: [],
    redirected: false,
    finalUrl: null,
    error: error instanceof Error ? error.message : String(error),
  };
}
