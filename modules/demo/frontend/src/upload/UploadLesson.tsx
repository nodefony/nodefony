import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NodefonyLogin } from "nodefony/client";
import { docsVersion, docUrl, type IDemoAbout } from "../about";
import { LEVELS } from "../Catalogue";
import { LessonCode } from "../lesson/LessonCode";
import type { LessonFile } from "../lesson/lesson";
import { probeHttp, type IProbeChunk, type IProbeResult } from "../kit/probe";
import {
  StepsLesson,
  type ILessonStep,
  type IStepCall,
} from "../kit/StepsLesson";
import {
  progressLine,
  readBack,
  sendWithProgress,
  sha256Hex,
  type IUploadProgress,
} from "./uploadClient";
import { UPLOAD_MAX_BYTES, UPLOAD_MAX_FILES, UPLOAD_PATH } from "./uploadDemo";
import { UPLOAD_LESSON, type UploadExcerpt } from "./uploadTabs";
import { FilePicker, UploadProgress } from "./UploadVisuals";

const CONTROLLER =
  "nodefony/controllers/UploadController.ts" satisfies LessonFile;
const SERVICE = "nodefony/service/UploadService.ts" satisfies LessonFile;
const SHARED = "frontend/src/upload/uploadDemo.ts" satisfies LessonFile;
const CLIENT = "frontend/src/upload/uploadClient.ts" satisfies LessonFile;
const PAGE = "frontend/src/upload/UploadLesson.tsx" satisfies LessonFile;
const VISUALS = "frontend/src/upload/UploadVisuals.tsx" satisfies LessonFile;

type UploadStep = ILessonStep<UploadExcerpt>;
type Live = (chunks: readonly IProbeChunk[]) => void;

/** Le corps brut envoyé par le geste 5. */
const RAW_BYTES = 3 * 1024 * 1024;

/** Un fichier fabriqué par la page : `size` octets d'un motif qui se répète. */
function patterned(size: number, name: string): File {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) bytes[i] = i & 0xff;
  return new File([bytes], name, { type: "application/octet-stream" });
}

/** Les fichiers que la page fabrique : le geste 1 réussit sans rien choisir. */
const SAMPLES = {
  hello: () =>
    new File(["bonjour nodefony\n"], "bonjour.txt", { type: "text/plain" }),
  // L'en-tête d'un PNG, sous un nom et un type de texte.
  pngAsText: () =>
    new File(
      [
        new Uint8Array([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
          0x0d, 0x49, 0x48, 0x44, 0x52,
        ]),
      ],
      "note.txt",
      { type: "text/plain" },
    ),
  textAsPng: () =>
    new File(["ceci n'est pas une image\n"], "photo.png", {
      type: "image/png",
    }),
} as const;

/**
 * Les identifiants rangés que rend une réponse, dans l'ordre : un envoi
 * (`{ files }`), un corps brut (un fichier) ou la liste du compte.
 */
function storedIds(body: string): string[] {
  try {
    const parsed: unknown = JSON.parse(body);
    const list: unknown = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed !== null && "files" in parsed
        ? parsed.files
        : [parsed];
    if (!Array.isArray(list)) return [];
    return list.flatMap((entry: unknown) =>
      typeof entry === "object" &&
      entry !== null &&
      "id" in entry &&
      typeof entry.id === "string"
        ? [entry.id]
        : [],
    );
  } catch {
    return [];
  }
}

// #region client-form
/**
 * Un envoi multipart : les fichiers sous le champ `file`, le libellé à côté.
 * L'empreinte de chaque fichier est calculée AVANT l'envoi, pour la comparer
 * à la relecture.
 */
async function sendFiles(
  files: readonly { file: Blob; name: string }[],
  label: string | null,
  onProgress: (progress: IUploadProgress) => void,
): Promise<{ result: IProbeResult; before: string[] }> {
  const form = new FormData();
  if (label !== null) form.append("label", label);
  for (const { file, name } of files) form.append("file", file, name);
  const before = await Promise.all(files.map(({ file }) => sha256Hex(file)));
  const result = await sendWithProgress(UPLOAD_PATH, form, onProgress);
  return { result, before };
}
// #endregion

/**
 * Page d'apprentissage « Envoi de fichiers » (`/demo/upload`) : la carte des
 * sept gestes, puis UN geste à l'écran (mise en page du kit,
 * `kit/StepsLesson.tsx`). Chaque appel envoie un vrai fichier au serveur.
 *
 * Guide pour un agent : le contrôleur est `UploadController.ts`, le
 * rangement `UploadService.ts`. Les envois passent par `XMLHttpRequest` pour
 * suivre la progression (`uploadClient.ts`) ; le reste par la sonde du kit
 * (`probeHttp` de `kit/probe.ts`). Les fichiers se rangent sur le compte :
 * sans session, les gestes attendent la connexion, sauf le refus « sans
 * session ».
 */
export function UploadLesson({ about }: { about: IDemoAbout | null }) {
  const version = docsVersion(about);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [picked, setPicked] = useState<File | null>(null);
  const [progress, setProgress] = useState<readonly IUploadProgress[]>([]);
  // L'empreinte de chaque fichier envoyé d'ici, par identifiant rangé.
  const before = useRef(new Map<string, string>());

  useEffect(() => {
    let live = true;
    void new NodefonyLogin().me().then((user) => {
      if (live) setSignedIn(user !== null);
    });
    return () => {
      live = false;
    };
  }, []);

  const steps = useMemo(() => {
    const blocked =
      signedIn === true
        ? null
        : signedIn === null
          ? "Lecture de la session…"
          : "Connectez-vous (en haut à droite) : les fichiers se rangent sur votre compte.";
    const remember = (ids: readonly string[], digests: readonly string[]) => {
      ids.forEach((id, i) => {
        const digest = digests.at(i);
        if (digest !== undefined) before.current.set(id, digest);
      });
    };
    /** Un envoi multipart, la progression à l'écran et dans la frise. */
    const send = (
      files: readonly { file: Blob; name: string }[],
      label: string | null,
      live: Live,
    ) => {
      setProgress([]);
      const lines: IProbeChunk[] = [];
      return sendFiles(files, label, (step) => {
        setProgress((done) => [...done, step]);
        lines.push(progressLine(step));
        live([...lines]);
      }).then(({ result, before: digests }) => {
        if (result.status === 201) remember(storedIds(result.body), digests);
        return result;
      });
    };
    const call = (
      label: string,
      path: string,
      run: IStepCall["run"],
      extra: { verb?: IStepCall["verb"]; blocked?: string | null } = {},
    ): IStepCall => ({
      label,
      verb: extra.verb ?? "POST",
      path,
      run,
      blocked: extra.blocked === undefined ? blocked : extra.blocked,
    });
    const pickedCall = (label: string) =>
      call(
        label,
        UPLOAD_PATH,
        (live) =>
          send(
            picked === null ? [] : [{ file: picked, name: picked.name }],
            null,
            live,
          ),
        {
          blocked:
            blocked ??
            (picked === null ? "Choisissez un fichier ci-dessus." : null),
        },
      );

    const list: readonly [UploadStep, ...UploadStep[]] = [
      {
        id: "send",
        short: "Envoyer un fichier",
        gesture: "@UploadedFiles()",
        title: "Le fichier arrive déjà sur le disque",
        text: "Le navigateur envoie un `POST` multipart (RFC 7578). Le framework le lit EN FLUX jusqu'à un fichier temporaire, avant l'action : elle reçoit des fichiers déjà écrits, et n'a qu'à les DÉPLACER sous un nom que le serveur choisit. Réponse : 201 et ce qui a été rangé.",
        excerpts: [
          { file: CONTROLLER, region: "upload-send" },
          { file: SERVICE, region: "upload-keep" },
          { file: VISUALS, region: "client-picker" },
          { file: PAGE, region: "client-form" },
        ],
        expect: "201, le fichier rangé",
        calls: [
          call("Un petit fichier texte", UPLOAD_PATH, (live) =>
            send([{ file: SAMPLES.hello(), name: "bonjour.txt" }], null, live),
          ),
          pickedCall("Le fichier choisi"),
        ],
      },
      {
        id: "progress",
        short: "Suivre la progression",
        gesture: "upload.onprogress",
        title: "Voir l'envoi avancer",
        text: "`fetch` ne dit pas où en est l'envoi d'un corps ; `XMLHttpRequest` le dit, par `upload.onprogress`. La barre et la frise montrent chaque avancement reçu. Sur ce poste, 6 Mio partent presque d'un coup ; sur un vrai réseau, la barre avance.",
        excerpts: [
          { file: CLIENT, region: "client-progress" },
          { file: CONTROLLER, region: "upload-send" },
        ],
        expect: "des avancements, puis 201",
        calls: [
          call("6 Mio fabriqués par la page", UPLOAD_PATH, (live) =>
            send(
              [
                {
                  file: patterned(6 * 1024 * 1024, "six-mio.bin"),
                  name: "six-mio.bin",
                },
              ],
              null,
              live,
            ),
          ),
          pickedCall("Le fichier choisi"),
        ],
      },
      {
        id: "many",
        short: "Plusieurs fichiers",
        gesture: "@UploadedFiles() · @Body()",
        title: "Plusieurs fichiers et un champ, un seul envoi",
        text: `Un formulaire porte des fichiers ET des champs texte : \`@UploadedFiles()\` rend les fichiers dans l'ordre d'envoi, \`@Body("label")\` le champ. La route en accepte ${UPLOAD_MAX_FILES} au plus.`,
        excerpts: [
          { file: CONTROLLER, region: "upload-send" },
          { file: PAGE, region: "client-form" },
        ],
        expect: "201, trois fichiers et le libellé",
        calls: [
          call("Trois fichiers et un libellé", UPLOAD_PATH, (live) =>
            send(
              ["un", "deux", "trois"].map((word) => ({
                file: new Blob([`fichier ${word}\n`], { type: "text/plain" }),
                name: `${word}.txt`,
              })),
              "trois d'un coup",
              live,
            ),
          ),
        ],
      },
      {
        id: "read",
        short: "Le relire",
        gesture: "Repr-Digest",
        title: "Relire le fichier, et prouver qu'il est intact",
        text: "Le serveur calcule l'empreinte SHA-256 de chaque fichier PENDANT sa réception, et la rend en `Repr-Digest` (RFC 9530) quand on le relit. Le navigateur l'avait calculée avant l'envoi : trois empreintes égales, le fichier est revenu tel qu'il est parti. `nosniff` et `attachment` : le navigateur ne devine rien et ne l'affiche pas.",
        excerpts: [
          { file: CONTROLLER, region: "upload-read" },
          { file: CLIENT, region: "client-readback" },
          { file: CLIENT, region: "client-digest" },
        ],
        expect: "la liste, puis trois empreintes égales",
        calls: [
          call(
            "Mes fichiers",
            UPLOAD_PATH,
            (live) => probeHttp(UPLOAD_PATH, {}, live),
            {
              verb: "GET",
            },
          ),
          call(
            "Relire le dernier et comparer",
            `${UPLOAD_PATH}/{id}`,
            async (live) => {
              const response = await fetch(UPLOAD_PATH, { cache: "no-store" });
              const last = response.ok
                ? storedIds(await response.text()).at(0)
                : undefined;
              if (last === undefined) return probeHttp(UPLOAD_PATH, {}, live);
              return readBack(
                `${UPLOAD_PATH}/${last}`,
                before.current.get(last) ?? null,
              );
            },
            { verb: "GET" },
          ),
        ],
      },
      {
        id: "raw",
        short: "Corps brut",
        gesture: "bodyStream: true",
        title: "Le corps entier EST le fichier",
        text: "Sans formulaire : le corps de la requête est le fichier, son nom dans l'adresse. `bodyStream: true` laisse le corps à l'action — le framework ne le lit pas, ses bornes ne s'appliquent pas : c'est le service qui compte les octets, hache et écrit au fil de l'eau.",
        excerpts: [
          { file: CONTROLLER, region: "upload-raw-route" },
          { file: SERVICE, region: "upload-raw" },
        ],
        expect: "201, le fichier rangé",
        calls: [
          call(
            "3 Mio en corps brut",
            `${UPLOAD_PATH}/raw?name=brut.bin`,
            async (live) => {
              const file = patterned(RAW_BYTES, "brut.bin");
              const digest = await sha256Hex(file);
              const result = await probeHttp(
                `${UPLOAD_PATH}/raw?name=brut.bin`,
                {
                  method: "POST",
                  headers: { "content-type": "application/octet-stream" },
                  body: file,
                },
                live,
              );
              if (result.status === 201)
                remember(storedIds(result.body), [digest]);
              return result;
            },
          ),
        ],
      },
      {
        id: "declared",
        short: "Ce que dit le client",
        gesture: "kindOf(octets)",
        title: "Le nom et le type viennent du client : des étiquettes",
        text: "Le client DÉCLARE un nom et un type ; rien ne les garantit. Le serveur reconnaît le fichier à ses premiers octets, et c'est ce type-là qu'il servira. Le nom n'est jamais un chemin : le fichier est rangé sous un identifiant, et `../../etc/passwd` n'est qu'une étiquette — que busboy a déjà réduite à son dernier segment.",
        excerpts: [
          { file: SHARED, region: "upload-kind" },
          { file: SERVICE, region: "upload-keep" },
        ],
        expect: "declared ≠ type ; un nom sans chemin",
        calls: [
          call("Un .txt qui est un PNG", UPLOAD_PATH, (live) =>
            send([{ file: SAMPLES.pngAsText(), name: "note.txt" }], null, live),
          ),
          call("Un .png qui est du texte", UPLOAD_PATH, (live) =>
            send(
              [{ file: SAMPLES.textAsPng(), name: "photo.png" }],
              null,
              live,
            ),
          ),
          call("Un nom qui remonte : ../../etc/passwd", UPLOAD_PATH, (live) =>
            send(
              [{ file: SAMPLES.hello(), name: "../../etc/passwd" }],
              null,
              live,
            ),
          ),
        ],
      },
      {
        id: "refuse",
        short: "Refuser",
        gesture: "413 · 400 · 403",
        title: "Trop gros, trop nombreux, vide, anonyme",
        text: `Un fichier de plus de 8 Mio est COUPÉ pendant son flux (413) : l'option \`upload\` de la route s'applique avant l'action, et le temporaire commencé est effacé. Plus de ${UPLOAD_MAX_FILES} fichiers : 413. Aucun fichier : 400, dit par l'action. Le corps brut trop gros : 413, compté par le service. Sans session : 403 — le refus de \`@IsGranted\`, avant que l'action soit construite.`,
        excerpts: [
          { file: CONTROLLER, region: "upload-send" },
          { file: SERVICE, region: "upload-raw" },
          { file: CONTROLLER, region: "upload-class" },
        ],
        expect: "413, 413, 400, 413, 403",
        calls: [
          call("8 Mio et un octet", UPLOAD_PATH, (live) =>
            send(
              [
                {
                  file: patterned(UPLOAD_MAX_BYTES + 1, "trop.bin"),
                  name: "trop.bin",
                },
              ],
              null,
              live,
            ),
          ),
          call(
            `${UPLOAD_MAX_FILES + 1} fichiers d'un coup`,
            UPLOAD_PATH,
            (live) =>
              send(
                Array.from({ length: UPLOAD_MAX_FILES + 1 }, (_, i) => ({
                  file: new Blob([`n° ${i + 1}\n`]),
                  name: `n${i + 1}.txt`,
                })),
                null,
                live,
              ),
          ),
          call("Un libellé, aucun fichier", UPLOAD_PATH, (live) =>
            send([], "rien à ranger", live),
          ),
          call(
            "Corps brut de 8 Mio et un octet",
            `${UPLOAD_PATH}/raw?name=trop.bin`,
            (live) =>
              probeHttp(
                `${UPLOAD_PATH}/raw?name=trop.bin`,
                {
                  method: "POST",
                  headers: { "content-type": "application/octet-stream" },
                  body: patterned(UPLOAD_MAX_BYTES + 1, "trop.bin"),
                },
                live,
              ),
          ),
          call(
            "Sans session",
            UPLOAD_PATH,
            (live) => probeHttp(UPLOAD_PATH, { credentials: "omit" }, live),
            { verb: "GET", blocked: null },
          ),
        ],
      },
    ];
    return list;
  }, [signedIn, picked, before]);

  const visuals = (step: UploadStep): ReactNode => (
    <>
      {(step.id === "send" || step.id === "progress") && (
        <FilePicker file={picked} onPick={setPicked} />
      )}
      {step.id === "progress" && <UploadProgress events={progress} />}
    </>
  );

  return (
    <main className="lesson steps-page">
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <a href="/demo">Démo</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Envoi de fichiers</span>
      </nav>

      <header className="steps-head">
        <span className={`lvl ${LEVELS.beginner.className}`}>
          {LEVELS.beginner.label}
        </span>
        <h1>Envoi de fichiers — téléverser, suivre, relire</h1>
        <p>
          Un fichier part du navigateur dans un formulaire{" "}
          <code>multipart/form-data</code>. Le serveur le lit{" "}
          <strong>en flux</strong> jusqu'au disque — jamais en mémoire —, le
          range sous un nom qu'il choisit, le reconnaît à ses octets, et le rend
          tel qu'il est arrivé, empreinte à l'appui.
        </p>
      </header>

      <StepsLesson
        steps={steps}
        label="Les sept gestes"
        prefix={UPLOAD_PATH}
        fields={visuals}
      />

      <details className="steps-more">
        <summary>Le contrôleur entier, et la page, couche par couche</summary>
        <LessonCode
          lesson={UPLOAD_LESSON}
          doc={{
            href: docUrl(version, "modules/http/upload"),
            label: "Envoi de fichiers et corps de requête — la doc complète",
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
              <strong>Garder le nom du client comme chemin.</strong>{" "}
              <code>path.join(dossier, file.filename)</code> : un nom{" "}
              <code>../../</code> sort du dossier. Ranger sous un identifiant,
              garder le nom comme étiquette.
            </li>
            <li>
              <strong>Croire le type déclaré.</strong>{" "}
              <code>file.mimeType</code> vient du client. Servir le type que
              prouvent les octets, avec <code>nosniff</code>.
            </li>
            <li>
              <strong>Une seule borne pour toute l'application.</strong> 500 Mo
              par défaut : un avatar de 2 Go remplit le disque avant d'être
              refusé. L'option de route <code>upload</code> borne chaque route.
            </li>
            <li>
              <strong>Lire un corps brut sans compter.</strong> Avec{" "}
              <code>bodyStream: true</code>, aucune borne du framework ne
              s'applique : l'action compte, ou le disque se remplit.
            </li>
          </ul>
        </div>
        <aside className="further" aria-label="Pour aller plus loin">
          <h2 className="lesson-step">Pour aller plus loin</h2>
          <a href={docUrl(version, "modules/http/upload")}>
            Envoi de fichiers et corps de requête — @nodefony/http
          </a>
          <a href="/demo/video">Vidéo par plages : servir un gros fichier</a>
          <a href="/demo/chat">Chat : des pièces jointes dans un salon</a>
        </aside>
      </section>
    </main>
  );
}
