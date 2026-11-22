import { useState, type ReactNode } from "react";
import { loginPagePath } from "nodefony/client";
import { docsVersion, docUrl, type IDemoAbout } from "../about";
import { LEVELS } from "../Catalogue";
import { LessonCode } from "../lesson/LessonCode";
import type { LessonFile } from "../lesson/lesson";
import { probeRequest, probeSocket, type IProbeResult } from "../kit/probe";
import {
  StepsLesson,
  type ILessonStep,
  type IStepCall,
} from "../kit/StepsLesson";
import {
  checkEcho,
  echoRequest,
  getRequest,
  helloPath,
  helloRequest,
  noteRequest,
  openHello,
  sourceRequest,
} from "./firstClient";
import { FIRST_PATH } from "./firstSteps";
import {
  FIRST_LESSON,
  type FirstClientRegion,
  type FirstControllerRegion,
  type FirstExcerpt,
} from "./firstTabs";
import { Exchange } from "./FirstVisuals";

const CONTROLLER =
  "nodefony/controllers/FirstStepsController.ts" satisfies LessonFile;
const CLIENT = "frontend/src/first/firstClient.ts" satisfies LessonFile;
const PROBE = "frontend/src/kit/probe.ts" satisfies LessonFile;

/** Un geste de Premiers pas, et les champs qu'il demande. */
interface IFirstStep extends ILessonStep<FirstExcerpt> {
  fields?: "name" | "name-age";
}

/** Les champs que les essais partagent. */
interface IFormState {
  name: string;
  age: string;
  etag: string | null;
}

/** Les régions citées par un geste : le contrôleur, puis le code client. */
function at(
  server: FirstControllerRegion[],
  client: FirstClientRegion[],
): FirstExcerpt[] {
  return [
    ...server.map((region): FirstExcerpt => ({ file: CONTROLLER, region })),
    ...client.map((region): FirstExcerpt => ({ file: CLIENT, region })),
  ];
}

/** Un `GET` du préfixe, préparé par le code client (`getRequest`). */
function get(label: string, path: string): IStepCall {
  return {
    label,
    verb: "GET",
    path: `${FIRST_PATH}${path}`,
    run: (live) => probeRequest(getRequest(path), live),
  };
}

/** Le corps que le geste « Recevoir » envoie avec l'âge en lettres. */
function wordAgeBody(form: IFormState): { name: string; age: string } {
  return { name: form.name, age: "vingt" };
}

/** Le corps qu'envoie le geste « Recevoir ». */
function echoBody(form: IFormState): { name: string; age: number } {
  return { name: form.name, age: Number(form.age) };
}

/** Les dix gestes ; les appels lisent les champs saisis. */
function buildSteps(form: IFormState): readonly [IFirstStep, ...IFirstStep[]] {
  return [
    {
      id: "hello",
      short: "Dire bonjour",
      gesture: "return { … }",
      title: "Retourner une valeur",
      text: "La règle d'or : l'action RETOURNE une valeur, le framework la rend. Un objet devient du JSON, sans `send()`. Le prénom vient de l'adresse (`{name}`), la langue de `?lang=`.",
      excerpts: at(["first-hello"], ["client-hello"]),
      expect: "200, JSON",
      fields: "name",
      calls: [
        {
          label: "En français",
          verb: "GET",
          path: helloPath(form.name, "fr"),
          run: () => probeRequest(helloRequest(form.name, "fr")),
        },
        {
          label: "In English",
          verb: "GET",
          path: helloPath(form.name, "en"),
          run: () => probeRequest(helloRequest(form.name, "en")),
        },
      ],
    },
    {
      id: "render",
      short: "HTML ou texte",
      gesture: "render()",
      title: "Rendre du HTML ou du texte",
      text: "Pour choisir soi-même le type, le statut ou les en-têtes : `render()`. `setContextHtml()` annonce du HTML ; un `Content-Type` en en-tête annonce autre chose.",
      excerpts: at(["first-render"], ["client-get"]),
      expect: "text/html, puis text/plain",
      calls: [get("La page HTML", "/page"), get("Le texte brut", "/text")],
    },
    {
      id: "echo",
      short: "Recevoir",
      gesture: "schema: { body }",
      title: "Recevoir des données, validées",
      text: "Le corps d'un `POST` est vérifié par un schéma AVANT l'action : elle ne reçoit que des données conformes, déjà typées. Un âge en lettres est refusé sans y entrer.",
      excerpts: at(["first-echo"], ["client-echo"]),
      expect: "200, puis 422",
      fields: "name-age",
      calls: [
        {
          label: "Envoyer",
          verb: "POST",
          path: `${FIRST_PATH}/echo`,
          run: () => probeRequest(echoRequest(echoBody(form))),
        },
        {
          label: "Envoyer l'âge en lettres",
          verb: "POST",
          path: `${FIRST_PATH}/echo`,
          run: () => probeRequest(echoRequest(wordAgeBody(form))),
        },
      ],
    },
    {
      id: "errors",
      short: "Erreurs",
      gesture: "throw new HttpError",
      title: "Statuts et erreurs",
      text: "Une erreur levée devient une réponse propre, avec son statut : `throw new HttpError(message, 404)`. En production, aucune pile de code ne part.",
      excerpts: at(["first-errors"], ["client-get"]),
      expect: "200, puis 404",
      calls: [get("Le livre 1", "/books/1"), get("Le livre 42", "/books/42")],
    },
    {
      id: "redirect",
      short: "Rediriger",
      gesture: "redirect()",
      title: "Rediriger, et le message flash",
      text: "`redirect(url)` renvoie ailleurs (302). Après un envoi, on redirige en 303 : recharger n'envoie pas deux fois. Le message flash vit en session et ne se lit qu'UNE fois : relisez la note.",
      excerpts: at(["first-redirect", "first-flash"], ["client-note"]),
      expect: "redirection suivie, flash lu une fois",
      calls: [
        get("Ancienne adresse", "/old-hello"),
        {
          label: "Envoyer une note",
          verb: "POST",
          path: `${FIRST_PATH}/note`,
          run: () => probeRequest(noteRequest()),
        },
        get("Relire la note", "/note"),
      ],
    },
    {
      id: "web",
      short: "Response Web",
      gesture: "Response.json()",
      title: "Renvoyer une Response Web",
      text: "L'objet `Response` de la Fetch API, celui que rend `fetch()` : l'action le renvoie tel quel, statut et en-têtes compris. Pratique pour relayer une API, ou une bibliothèque qui en produit une.",
      excerpts: at(["first-web-response"], ["client-get"]),
      expect: "200, en-tête x-demo",
      calls: [get("Appeler", "/web")],
    },
    {
      id: "stream",
      short: "Flux",
      gesture: "renderStream()",
      title: "Envoyer un flux",
      text: "`renderStream()` envoie chaque morceau dès qu'il est prêt. Regardez-les arriver un par un, avec leur instant d'arrivée.",
      excerpts: [
        ...at(["first-stream"], ["client-get"]),
        { file: PROBE, region: "probe-http" },
      ],
      expect: "6 morceaux, 400 ms d'écart",
      calls: [get("Lancer le compte à rebours", "/countdown")],
    },
    {
      id: "file",
      short: "Fichier",
      gesture: "streamFile()",
      title: "Servir un fichier, et le cache offert",
      text: "`streamFile()` lit le fichier du disque en flux — ici, ce contrôleur. Il pose seul un `etag` : redemandé avec, le fichier ne repart pas (304). `renderFileDownload()` le sert en pièce à enregistrer.",
      excerpts: at(["first-file"], ["client-file"]),
      expect: "200, puis 304",
      calls: [
        {
          label: "Lire le fichier",
          verb: "GET",
          path: `${FIRST_PATH}/source`,
          run: (live) => probeRequest(sourceRequest(null), live),
        },
        {
          label: "Redemander avec son etag",
          verb: "GET",
          path: `${FIRST_PATH}/source`,
          run: (live) => probeRequest(sourceRequest(form.etag), live),
          blocked: form.etag === null ? "lisez d'abord le fichier" : null,
        },
      ],
    },
    {
      id: "whoami",
      short: "Qui appelle ?",
      gesture: "this.user",
      title: "Qui appelle ?",
      text: "`this.user` : l'identité posée par le pare-feu, ou `null` pour un visiteur. Le serveur ne croit jamais un nom envoyé par le navigateur. Connectez-vous, puis rappelez.",
      excerpts: at(["first-whoami"], ["client-get"]),
      expect: "connected: false, ou votre identifiant",
      calls: [get("Qui suis-je ?", "/whoami")],
    },
    {
      id: "socket",
      short: "Deux transports",
      gesture: '"WEBSOCKET"',
      title: "Une action, deux transports",
      text: "L'action du geste 1 déclare aussi `WEBSOCKET` : la même méthode répond à une socket. La première trame est sa réponse, et chaque message envoyé la rappelle. Même code, même sécurité — seul `transport` change.",
      excerpts: at(["first-hello"], ["client-socket"]),
      expect: "transport: websocket",
      fields: "name",
      calls: [
        {
          label: "Par WebSocket",
          verb: "WS",
          path: helloPath(form.name, "fr"),
          run: () =>
            probeSocket(helloPath(form.name, "fr"), "encore", () =>
              openHello(form.name),
            ),
        },
        {
          label: "Par HTTP, pour comparer",
          verb: "GET",
          path: helloPath(form.name, "fr"),
          run: () => probeRequest(helloRequest(form.name, "fr")),
        },
      ],
    },
  ];
}

/**
 * Page d'apprentissage « Premiers pas » (`/demo/first-steps`) : la carte des
 * dix gestes, puis UN geste à l'écran (mise en page du kit,
 * `kit/StepsLesson.tsx`). Ici : les gestes, les champs qu'ils demandent,
 * et l'etag gardé pour le geste « Fichier ».
 *
 * Guide pour un agent : le contrôleur est `FirstStepsController.ts` ; le
 * code client qui prépare chaque appel est `firstClient.ts`, envoyé par la
 * sonde du kit (`kit/probe.ts`) ; l'échange dessiné vit dans
 * `FirstVisuals.tsx`.
 */
export function FirstStepsLesson({ about }: { about: IDemoAbout | null }) {
  const version = docsVersion(about);
  const [name, setName] = useState("Alice");
  const [age, setAge] = useState("30");
  // L'etag du dernier fichier lu : un 304 ne le renvoie pas, on le garde.
  const [etag, setEtag] = useState<string | null>(null);
  // Le dernier résultat de chaque geste : l'échange le dessine.
  const [last, setLast] = useState<Partial<Record<string, IProbeResult>>>({});
  const form = { name, age, etag };
  const steps = buildSteps(form);

  const fields = (step: IFirstStep): ReactNode => {
    const done = last[step.id];
    return (
      <>
        {inputs(step)}
        {step.id === "echo" && (
          <EchoCheck
            bodies={[
              ["Envoyer", echoBody(form)],
              ["Envoyer l'âge en lettres", wordAgeBody(form)],
            ]}
          />
        )}
        {done !== undefined && <Exchange result={done} />}
      </>
    );
  };
  const inputs = (step: IFirstStep): ReactNode =>
    step.fields === undefined ? null : (
      <div className="steps-fields">
        <label>
          {step.fields === "name-age" ? "Nom" : "Prénom"}
          <input
            value={name}
            maxLength={40}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        {step.fields === "name-age" && (
          <label>
            Âge
            <input
              value={age}
              inputMode="numeric"
              onChange={(event) => setAge(event.target.value)}
            />
          </label>
        )}
      </div>
    );
  const extra = (step: IFirstStep): ReactNode => {
    if (step.id === "file") {
      return (
        <a className="call" href={`${FIRST_PATH}/source?download=1`} download>
          <span className="call-verb verb-get">GET</span>
          <span className="call-text">
            <span className="call-label">Télécharger</span>
            <code className="call-path">/source?download=1</code>
          </span>
        </a>
      );
    }
    if (step.id === "whoami" && about !== null && about.loginPath !== null) {
      return (
        <a
          className="steps-link"
          href={loginPagePath(`/demo/first-steps#${step.id}`, about.loginPath)}
        >
          Se connecter, puis rappeler
        </a>
      );
    }
    return null;
  };

  return (
    <main className="lesson steps-page">
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <a href="/demo">Démo</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Premiers pas</span>
      </nav>

      <header className="steps-head">
        <span className={`lvl ${LEVELS.beginner.className}`}>
          {LEVELS.beginner.label}
        </span>
        <h1>Premiers pas — un contrôleur, dix gestes</h1>
        <p>
          Un <strong>contrôleur</strong> reçoit une requête et rend une réponse.
          Choisissez un geste : vous voyez son code, vous l'appelez pour de
          vrai, et le serveur répond.
        </p>
      </header>

      <StepsLesson
        steps={steps}
        label="Les dix gestes"
        prefix={FIRST_PATH}
        fields={fields}
        extra={extra}
        onResult={(result, step) => {
          const found = result.headers.find(([header]) => header === "etag");
          if (found !== undefined) setEtag(found[1]);
          setLast((done) => ({ ...done, [step]: result }));
        }}
      />

      <details className="steps-more">
        <summary>Le contrôleur entier, et la page, couche par couche</summary>
        <LessonCode
          lesson={FIRST_LESSON}
          doc={{
            href: docUrl(version, "modules/framework/controller"),
            label: "Le contrôleur — la doc complète",
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
              <strong>
                <code>return null</code> laisse la requête pendue.
              </strong>{" "}
              Le framework comprend « je répondrai moi-même » et attend. Rendez
              une valeur, ou un statut sans corps (204).
            </li>
            <li>
              <strong>Le contrôleur est partagé.</strong> Une seule instance
              sert toutes les requêtes : rien ne se garde sur <code>this</code>,
              sous peine de mêler deux visiteurs.
            </li>
            <li>
              <strong>Un 301 ne s'oublie pas.</strong> Le navigateur le garde
              presque pour toujours : <code>redirect()</code> fait un 302 par
              défaut.
            </li>
            <li>
              <strong>Un flash sans session ne fait rien.</strong> Sans{" "}
              <code>@UseSession()</code> sur la route, le message n'est pas
              gardé, et rien ne le signale.
            </li>
            <li>
              <strong>Une Response renvoyée par une socket ne part pas.</strong>{" "}
              Une trame n'a ni statut ni en-têtes : par WebSocket, rendez un
              objet.
            </li>
          </ul>
        </div>
        <aside className="further" aria-label="Pour aller plus loin">
          <h2 className="lesson-step">Pour aller plus loin</h2>
          <a href={docUrl(version, "modules/framework/controller")}>
            Le contrôleur — @nodefony/framework
          </a>
          <a href="/demo/chat">Le chat : un contrôleur temps réel</a>
          <span>
            Générer un contrôleur : <code>npx nodefony create controller</code>
          </span>
        </aside>
      </section>
    </main>
  );
}

/**
 * Ce que la page sait AVANT d'envoyer : le même schéma que le serveur
 * (`checkEcho`, code client), appliqué à chacun des deux corps du geste.
 *
 * @param bodies - le libellé de chaque bouton, et le corps qu'il envoie
 */
function EchoCheck({
  bodies,
}: {
  bodies: readonly (readonly [string, unknown])[];
}) {
  return (
    <div className="echo-check">
      <p>
        La page vérifie AVANT d'envoyer, avec le schéma partagé{" "}
        <code>EchoBody</code> :
      </p>
      <ul>
        {bodies.map(([label, body]) => {
          const issues = checkEcho(body);
          return (
            <li
              key={label}
              className={issues.length === 0 ? "is-ok" : "is-bad"}
            >
              <strong>{label}</strong> :{" "}
              {issues.length === 0
                ? "conforme — le serveur l'acceptera."
                : `refusé (${issues.join(", ")}) — le serveur refusera aussi.`}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
