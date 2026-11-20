import { useEffect, useRef, useState, type ReactNode } from "react";
import { docsVersion, docUrl, type IDemoAbout } from "../about";
import { LEVELS } from "../Catalogue";
import { LessonCode } from "../lesson/LessonCode";
import type { LessonFile } from "../lesson/lesson";
import {
  probeRealtime,
  wireTap,
  type IProbeChunk,
  type IProbeResult,
  type IWireTap,
} from "../kit/probe";
import { StepsLesson, type ILessonStep } from "../kit/StepsLesson";
import {
  canvasPng,
  ensureConnected,
  forgeBytes,
  negotiate,
  openBinary,
  requestSizes,
  sendBytes,
  trySize,
  watchGame,
  watchVibration,
  withSocket,
  type BinarySocket,
} from "./binaryClient";
import {
  BINARY_PATH,
  BINARY_SOCKET,
  GAME_HZ,
  VIBRATION_HZ,
  type IDigest,
} from "./binaryDemo";
import { BINARY_LESSON, type BinaryExcerpt } from "./binaryTabs";
import {
  CodecPair,
  DigestMatch,
  DrawPad,
  GameField,
  Oscilloscope,
  PayloadGauge,
  RateChart,
  WireComparison,
} from "./BinaryVisuals";
import { WIRE_CBOR, WIRE_TEXT } from "./wire";

const CONFIG = "nodefony/config/config.ts" satisfies LessonFile;
const CONTROLLER =
  "nodefony/controllers/BinaryController.ts" satisfies LessonFile;
const CLIENT = "frontend/src/binary/binaryClient.ts" satisfies LessonFile;
const SHARED = "frontend/src/binary/binaryDemo.ts" satisfies LessonFile;
const PROBE = "frontend/src/kit/probe.ts" satisfies LessonFile;

/** Trois secondes de chaque flux. */
const VIBRATION_FRAMES = VIBRATION_HZ * 3;
const GAME_FRAMES = GAME_HZ * 3;

/** 1,5 Mio : sous la limite en CBOR, au-dessus une fois en base64. */
const UNDER_LIMIT = 1.5 * 1024 * 1024;
const OVER_LIMIT = 3 * 1024 * 1024;

/** Ce que montre un geste, en plus du relevé des trames. */
type BinaryShow =
  "codecs" | "vibration" | "sizes" | "send" | "limit" | "game" | "traps";

interface IBinaryStep extends ILessonStep<BinaryExcerpt> {
  shows?: BinaryShow;
}

/** Ce que le code client remet à la page, pour les visuels. */
interface IBinaryScreen {
  codec: (label: string, codec: string) => void;
  vibration: (rpm: number, samples: Int16Array) => void;
  positions: (positions: Float32Array) => void;
  digest: (result: { server: IDigest; local: string } | null) => void;
  canvas: () => HTMLCanvasElement | null;
}

/**
 * La socket que la page GARDE ouverte, en CBOR — celle d'une application,
 * visible dans la barre de debug — et le compteur de fil qui la suit.
 */
interface IAppSocket {
  socket: BinarySocket;
  tap: IWireTap;
}

/** Une écoute de la sonde sur la socket de la démo. */
function onSocket(
  run: Parameters<typeof probeRealtime>[1],
): (live: (chunks: readonly IProbeChunk[]) => void) => Promise<IProbeResult> {
  return (live) => probeRealtime(BINARY_SOCKET, run, live);
}

/** Les sept gestes. */
function buildSteps(
  screen: IBinaryScreen,
  app: IAppSocket,
): readonly [IBinaryStep, ...IBinaryStep[]] {
  return [
    {
      id: "negotiate",
      short: "Négocier",
      gesture: "codec: CBOR_FRAME_CODEC",
      title: "Négocier le codec, connexion par connexion",
      text: "Le serveur sait parler CBOR ; chaque page choisit d'en profiter. La socket de la page OFFRE CBOR au handshake et l'obtient. Une seconde, ouverte le temps de comparer, n'offre rien et reste en texte — sur le même serveur, au même moment.",
      excerpts: [
        { file: CONFIG, region: "binary-config" },
        { file: CLIENT, region: "client-open" },
        { file: CLIENT, region: "client-negotiate" },
      ],
      expect: "binaire avec l'offre, texte sans",
      shows: "codecs",
      calls: [
        {
          label: "Comparer les deux connexions",
          verb: "WS",
          path: BINARY_SOCKET,
          run: onSocket(async ({ attach, meter }) => {
            attach(app.tap);
            const cbor = await negotiate(app.socket);
            screen.codec(WIRE_CBOR, cbor);
            const text = await withSocket(
              false,
              meter(WIRE_TEXT).transport,
              negotiate,
            );
            screen.codec(WIRE_TEXT, text);
            return `avec l'offre : ${cbor}\nsans offre : ${text}`;
          }),
        },
      ],
    },
    {
      id: "vibration",
      short: "Industrie",
      gesture: "new DataView(…)",
      title: "Recevoir les mesures d'une machine",
      text: `Une machine pousse ${VIBRATION_HZ} trames par seconde : 256 mesures d'accéléromètre en Int16, 512 octets. En CBOR, ils voyagent tels quels ; la page les lit avec \`DataView\`, sur la tranche reçue, en petit-boutiste.`,
      excerpts: [
        { file: CONTROLLER, region: "binary-vibration" },
        { file: CLIENT, region: "client-vibration" },
      ],
      expect: `${VIBRATION_FRAMES} trames de 512 octets de mesures`,
      shows: "vibration",
      calls: [
        {
          label: "Écouter trois secondes",
          verb: "WS",
          path: BINARY_SOCKET,
          run: onSocket(async ({ attach }) => {
            attach(app.tap);
            const seen = await watchVibration(
              app.socket,
              VIBRATION_FRAMES,
              screen.vibration,
            );
            return `${seen} trames de vibrations reçues`;
          }),
        },
      ],
    },
    {
      id: "wire",
      short: "Le fil mesuré",
      gesture: "byteLength",
      title: "Ce qui voyage vraiment",
      text: "La page demande six charges, de 64 octets à 1 Mio, sur une connexion CBOR puis sur une connexion texte. Sa sonde compte chaque trame reçue, en octets, et le temps que la socket passe dessus. En texte, les octets voyagent en base64 : un tiers de plus.",
      excerpts: [
        { file: CONTROLLER, region: "binary-sample" },
        { file: CLIENT, region: "client-measure" },
        { file: PROBE, region: "probe-realtime" },
      ],
      expect: "CBOR environ 25 % plus léger",
      shows: "sizes",
      calls: [
        {
          label: "Mesurer, CBOR puis texte",
          verb: "WS",
          path: BINARY_SOCKET,
          run: onSocket(async ({ attach, meter }) => {
            attach(app.tap);
            const cbor = await requestSizes(app.socket);
            const text = await withSocket(
              false,
              meter(WIRE_TEXT).transport,
              requestSizes,
            );
            return `octets de charge reçus : ${cbor} en CBOR, ${text} en texte — les mêmes`;
          }),
        },
      ],
    },
    {
      id: "send",
      short: "Envoyer",
      gesture: "{ bytes: Uint8Array }",
      title: "Envoyer des octets, recevoir leur empreinte",
      text: "Dessine, puis envoie : les octets PNG du canevas partent dans les paramètres d'une méthode. Le serveur rend leur taille et leur SHA-256 ; le navigateur calcule le sien. Même empreinte : pas un octet n'a changé en route. La socket de la page reste ouverte : la barre de debug montre la trame envoyée et la réponse.",
      excerpts: [
        { file: CONTROLLER, region: "binary-digest" },
        { file: CLIENT, region: "client-send" },
      ],
      expect: "deux empreintes identiques",
      shows: "send",
      calls: [
        {
          label: "Envoyer le dessin",
          verb: "WS",
          path: BINARY_SOCKET,
          run: onSocket(async ({ attach }) => {
            attach(app.tap);
            const canvas = screen.canvas();
            if (canvas === null) throw new Error("canevas absent");
            screen.digest(null);
            const result = await sendBytes(app.socket, await canvasPng(canvas));
            screen.digest(result);
            return `serveur : ${result.server.sha256}\nnavigateur : ${result.local}`;
          }),
        },
      ],
    },
    {
      id: "limit",
      short: "La limite",
      gesture: "maxPayload",
      title: "Trop gros : la connexion se ferme",
      text: "Un message entrant ne dépasse pas `maxPayload` — relevé ici à 2 Mio. 1,5 Mio passe en CBOR. 3 Mio : le serveur ferme en 1009 sans appeler l'action. La socket de la page est fermée ; le geste suivant la rouvre. Et les mêmes 1,5 Mio en texte pèsent 2 Mio passés une fois en base64 : refusés aussi.",
      excerpts: [
        { file: CONFIG, region: "binary-config" },
        { file: CLIENT, region: "client-limit" },
      ],
      expect: "passe ; 1009 ; 1009",
      shows: "limit",
      calls: [
        {
          label: "1,5 Mio en CBOR",
          verb: "WS",
          path: BINARY_SOCKET,
          run: onSocket(({ attach }) => {
            attach(app.tap);
            return trySize(app.socket, UNDER_LIMIT);
          }),
        },
        {
          label: "3 Mio en CBOR",
          verb: "WS",
          path: BINARY_SOCKET,
          run: onSocket(({ attach }) => {
            attach(app.tap);
            return trySize(app.socket, OVER_LIMIT);
          }),
        },
        {
          label: "1,5 Mio en texte",
          verb: "WS",
          path: BINARY_SOCKET,
          run: onSocket(({ meter }) =>
            withSocket(false, meter(WIRE_TEXT).transport, (socket) =>
              trySize(socket, UNDER_LIMIT),
            ),
          ),
        },
      ],
    },
    {
      id: "game",
      short: "Jeu",
      gesture: "Float32",
      title: "Un jeu à trente images par seconde",
      text: `64 sprites, ${GAME_HZ} images par seconde, l'état complet à chaque image : 64 positions en Float32, 512 octets. Deux connexions suivent le même jeu, l'une en CBOR, l'autre en texte : la sonde pèse chaque image sur les deux.`,
      excerpts: [
        { file: CONTROLLER, region: "binary-game" },
        { file: CLIENT, region: "client-game" },
        { file: SHARED, region: "binary-shared" },
      ],
      expect: `${GAME_FRAMES} images sur chaque connexion`,
      shows: "game",
      calls: [
        {
          label: "Jouer trois secondes",
          verb: "WS",
          path: BINARY_SOCKET,
          run: onSocket(async ({ attach, meter }) => {
            attach(app.tap);
            const [cbor, text] = await Promise.all([
              watchGame(app.socket, GAME_FRAMES, screen.positions),
              withSocket(false, meter(WIRE_TEXT).transport, (socket) =>
                watchGame(socket, GAME_FRAMES, null),
              ),
            ]);
            return `${cbor} images en CBOR, ${text} images en texte`;
          }),
        },
      ],
    },
    {
      id: "traps",
      short: "Pièges",
      gesture: "{ $bytes }",
      title: "Le $bytes forgé",
      text: 'Sur une connexion texte, `{"$bytes":"…"}` est la forme des octets. Un objet applicatif de cette forme serait relu en octets : l\'encodeur refuse de l\'envoyer. Avec une seconde clé, il part — et le schéma du serveur refuse ce qui n\'est pas un `Uint8Array`.',
      excerpts: [
        { file: CLIENT, region: "client-traps" },
        { file: CONTROLLER, region: "binary-digest" },
      ],
      expect: "TypeError ; refusé par le schéma",
      shows: "traps",
      calls: [
        {
          label: "Forger { $bytes }",
          verb: "WS",
          path: BINARY_SOCKET,
          run: onSocket(({ meter }) =>
            forgeBytes(false, meter(WIRE_TEXT).transport),
          ),
        },
        {
          label: "Avec une seconde clé",
          verb: "WS",
          path: BINARY_SOCKET,
          run: onSocket(({ meter }) =>
            forgeBytes(true, meter(WIRE_TEXT).transport),
          ),
        },
      ],
    },
  ];
}

/**
 * Page d'apprentissage « Temps réel binaire » (`/demo/binary`) : la carte des
 * sept gestes, puis UN geste à l'écran (mise en page du kit,
 * `kit/StepsLesson.tsx`). Chaque appel ouvre de vraies sockets, et la sonde
 * compte leurs trames.
 *
 * Guide pour un agent : le contrôleur est `BinaryController.ts` ; le code
 * client de chaque geste, `binaryClient.ts` ; la sonde, `probeRealtime` de
 * `kit/probe.ts` ; la relecture du relevé, `wire.ts` ; les visuels,
 * `BinaryVisuals.tsx`.
 */
export function BinaryLesson({ about }: { about: IDemoAbout | null }) {
  const version = docsVersion(about);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  // UNE socket CBOR pour toute la page, ouverte à l'arrivée, fermée au
  // départ : les gestes la partagent, la barre de debug la montre.
  const [app] = useState<IAppSocket>(() => {
    const tap = wireTap(WIRE_CBOR);
    return { tap, socket: openBinary(true, tap.transport) };
  });
  useEffect(() => {
    ensureConnected(app.socket).catch(() => {
      // Le premier geste réessaiera, et dira pourquoi s'il échoue encore.
    });
    return () => app.socket.disconnect();
  }, [app]);
  const [last, setLast] = useState<Partial<Record<string, IProbeResult>>>({});
  const [codecs, setCodecs] = useState<Partial<Record<string, string>>>({});
  const [vibration, setVibration] = useState<{
    rpm: number;
    samples: Int16Array;
  } | null>(null);
  const [positions, setPositions] = useState<Float32Array | null>(null);
  const [digest, setDigest] = useState<{
    server: IDigest;
    local: string;
  } | null>(null);
  const steps = buildSteps(
    {
      codec: (label, codec) =>
        setCodecs((before) => ({ ...before, [label]: codec })),
      vibration: (rpm, samples) => setVibration({ rpm, samples }),
      positions: setPositions,
      digest: setDigest,
      canvas: () => canvas.current,
    },
    app,
  );

  const fields = (
    step: IBinaryStep,
    live: readonly IProbeChunk[] | null,
  ): ReactNode => {
    const chunks = live ?? last[step.id]?.chunks ?? [];
    // Un visuel par nature de geste : la carte refuse d'en oublier un.
    const visuals: Record<BinaryShow, ReactNode> = {
      codecs: <CodecPair chunks={chunks} codecs={codecs} />,
      vibration: (
        <>
          <Oscilloscope
            samples={vibration?.samples ?? null}
            rpm={vibration?.rpm ?? null}
          />
          <RateChart chunks={chunks} />
        </>
      ),
      sizes: (
        <>
          <WireComparison chunks={chunks} metric="bytes" />
          <WireComparison chunks={chunks} metric="ms" />
        </>
      ),
      send: (
        <>
          <DrawPad canvas={canvas} />
          <DigestMatch result={digest} />
        </>
      ),
      limit: <PayloadGauge chunks={chunks} />,
      game: (
        <>
          <GameField positions={positions} chunks={chunks} hz={GAME_HZ} />
          <RateChart chunks={chunks} />
        </>
      ),
      traps: null,
    };
    return step.shows === undefined ? null : visuals[step.shows];
  };

  return (
    <main className="lesson steps-page">
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <a href="/demo">Démo</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Temps réel binaire</span>
      </nav>

      <header className="steps-head">
        <span className={`lvl ${LEVELS.advanced.className}`}>
          {LEVELS.advanced.label}
        </span>
        <h1>Temps réel binaire — des octets sur la socket</h1>
        <p>
          Des mesures de machine, les positions d'un jeu, un fichier : des{" "}
          <strong>octets</strong>, dans les mêmes messages que le reste. Avec le
          codec <strong>CBOR</strong>, ils voyagent tels quels ; sans lui, en
          base64. La page le mesure, trame par trame.
        </p>
        <aside className="codec-explain" aria-label="Une connexion, un codec">
          <h2>Une connexion, un codec</h2>
          <ol>
            <li>
              Au handshake, le navigateur <strong>offre</strong> CBOR (
              <code>codec: CBOR_FRAME_CODEC</code>) ou n'offre rien.
            </li>
            <li>
              Le serveur <strong>choisit</strong> et l'annonce dans l'accueil,
              la seule trame toujours en texte. Toute la suite de la connexion
              garde ce format&nbsp;: elle n'en change jamais.
            </li>
            <li>
              Le serveur en <code>codec: "cbor"</code> parle les{" "}
              <strong>deux à la fois</strong>, une connexion de chaque sorte.
              Une page qui n'offre rien reste en texte et reçoit quand même ses
              octets en <code>Uint8Array</code>.
            </li>
          </ol>
          <p>
            Une vraie application ouvre <strong>une seule socket</strong>, qui
            offre CBOR, et la garde. Cette page fait de même : sa socket reste
            ouverte pendant tous les gestes, et la barre de debug la montre.
            Elle n'en ouvre une seconde, en texte, que le temps de peser les
            mêmes messages dans les deux formats.
          </p>
        </aside>
      </header>

      <StepsLesson
        steps={steps}
        label="Les sept gestes"
        prefix={BINARY_PATH}
        fields={fields}
        onResult={(result, step) =>
          setLast((done) => ({ ...done, [step]: result }))
        }
      />

      <details className="steps-more">
        <summary>Le contrôleur entier, et la page, couche par couche</summary>
        <LessonCode
          lesson={BINARY_LESSON}
          doc={{
            href: docUrl(version, "modules/realtime/protocole"),
            label: "Le protocole temps réel — la doc complète",
          }}
        />
      </details>

      <section className="lesson-traps" aria-labelledby="lesson-traps-title">
        <div>
          <h2 id="lesson-traps-title" className="lesson-step">
            Les pièges
          </h2>
          <ul>
            <li>
              <strong>Un serveur resté en json déforme les octets.</strong> Un{" "}
              <code>Uint8Array</code> y part en <code>{'{"0":1,"1":2,…}'}</code>
              , sans aucune erreur : la clé <code>codec</code> se vérifie avant
              tout autre diagnostic.
            </li>
            <li>
              <strong>
                <code>shared()</code> fige ses réglages.
              </strong>{" "}
              Le codec passé à un <code>NodefonySocket.shared()</code> qui n'est
              pas le premier de l'adresse est ignoré : d'où une socket dédiée.
            </li>
            <li>
              <strong>
                <code>new DataView(bytes.buffer)</code> lit à côté.
              </strong>{" "}
              Un <code>Uint8Array</code> ne commence pas toujours au début de
              son tampon : passer <code>byteOffset</code> et{" "}
              <code>byteLength</code>.
            </li>
            <li>
              <strong>CBOR ne gagne que sur des octets.</strong> Sur des objets
              ordinaires, JSON est natif au moteur : n'offrir le codec que si
              des octets circulent.
            </li>
          </ul>
        </div>
        <aside className="further" aria-label="Pour aller plus loin">
          <h2 className="lesson-step">Pour aller plus loin</h2>
          <a href={docUrl(version, "modules/realtime/protocole")}>
            Des octets dans la charge — @nodefony/realtime
          </a>
          <a href={docUrl(version, "modules/realtime/configuration")}>
            La clé codec — configuration
          </a>
          <a href="/demo/chat">Le chat : la même socket, en texte</a>
        </aside>
      </section>
    </main>
  );
}
