import { loginPagePath } from "nodefony/client";
import { docsVersion, docUrl, type IDemoAbout } from "../about";
import { Inline, LEVELS } from "../Catalogue";
import { LessonCode } from "../lesson/LessonCode";
import { decodeClaims } from "./partnerApi";
import { PARTNER_LESSON } from "./partnerTabs";
import {
  usePartnerLab,
  type IPartnerLab,
  type ITrialResult,
  type PartnerTrial,
} from "./usePartnerLab";

/** Un essai de la page : ce qu'il fait, et ce qu'on doit observer. */
interface ITrialSpec {
  id: PartnerTrial;
  title: string;
  text: string;
  expect: string;
  action: string;
  needsToken: boolean;
}

const TRIALS: readonly ITrialSpec[] = [
  {
    id: "no-token",
    title: "Appeler sans jeton",
    text: "Votre navigateur envoie son cookie de session, connecté ou non. La zone `demo-partner` ne lit pas les cookies : elle ne connaît que les jetons.",
    expect: "401",
    action: "Appeler sans jeton",
    needsToken: false,
  },
  {
    id: "obtain",
    title: "Obtenir un jeton",
    text: "Le guichet `POST /demo/api/token` signe un jeton à votre nom, valable cinq minutes, pour cette seule API. Il exige une session.",
    expect: "200 si connecté, 403 sinon",
    action: "Obtenir un jeton",
    needsToken: false,
  },
  {
    id: "with-token",
    title: "Appeler avec le jeton",
    text: "Le même appel, avec `Authorization: Bearer …`. Le firewall vérifie la signature, l'expiration et l'audience, puis l'action répond.",
    expect: "200",
    action: "Appeler avec le jeton",
    needsToken: true,
  },
  {
    id: "tampered",
    title: "Appeler avec un jeton altéré",
    text: "Un seul caractère de la signature change : le jeton ne prouve plus rien. Le firewall le refuse avant le contrôleur.",
    expect: "401",
    action: "Appeler avec un jeton altéré",
    needsToken: true,
  },
];

/**
 * Page d'apprentissage « API entre programmes » (`/demo/partner`) — le
 * gabarit commun : (1) ce qu'on construit, (2) la démo qui tourne, (3) le
 * code qui la fait, (4) les pièges et la suite.
 *
 * Guide pour un agent : les appels vivent dans `usePartnerLab.ts`, le contrat
 * du guichet dans `partnerApi.ts` (partagé avec `PartnerTokenController`),
 * la zone dans `nodefony/config/security.ts`.
 */
export function PartnerLesson({ about }: { about: IDemoAbout | null }) {
  const lab = usePartnerLab();
  const version = docsVersion(about);
  return (
    <main className="lesson">
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <a href="/demo">Démo</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">API entre programmes</span>
      </nav>

      <section className="lesson-intro" aria-labelledby="lesson-title">
        <p className="lesson-meta">
          <span className={`lvl ${LEVELS.advanced.className}`}>
            {LEVELS.advanced.label}
          </span>
          <span className="lesson-step">
            1 · Ce qu'on construit, et pourquoi
          </span>
        </p>
        <h1 id="lesson-title">
          API entre programmes — un jeton, jamais un cookie
        </h1>
        <p>
          Un service partenaire, un script ou un agent n'a pas de navigateur :
          il se présente avec un <strong>jeton d'accès</strong>. Ici, une zone
          du firewall protège <code>/demo/api/partner</code> : elle vérifie le
          jeton AVANT le contrôleur, qui ne contient plus que le métier. Le
          jeton peut venir de cette application ou d'un serveur d'identité
          (Keycloak) — l'API ne change pas.
        </p>
      </section>

      <section className="lesson-demo" aria-labelledby="lesson-demo-title">
        <h2 id="lesson-demo-title" className="lesson-step">
          2 · La démo qui tourne
        </h2>
        <PartnerLab lab={lab} loginPath={about?.loginPath ?? null} />
      </section>

      <LessonCode
        lesson={PARTNER_LESSON}
        doc={{
          href: docUrl(version, "modules/security/obtenir-un-jeton"),
          label: "Obtenir un jeton — la doc complète",
        }}
      />

      <section className="lesson-traps" aria-labelledby="lesson-traps-title">
        <div>
          <h2 id="lesson-traps-title" className="lesson-step">
            4 · Les pièges
          </h2>
          <ul>
            <li>
              <strong>Un jeton pour une autre API ouvre celle-ci.</strong> Sans
              audience, un jeton volé ailleurs vaut ici : la zone exige la
              sienne (<code>resource</code>), et le guichet n'émet que pour
              elle.
            </li>
            <li>
              <strong>Un jeton longue durée est un mot de passe.</strong> Cinq
              minutes suffisent à un appel ; un programme qui dure se redemande
              un jeton, il n'en garde pas un d'un an.
            </li>
            <li>
              <strong>Une zone sans état ne crée pas de session.</strong>{" "}
              <code>stateless</code> : chaque appel prouve qui il est. Sans lui,
              chaque appel de programme laisserait une session en mémoire.
            </li>
            <li>
              <strong>Décoder n'est pas vérifier.</strong> La page affiche ce
              que porte le jeton ; seule la signature, vérifiée par le serveur,
              dit qu'il est vrai.
            </li>
          </ul>
        </div>
        <aside className="further" aria-label="Pour aller plus loin">
          <h2 className="lesson-step">Pour aller plus loin</h2>
          <a href={docUrl(version, "modules/security/obtenir-un-jeton")}>
            Obtenir un jeton — @nodefony/security
          </a>
          <a href={docUrl(version, "modules/security/keycloak")}>
            Keycloak, émetteur externe
          </a>
          <span>
            Depuis un terminal : <code>npx nodefony demo:partner:call</code>
          </span>
          <span>
            Avec Keycloak :{" "}
            <code>npx nodefony demo:partner:call --issuer keycloak</code>
          </span>
        </aside>
      </section>
    </main>
  );
}

/** Les quatre essais, dans l'ordre, chacun avec sa réponse réelle. */
function PartnerLab({
  lab,
  loginPath,
}: {
  lab: IPartnerLab;
  loginPath: string | null;
}) {
  const claims =
    lab.token === null ? null : decodeClaims(lab.token.accessToken);
  const refusal = lab.results.obtain?.status;
  const refused = refusal === 401 || refusal === 403;
  return (
    <ol className="trials">
      {TRIALS.map((trial, index) => {
        const result = lab.results[trial.id];
        const blocked = trial.needsToken && lab.token === null;
        return (
          <li key={trial.id} className="trial">
            <div className="trial-head">
              <span className="trial-num" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{trial.title}</h3>
              <span className="trial-expect">Attendu : {trial.expect}</span>
            </div>
            <p>
              <Inline text={trial.text} />
            </p>
            <div className="trial-actions">
              <button
                type="button"
                className="btn primary"
                disabled={blocked || lab.busy !== null}
                aria-busy={lab.busy === trial.id}
                onClick={() => lab.run(trial.id)}
              >
                {trial.action}
              </button>
              {blocked && (
                <span className="trial-hint">
                  Obtenez d'abord un jeton (essai 2).
                </span>
              )}
              {trial.id === "obtain" && refused && loginPath !== null && (
                <a
                  className="btn"
                  href={loginPagePath("/demo/partner", loginPath)}
                >
                  Se connecter pour obtenir un jeton
                </a>
              )}
            </div>
            <div aria-live="polite">
              {result !== undefined && <TrialResult result={result} />}
              {trial.id === "obtain" && claims !== null && (
                <Claims claims={claims} />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** La requête telle que partie, et la réponse telle que reçue. */
function TrialResult({ result }: { result: ITrialResult }) {
  const tone =
    result.status === null ? "ko" : result.status < 400 ? "ok" : "ko";
  return (
    <div className="trial-result">
      <p className="trial-line">
        <span className={`status ${tone}`}>
          {result.status ?? "échec réseau"}
        </span>
        <code>{result.request}</code>
      </p>
      <dl className="trial-headers">
        <dt>Authorization</dt>
        <dd>
          <code>{result.authorization ?? "(aucun)"}</code>
        </dd>
        {result.challenge !== null && (
          <>
            <dt>WWW-Authenticate</dt>
            <dd>
              <code>{result.challenge}</code>
            </dd>
          </>
        )}
      </dl>
      <pre>
        <code>{result.body === "" ? "(corps vide)" : result.body}</code>
      </pre>
    </div>
  );
}

/** Revendications à afficher en date : instants en secondes (RFC 7519 §2). */
const TIME_CLAIMS = new Set(["exp", "iat", "nbf", "auth_time"]);

const CLAIM_TIME = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** Ce que porte le jeton — décodé pour l'affichage, PAS vérifié. */
function Claims({ claims }: { claims: Record<string, unknown> }) {
  return (
    <div className="claims">
      <p>
        Ce que porte le jeton (décodé, <strong>non vérifié</strong> : seul le
        serveur vérifie la signature) :
      </p>
      <dl>
        {Object.entries(claims).map(([name, value]) => (
          <div key={name}>
            <dt>
              <code>{name}</code>
            </dt>
            <dd>
              {TIME_CLAIMS.has(name) && typeof value === "number"
                ? CLAIM_TIME.format(value * 1000)
                : typeof value === "string"
                  ? value
                  : JSON.stringify(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
