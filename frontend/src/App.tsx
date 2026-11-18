/**
 * Page d'accueil de nodefony — MINIMALE, et c'est voulu : c'est TA page.
 *
 * Elle dit quelle application répond, propose la connexion et nomme le
 * compte connecté. Rien de plus : ce qui part ici part en PRODUCTION, vers
 * n'importe qui — ni mot de passe, ni version, ni lien vers la console
 * d'administration.
 *
 * Pour VOIR ce que le framework sait faire (temps réel, flux, envoi de
 * fichiers, API entre programmes), installe la démo : elle se copie dans
 * l'application, se lit, se modifie et se supprime comme ton propre code.
 */
import { useEffect } from "react";
// La liaison React de la connexion : l'état de session en hook, la page de
// connexion servie par le framework (jamais un formulaire recopié ici).
import { useNodefonyLogin } from "nodefony/react";
import { loginPagePath } from "nodefony/client";
import { NODEFONY_LOGO } from "./brand";
import "./showcase.css";
import "./accent.css";

/** Accueil : le nom de l'application et l'état de la session. */
export function App() {
  const { state: login, flow } = useNodefonyLogin();
  // Reprend la session existante au montage (cookie de session, s'il y en a un).
  useEffect(() => {
    void flow.me();
  }, [flow]);
  const logout = async (): Promise<void> => {
    // Session venue d'un fournisseur : suivre son adresse ferme AUSSI la sienne.
    const providerLogout = await flow.logout();
    if (providerLogout !== null) window.location.assign(providerLogout);
  };
  return (
    <main className="nf-main">
      <img
        className="nf-fwlogo"
        src={NODEFONY_LOGO}
        alt=""
        width={48}
        height={48}
      />
      <h1>nodefony</h1>
      <div className="nf-card" role="status">
        {login.step === "authenticated" && login.user ? (
          <p>
            Connecté en tant que{" "}
            <span className="nf-session" data-open="">
              {login.user.identifier}
            </span>{" "}
            <button
              type="button"
              className="nf-action"
              onClick={() => void logout()}
            >
              Se déconnecter
            </button>
          </p>
        ) : (
          <a
            className="nf-action"
            href={loginPagePath(location.pathname + location.search)}
          >
            Se connecter
          </a>
        )}
      </div>
    </main>
  );
}
