import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { nodefonyBin, runningAppPort } from "nodefony/testing";
/**
 * Démarre l'application UNE fois pour toute la suite E2E, et l'arrête à la fin.
 *
 * Pourquoi ici et pas dans chaque fichier de test : chaque entité générée apporte
 * son propre fichier `*.e2e.test.ts`, et un `beforeAll` par fichier signifierait
 * un démarrage complet par fichier — la suite se paierait en minutes, et deux
 * fichiers qui démarrent la même application se marcheraient dessus.
 *
 * La mécanique est 100 % native Nodefony :
 *   - `nodefony production --detach --wait` : lancement détaché, exit 0 seulement
 *     quand la readiness est sondée (ports ouverts) — aucun sleep arbitraire ;
 *   - `nodefony stop` : arrêt propre de tout runtime de l'application.
 *
 * Les tests ne reçoivent pas le port par ce fichier : ils le lisent eux-mêmes
 * avec `runningAppPort()`. Un port écrit en dur casse dès que l'application
 * déclare le sien (`NF_PORT`, `PORT` en PaaS) ou qu'un port occupé l'a fait
 * glisser — et un port de REPLI est pire encore, il fait interroger le premier
 * serveur venu sur la machine.
 */

/**
 * Le lanceur du framework — RÉSOLU par le framework lui-même.
 *
 * Aucun chemin n'est écrit ici, et c'est le point : `node_modules/.bin/nodefony`
 * n'existe pas sous Windows (npm y écrit un `.cmd`, que Node refuse d'exécuter
 * sans shell), et l'emplacement du paquet dépend du hoisting, des espaces de
 * travail, du gestionnaire utilisé. `nodefonyBin()` demande à Node de localiser
 * le paquet et lit son champ `bin` : une seule implémentation, dans le
 * framework, qui suit ses propres déménagements.
 *
 * Le résultat se donne à `node`, jamais au système : c'est un script.
 */
const bin = nodefonyBin();

/**
 * Base de données de la suite E2E — jetable, et surtout SÉPARÉE de celle du
 * développement.
 *
 * Une suite qui écrit dans la base de dev ne fait pas que la salir : elle y
 * sème un compte `admin` dont le mot de passe est celui, écrit en clair dans ce
 * fichier. Le seed étant idempotent, `admin` / `admin` — le couple annoncé par
 * le `.env` et le README — cesse alors de fonctionner pour toujours, sans le
 * moindre message. Symétriquement, un `admin` déjà semé en développement fait
 * échouer `adminLogin()`, et la suite accuse la route qu'elle mesure au
 * lieu de son décor. Un fichier à part supprime les deux pannes d'un coup, et
 * rend la suite reproductible.
 *
 * Surcharge : `NF_E2E_DATABASE_URL` — pour éprouver la suite sur un AUTRE
 * serveur que celui du développement (une instance PostgreSQL de recette, par
 * exemple).
 *
 * ⚠️ **Elle ne change pas le DIALECTE de vos entités.** Elles sont écrites pour
 * celui que vous avez choisi à la création de l'application, et l'ORM refuse de
 * démarrer sur un autre en nommant l'entité fautive. Viser un moteur différent
 * suppose de porter chaque entité (`createXTable("postgres")`) — un chantier,
 * pas une variable.
 */
export const E2E_BASE_URL =
  process.env.NF_E2E_DATABASE_URL ??
  `sqlite:${path.resolve("var/databases/e2e.db")}`;

/**
 * Mot de passe du compte d'administration, POUR LA SUITE DE TESTS UNIQUEMENT.
 *
 * La suite tourne en `production`, où aucun compte n'est semé sans mot de passe
 * explicite — c'est voulu : une application ne doit jamais naître en production
 * avec des identifiants connus. Les tests, eux, ont besoin d'une identité pour
 * éprouver les routes protégées (la suppression, notamment), d'où cette valeur
 * jetable, posée dans l'environnement du serveur de test et nulle part ailleurs.
 */
export const ADMIN_PASSWORD = "e2e-admin-jetable";

/**
 * Ouvre une session d'administration et rend l'en-tête `Cookie` à rejouer.
 *
 * C'est ainsi qu'un client réel s'authentifie auprès de l'application : un POST
 * sur la route de connexion du framework, puis le cookie de session sur chaque
 * requête suivante. Les tests d'une route protégée s'en servent ; les autres
 * l'ignorent.
 *
 * @returns L'en-tête `Cookie` complet, à passer tel quel à `fetch`.
 * @throws Si la connexion échoue — mieux vaut un test qui dit « je n'ai pas pu
 * m'authentifier » qu'un test qui conclut « accès refusé » sur un décor cassé.
 */
export async function adminLogin(): Promise<string> {
  const port = runningAppPort();
  const res = await fetch(
    `http://127.0.0.1:${port}/nodefony/security/api/auth/login`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: "admin",
        password: ADMIN_PASSWORD,
      }),
    },
  );
  if (res.status !== 200) {
    throw new Error(
      `connexion admin impossible (${res.status}) — le décor de test, pas la route mesurée`,
    );
  }
  const cookies = res.headers.getSetCookie?.() ?? [];
  return cookies.map((c) => c.split(";")[0]).join("; ");
}

export async function setup(): Promise<void> {
  // Repartir d'une base VIERGE : une suite dont le verdict dépend de ce qu'un
  // run précédent a laissé n'est pas reproductible.
  // Les compagnons `-wal` et `-shm` partent avec le fichier, sinon SQLite
  // ressuscite l'état d'avant.
  if (E2E_BASE_URL.startsWith("sqlite:")) {
    const file = E2E_BASE_URL.slice("sqlite:".length);
    for (const suffix of ["", "-wal", "-shm"]) {
      rmSync(`${file}${suffix}`, { force: true });
    }
  }

  // Le schéma AVANT le trafic — le patron de production, appliqué ici tel quel.
  //
  // En production le démarrage ne fabrique JAMAIS le schéma (mode `ddl: none`) :
  // c'est délibéré, parce que plusieurs exemplaires partent en même temps et
  // qu'aucun d'eux ne doit toucher aux tables. C'est un travail d'orchestrateur,
  // qui passe AVANT. Sans cette étape, la base qu'on vient d'effacer reste vide,
  // la mise en service est retenue (`/readyz` rend 503), et `--wait` attend une
  // disponibilité qui ne viendra jamais.
  execFileSync(process.execPath, [bin, "orm:migrate"], {
    stdio: "inherit",
    timeout: 120_000,
    env: {
      ...process.env,
      NODE_ENV: "production",
      NF_DATABASE_URL: E2E_BASE_URL,
    },
  });
  execFileSync(process.execPath, [bin, "production", "--detach", "--wait"], {
    stdio: "inherit",
    timeout: 120_000,
    env: {
      ...process.env,
      // La suite ne touche JAMAIS la base de développement — cf `E2E_BASE_URL`.
      NF_DATABASE_URL: E2E_BASE_URL,
      // Sans cette variable, la production ne sème AUCUN compte : les tests des
      // routes protégées n'auraient aucune identité à présenter, et échoueraient
      // en accusant la garde plutôt que le décor.
      NF_ADMIN_PASSWORD: ADMIN_PASSWORD,
    },
  });
}

export async function teardown(): Promise<void> {
  // Jamais de serveur laissé derrière : un runtime orphelin tient les ports et
  // fait échouer le run suivant sur une erreur qui ne parle pas de lui.
  execFileSync(process.execPath, [bin, "stop"], {
    stdio: "inherit",
    timeout: 30_000,
  });
}
