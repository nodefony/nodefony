import { useEffect, useMemo, useState } from "react";
import {
  NodefonyLogin,
  loginPagePath,
  type NodefonyLoginUser,
} from "nodefony/client";

/**
 * Le compte, dans une barre de navigation : « Se connecter » pour un
 * visiteur, l'identifiant et « Se déconnecter » une fois la session ouverte.
 *
 * Guide pour un agent : brique du KIT, posée dans la barre du haut de toutes
 * les démos (`App.tsx`). Aucun appel écrit à la main : `NodefonyLogin`
 * (`nodefony/client`) reprend la session (`me()`) et la ferme (`logout()`) ;
 * la page de connexion suit la config (`loginPath` de `/demo/api/about`,
 * `null` quand elle est désactivée) et ramène ici par `loginPagePath`. Après
 * la déconnexion, la page se recharge : les sockets ouvertes portaient
 * l'ancienne identité. Une session venue d'un fournisseur renvoie vers SA
 * déconnexion (`logoutUrl`), pour la fermer aussi.
 *
 * @param loginPath - chemin de la page de connexion, `null` si désactivée
 */
export function Account({ loginPath }: { loginPath: string | null }) {
  const login = useMemo(() => new NodefonyLogin(), []);
  // `undefined` tant que la session n'est pas lue : rien n'est affiché, pour
  // ne pas montrer « Se connecter » à quelqu'un qui l'est.
  const [user, setUser] = useState<NodefonyLoginUser | null | undefined>(
    undefined,
  );
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    let live = true;
    void login.me().then((found) => {
      if (live) setUser(found);
    });
    return () => {
      live = false;
    };
  }, [login]);

  if (user === undefined) return null;
  if (user === null)
    return loginPath === null ? null : (
      <a
        className="login"
        href={loginPagePath(window.location.pathname, loginPath)}
      >
        Se connecter
      </a>
    );
  return (
    <div className="account" role="group" aria-label="Compte">
      <span className="account-who">
        <span aria-hidden="true">👤</span> {user.identifier}
      </span>
      <button
        type="button"
        className="account-out"
        disabled={leaving}
        onClick={() => {
          setLeaving(true);
          void login.logout().then((url) => {
            if (url === null) window.location.reload();
            else window.location.assign(url);
          });
        }}
      >
        {leaving ? "Déconnexion…" : "Se déconnecter"}
      </button>
    </div>
  );
}
