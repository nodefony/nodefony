import { defineConfig, use } from "nodefony";
import type { env } from "./env";

/**
 * Configuration de l'application — UN fichier, seulement les ÉCARTS aux
 * défauts du framework (deep-merge au boot). Le par-environnement passe par
 * `ctx` (isProd/isDev/env typé), jamais par un fichier parallèle.
 *
 * Voir la config RÉSOLUE, valeur ET provenance : `npx nodefony inspect config`,
 * ou la console Studio. Guide complet : `docs/guides/configuration.md`.
 */
export default defineConfig<typeof env>((ctx) => ({
  /**
   * Interface d'écoute. En container, écouter TOUTES les interfaces : le port
   * mapping Docker/k8s n'atteint jamais un bind sur 127.0.0.1.
   */
  domain: ctx.isProd ? "0.0.0.0" : "127.0.0.1",

  /**
   * Écoute HTTP et HTTPS. Rien ici ⇒ défauts du framework (5151, et 5152 en
   * HTTP/2) ; un port est une propriété du DÉPLOIEMENT et se déclare par
   * l'environnement — cf `.env`.
   *
   * HTTPS est actif même en dev parce que les API navigateur modernes exigent
   * un contexte sécurisé (WebRTC/getUserMedia, presse-papiers, service workers,
   * notifications). Le certificat de développement est généré au premier boot —
   * via **mkcert** s'il est installé (autorité locale de confiance, zéro
   * avertissement navigateur), sinon auto-signé.
   *
   * - Ne garder qu'un port, en clair (TLS terminé à l'ingress) : `https: false`.
   * - Inspecter ou regénérer le certificat : `npx nodefony http:certificates`.
   */
  servers: {
    ...((ctx.env.NF_PORT ?? ctx.env.PORT)
      ? { http: { port: ctx.env.NF_PORT ?? ctx.env.PORT } }
      : {}),
    ...(ctx.env.NF_PORT_HTTPS
      ? { https: { port: ctx.env.NF_PORT_HTTPS } }
      : {}),
  },

  log: {
    debug: ctx.isProd ? [] : "*",
    /** stdout = contrat cloud-native (collecteur de logs de l'orchestrateur). */
    driver: ctx.env.NF_LOG_DRIVER,
  },

  /**
   * Manifeste ORDONNÉ des modules — l'ordre du tableau = l'ordre de chargement.
   * La `policy` d'une entrée FILTRE, elle ne réordonne jamais :
   *
   * - `"mandatory"` → socle de l'app : toujours chargé, non filtrable
   *   (déclare l'intention « sans lui, cette app n'a pas de sens ») ;
   * - `"optional"` → défaut : chargé, sauf si sa GARDE `when` dit non ;
   * - `"dev"` → chargé UNIQUEMENT hors production : outillage, démo, consoles
   *   (0 coût prod — un module non listé n'est même pas importé).
   *
   * La garde `when` rend un booléen : `false` ⇒ le module n'est pas chargé du
   * tout. Elle reçoit la config résolue — `when: (config) => …` — mais peut
   * l'ignorer et fermer sur `ctx`, ce que fait redis plus bas
   * (`when: () => !!ctx.infra.cache`) : la question qu'il pose porte sur
   * l'ENVIRONNEMENT (une URL Redis est-elle déclarée ?), pas sur sa propre
   * configuration. Décider d'après `config` sert quand la réponse dépend d'une
   * clé du module lui-même.
   */
  modules: [
    /**
     * ORM Drizzle (SQL). Sans `NF_DATABASE_URL` : sqlite LOCAL, et l'app
     * persiste out-of-the-box (users, sessions, jetons). Déclare
     * `NF_DATABASE_URL` (postgres://…) pour pointer une vraie base.
     */
    "@nodefony/drizzle",

    /** Socle serveur : HTTP/WS natifs + probes /livez /readyz. */
    use("@nodefony/http", {}),

    /** Router + controllers + décorateurs (`@controller`, `@route`). */
    "@nodefony/framework",

    /**
     * Socket Nodefony (canaux duplex multiplexés). Backplane `cluster` = IPC
     * intra-pod, 0 dépendance externe ; `redis` = opt-in cross-pod.
     */
    use("@nodefony/realtime", { backplane: { driver: "cluster" } }),

    /**
     * Firewall applicatif + audit — chaque requête passe le pipeline sécurité.
     * Les zones sont validées Zod au boot (config invalide = fail-closed).
     */
    use("@nodefony/security", {
      /**
       * Jetons signés par CETTE application — le décor de DÉVELOPPEMENT.
       *
       * 🔴 Deux réglages sans lesquels `nodefony security:token` produit un
       * jeton inutilisable, chacun pour une raison différente :
       *
       * - **`audiences`** est une liste BLANCHE de ressources qu'un client peut
       *   NOMMER (`resource`, RFC 8707). L'URI de la porte MCP doit y figurer,
       *   sinon l'émetteur REFUSE de l'inscrire (`invalid_target`) — et l'on se
       *   retrouve avec une porte que rien ne sait ouvrir. Les deux adresses
       *   sont là parce que la porte répond en clair ET en TLS : un jeton
       *   demandé pour l'une était refusé sur l'autre, la liaison d'audience
       *   faisant, à juste titre, son travail. Ces valeurs s'ÉCRIVENT, jamais
       *   ne se dérivent du `Host` — un en-tête forgé obtiendrait sinon un
       *   jeton d'audience arbitraire. En production : l'URL publique en https.
       *
       * - **`keystore.dir`** rend la clé de signature PERSISTANTE. Sans lui,
       *   chaque process génère la sienne au démarrage : un jeton émis par la
       *   CLI porte un `kid` que le serveur en marche ne connaît pas, et il est
       *   refusé en « autorisation requise » — sans que rien ne dise pourquoi.
       *   En production, la clé vient de l'environnement (`keySetJson`), le
       *   système de fichiers d'un pod étant éphémère.
       */
      jwt: {
        issuer: ctx.isProd
          ? undefined
          : `https://localhost:${ctx.env.NF_PORT_HTTPS ?? 5152}`,
        audiences: ctx.isProd
          ? []
          : [
              `https://localhost:${ctx.env.NF_PORT_HTTPS ?? 5152}`,
              `http://localhost:${ctx.env.NF_PORT ?? 5151}/nodefony/mcp`,
              `https://localhost:${ctx.env.NF_PORT_HTTPS ?? 5152}/nodefony/mcp`,
            ],
        keystore: ctx.isProd ? {} : { dir: "var/keys" },
      },
      /**
       * Zones firewall de TES routes. `main` essaie `session` (cookie BFF →
       * `context.user` rempli) puis `anonymous` : rien n'est bloqué tel quel.
       * Hors zone, l'identité n'est JAMAIS résolue.
       *
       * - EXIGER le login sur `/api` : retire `"anonymous"` de `main`.
       * - Protéger plus large : élargis le pattern (ex. `"^/(api|compte)"`).
       *
       * Le firewall trie par longueur de pattern : `/api/secure/*` tombe donc
       * dans `secure`, sans `anonymous` → 401 avant ton controller. Essaie
       * `GET /api/secure/hello`.
       *
       * `main` et `secure` sont STATEFUL : l'identité tient dans une session
       * serveur, portée par un cookie opaque et révocable — le bon modèle pour
       * un NAVIGATEUR. `machine`, plus bas, montre l'autre cas : un appelant
       * qui ne stocke pas de cookie ne doit RIEN recevoir qu'il faille stocker.
       *
       * ⚠️ `stateless: false` (le défaut) sur une zone de service NE FAIT PAS
       * ÉCHOUER l'essai — et c'est le piège. Depuis un navigateur, ou avec un
       * `curl -c`, le cookie posé est renvoyé aux appels suivants et tout
       * marche ; le vrai client, lui, ne stocke rien. Ce qu'il en coûte n'est
       * pas un refus mais un REGISTRE : chaque appel porteur d'un cookie
       * inconnu fait reprendre, puis réécrire une session serveur — et
       * renvoyer un `Set-Cookie` — pour un appelant qui ne la relira jamais.
       *
       * `stateless: true` ferme cela : la zone n'ouvre ni ne reprend de
       * session, le cookie entrant est ignoré, et l'identité tient tout
       * entière dans la preuve portée par la requête. Corollaire, appliqué au
       * DÉMARRAGE : lister `"session"` dans une zone stateless est une
       * contradiction, et l'application REFUSE de démarrer en nommant la zone.
       * Une zone sert un navigateur (session) ou un porteur de preuve (clé,
       * jeton) — jamais les deux sous le même drapeau.
       */
      /**
       * ⚠️ Un `pattern` couvre un PRÉFIXE, pas les routes qu'on a en tête —
       * et c'est TOUT l'intérêt : les routes ajoutées demain sous ce préfixe
       * naissent protégées, sans que personne ait à y penser.
       *
       * D'où le piège, mesuré : pour fermer `/api/account/profile` et
       * `/api/account/invoices`, on écrit
       * `pattern: "^/api/account/(profile|invoices)"`. Les deux routes
       * refusent bien l'anonyme, l'essai est vert, la revue passe — et la
       * TROISIÈME route du compte, ajoutée un mois plus tard, est PUBLIQUE.
       * Rien ne le signale : la zone existe, elle a l'air de couvrir l'espace.
       * Le bon pattern est `"^/api/account"`.
       *
       * La zone retenue est celle dont le pattern est le plus LONG parmi
       * celles qui correspondent (`firewall.ts:245`) — pas la première
       * déclarée. C'est ainsi que `^/api/secure` l'emporte sur `^/api`
       * ci-dessous. Un pattern énuméré gagne donc lui aussi sur ses propres
       * routes, ce qui rend l'erreur silencieuse : ce qu'on teste marche.
       */
      areas: {
        main: {
          pattern: "^/api",
          authenticators: ["session", "anonymous"],
        },
        // AJOUTER une route ici ne demande RIEN de plus : le préfixe est déjà
        // couvert, la zone authentifie, et `context.user` est garanti dans le
        // controller. Une route neuve sous `/api/secure` naît protégée.
        //
        // ⚠️ Un appelant qui reçoit 401 sur une route de cette zone ne dit PAS
        // que la zone est mal réglée : il dit qu'il ne s'authentifie pas. Les
        // deux réflexes qui suivent affaiblissent l'application ENTIÈRE pour un
        // seul appelant, et rien ne le signalera :
        //   · ajouter `"anonymous"` ici — toutes les routes de la zone
        //     deviennent publiques, pas seulement la nouvelle ;
        //   · poser `@BypassFirewall`/`@Anonymous` sur l'action — même effet,
        //     en plus discret, puisque la zone a toujours l'air fermée.
        // Fais plutôt s'authentifier l'appelant (session pour un navigateur,
        // zone `machine` ci-dessous pour un service), ou donne-lui sa propre
        // zone. Restreindre DAVANTAGE reste possible sans rien ouvrir :
        // `@IsGranted(["ROLE_ADMIN"])` sur l'action.
        secure: {
          pattern: "^/api/secure",
          authenticators: ["session"],
        },
        // Appelant qui n'est PAS un navigateur — service partenaire, script,
        // agent. Zone ACTIVE, et non un exemple en commentaire : c'est le code
        // qu'on a sous les yeux qu'on recopie, jamais celui qu'on lit à côté.
        // Rien ne tombe ici tant qu'aucune route ne commence par `/api/machine`.
        machine: {
          pattern: "^/api/machine",
          authenticators: ["apikey"], // PAS "session" — ce client n'a pas de cookie
          stateless: true, // false ⇒ l'app ouvre une session qu'il ne renverra jamais
        },
      },

      /**
       * Clés de chiffrement au repos — les VALEURS vivent dans `.env.local`
       * (gitignoré), générées à la création de l'app. Rotation ou rattrapage :
       * `npx nodefony security:secrets --write`.
       */
      totp: { encryptionKey: ctx.env.NF_TOTP_KEY },
      webhooks: { encryptionKey: ctx.env.NF_WEBHOOK_KEY },
      csrf: { secret: ctx.env.NF_CSRF_SECRET },

      /**
       * Hiérarchie de rôles — un rôle COUVRE ceux qu'il liste, transitivement.
       * `ROLE_NODEFONY_*` = plateforme (console Studio) ; `ROLE_*` = applicatif.
       * Le compte admin semé par `nodefony/security/provisionUsers.ts` les porte.
       */
      roleHierarchy: {
        ROLE_NODEFONY_ADMIN: ["ROLE_ADMIN", "ROLE_SUPERVISOR", "ROLE_DEV"],
        ROLE_ADMIN: ["ROLE_USER"],
      },
    }),

    /**
     * Builder Vite + statics : sert le frontend de l'app (HMR en dev).
     *
     * L'origine que le NAVIGATEUR utilise pour les assets se dérive du `Host`
     * de la requête : rien à configurer pour développer depuis une autre
     * machine, un conteneur ou un tunnel — chacun reçoit l'origine par
     * laquelle il est arrivé. Codespaces/Gitpod : détection automatique.
     *
     * `publicOrigin: "https://mon-proxy.example.com:{port}"` force une origine
     * unique quand un frontal la réécrit ; `{port}` suit le port réel de Vite.
     * Un réglage explicite gagne toujours sur la dérivation.
     */
    use("@nodefony/frontend", {
      publicOrigin: "",
    }),

    /**
     * Console d'administration → `/nodefony` : modules chargés, routes, config
     * résolue, sessions, logs.
     *
     * `policy: "dev"` parce que c'est une surface d'ADMIN : absente de la
     * production. Pour l'y garder — choix ASSUMÉ — protège `/nodefony` par une
     * zone firewall, PUIS passe la policy à `"mandatory"`.
     *
     * `ui: "static"` sert les assets pré-buildés du paquet npm (rien à
     * recompiler). `"auto"`/`"vite"` feraient passer l'UI Studio par TON serveur
     * Vite — pour développer Studio lui-même — et exigeraient ses plugins dans
     * TES devDependencies (une app Vue/Angular n'a pas `@vitejs/plugin-react`).
     */
    use("@nodefony/studio", { ui: "static" }, { policy: "dev" }),

    /**
     * Accès Redis générique — chargé par la DÉCLARATION de l'infra cache :
     * `NF_REDIS_URL` présente ⇔ module chargé (un seul signal, pas de magie
     * localhost). Consommateurs : backplane realtime `redis`, sessions,
     * idempotence.
     */
    use("@nodefony/redis", undefined, {
      when: () => !!ctx.infra.cache,
    }),

    /**
     * Outillage de DÉVELOPPEMENT — la porte HTTP de la carte de visite de cette
     * application (`/nodefony/devkit`). La même carte au terminal ne dépend PAS
     * de ce module : `npx nodefony card` est servie par le cœur et répond même
     * ici retiré, application non construite ou environnement non posé.
     *
     * `policy: "dev"` : ce qu'il expose (modules chargés, chemins de
     * documentation, commandes à lancer) aide pendant le développement et n'est,
     * en production, qu'une divulgation de ton architecture. Un module non chargé
     * n'est même pas importé — le coût en production est nul, pas « faible ».
     *
     * Il est en `devDependencies` : `npm ci --omit=dev` ne l'installe pas.
     */
    use(
      "@nodefony/devkit",
      {
        mcp: {
          authorization: {
            /**
             * 🔴 L'audience attendue des jetons de la porte MCP — elle
             * s'ÉCRIT, jamais ne se dérive du `Host` : un en-tête forgé
             * obtiendrait sinon un jeton d'audience arbitraire ET passerait la
             * vérification, ce qui viderait la liaison d'audience (RFC 8707) de
             * son unique raison d'être.
             *
             * Sans cette ligne, l'émetteur de cette application REFUSE de
             * signer un jeton pour sa propre porte (`invalid_target`) — et
             * `npx nodefony ai:mcp --auth` livre alors une porte que rien ne
             * peut franchir.
             *
             * Ce sont les adresses de DÉVELOPPEMENT (la porte répond en clair
             * et en TLS). En production, mets ici l'URL publique en https.
             *
             * ⚠️ Le PORT suit ta configuration (`NF_PORT`), il n'est pas figé :
             * une application lancée ailleurs verrait sinon son propre jeton
             * refusé — l'audience désignant une adresse où elle ne répond pas.
             * Lire une variable de configuration n'est PAS dériver du `Host` :
             * l'une t'appartient, l'autre vient du client.
             */
            resource: `http://localhost:${ctx.env.NF_PORT ?? 5151}/nodefony/mcp`,
            additionalResources: [
              `https://localhost:${ctx.env.NF_PORT_HTTPS ?? 5152}/nodefony/mcp`,
            ],
          },
        },
      },
      { policy: "dev" },
    ),
  ],
}));
