import { defineEnv, envEnum, envNumber, envString } from "nodefony";

/**
 * Catalogue typé des variables d'environnement — SEUL lecteur de `process.env`.
 * Validé au boot (fail-fast), exposé au descripteur de config via `ctx.env`.
 *
 * 💾 PERSISTANCE (infra déclarée) : tu déclares une ou deux URLs, le framework
 * DÉRIVE les stores (users, sessions, jetons, idempotence…) — `store: "auto"`.
 */
export const env = defineEnv({
  /**
   * Port d'écoute HTTP. Absent = défaut du framework (5151). Le déclarer est le
   * cas du DÉPLOIEMENT : le port y est un contrat (service k8s, ingress, sonde).
   * En dev, ne rien mettre : si 5151 est déjà pris (une autre app Nodefony),
   * le framework prend le port libre suivant et l'ANNONCE (`portPolicy: "auto"`,
   * défaut hors production) — en production il échoue franchement (`strict`),
   * car un pod qui écoute ailleurs en silence est un pod injoignable.
   */
  NF_PORT: envNumber({
    optional: true,
    description: "Port d'écoute HTTP (défaut framework 5151).",
  }),

  /**
   * Alias PLATEFORME : Cloud Run, Heroku, Railway et Fly injectent `PORT` et
   * exigent que le process écoute dessus. On l'accepte tel quel — zéro glue de
   * déploiement. `NF_PORT` l'emporte si les deux sont présents.
   */
  PORT: envNumber({
    optional: true,
    description:
      "Alias plateforme du port HTTP (Cloud Run/Heroku) — NF_PORT gagne.",
  }),

  /**
   * Port d'écoute HTTPS/HTTP2 (défaut framework 5152). Pas d'alias plateforme :
   * en cloud, le TLS est terminé à l'ingress et le pod sert en clair.
   */
  NF_PORT_HTTPS: envNumber({
    optional: true,
    description: "Port d'écoute HTTPS/HTTP2 (défaut framework 5152).",
  }),

  NF_LOG_DRIVER: envEnum(["stdout", "file", "null"] as const, {
    default: "stdout",
  }),

  /**
   * Nombre de processus Node lancés par `nodefony production` / `cluster`.
   * Trois formes : `1` — le défaut, un process par pod, la mise à l'échelle
   * est le travail de l'orchestrateur ; `"auto"` — un worker par cœur ALLOUÉ
   * (quota cgroup du conteneur, jamais `os.cpus()`) ; ou un nombre explicite.
   * Trois voies, de la plus forte à la plus faible : `--workers <n|auto>` sur
   * la ligne de commande > cette variable > le fichier
   * `nodefony/config/cluster/cluster.config.ts` (non généré : sa valeur serait
   * le défaut — à créer si la topologie doit vivre en git, voir le README).
   * Lue par le maître AVANT le boot : déclarée ici pour le catalogue
   * (`npx nodefony env`), pas pour être lue par l'application. `npm run dev`
   * l'ignore — le développement est toujours mono-process.
   */
  NF_WORKERS: envString({
    optional: true,
    description:
      "Processus Node à lancer : 1 (défaut, un par pod) | auto (cœurs alloués, cgroup) | <n>.",
  }),

  /**
   * Infra `database` : URL unique, dialecte déduit du scheme
   * (`sqlite:./var/app.db` | `postgres://…` | `mysql://…` | `mongodb://…`).
   * ABSENTE = profil solo : sqlite local (l'app persiste quand même).
   * Alias plateforme accepté : `DATABASE_URL`. Secret → jamais loggée brute.
   */
  NF_DATABASE_URL: envString({
    optional: true,
    description:
      "Infra database : URL unique (sqlite:|postgres://|mysql://|mongodb://), dialecte déduit du scheme.",
  }),

  /**
   * Infra `cache` (éphémère partagé) : URL Redis. Sa présence CHARGE le module
   * `@nodefony/redis` et aiguille les briques éphémères (sessions, idempotence)
   * vers Redis. Alias plateforme accepté : `REDIS_URL`.
   */
  NF_REDIS_URL: envString({
    optional: true,
    description:
      "Infra cache : URL Redis (redis://…) — sa présence charge @nodefony/redis.",
  }),

  /**
   * 🔐 Clés de chiffrement au repos (module security) — les VALEURS vivent dans
   * `.env.local` (gitignoré), générées à la création de l'app. Rotation ou
   * rattrapage : `npx nodefony security:secrets --write`. En production :
   * Secret k8s / vault — jamais en git.
   *
   * Les deux PREMIÈRES sont `optional` À DESSEIN : absentes, la brique
   * concernée se désactive en fail-safe (2FA, webhooks) avec un log CRITIC —
   * une application qui n'en use pas doit pouvoir démarrer sans elles. Ne pas
   * leur ajouter `requiredIn` par symétrie : ce serait refuser de démarrer une
   * application qui ne s'en sert pas.
   */
  NF_TOTP_KEY: envString({
    optional: true,
    description:
      "Clé de chiffrement des secrets 2FA/TOTP au repos (32 octets base64).",
  }),
  NF_WEBHOOK_KEY: envString({
    optional: true,
    description:
      "Clé de chiffrement des secrets de signature webhook (32 octets base64).",
  }),
  /**
   * Celle-ci n'a PAS de repli acceptable. Absente, un secret est tiré au
   * démarrage : chaque exemplaire en tire un différent, et chaque redémarrage
   * en change — un pod refuse alors le jeton anti-CSRF qu'un autre vient
   * d'émettre, et l'utilisateur voit un formulaire rejeté au hasard, sans la
   * moindre erreur dans les journaux. `requiredIn` fait échouer le démarrage
   * là où ça compte, et `nodefony doctor --env production` le dit AVANT.
   */
  NF_CSRF_SECRET: envString({
    optional: true,
    requiredIn: ["production"],
    description:
      "Secret des jetons anti-CSRF (synchronizer) — partagé entre process en cluster.",
  }),

  /**
   * Mot de passe du compte admin seedé au premier boot (voir
   * `nodefony/security/users.ts`). DEV : défaut `nodefony-dev-42` (compte admin/nodefony-dev-42,
   * comme Grafana — pratique, LOCAL uniquement). PROD : OBLIGATOIRE — sans lui
   * le seed refuse (jamais de mot de passe par défaut en production).
   *
   * Pas de `requiredIn` : l'exigence ne vaut qu'au PREMIER démarrage. Une fois
   * le compte créé, la variable ne sert plus — la rendre requise ferait refuser
   * de démarrer un déploiement qui tourne depuis des mois.
   */
  NF_ADMIN_PASSWORD: envString({
    optional: true,
    description:
      "Mot de passe du compte admin seedé au 1er boot (obligatoire en production).",
  }),

  // L'origine publique du dev-server Vite n'est PAS une variable
  // d'environnement : elle se dérive du `Host` de chaque requête, si bien que
  // ton poste et un navigateur en conteneur chargent la même page en même
  // temps, sans rien à poser. Pour un besoin durable — tunnel, proxy frontal —
  // écris `publicOrigin` dans `nodefony.config.ts` : c'est un réglage, il gagne
  // sur la dérivation, et il ne s'oublie pas dans un shell.
});
