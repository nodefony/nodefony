/**
 * Firewall applicatif, jetons, audit — la configuration de la sécurité.
 *
 * Fragment du manifeste : `nodefony.config.ts` l'importe et passe le résultat à
 * `use("@nodefony/security", …)`. Rien ne charge ce dossier tout seul — c'est
 * l'import du manifeste qui monte ce fichier, et lui seul.
 *
 * 🔴 `satisfies` n'est PAS décoratif. Écrit dans le manifeste, ce littéral était
 * vérifié au point d'appel : une clé inconnue y était refusée. Rendu par une
 * fonction, il ne l'est plus — la clé compile, puis Zod la retire EN SILENCE au
 * boot, et le module démarre sur son défaut. `satisfies` rétablit ce contrôle,
 * et `npx nodefony doctor` refuse un fragment qui s'en passe.
 *
 * C'est ici que se pose la configuration d'un module quand elle porte plus
 * qu'un réglage. Un module de plus à configurer = un fichier de plus ici ; le
 * manifeste, lui, reste l'INDEX : quels modules, dans quel ordre.
 *
 * @module
 */
import type { ConfigContext } from "nodefony";
import type { ISecurityConfigInput } from "@nodefony/security";
import type { env } from "../../env";

/** La configuration de `@nodefony/security` pour cette application. */
export const securityConfig = (ctx: ConfigContext<typeof env>) =>
  ({
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
  }) satisfies ISecurityConfigInput;
