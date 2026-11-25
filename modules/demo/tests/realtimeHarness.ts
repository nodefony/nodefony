import { execFile } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer, type Server, type Socket } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { readRuntimeState } from "nodefony";
import * as nodefonyCbor from "nodefony/cbor";
import { NodefonySocket, type IRealtimeContract } from "nodefony/client";
import {
  E2E_ADMIN_PASSWORD,
  E2E_USER_IDENTIFIER,
  E2E_USER_PASSWORD,
  nodefonyBin,
  startSpareApp,
  type ISpareApp,
} from "nodefony/testing";
import { describe, inject } from "vitest";

declare module "vitest" {
  export interface ProvidedContext {
    /** La base de la suite e2e de l'application (`tests/e2e.setup.ts`). */
    e2eDatabaseUrl: string | null;
    /** Vrai quand la suite vise une application servie AILLEURS (`NF_E2E_BASE_URL`). */
    e2eExternalTarget: boolean;
  }
}

/**
 * Le décor des tests de bout en bout de la démo : un serveur RÉEL, et les
 * sockets de la page (`nodefony/client`) branchées dessus.
 *
 * Guide pour un agent :
 * - La démo est un module `policy: "dev"` : la production la retire, et le
 *   serveur que `tests/e2e.setup.ts` démarre pour l'application est un serveur
 *   de production. Chaque fichier démarre donc SON exemplaire, en
 *   développement (`startDemoServer` en `beforeAll`, `stop` en `afterAll`).
 * - Les ports sont pris LIBRES, HTTPS compris : jamais 5151/5152, ceux d'un
 *   `nodefony development` déjà ouvert sur le poste. La base est celle du
 *   décor e2e (un SQLite JETABLE, ou la base `<base>_e2e` d'un moteur
 *   serveur) : la base de développement de l'application n'est jamais
 *   touchée, et le compte `admin` y naît avec le mot de passe du décor e2e.
 * - Cible EXTERNE (`NF_E2E_BASE_URL`) : l'application visée est un
 *   déploiement de production, d'où la démo est RETIRÉE. Il n'y a rien à y
 *   viser, et démarrer un exemplaire ici mesurerait ce poste, pas la cible.
 *   Les suites se décrivent donc par `demoDescribe`, qui les SAUTE en le
 *   disant ; `startDemoServer` refuse de démarrer dans ce mode.
 * - Un test ouvre ses sockets par `openSocket`, attend ce qu'il veut voir par
 *   `waitFor` — jamais par une pause fixe —, et referme tout par `closeAll`.
 */

let server: ISpareApp | null = null;

/**
 * Le port HTTPS où l'exemplaire démarré écoute VRAIMENT — HTTP/2, celui du
 * gRPC natif. Lu sur ce que le serveur publie, jamais recopié de sa config :
 * en développement, un port pris le fait glisser au suivant.
 */
let httpsPortOf: number | null = null;

/**
 * Les variables de l'exemplaire (sa base, le mot de passe `admin`, ses ports) :
 * une commande `nodefony` lancée par un test doit lire la MÊME base pour
 * signer un jeton que l'exemplaire acceptera.
 */
let serverEnv: Record<string, string> | null = null;

/**
 * Vrai quand l'exemplaire tourne sur une base JETABLE, propre à ce fichier
 * (SQLite) ; faux sur la base `<base>_e2e` PARTAGÉE d'un moteur serveur, que
 * `tests/e2e.setup.ts` a déjà peuplée. Décidé une fois, par `startDemoServer`.
 */
let disposableBase = false;
/**
 * La création du compte sans privilège sur la base jetable de l'exemplaire en
 * cours : faite UNE fois, rejouée par chaque appel — la commande refuse un
 * compte qui existe déjà. Remise à `null` avec l'exemplaire.
 */
let memberReady: Promise<void> | null = null;

/**
 * Vrai quand la suite vise une application servie ailleurs — la décision de
 * `tests/e2e.setup.ts`, transmise par `provide`, jamais recalculée ici.
 * Absente (fichier joué sans ce décor, `undefined`) : la démo démarre son
 * exemplaire.
 */
const externalTarget = inject("e2eExternalTarget");

/**
 * Le `describe` des suites de la démo : SAUTÉ quand la cible est externe.
 *
 * Un fichier dont toutes les suites sont sautées ne joue pas ses `beforeAll` :
 * aucun exemplaire n'est démarré. La raison s'affiche — un saut muet se lit
 * comme un vert.
 */
export const demoDescribe = externalTarget ? describe.skip : describe;
if (externalTarget) {
  process.stdout.write(
    "démo : SAUTÉE — `NF_E2E_BASE_URL` vise un déploiement de production, " +
      "d'où la démo (module de développement) est retirée.\n",
  );
}

/**
 * Un serveur à l'écoute sur un port LIBRE, attribué par le système (port 0).
 *
 * Un port se tient ouvert tant qu'on en a besoin : tiré puis refermé, il peut
 * être repris par n'importe quel processus avant qu'on s'en serve, et deux
 * tirages successifs peuvent rendre le même numéro.
 *
 * @param onConnection - ce que reçoit une connexion (rien par défaut)
 */
function listenFree(onConnection?: (socket: Socket) => void): Promise<Server> {
  return new Promise((resolve, reject) => {
    const holder = createServer(onConnection);
    holder.once("error", reject);
    holder.listen(0, "127.0.0.1", () => resolve(holder));
  });
}

/** Le port d'un serveur à l'écoute. */
function portOf(holder: Server): number {
  const address = holder.address();
  if (address !== null && typeof address === "object") return address.port;
  throw new Error("aucun port rendu par le système");
}

/** Referme un serveur, et attend qu'il l'ait fait. */
function closeServer(holder: Server): Promise<void> {
  return new Promise((resolve) => holder.close(() => resolve()));
}

/**
 * Occupe un port comme le ferait un autre serveur du poste : la connexion est
 * acceptée puis aussitôt coupée — un client égaré échoue vite, jamais en
 * attendant son délai. Le port s'obtient EN l'occupant : jamais tiré d'abord.
 */
function squat(): Promise<Server> {
  return listenFree((socket) => socket.destroy());
}

/** Le port HTTPS que l'exemplaire publie, ou `null` s'il n'en publie aucun. */
function publishedHttpsPort(): number | null {
  const url = readRuntimeState(process.cwd(), {
    purgeStale: false,
  })?.urls?.find((u) => u.startsWith("https:"));
  return url === undefined ? null : Number(new URL(url).port);
}

/** Les réglages d'un exemplaire. */
export interface IDemoServerOptions {
  /**
   * Occupe le port HTTPS configuré avant le démarrage : l'exemplaire glisse
   * au suivant, comme une application lancée pendant qu'une autre tient
   * 5151/5152. Sa config dit alors un port, et il en sert un autre.
   */
  httpsPortTaken?: boolean;
}

/**
 * Démarre l'exemplaire de développement qui sert la démo.
 *
 * @param options - le décor des ports
 * @returns l'arrêt, à appeler en `afterAll`
 * @throws Error — en cible externe : la suite qui l'appelle devait être
 * décrite par `demoDescribe`
 */
export async function startDemoServer(
  options: IDemoServerOptions = {},
): Promise<() => Promise<void>> {
  if (externalTarget) {
    throw new Error(
      "startDemoServer() en cible externe (`NF_E2E_BASE_URL`) : la démo n'y " +
        "est pas servie — décrire la suite par `demoDescribe`, qui la saute.",
    );
  }
  // Les deux ports sont tenus ouverts ENSEMBLE jusqu'au dernier tirage :
  // jamais deux fois le même numéro. Un port repris entre sa fermeture et le
  // démarrage fait glisser l'exemplaire au suivant — `startSpareApp` et
  // `publishedHttpsPort` suivent alors celui qu'il SERT.
  const squatter = options.httpsPortTaken ? await squat() : null;
  const httpsHolder = squatter ?? (await listenFree());
  const httpProbe = await listenFree();
  const port = portOf(httpProbe);
  const httpsPort = portOf(httpsHolder);
  await closeServer(httpProbe);
  if (httpsHolder !== squatter) await closeServer(httpsHolder);
  const release = () =>
    new Promise<void>((resolve) => {
      if (squatter === null) resolve();
      else squatter.close(() => resolve());
    });
  // La base est celle que `tests/e2e.setup.ts` a CHOISIE et remise à neuf,
  // transmise par `provide` — jamais une copie de sa règle. Un moteur
  // serveur : la même base `<base>_e2e` (une entité écrite pour un dialecte
  // refuse de démarrer sur un autre). SQLite, ou rien de transmis : un fichier
  // JETABLE par fichier de test. Les fichiers se suivent
  // (`fileParallelism: false`) : un seul exemplaire de développement à la fois
  // écrit dans une base partagée.
  const shared = inject("e2eDatabaseUrl") ?? null;
  let dir: string | null = null;
  let database: string;
  if (shared !== null && !shared.startsWith("sqlite:")) {
    database = shared;
  } else {
    dir = mkdtempSync(path.join(tmpdir(), "nf-demo-e2e-"));
    database = `sqlite:${path.join(dir, "demo.db")}`;
  }
  const cleanup = () => {
    if (dir !== null) {
      rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
    }
  };
  const env = {
    NF_DATABASE_URL: database,
    NF_ADMIN_PASSWORD: E2E_ADMIN_PASSWORD,
    // La suite écrit en rafale avec UN compte : le quota d'écriture se relève.
    // Le 429 reste prouvé par la frappe, dont le quota est fixe.
    NF_DEMO_CHAT_WRITE_QUOTA: "100000",
  };
  const spare = await startSpareApp({
    command: "development",
    port,
    httpsPort,
    timeoutMs: 120_000,
    env,
  }).catch(async (error: unknown) => {
    await release();
    cleanup();
    throw error;
  });
  server = spare;
  httpsPortOf = publishedHttpsPort() ?? httpsPort;
  disposableBase = dir !== null;
  memberReady = null;
  // Les ports aussi : l'émetteur des jetons (`jwt.issuer`) en dépend, donc
  // l'audience qu'un jeton doit porter pour que cet exemplaire l'accepte.
  serverEnv = {
    ...env,
    NF_PORT: String(port),
    NF_PORT_HTTPS: String(httpsPort),
  };
  return async () => {
    server = null;
    httpsPortOf = null;
    serverEnv = null;
    disposableBase = false;
    memberReady = null;
    await spare.stop();
    await release();
    cleanup();
  };
}

/** L'origine `https://` de l'exemplaire démarré — HTTP/2, pour un client gRPC natif. */
export function httpsOrigin(): string {
  if (httpsPortOf === null) throw new Error("startDemoServer() d'abord");
  return `https://localhost:${httpsPortOf}`;
}

/** Les variables de l'exemplaire démarré, à reprendre pour une commande `nodefony`. */
export function serverEnvironment(): Record<string, string> {
  if (serverEnv === null) throw new Error("startDemoServer() d'abord");
  return serverEnv;
}

/**
 * Garantit le compte SANS privilège du décor e2e (`E2E_USER_IDENTIFIER`) sur
 * la base de l'exemplaire démarré, pour un test qui joue un second utilisateur.
 *
 * Une base PARTAGÉE (moteur serveur) l'a déjà : `tests/e2e.setup.ts` l'y sème,
 * et le recréer échouerait (« le compte existe déjà »). Une base JETABLE
 * (SQLite) ne porte que l'`admin` du démarrage : le compte y naît par la VRAIE
 * commande, sur la même base, avec le même `UserService` que l'application —
 * une fois par exemplaire : l'appeler de plusieurs tests est sûr.
 *
 * @throws Error si aucun exemplaire n'est démarré, ou si la commande échoue
 */
export function ensureMember(): Promise<void> {
  const env = serverEnvironment();
  if (!disposableBase) return Promise.resolve();
  if (memberReady === null) {
    const created = promisify(execFile)(
      process.execPath,
      [
        nodefonyBin(),
        "security:user:add",
        E2E_USER_IDENTIFIER,
        "--password",
        E2E_USER_PASSWORD,
      ],
      { env: { ...process.env, ...env, NODE_ENV: "development" } },
    ).then(() => undefined);
    // Un échec n'est pas retenu : l'appel suivant réessaie.
    created.catch(() => {
      if (memberReady === created) memberReady = null;
    });
    memberReady = created;
  }
  return memberReady;
}

/** L'adresse `http://` d'un chemin, sur l'exemplaire démarré. */
export function httpUrl(pathname: string): string {
  if (server === null) throw new Error("startDemoServer() d'abord");
  return `http://127.0.0.1:${server.port}${pathname}`;
}

/** L'adresse `ws://` d'un chemin, sur l'exemplaire démarré. */
export function socketUrl(pathname: string): string {
  return httpUrl(pathname).replace(/^http/u, "ws");
}

/** Une socket ouverte par ce décor, typée par le contrat de sa démo. */
export type ContractSocket<C extends IRealtimeContract> = ReturnType<
  typeof NodefonySocket.fromContract<C>
>;

const opened = new Set<{ disconnect(): void }>();

/**
 * Ouvre une socket NEUVE (jamais la partagée : deux joueurs sont deux
 * clients) et attend qu'elle soit connectée. La page passe une adresse
 * relative ; Node n'a pas de page, l'adresse est donc absolue.
 *
 * @param pathname - le chemin de la socket, celui que la page emploie
 * @param options - `cbor: false` pour une socket texte ; `session` : les
 *   en-têtes d'une session (leur cookie part avec la poignée de main), sinon
 *   la socket est anonyme
 */
export async function openSocket<C extends IRealtimeContract>(
  pathname: string,
  options: { cbor?: boolean; session?: Record<string, string> } = {},
): Promise<ContractSocket<C>> {
  const cookie = options.session?.cookie;
  const socket = NodefonySocket.fromContract<C>({
    url: socketUrl(pathname),
    // Un test qui perd sa socket doit ÉCHOUER, pas se reconnecter en silence.
    autoReconnect: false,
    ...(options.cbor === false ? {} : { codec: nodefonyCbor.CBOR_FRAME_CODEC }),
    // Une session : Node n'a pas de navigateur pour joindre le cookie, la
    // socket le porte elle-même — avec l'origine du site, comme une page.
    ...(cookie === undefined
      ? {}
      : { headers: { cookie, origin: httpsOrigin() } }),
  });
  opened.add(socket);
  await socket.connect();
  return socket;
}

/** Referme toutes les sockets ouvertes par ce décor. */
export function closeAll(): void {
  for (const socket of opened) socket.disconnect();
  opened.clear();
}

/**
 * Attend qu'une condition devienne vraie, en la relisant toutes les 25 ms.
 *
 * @throws Error — avec `what` — si elle ne l'est pas avant `timeoutMs`
 */
export async function waitFor(
  what: string,
  condition: () => boolean,
  timeoutMs = 10_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) {
      throw new Error(`délai dépassé (${timeoutMs} ms) : ${what}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}
