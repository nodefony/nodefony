# AGENTS.md — nodefony

> **N'invente jamais du code Nodefony : génère-le, imite-le, vérifie-le.**
> Trois actes pour toute tâche : **LIRE** (ce fichier, puis la doc pointée) →
> **GÉNÉRER** (`npx nodefony create …` produit du vrai code, à imiter) →
> **VÉRIFIER** (`npm run verify` — UNE commande : types + lint + tests + câblage).
>
> **Le réflexe, avant d'écrire le MOINDRE fichier** : un générateur le
> produit-il ? Écrire à la main un CRUD, un controller, une entité ou un
> squelette de module, c'est le signal que tu as raté une commande de la
> table ci-dessous — arrête-toi et lance-la.
>
> **Tu RENDS une réponse ?** `return this.renderJson(obj)` pour du JSON ;
> `this.setContextHtml()` puis `return this.render(html)` pour une PAGE — le nonce
> CSP de la requête s'écrit **`this.context?.cspNonce`** (le `?.` n'est pas
> optionnel : `context` est `ContextType | undefined`, sans lui le code ne
> compile pas), à recopier dans tout `<script>` en ligne. Ne touche JAMAIS
> `this.response` à la main : poser `Content-Type` toi-même court-circuite la
> négociation, et un `this.response as any` est le signal que tu as raté la façade.
>
> **Tu LIS une liste ?** Elle se BORNE, toujours. Le service d'une entité hérite
> `findPage({ limit: 25 })` — il ne charge que `limit + 1` lignes et rend
> `{ items, hasNext }` ; sinon `find(criteria, { limit })`. Un `find` sans borne
> matérialise la table ENTIÈRE : indolore sur les quelques lignes du poste de
> développement, fatal sur les dizaines de milliers de la production. Il te faut
> une projection de colonnes, une CTE, une agrégation ? Descends au natif **avec
> son type** — `import type { DrizzleDb } from "@nodefony/drizzle"` puis
> `orm.getNativeConnection<DrizzleDb>()`. Sans le paramètre de type tu reçois
> `unknown`, et il ne te reste qu'un `as any` que le contrôle refuse.
>
> **Tu SERS un fichier ?** Trois façades, jamais `createReadStream` à la main :
> `this.renderMediaStream(f)` pour un média qu'on parcourt (`Range` → 206),
> `this.streamFile(f)` pour le fichier entier, `this.renderFileDownload(f)` pour
> forcer le téléchargement. Le faire soi-même rend une réponse que le client ne
> peut pas lire — le détail, plus bas, est MESURÉ.

## Générateurs — appelle-les, ne recompose jamais leur sortie de mémoire

| Besoin                                                                                                  | Commande                                                                                         |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Module applicatif (workspace npm)                                                                       | `npx nodefony create module <nom>`                                                               |
| Controller HTTP **et** WebSocket (même classe)                                                          | `npx nodefony create controller <nom> --kind hello\|rest\|realtime\|duplex\|example`             |
| Controller **réservé à une habilitation** — garde de classe + rôle déclaré dans la hiérarchie           | `npx nodefony create controller <nom> --role ROLE_X`                                             |
| Ressource REST **complète** — entité + service + controller CRUD + tests (ne JAMAIS l'écrire à la main) | `npx nodefony create entity <Nom> --fields "sku:string! price:float"`                            |
| Service métier seul — la logique réutilisable, hors de tout controller                                  | `npx nodefony create service <Nom> [--inject <AutreService>] [--module <m>]`                     |
| Frontend Vite (React/Vue/Angular)                                                                       | `npx nodefony create front <nom> [--module <m>]`                                                 |
| Commande CLI `nodefony <module>:<action>`                                                               | `npx nodefony create command <action> [--module <m>] [--phase onReady\|onRegister\|onPostReady]` |

**Ces dossiers ne s'écrivent JAMAIS à la main** — y déposer un fichier signifie
que tu as raté une commande de la table ci-dessus :

| Tu t'apprêtes à écrire dans…     | Lance plutôt                                                             |
| -------------------------------- | ------------------------------------------------------------------------ |
| `nodefony/entity/`               | `npx nodefony create entity <Nom> --fields "…"`                          |
| `nodefony/controllers/`          | `npx nodefony create controller <nom> --kind …`                          |
| `nodefony/service/`              | `npx nodefony create service <Nom>` (ou `create entity`, qui en pose un) |
| `nodefony/command/`              | `npx nodefony create command <action> [--module <m>]`                    |
| `modules/<nom>/` (module entier) | `npx nodefony create module <nom>`                                       |

Le code écrit à la main compile souvent — c'est tout le piège. Il diverge du
gabarit courant, et cette divergence ne se voit qu'à la première montée de
version. `npx nodefony create --help` liste les générateurs de CETTE version : la
liste s'allonge, ne te fie pas à ta mémoire.

Chaque commande se décrit à une machine : `--describe-json` (questions + options
en JSON), `--answers-json <fichier|->` (réponses en JSON), `--dry-run` (plan et
diffs, zéro écriture). Un refus n'écrit jamais rien (transaction).

Les champs d'une entité se déclarent en positionnels :
`npx nodefony create entity Post title:string! views:int=0 status:enum(draft,published) slug:string:index author:ref:User`.
Le `!` interdit le nul, le `?` l'autorise, `:index` pose l'index, `=<valeur>` fixe
la valeur par défaut, `enum(a,b)` borne les valeurs admises, et
`ref:<Entité>` crée la colonne de jointure **avec** son index. Les types portent
leur taille (`string(120)`, `char(2)`, `decimal(10,2)`). Un index de TABLE couvre
plusieurs colonnes et se répète : `--index "siteId,createdAt"`, `--unique "a,b"`.
Un `enum` rend la MÊME colonne sur les trois moteurs (pas de type SQL nommé, qui
exigerait une migration) : c'est le type TypeScript et le schéma Zod qui la
bornent — donc sur TOUS les transports, REST comme socket.

Si la table EXISTE DÉJÀ en base, trois options lui font épouser ses noms sans
rien renommer à la main : `--table <nom_sql>` (au lieu du pluriel),
`--column-case snake` (colonne `site_id`, propriété toujours `siteId`) et
`--id-name <colonne>` (clé primaire `website_id`, propriété toujours `id`). Le
code TypeScript ne change dans aucun des trois cas — seul le SQL suit.
`npx nodefony create entity --help` porte la grammaire de CETTE version — elle
s'enrichit, ta mémoire non.

## Où lire AVANT de coder (tâche → doc installée)

La référence est INSTALLÉE avec les paquets — lis CIBLÉ, jamais tout le dossier.

> 🔎 **Une recherche ORDINAIRE ne voit pas cette documentation.** `rg "terme"`
> lancé à la racine ne descend pas dans `node_modules` (git l'ignore, `rg` le
> suit) : le sujet paraît absent alors qu'il occupe quinze pages. Trois gestes
> justes, du plus utile au plus brut :
>
> - **chercher partout, avec le sens** — si le serveur tourne et que l'outil MCP
>   est câblé (`npx nodefony ai:mcp`), `nodefony_docs` avec `query` balaie TOUTE
>   la documentation chargée et rend des extraits ; `nodefony_symbols` rend la
>   SIGNATURE réelle d'un symbole, que le graphe seul ne porte pas ;
> - **désigner le dossier** — `rg "terme" node_modules/@nodefony/*/docs/` :
>   l'exclusion ne vaut que pour le PARCOURS, un chemin donné en argument est
>   toujours lu ;
> - **forcer l'inclusion** — `rg --no-ignore "terme"` pour un balayage large.
>
> ⚠️ **Si `node_modules/` n'existe pas, la documentation n'est pas là** — et
> aucun de ces gestes ne répondra. Ce n'est pas « le sujet n'est pas documenté » :
> c'est `npm install` qui n'a pas été lancé. DIS-LE plutôt que de conclure de son
> silence, et ne réécris jamais à la main ce que tu n'as pas pu lire.

- **Quel module installer pour tel besoin** (et lequel NE PAS installer) — `node_modules/nodefony/docs/catalogue.md`
- **Variables d'environnement** : cascade des `.env`, précédence, `NF__`, **et dans quel MODE tourne une commande** — `node_modules/nodefony/docs/environnement.md`
- **Kernel, cycle de vie, CLI** — `node_modules/nodefony/docs/kernel.md` + `cli.md`
- **Service, DI, container, scopes** — `node_modules/nodefony/docs/service.md`
- **Client isomorphe (navigateur), hooks React** — `node_modules/nodefony/docs/client.md` + `react-hooks.md`
- **Serveurs, sessions, cookies, upload, rate-limit** — `node_modules/@nodefony/http/docs/`
- **Recevoir un FICHIER** (formulaire multipart, `@UploadedFile`, où le ranger sans laisser le client choisir) — `node_modules/@nodefony/http/docs/upload.md`
- **Journaliser, corréler, tracer une requête** (identifiant de requête, trace) — `node_modules/@nodefony/http/docs/observabilite.md`
- **Routing, controllers, décorateurs, idempotence** — `node_modules/@nodefony/framework/docs/`
- **Firewall, authenticators, CSRF, CORS, clés d'API** — `node_modules/@nodefony/security/docs/firewall.md`
- **Protéger une action par un RÔLE** (`@IsGranted`), voters, hiérarchie — `node_modules/@nodefony/security/docs/authorization.md`
- **Le navigateur REFUSE d'exécuter ton script ou de charger une image** (politique de contenu, nonce, `Context.cspNonce`, HSTS, clickjacking) — `node_modules/@nodefony/security/docs/headers.md`
- **Utilisateurs** : contrat `IUser`, `UserService`, mot de passe — `node_modules/@nodefony/user/docs/index.md`
- **Notifier un système tiers** (webhook signé, rejeu, endpoints) — `node_modules/@nodefony/security/docs/webhooks.md`
- **Entités, repositories, requêtes (ORM)** — `node_modules/@nodefony/orm-core/docs/`
- **Migrations de schéma** (générer, appliquer, ÉPROUVER sans risque, déployer, réparer) — charge d'abord le skill `nodefony-migrate-schema` ; le détail des verdicts vit dans `node_modules/@nodefony/drizzle/docs/migrations.md`
- **Canaux temps réel, actions, protocole WS** — `node_modules/@nodefony/realtime/docs/`
- **Builder Vite, entries, HMR** — `node_modules/@nodefony/frontend/docs/`
- **Console d'admin Studio (dev)** — `node_modules/@nodefony/studio/docs/` + http://127.0.0.1:5151/nodefony

La config de l'app vit à trois endroits, et les confondre coûte une heure :
`nodefony.config.ts` est l'INDEX ordonné des modules montés ; la configuration
d'UN module va dans `nodefony/config/<module>.ts`, sous la forme
`(ctx) => ({ … }) satisfies I<Module>ConfigInput` ; `env.ts` déclare les
variables d'environnement et reste le seul lecteur de `process.env`.
Pointe-les, ne les recopie pas.

🔴 Le `satisfies` d'un fragment n'est pas décoratif : sans lui, une clé mal
orthographiée COMPILE, puis Zod la retire en silence au boot et le module
démarre sur son défaut. `npx nodefony doctor` refuse un fragment qui s'en passe.

**Des skills d'agent sont posés dans `.agents/skills/`** — la marche à suivre
complète pour les tâches courantes (`ls .agents/skills/` les liste ; leur
description dit quand chacun s'applique). Ce sont des **pointeurs** vers le
contenu installé dans `node_modules` : ils suivent la version du framework de CE
projet, et les éditer ne servirait à rien. Si ton outil ne charge que son propre
dossier de découverte, lis-les à la main — c'est le chemin le plus court vers la
bonne façade. `npx nodefony ai:sync` les remet à jour après un `npm update`
(`--dry-run` dit ce qui changerait).

**Les instructions que tu lis vivent dans `AGENTS.md`** — standard porté par
l'Agentic AI Foundation (Linux Foundation), précédence « le plus proche gagne ».
Les fichiers au nom d'un outil (`CLAUDE.md`, `GEMINI.md`) n'en sont que des
POINTEURS : ce qu'on y recopierait divergerait en silence. Deux agents lisent
`AGENTS.md` d'office (Codex, Vibe), deux ouvrent leur propre fichier.

**La porte d'introspection de cette application** (protocole MCP) se câble par
`npx nodefony ai:mcp` : elle écrit `.mcp.json` à la racine et, si tu le
demandes, déclare la porte chez tes agents **par leur propre CLI**. En mode
authentifié (`--auth`), l'en-tête porte `${NF_MCP_TOKEN}` — jamais le jeton
lui-même, que `npx nodefony security:token --write` émet à part. ⚠️ La porte est
une ROUTE : elle n'existe que serveur démarré, et un client MCP qui la trouve
éteinte la marque en échec pour toute sa session.

## Les commandes de l'app — demande la liste, ne la devine pas

```bash
npx nodefony --help              # TOUTES les commandes, celles des modules installés comprises
npx nodefony <commande> --help   # les options exactes de l'une d'elles
```

La liste **dépend des modules installés** : elle n'est pas la même d'une app à
l'autre, et elle s'allonge dès que tu en ajoutes un. C'est pour ça qu'elle se
demande au lieu de se retenir.

**Toujours `npx`, jamais `nodefony` nu.** Le binaire vit dans les `node_modules`
de CETTE app, pas dans ton PATH : la forme nue rend un code 127 tant que rien
n'est installé globalement. Une installation globale existe bien
(`npm i -g nodefony`) — elle sert à créer une app HORS projet — et, dans un
projet, elle passe la main au binaire local (le projet gagne, comme `gradlew`).
Mais elle peut être plus ANCIENNE que celle de l'app : `npx` prend directement la
version que cette application a choisie, sans dépendre de ce qui traîne sur la
machine.

Celles qu'on n'invente pas — faute de savoir qu'elles existent :

- Mettre l'app derrière **nginx ou haproxy** — `npx nodefony proxy:generate <nginx|haproxy> [-o <fichier>] [-b <hôte>] [-l <port>] [--reencrypt]`
- **Servir les fichiers statiques depuis un CDN** — `npx nodefony assets:publish [-o <dossier>] [--clean] [--json]`
- **Certificat TLS de développement** — `npx nodefony http:certificates [-f] [-j]`
- **Construire le front pour la production** — `npx nodefony frontend:build [-f]`
- **Où en est le serveur Vite** — `npx nodefony frontend:status [-j]`
- **Clés de chiffrement du firewall** — `npx nodefony security:secrets [-j] [-w]`
- Créer un compte **administrateur** — `npx nodefony security:user:add <identifiant> --admin`
- **Écrire les migrations** des entités modifiées — `npx nodefony orm:generate [--name <nom>] [--custom]`
- **Appliquer les migrations** (verrou + historique) — `npx nodefony orm:migrate [-n|--dry-run] [--json]`
- **La base est-elle à jour ?** — `npx nodefony orm:migrate:status [--json]` — **0** = à jour, **1** = en retard : ta barrière de déploiement
- **Éprouver une migration SANS toucher à ta base** — `NF_MIGRATE_DATABASE_URL="sqlite:/tmp/essai.sqlite" npx nodefony orm:migrate` — migre AILLEURS ; c'est ainsi qu'on prouve qu'une migration s'applique, jamais en refaisant la base
- **Repartir d'une base vierge EN DÉVELOPPEMENT** — `npx nodefony orm:reset [-c <connecteur>] [-y]` — refusée partout ailleurs, et **elle DÉTRUIT les données** : ce n'est jamais la façon d'éprouver une migration, ni la réponse à une migration qui refuse
- **Dépendances en retard (agrégées, pas le brut de npm)** — `npx nodefony outdated [-j] [-a]`
- **Cohérence du projet (classe non câblée, route qui répondra 404)** — `npx nodefony doctor [--json]` — depuis n'importe quel sous-dossier
- **Plusieurs processus, un cœur chacun** — `npx nodefony production -w <n|auto>` · `npx nodefony cluster -w <n|auto>` · `NF_WORKERS=<n|auto>` (déclarée dans `env.ts`) — la ligne de commande gagne, puis la variable, puis `nodefony/config/cluster/cluster.config.ts`
- **Construire l'image de container** — `docker build -t nodefony .` — le `Dockerfile` est DÉJÀ là, ne le réécris pas

- **Complétion au TAB** — `source <(nodefony completion zsh)`

Ce tableau ne remplace pas `--help` : lui seul connaît les modules de CETTE app,
et il fait foi le jour où les deux divergent.

## Vérités du framework (anti-préjugés — ce que tu crois savoir est faux ici)

- **La PROVENANCE d'une requête n'est pas une PREUVE D'INTENTION — une mutation
  exige `@CsrfProtect`.** Le raisonnement qui vient, et qui est faux : « le
  firewall vérifie déjà `Sec-Fetch-Site`, donc une écriture est protégée ». Ces
  en-têtes sont posés par un NAVIGATEUR ; un programme qui parle en HTTP n'en
  envoie aucun, et la défense de provenance le laisse alors passer — c'est son
  rôle, elle distingue les sites, pas les intentions. Résultat mesuré : un
  `POST /api/cart/items` sans jeton rend `201`, et l'application croit avoir une
  défense. Toute action qui ÉCRIT porte donc `@CsrfProtect` explicitement. Le
  jeton ne se demande à AUCUN endpoint : une requête sûre (`GET`) vers la route
  protégée sème le cookie lisible `csrf-token`, et la mutation le rejoue dans
  l'en-tête `x-csrf-token` — c'est le double-submit, sinon `403`. La provenance
  et le jeton se cumulent ; l'une ne remplace jamais l'autre.

- **Une origine tierce refusée en 403 se DÉCLARE — elle ne s'exempte pas.** Quand
  les envois d'un partenaire sont rejetés alors que les tiens aboutissent, la
  cause est la défense CSRF, et le réflexe qui vient (`@CsrfExempt` sur la route,
  `checkOrigin: false`, `csrf.enabled: false`) fait passer le partenaire **et
  n'importe quel autre site** : la route cesse de distinguer qui que ce soit,
  c'est-à-dire exactement l'attaque que la défense arrêtait. La réponse est une
  ligne de configuration — ajoute l'origine au bloc `csrf` déjà présent dans
  `securityConfig`, `nodefony/config/security.ts` :

  ```ts
  csrf: {
    secret: ctx.env.NF_CSRF_SECRET,
    trustedOrigins: ["https://partenaire.example"],
  },
  ```

  La comparaison porte sur la chaîne d'origine ENTIÈRE (`scheme://host[:port]`) :
  ni joker, ni sous-domaine implicite — une origine par entrée. À ne pas
  confondre avec `cors.origins`, qui autorise EN PLUS le JS du tiers à **lire**
  tes réponses : un partenaire qui POSTE n'en a pas besoin, et les deux
  traversent la défense. Détail :
  `node_modules/@nodefony/security/docs/csrf.md` ; geste complet et pièges :
  skill **`nodefony-protect-route`**.

- **Un adaptateur de données ne remplace pas l'autre : ils se COMPLÈTENT.** Chacun
  déclare les _stores_ qu'il sait tenir (`nodefony.stores` de son `package.json`) —
  `drizzle` les huit (session, user, tokens, passkeys, totp, audit, webhooks,
  idempotency), `mongoose` cinq (ni `totp`, ni `audit`, ni `idempotency`), `redis`
  quatre. Ce n'est pas un retard de développement mais un CHOIX : un journal
  d'audit n'a rien à faire dans un moteur documentaire. Ne promets donc jamais une
  parité qui n'existe pas, et vérifie où atterrit chaque donnée :
  `npx nodefony inspect stores`. Le détail par brique :
  `node_modules/nodefony/docs/catalogue.md`.

- **Le cœur `nodefony` est ISOMORPHE** : le même paquet se charge côté Node
  ET navigateur. La porte client EXPLICITE est le subpath `nodefony/client`
  (`RealtimeClient`, notices, rôles — résolu à l'identique par Vite, Node et
  le typecheck) ; les hooks React vivent dans `nodefony/react`. Ne réécris
  JAMAIS un client WebSocket/JSON-RPC, ne duplique JAMAIS un type entre front
  et back : un seul contrat, vérifié par le compilateur des deux bouts.

- **Une commande ne tourne PAS dans le mode du serveur que tu as lancé — DEMANDE-le.**
  Chaque commande démarre son propre noyau. Sans `NODE_ENV` dans ton shell, elle
  part en `development` ; avec `NODE_ENV=production`, elle lit une AUTRE
  configuration et une AUTRE base de données — sans rien dire de plus. Ne le
  suppose jamais avant d'écrire ou de migrer quoi que ce soit :

  ```bash
  npx nodefony env              # le mode, et d'où vient chaque variable
  npx nodefony inspect config   # la configuration EFFECTIVE, et sa provenance
  ```

  Pour forcer : `NODE_ENV=production npx nodefony <commande>`. La règle complète
  (absent, posé, valeur non-moteur) est dans
  `node_modules/nodefony/docs/environnement.md`.

- **Une initialisation s'ACCROCHE à une phase du démarrage — il n'y a pas de
  `app.use()`.** Nodefony n'est pas un framework à middlewares chaînés : du code
  posé au chargement d'un fichier s'exécute AVANT que la configuration existe, et
  il n'y a rien à quoi « ajouter » un traitement global. Ce qui doit tourner au
  démarrage se déclare depuis un module ou un service :
  `this.module?.hookKernel("onBoot", async () => { … })` — l'étiquette porte alors
  le nom et la criticité du module, ce qu'un `kernel.once(…)` posé à la main
  perdrait. Les phases, dans l'ordre : `onRegister` (les modules se déclarent),
  `onBoot` (tout est chargé, les connexions s'ouvrent), `onReady` (juste AVANT que
  les serveurs se mettent à écouter), `onPostReady` (ils écoutent), `onTerminate`
  (fermeture). Une commande CLI se pose sur la
  même échelle : `npx nodefony create command <action> --phase onReady`.
  ⚠️ Si tu t'apprêtes à écrire `as any` sur le kernel pour atteindre une méthode,
  arrête-toi : c'est le signe que tu cherches une API d'un AUTRE framework. Les
  phases, le conteneur et les connecteurs sont typés — la référence est dans
  `node_modules/nodefony/docs/kernel.md`, et `npx nodefony inspect services`
  montre ce qui existe RÉELLEMENT dans cette application.

- **Un service n'est pas une classe utilitaire.** Une classe à méthodes `static`,
  ou un objet exporté, COMPILE et marche — et reste invisible au framework. Un
  service Nodefony est une classe `@injectable()` qui `extends Service` : c'est
  de là que lui viennent sa config fusionnée, son journal (`this.log`), les
  événements, et sa place dans le conteneur. Il porte DEUX noms sans que ce soit
  une redondance : le décorateur nomme la CLASSE (ce qu'on écrit dans
  `@inject("…")`), le `super("nom", …)` nomme l'INSTANCE (sa clé pour
  `container.get("…")`). Ne l'écris pas de mémoire :
  `npx nodefony create service <Nom>` en pose un complet, commenté, à imiter ;
  la référence est dans
  `node_modules/nodefony/docs/service.md`.
  **Un service qui en appelle un autre le déclare au CONSTRUCTEUR** :
  `npx nodefony create service <Nom> --inject <AutreService>` écrit le
  `@inject("AutreService")` et l'appel qui va avec. La dépendance est alors
  ordonnée par le conteneur et visible dans la signature — là où
  `container.get("…")` cherche à l'exécution et rend `undefined` en silence si
  le service n'est pas enregistré.

- **Les violations de contrainte sont DÉJÀ traduites en HTTP — ne les rattrape pas.**
  Un doublon sur une colonne unique ressort en **409**, une donnée qui viole le
  schéma Zod en **422**, chacun avec son corps JSON : le rendu d'erreur lit le code
  du pilote (`23505` PostgreSQL, `ER_DUP_ENTRY` MySQL, `SQLITE_CONSTRAINT_UNIQUE`,
  `11000` MongoDB) et le mappe, quel que soit le moteur. N'écris donc JAMAIS un
  `throw … 409` dans un service pour un `sku` déjà pris. Le vérifier toi-même
  d'abord (« existe-t-il ? » puis insertion) est plus lent ET **faux sous
  concurrence** : deux requêtes simultanées passent toutes les deux le test avant
  que l'une n'écrive. La contrainte de la base est le seul arbitre exact — laisse-la
  lever, le pipeline traduit.

- **Un fichier ne se sert pas à la main.** Trois façades, et le choix se fait sur
  l'usage : `this.renderMediaStream(file)` implémente les **requêtes par plage**
  (`Range` → 206 + `Content-Range`, 416 hors plage) — c'est ce qu'exige un lecteur
  vidéo ou audio pour se déplacer ; `this.streamFile(file)` envoie le fichier
  ENTIER en flux, sans plage ; `this.renderFileDownload(file)` force le
  téléchargement. Recomposer ça avec `createReadStream` et `response.write`
  compile, passe les tests — et rend une réponse **incohérente** : un statut posé
  à la main n'atteint jamais la socket (le pipeline écrit statut et en-têtes à
  SON tour), donc le client reçoit **200 avec un corps partiel** et croit tenir le
  fichier complet. Mesuré au banc, pas supposé.

- **Le container DI est PROTOTYPAL** : les services vivent sur une chaîne de
  prototypes — un scope de requête VOIT tous les services du kernel sans
  aucune copie (coût d'un scope ≈ un `Object.create`), et ce qu'on `set()`
  dans un scope MEURT avec la requête. Ne fabrique donc ni cache de services
  par requête, ni singleton maison : `container.get("<nom>")` remonte la
  chaîne, c'est le mécanisme.

- **Le WS métier passe par la socket Nodefony** (`--kind realtime` : canaux
  pub/sub + actions RPC + policies). L'echo WS brut des exemples est une démo
  du pipeline partagé, pas un modèle à imiter.

- **Utilisateurs et droits : tout existe, n'improvise RIEN.** Ces gestes
  couvrent l'essentiel, et chacun a sa doc installée (cf. la table « Où lire
  AVANT de coder », plus haut) ; le geste détaillé et ses pièges vivent dans le
  skill **`nodefony-protect-route`** :
  - **protéger un ESPACE de routes** (tout ce qui commence par un préfixe) :
    une zone de firewall dans `nodefony/config/security.ts`, dont le `pattern` est le
    PRÉFIXE lui-même — `pattern: "^/api/account"`, **jamais** la liste des
    routes du jour (`"^/api/account/(profile|invoices)"`). Énumérer marche à
    l'essai, passe la revue, et laisse la route sœur ajoutée ensuite NAÎTRE
    PUBLIQUE — rien ne le signale, la zone a l'air de couvrir l'espace. Quand
    des routes partagent un préfixe, ne les protège pas une par une ;
  - **protéger une action** : le décorateur `@IsGranted("ROLE_ADMIN")` sur la
    méthode — il vaut pour TOUS les transports (HTTP et socket), et se pose
    **en plus** de la zone de firewall (le firewall AUTHENTIFIE, `@IsGranted`
    AUTORISE) ;
  - **réserver TOUT un controller à une habilitation** : ne l'écris pas,
    demande-le — `npx nodefony create controller <nom> --role ROLE_X` pose la
    garde sur la CLASSE (donc sur les actions à venir) **et** déclare le rôle
    sous `ROLE_ADMIN` dans `roleHierarchy`. Les deux gestes vont ensemble, et
    c'est le second qu'on oublie en les faisant à la main ;
  - **lire l'utilisateur courant** : le paramètre décoré `@CurrentUser()`
    (typé `IUser` de `@nodefony/user`) — l'identité est ré-résolue à chaque
    requête, donc les rôles sont frais et une révocation prend effet tout de
    suite. N'écris pas ton propre lecteur de session ;
  - **déclarer qu'un rôle en implique un autre** : la clé `roleHierarchy` de
    la config du module de sécurité (`ROLE_ADMIN` hérite `ROLE_USER`) — que
    `create controller --role` remplit pour toi quand le rôle naît avec son
    controller. Elle
    est aplatie au boot ; n'écris pas de test d'appartenance à la main — et
    n'énumère pas non plus les rôles du jour sur l'action.
    `@IsGranted(["ROLE_BILLING", "ROLE_ADMIN"])` accorde bien l'accès (un
    attribut suffit), mais la relation entre ces deux rôles n'existe alors
    NULLE PART : la route sœur ajoutée demain devra répéter la liste, et
    l'oubli ne se voit sur aucune route. C'est le piège de la puce
    précédente, un cran plus haut — énumérer ce qu'on a sous les yeux au
    lieu de déclarer la règle ;
  - **créer un compte** : la commande `npx nodefony security:user:add <identifiant>`.
    Ne fabrique pas d'utilisateur en insérant directement dans la base — le mot
    de passe passe par l'encodeur du framework.
  - **ouvrir une API à un PROGRAMME** (service partenaire, script, agent — pas
    un navigateur) : cette zone est **déjà posée** dans `nodefony/config/security.ts` —

    ```ts
    machine: {
      pattern: "^/api/machine",
      authenticators: ["apikey"], // PAS "session" — ce client n'a pas de cookie
      stateless: true, // false ⇒ un registre de sessions pour un client qui ne le relit pas
    },
    ```

    Pour une route **NEUVE**, fais-la **tomber sous `/api/machine`** plutôt que
    d'ajouter une zone : celle-ci est déjà réglée, et une seconde zone au
    pattern plus court la coifferait sans prévenir (le firewall trie par
    longueur de pattern).

    🔴 **Mais une URL DÉJÀ PUBLIÉE ne se déplace pas — c'est un contrat.** Quand
    on te demande de protéger une adresse existante (`/api/partenaire/depot`),
    la déménager sous `/api/machine` la fait répondre `404` à celui-là même
    qu'on voulait servir : le partenaire appelle l'ancienne, personne ne l'a
    prévenu, et rien dans l'application ne signale la rupture. Vécu, et le
    contrôle l'a vu — clé d'API valide, `404`. **On adapte la ZONE à l'URL,
    jamais l'URL à la zone** : étends le `pattern` de la zone `machine` pour
    qu'il couvre aussi l'adresse en place —

    ```ts
    machine: {
      pattern: "^/api/(machine|partenaire)",
      authenticators: ["apikey"],
      stateless: true,
    },
    ```

    Une URL ne se déplace que si l'énoncé le demande, et alors l'ancienne
    redirige.

    ⚠️ `stateless: false` (le défaut) **ne fait pas échouer l'essai**, et c'est
    tout le piège : depuis un navigateur ou un `curl -c`, le cookie posé revient
    aux requêtes suivantes et tout semble marcher. Ce que ça coûte n'est pas un
    refus mais un **registre** — chaque appel portant un cookie inconnu fait
    reprendre puis réécrire une session serveur, et renvoyer un `Set-Cookie`,
    pour un appelant qui ne la relira jamais. `stateless: true` ferme cela : la
    zone n'ouvre ni ne reprend de session, et le cookie entrant est ignoré.
    Lister `"session"` dans une zone stateless est une contradiction, et
    l'application **refuse de démarrer** en nommant la zone. Règle : un appelant
    qui ne stocke pas de cookie ne doit rien recevoir qu'il faille stocker.
    Les clés s'émettent par `POST /nodefony/security/api/keys`.

  - Un droit **métier** qui ne se réduit pas à un rôle (« l'auteur peut éditer
    SON document ») s'écrit en **voter** et s'enregistre par
    `registerVoterFactory` ; `@IsGranted("doc.edit", { subject: "id" })` l'appelle.
    C'est le point d'extension prévu — il n'y a pas de table de permissions à
    inventer.

## Environnement : ne devine JAMAIS, demande

```bash
npx nodefony env          # cascade des .env, valeur EFFECTIVE de chaque variable, sa PROVENANCE
npx nodefony env --json   # même rapport, pour un script
```

**Encadre toute modification de configuration par cette commande** : une fois
AVANT, pour savoir ce qui s'applique aujourd'hui et d'où ça vient ; une fois
APRÈS, pour prouver que ta valeur est bien celle qui gagne. Ce n'est pas un
outil de dépannage qu'on sort quand ça casse — c'est le geste qui remplace la
déduction.

Elle répond aux quatre questions dont dépend toute configuration, et qu'aucune
lecture de fichier ne tranche : quels fichiers sont lus **et dans quel ordre**,
quelles variables l'app **déclare**, quelle valeur est **effective et d'où elle
vient**, et **ce qui est ignoré**. Lire les `.env` toi-même te donne des
contenus ; la précédence, elle, est un mécanisme — tu ne peux que la supposer,
et une supposition fausse ne se voit qu'en production. La commande ne boote
rien, donc elle répond aussi quand l'app ne démarre plus.

**Précédence, du plus FORT au plus faible** — le premier qui pose une valeur
gagne, les suivants sont ignorés en silence :

```
process.env  >  .env.<déploiement>.local  >  .env.<mode>.local  >  .env.local
             >  .env.<déploiement>        >  .env.<mode>        >  .env
```

`<mode>` = `NODE_ENV` (`development`/`production`). `<déploiement>` = `APP_ENV`
(`staging`, `canary`… — plus spécifique, donc plus fort). Les `*.local` ne sont
jamais committés : les secrets y vont, et nulle part ailleurs.

**Deux mécanismes à ne pas confondre** :

| Forme                                 | Ce que c'est                                                | Où c'est déclaré                                       |
| ------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| `NF_PORT=5151`                        | variable de l'APP, typée et validée                         | `env.ts` (`defineEnv`) — non déclarée = **sans effet** |
| `NF__HTTP__SERVERS__HTTPS__PORT=8443` | surcharge DIRECTE d'une clé de config d'un module           | rien à déclarer — double `__` = séparateur             |
| `NF_TOTP_KEY_FILE=/run/secrets/x`     | la même variable, lue depuis un fichier (secret Docker/K8s) | idem `NF_TOTP_KEY`                                     |

Une variable `NF_` mal orthographiée n'échoue pas : elle est **ignorée**, et le
défaut s'applique en silence. `npx nodefony env` est le seul endroit qui la montre
(avec la correction probable).

**Les clés de configuration d'un module, avec leurs défauts, sont LISIBLES :**
`node_modules/@nodefony/<module>/dist/nodefony/config/config.js` porte le schéma
Zod du module — chaque clé, son `.default(…)` et sa `.describe(…)`. C'est la
source, pas une copie : la lire évite d'inventer une option qui n'existe pas
(une clé inconnue est retirée en silence à la validation). Ne recopie jamais ces
valeurs dans la doc du projet ; elles bougeront sans toi.

Pour ce que le PROJET offre comme choix (connecteurs déclarés, entités déjà
créées, types de colonnes de ton moteur) :
`npx nodefony create entity --describe-json` — c'est la même source que le
formulaire de Studio, à jour par construction.

## Pièges qui coûtent cher — vécus, pas théoriques

Chacun a déjà fait perdre une heure et beaucoup d'allers-retours. Le symptôme ne
désigne jamais la cause : c'est ce qui les rend chers.

- **Un test rouge en suite, VERT rejoué seul** — une ressource PARTAGÉE entre fichiers (serveur, table, état global) — pas une régression de ton diff → rejoue-le seul : l'isolation dit la vérité ; puis donne à chaque fichier sa propre ressource
- **Le serveur lancé en arrière-plan a disparu** — `… &` reçoit SIGHUP et meurt ; et tuer le PID du port ne tue pas le superviseur, qui respawne → `npx nodefony production --detach --wait` pour démarrer, `npx nodefony stop` pour arrêter — jamais `&`, jamais un kill par le port
- **Des dizaines de tests d'intégration rouges d'un coup** — ils FRAPPENT un serveur, ils ne le lancent pas : il est éteint (`ECONNREFUSED`) → `npx nodefony status` d'abord ; en e2e, laisse la commande gérer le cycle
- **La route existe dans le code et répond 404** — le runtime charge `dist/`, pas tes sources → `npm run build` — et en cas de doute vérifie le `dist/` par son CONTENU (`grep` du symbole), jamais par sa date
- **Ta route NEUVE répond 404, et le `dist/` est à jour** — elle n'est pas montée où tu crois : le chemin réel est le PRÉFIXE de son controller suivi du `path` de la route — une action `path: "/widget"` posée dans un controller `@controller("/api")` répond sur `/api/widget` → `npx nodefony inspect routes --json` donne le chemin MONTÉ ; si l'URL demandée ne doit pas porter le préfixe, la route va dans un controller qui n'en a pas
- **TOUT répond 404, même les routes du gabarit** — un AUTRE serveur tient les ports — ou LE TIEN a glissé sur d'autres ports, le port voulu étant pris → `npx nodefony status` : il montre les ports RÉELS, pas ceux que tu as configurés, et NOMME le projet voisin qui tient un port ; `npx nodefony stop <nom>` l'arrête sans te déplacer
- **L'app démarre, et pourtant une brique manque** (base injoignable, module absent) — une brique peut tomber en fail-soft, ou être écartée par sa `policy` : le boot CONTINUE, et le journal ne le dit qu'une fois, dans le terminal de celui qui a lancé → `npm run doctor` — il lit `var/last-boot.json` et nomme chaque brique absente AVEC sa raison
- **L'app ne démarre plus et tu n'as pas la sortie** (démarrage détaché, conteneur, CI) — le journal est parti avec le terminal → `npm run doctor` n'exécute rien : il rapporte la phase atteinte et la cause du dernier démarrage
- **Ça marche en dev, c'est mort en production** — les modules `policy: dev` sont RETIRÉS en production — ce qu'ils portaient disparaît avec eux → avant de livrer, UN boot `npx nodefony production --detach --wait` et rejoue tes vérifications
- **Un réglage de configuration ne change rien** — clé inconnue ou mal placée : retirée EN SILENCE à la validation → `npx nodefony inspect config --json` — la config effective et la provenance de chaque valeur ; et AVANT d'écrire la clé, `npx nodefony inspect schema <module>` dit celles qui existent, avec leur type et ce qu'elles font — n'invente jamais un nom de clé
- **Une variable d'environnement « ne prend pas »** — mal orthographiée (ignorée en silence) ou masquée par un rang supérieur → `npx nodefony env` — il montre la valeur EFFECTIVE et sa provenance
- **Après un échec au milieu d'une chaîne `&&`, tout ment** — rien d'aval n'a tourné : tu mesures l'état d'AVANT → après tout échec, considère que la suite n'a pas eu lieu — revérifie que l'artefact mesuré a été régénéré
- **Les tests passent, `npm run typecheck` échoue** — le runner efface les types : un test vert ne typecheck rien → lance les DEUX avant de conclure
- **Suite verte, et le câblage est mort** — un test qui ne quitte pas la brique ne prouve que la brique → débranche le point de câblage : si rien ne tombe, il n'est pas testé
- **Un test vert « prouve » une garantie de sécurité** — elle est vraie dans la fonction, fausse sur le trajet réel → frappe la route en anonyme et regarde si le code a tourné
- **Un test qui n'a jamais échoué** — il ne garde rien — un test neuf est complaisant par défaut → casse-le exprès une fois, vérifie qu'il rougit
- **« Tout est vert » alors qu'une suite ne s'est pas exécutée** — un test sauté compte comme réussi — et un fichier jamais COLLECTÉ (erreur de syntaxe, hors du glob) ne compte pas du tout → lis le NOMBRE de tests, pas la couleur
- **`localhost` et `127.0.0.1` te jouent des tours** — ce sont deux ORIGINES distinctes : cookies, cache et passkeys ne les partagent pas → une seule origine en développement, partout — URL ouverte comme callbacks
- **Ta page répond 200 et son script ne s'exécute pas** — la politique de contenu exige un `nonce` sur les scripts, et le navigateur refuse un `<script>` en ligne qui n'en porte pas (« Refused to execute inline script ») : un `curl` ne le voit JAMAIS, il ne lit que le corps → signe le script (`<script nonce="…">`, valeur `this.context?.cspNonce` de ton controller) ou sors-le dans un fichier servi ; ne desserre PAS la politique (`'unsafe-inline'`), et le journal du serveur te le dit en développement — détail : `node_modules/@nodefony/security/docs/headers.md`
- **La modif d'une entité « ne prend pas »** (erreur SQL au runtime) — en développement, un champ AJOUTÉ qui accepte le vide est posé au boot suivant, un champ OBLIGATOIRE ne l'est jamais, et aucune colonne n'est jamais retirée → écris la migration (`npx nodefony orm:generate` puis `npx nodefony orm:migrate`), qui vaut en dev comme en production ; `npx nodefony orm:reset` refait la base à neuf et **perd les données** — à ne taper que sur une base dont le contenu ne compte pour personne
- **Un déploiement où « rien ne répond »** alors que les pods tournent — un exemplaire dont la base est en retard répond 503 sur `/readyz` (jamais sur `/livez`) et reste hors du répartiteur : c'est voulu, ce n'est pas une panne → `npx nodefony orm:migrate:status` dit qui est en retard ; applique les migrations, les pods se mettent en service SEULS
- **Les routes authentifiées plafonnent** quand le reste tient la charge — le stockage de session par défaut est SYNCHRONE : chaque reprise bloque la boucle d'événements → compare une route anonyme et une route authentifiée AVANT d'accuser TLS ou le pare-feu ; passe le stockage sur redis pour la charge
- **En production, la modif front n'apparaît jamais** — hors développement il n'y a PAS de rechargement à chaud, et le manifeste est lu AU BOOT → `npm run build` → **redémarre le serveur** → rechargement forcé
- **Ta modif front n'apparaît pas (en dev)** — le navigateur sert son cache — et le rechargement à chaud ne remplace ni un singleton ni un composant qui gagne des hooks : le code neuf tourne sur du vieil état → rechargement forcé, et vérifie que Vite a bien recompilé
- **Une route d'API répond du HTML** — un repli SPA générique avale les routes voisines — le premier motif qui correspond gagne → repli en préfixe LITTÉRAL ; `npx nodefony inspect routes --json` montre l'ordre réel
- **Des utilisateurs « déconnectés au hasard »** — le traitement global « 401 = session expirée » frappe aussi les sondes d'authentification, où 401 est NORMAL — et détruit une session valide → exempte les sondes du traitement global

**Ce qui coûte le plus de tokens** : enchaîner arrêt → construction → démarrage
après chaque petite modification. Regroupe TOUTES tes modifications serveur, puis
UN seul cycle. Le serveur de développement reconstruit tout seul, et le front
passe en rechargement à chaud — zéro redémarrage. Et ne lance **jamais** une
construction pendant qu'une suite de tests interroge le serveur : il redémarre au
milieu, et tu passes l'heure suivante sur des 404 fantômes.

## Modules du projet

Aucun — `npx nodefony create module <nom>` en pose un (workspace npm sous `modules/`).

## Gates — vérifier avant de dire « fait »

```bash
npm run verify        # ⬅ LA commande. typecheck + lint + tests + doctor, dans cet ordre
```

**Une seule à retenir, et c'est délibéré.** Les quatre gates ci-dessous existent
séparément pour qu'on puisse en relancer un ; mais tant qu'ils n'étaient QUE
séparés, il fallait penser à les enchaîner — et le premier oublié était toujours
le même, `typecheck`, celui que rien d'autre ne remplace : **le bundler ne
type-check pas**, ton code peut être bâti, servi, et ne pas compiler.

`verify` s'arrête au premier rouge, et ce rouge est ta tâche suivante.

```bash
npm run typecheck     # types — le seul gate que le build ne fait PAS à ta place
npm run lint          # style et pièges
npm test              # unitaires, rapides, zéro serveur
npm run doctor        # diagnostic : câblage, install, + BILAN du dernier démarrage
npm run test:e2e      # boot RÉEL + HTTP/WS (build inclus) — HORS `verify` : c'est le gate LENT
```

### `doctor` — le premier réflexe quand quelque chose ne va pas

**Avant de chercher, demande.** `npx nodefony doctor` (ou `npm run doctor`) est
la commande de diagnostic : elle répond depuis n'importe quel sous-dossier, elle
n'exécute RIEN de ton application, et `--json` la rend exploitable par un script.
`check` en est un alias historique — le nom à retenir est `doctor`.

Ce qu'elle t'épargne : une demi-heure à chercher pourquoi une route répond 404,
pourquoi un service est introuvable, ou pourquoi l'app « marche » sans faire ce
qu'on lui demande. Elle ne devine pas — elle LIT, et elle nomme le geste.

```bash
npx nodefony doctor           # sortie lisible ; sort en erreur s'il manque quelque chose
npx nodefony doctor --json    # même chose, pour un script ou un agent
```

**`doctor` nomme d'abord ce qui empêche de DÉMARRER**, et il le fait sans rien
exécuter — donc il répond sur une app qui ne se lance plus :

- une **variable REQUISE** sans valeur ;
- un module que le manifeste charge mais qui n'est **pas installé** ;
- une dépendance déclarée **absente de `node_modules`** ;
- un **port déjà tenu** par un autre programme (le tien ne compte pas).

Il nomme aussi une **classe écrite que rien ne déclare** — une entité hors de
`@entities([…])`, un controller hors de `@controllers([…])`. Elle compile, les
tests qui l'importent passent, et la panne n'arrive qu'au démarrage suivant :
une table jamais créée, une route qui répond 404 sans que rien ne l'explique.
C'est le mode d'échec de la COPIE, celui qu'on fait en recopiant le voisin au
lieu d'appeler le générateur.

**`doctor` te dit aussi ce qui s'est passé au dernier démarrage**, et c'est la
seule façon de l'apprendre après coup : l'app écrit son bilan dans
`var/last-boot.json` à chaque boot. Deux cas que tu ne peux pas voir autrement :

- **elle ne démarre plus** — `doctor` n'exécute rien, donc il répond quand même,
  et il nomme la phase atteinte et la cause ;
- **elle démarre mais AMPUTÉE** — c'est le cas piégeux : tout a l'air sain, et
  une brique manque (base injoignable, module écarté par sa `policy`). Le
  journal l'a dit une fois, au terminal de celui qui a lancé. `doctor` te le
  redit, avec la RAISON de chaque brique absente.

Sur une app saine il n'en parle pas. S'il en parle, lis avant de coder.

## Piloter le serveur — et l'ARRÊTER

```bash
npm run dev                          # développement : rechargement auto, Ctrl+C pour arrêter
npx nodefony development --no-watch      # développement SANS rechargement : un seul process, stable
npx nodefony status                      # que tourne-t-il ? ports, PID — ne boote rien
npx nodefony stop                        # arrêt PROPRE de tout runtime de cette app
npx nodefony stop <nom|chemin>           # arrêter un AUTRE projet, sans changer de dossier
npx nodefony production --detach --wait  # boot réel en arrière-plan ; rend la main ports OUVERTS
```

**Arrête ce que tu démarres.** Un serveur laissé derrière garde les ports : le run
suivant échoue sur une erreur qui ne parle jamais de lui (`EADDRINUSE`, ou pire, un
test qui interroge l'ANCIENNE version du code). `npx nodefony stop` est la sortie
propre, `npx nodefony status` dit ce qui reste.

**Ces deux commandes ne voient QUE cette application.** Plusieurs projets Nodefony
peuvent tourner sur la même machine ; `status` ne compte jamais les process du
voisin comme les tiens, il les NOMME dans une table à part (nom, ports tenus,
racine) — et ce nom est ce que `stop` accepte. Deux conséquences pour toi :
« aucune instance » veut dire « aucune À MOI », pas « rien ne tourne » ; et une
cible que `stop` ne peut pas désigner sans ambiguïté est REFUSÉE, avec un code de
sortie non nul et rien d'arrêté — **lis ce code**, un refus ressemble sinon à un
succès. Ne prends `--all` que pour faire table rase du poste entier : il emporte
les serveurs des autres projets, y compris ceux que tu n'as pas lancés.

**Pour faire tourner une suite contre un serveur, prends `--no-watch`.** Le mode
développement surveille les sources et relance le serveur dès qu'un fichier bouge —
ce qui est exactement ce qu'on veut en codant, et exactement ce qu'on ne veut pas
pendant un run : le redémarrage coupe les connexions sous les tests, et le rouge qui
en sort accuse le code alors que le fautif est le décor. `--no-watch` garde tout le
mode développement (mêmes modules, mêmes erreurs détaillées) et retire le seul
rechargement automatique.

⚠️ **Une suite lancée contre un serveur de PRODUCTION reçoit `404` sur tout.** Les
modules déclarés `policy: "dev"` n'y sont pas chargés — les routes que la suite
interroge n'existent tout simplement pas. C'est le rôle de cette politique, pas un
défaut à contourner. Si c'est bien le mode production que tu veux éprouver :

```bash
NF_WITH_DEV_MODULES=1 nodefony production --detach --wait   # dérogation explicite
NF_WITH_DEV_MODULES_TTL_MIN=120 …                            # campagne longue (charge)
```

Ce runtime **s'arrête tout seul** (30 min par défaut, réglable jusqu'à 4 h, jamais
désarmable), après un préavis. Ce n'est pas une gêne : c'est ce qui empêche une
variable oubliée dans une image ou un manifeste de laisser des routes de banc
ouvertes en production pendant des mois. Règle le délai AVANT une mesure longue — un
serveur qui tombe au milieu ne rend pas une mesure fausse, il en rend une qu'on
croira vraie.

## Voir un écran toi-même — un navigateur, pas un `curl`

Un `curl` prouve qu'une route répond ; il ne dit pas si l'écran **se monte**. Le
devkit porte des sondes prêtes à l'emploi, qui s'exécutent de deux façons.

**Sur cette machine** — le plus court :

```bash
npm run see:setup
node node_modules/@nodefony/devkit/skills/nodefony-browser/scripts/inspect.mjs /
```

`see:setup` n'installe **rien de lourd par défaut** : le pilote pèse quelques
mégaoctets, et il essaie d'abord les navigateurs **déjà présents** sur la machine —
Chrome, puis Edge, qui est préinstallé sur tout Windows. Le navigateur complet
n'est téléchargé que si aucun ne répond, une seule fois par machine (cache
utilisateur partagé par tous tes projets, jamais dans `node_modules`) :

```bash
npx playwright install chromium
```

Le champ `navigateur` de la sortie dit lequel a servi — deux mesures faites avec
des navigateurs différents ne se comparent pas.

**En conteneur** — quand tu veux une mesure **comparable** dans le temps (image
épinglée, donc version figée), de l'**isolation** (le navigateur ne voit ni ton
disque ni ton réseau), ou que tu ne veux **rien** installer :

```bash
docker compose --profile browser up -d
docker cp node_modules/@nodefony/devkit/skills/nodefony-browser/scripts/. nodefony-browser:/app/see-screen
docker exec nodefony-browser node /app/see-screen/inspect.mjs /
```

Le **`/.`** de la copie n'est pas décoratif : sans lui, une seconde copie imbrique
un dossier de plus au lieu de remplacer, et tu relances une version périmée des
sondes sans le moindre message.

Tu obtiens un JSON : le titre, la langue, le thème, les **scripts réellement
servis**, les erreurs de console, une capture horodatée — et surtout des **mesures**
que ni une capture ni un `curl` ne donnent : la couleur, le fond effectif, le
**contraste calculé** (luminances WCAG) et la taille de chaque élément que tu
sondes (`-e "NF_BROWSER_PROBES=libellé=sélecteur,…"`). C'est la différence entre
« ça me paraît lisible » et « 7,39:1, donc AAA ».

`watch.mjs`, à côté, regarde le temps qui coule plutôt qu'un instant : frames
WebSocket horodatées dans les deux sens, réponses ≥ 400, erreurs de console. C'est
la seule façon de voir une frame qui n'arrive pas ou une reconnexion en boucle.
Il s'arrête sur une **condition applicative** (`NF_BROWSER_UNTIL`) plutôt que sur
une durée — mais **éprouve toute condition d'arrêt avec une condition IMPOSSIBLE**
avant de lui faire confiance : tant qu'elle n'a pas échoué une fois, rien ne dit
qu'elle discrimine.

### Auditer, pas seulement regarder

```bash
npm run audit:setup
npm run audit:web -- /tableau-de-bord
```

Lighthouse complet **sur une page authentifiée** — ce que l'extension du navigateur
ne sait pas faire. Cinq catégories, dont **`agentic-browsing`** : ce qu'un agent
d'intelligence artificielle trouve en arrivant sur ta page (arbre d'accessibilité,
stabilité visuelle, annotations WebMCP de tes formulaires, `llms.txt`).

`audit:setup` est **séparé** de `see:setup` parce que Lighthouse pèse une
vingtaine de mégaoctets : tu ne le paies que si tu audites.

⚠️ **Ne juge pas la note de performance sur le serveur de développement** :
modules servis un par un, sources non minifiées, rechargement à chaud. Elle
s'effondre pour des raisons qui n'existent pas en production. Cette catégorie
ne se mesure que sur une version bâtie.

Le mode d'emploi complet est le skill **`nodefony-browser`** du devkit (`ai:sync` en pose
le pointeur dans `.agents/skills/`).

**Quatre règles, sinon tu diagnostiqueras le vide** :

| Règle                                                                | Pourquoi                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Joins l'app par **`host.docker.internal`**                           | `localhost` désigne le conteneur, pas ta machine. Si tu as activé `domainCheck`, ajoute ce nom aux `trustedHosts` en développement, sinon la barrière répond `421`.                                                                                                                                                                                                                                                   |
| Passe par **HTTPS**                                                  | Le cookie de session est `secure` : sur une origine `http://` non-`localhost` le navigateur le **jette**, et tout revient en `401` — on croit alors que le login rate.                                                                                                                                                                                                                                                |
| **Rien à poser** pour rendre Vite joignable                          | L'origine des assets se dérive du `Host` de ta requête : arriver par `host.docker.internal` suffit, l'allowlist Vite et le WebSocket du HMR suivent le même nom, et le poste reste servi sur `127.0.0.1` en même temps. Si la page annonce quand même `127.0.0.1:5173` depuis le conteneur, c'est que le nom ne franchit pas `trustedHosts`, ou qu'une `publicOrigin` explicite est configurée (elle gagne toujours). |
| **Attends un texte propre à l'écran visé** avant de lire ou capturer | Le SPA se monte APRÈS la navigation. Et attendre un texte présent aussi sur la page de connexion (le nom de l'app…) aboutit dans les deux cas : ça ne prouve rien.                                                                                                                                                                                                                                                    |

Une capture **n'écrase pas** un fichier existant : réutiliser un nom te fait relire
une image périmée pendant que l'appel répond « OK ». Nom neuf, ou vérifie la date.

**🔴 AVANT d'accuser ton code : le bundle SERVI est-il celui que tu as bâti ?** En
front pré-bâti, trois mécanismes indépendants te font observer du code que la source
ne contient plus — un build partiel qui ne purge pas la sortie (deux générations de
chunks, l'`index.html` pouvant désigner l'ancienne), un cache de build qui RESTAURE
un ancien `dist` par-dessus le tien, et le service d'assets qui lit l'`index.html`
au démarrage seulement. Le symptôme est traître : l'écran montre un composant que tu
as remplacé.

Le champ **`scripts`** rendu par `inspect.mjs` liste les fichiers servis à la page :
compare-les à ceux que désigne l'`index.html` produit dans `<module>/dist/frontend/`.
Deux valeurs différentes ⇒ le défaut n'est pas dans ton code. Rebâtis en forçant
(cache invalidé), redémarre le serveur, PUIS redémarre le conteneur navigateur —
son cache HTTP survit à un simple rechargement. Aucun de ces trois pas n'est
facultatif.

**L'autre voie — le serveur MCP.** Le même conteneur expose un serveur MCP
(`claude mcp add --transport http browser http://127.0.0.1:3001/mcp`) : prends-le
pour **explorer** une page interactivement, et les sondes ci-dessus pour tout le
reste. Le protocole intermédiaire coûte plusieurs fois le temps d'un appel direct,
ne rend rien qu'un script puisse exploiter, et sa session peut tomber sous toi.

Ce que ce navigateur ne remplace pas : le rechargement à chaud, l'animation et le
rendu fin — ça se juge dans un vrai navigateur. Lui répond à « l'écran se monte-t-il,
s'alimente-t-il, et crie-t-il dans la console ? ».

## Demander à l'app, plutôt que déduire du code

**Perdu ? Commence par ici** — la carte de visite dit qui répond, ce qui est
chargé, où lire et quoi lancer :

```bash
npx nodefony card               # ajoute -j pour du JSON (| jq)
```

Elle répond **toujours** : sur une application pas encore construite, et depuis
un terminal qui n'a posé aucune variable d'environnement — elle ne lit que des
fichiers. Dans ce cas elle le DIT (« modules installés », pas « chargés ») et
renvoie à `npx nodefony inspect modules` pour ce qui est vraiment monté.
`devkit:card` reste accepté : c'est son ancien nom.

```bash
npx nodefony inspect routes --json     # toutes les routes réelles (chemin, méthodes, controller)
npx nodefony inspect services --json   # services enregistrés, et le module qui les porte
npx nodefony inspect config --json     # config EFFECTIVE de chaque module (+ d'où vient chaque valeur)
npx nodefony inspect schema http        # ce qu'on a le DROIT d'écrire : clés, type, défaut, DESCRIPTION
npx nodefony inspect modules --json    # modules CHARGÉS — pas ceux que le manifeste déclare
npx nodefony inspect module http       # un module en détail
npx nodefony inspect entities --json   # entités déclarées à l'ORM
npx nodefony inspect stores --json     # où sont RÉELLEMENT écrites les données (sessions, cache…)
npx nodefony inspect graph --json      # graphe des entités et de leurs relations
```

Ces commandes bootent l'app **sans ouvrir un seul port** et rendent exactement ce
que sert la console d'administration — même code, deux portes. Préfère-les à la
lecture des sources : une route dépend de décorateurs, d'un manifeste et d'un
ordre de chargement ; la déduire, c'est se tromper un jour sur deux. `--json` est
un flux pur, `| jq` fonctionne.

**« Que fait cette classe, où est-elle définie, qu'étend-elle ? » → une commande,
pas une fouille :**

```bash
npx nodefony symbols AbstractCrudService      # définition, TSDoc, parenté — en O(1)
npx nodefony symbols --module @nodefony/http  # toute la surface exportée d'un paquet
npx nodefony symbols                          # ce que le graphe couvre, et d'où il vient
```

Le graphe symbolique de TOUT le framework est livré avec le paquet `nodefony` :
la réponse ne dépend ni d'un serveur, ni d'un build, ni de ta connexion. Va y
chercher un symbole AVANT d'ouvrir un `.d.ts` ou de parcourir `node_modules` —
et avant, surtout, d'inventer une signature.

**Tu préfères des OUTILS à des commandes ? Cette app en expose, par MCP.** Les
mêmes réponses (`inspect`, `check`, `symbols`, `card`), servies en Model Context
Protocol — utile si ton client sait appeler des outils mais pas lancer un
terminal :

```bash
npx nodefony ai:mcp             # écrit .mcp.json ; --dry-run pour voir sans écrire
```

Ce n'est **pas un process de plus** : le serveur MCP est une route de cette
application (`POST /nodefony/mcp`), donc il n'existe **que pendant que l'app
tourne**, et il suit chaque rechargement du serveur de développement sans rien à
resynchroniser. Après avoir écrit le fichier, **redémarre ton client** : aucun ne
relit sa configuration en cours de route.

⚠️ **L'ordre compte, et il se paie en silence** : ton client se connecte aux
serveurs MCP **au démarrage de TA session, une seule fois** — si l'application
ne tournait pas à cet instant, le serveur reste marqué `failed` et ses outils
n'apparaîtront **jamais** dans cette session, même après un
`npx nodefony development --detach --wait`. Démarre l'application D'ABORD, ta
session ENSUITE. Application éteinte ou session déjà ouverte : les commandes
CLI (`inspect`, `check`, `symbols`, `card`) rendent les mêmes réponses, sans
rien exiger.

Deux choses à savoir avant de t'étonner : la porte est **refusée à toute adresse
non locale** et à toute origine de navigateur non déclarée (`403`) — c'est une
protection contre une page web qui viserait ton `localhost`, pas un bogue ; et
elle **n'existe pas en production**, le module qui la sert étant `policy: "dev"`.
Réglages : `use("@nodefony/devkit", { mcp: { … } })`.

**Ces quatre outils décrivent le FRAMEWORK. Ceux du métier, c'est toi qui les
ajoutes** — n'importe quel module de cette application publie les siens en
implémentant `getMcpTools()`. C'est le seul moyen qu'un agent extérieur
interroge le domaine plutôt que la plomberie :

```ts
import { Module, mcpText, type IMcpTool } from "nodefony";

class Shop extends Module {
  getMcpTools(): IMcpTool[] {
    return [
      {
        name: "shop_stock",
        // La description est ce qui DÉCLENCHE l'outil : dire ce qu'il rend ET
        // quand s'en servir. Un modèle n'appelle pas ce qu'il ne comprend pas.
        description:
          "Stock réel d'une référence produit. À utiliser avant de proposer " +
          "une commande — la réponse vient de la base, pas d'un cache.",
        inputSchema: {
          type: "object",
          properties: { sku: { type: "string", description: "Référence" } },
          required: ["sku"],
        },
        handler: async (args) => mcpText(await this.stock(String(args.sku))),
      },
    ];
  }
}
```

Rien ne s'enregistre au démarrage : la liste est relue à chaque requête, donc un
module ajouté apparaît sans rien redémarrer. `mcp.tools` ne filtre que les
outils **intégrés** — le tien est publié dès qu'il est déclaré. Un outil écarté
(nom hors `[a-zA-Z0-9_-]{1,64}`, nom déjà pris, handler absent) le dit en
`WARNING` dans les journaux du serveur : s'il manque à l'appel, la raison y est
déjà, ne la cherche pas dans ton handler — il n'a pas été appelé.

**Un outil qui touche à des données réservées se DÉCLARE tel** — `scopes` (tous
exigés) et/ou `requiresAuth`, et son handler reçoit l'appelant en second
paramètre pour borner ce qu'il rend :

```ts
{
  name: "shop_invoice",
  description: "Facture d'une commande.",
  inputSchema: { type: "object", properties: { id: { type: "string" } } },
  scopes: ["shop:read", "shop:billing"],
  handler: async (args, caller) => mcpText(await this.invoice(args.id, caller.subject)),
}
```

Un outil ainsi déclaré est **retenu** tant que l'appelant ne présente pas ce
qu'il exige : absent de `tools/list`, **et** inappelable en le nommant — un
catalogue filtré dont les outils cachés répondent quand même ne serait qu'un
rideau. Le refus dit « outil inconnu », jamais « interdit » : son existence même
n'est pas révélée.

⚠️ **Aujourd'hui cette porte n'authentifie PERSONNE** — elle ne valide aucun
jeton. Un outil qui exige des scopes est donc, ici et maintenant, **invisible
pour toujours**. C'est voulu (fermé par défaut), mais retiens-en la conséquence
pratique : tant que l'authentification n'est pas branchée, n'attends pas d'un
outil protégé qu'il réponde — c'est le comportement normal, pas une panne.

⚠️ Et pour les outils publics : avant d'exposer une donnée, demande-toi si elle
supporterait d'être lue **sans identification** par qui a accès à la machine.

**Ce que rend `inspect` ENGLOBE tes sources, et les dépasse de loin.** Les modules
installés — ceux du framework compris — montent leurs propres routes, services et
entités : une app qui ne définit qu'une poignée de routes en expose couramment plus
d'une centaine. Un écart d'un ordre de grandeur entre ce que tu lis dans tes
fichiers et `npx nodefony inspect routes --json | jq 'length'` n'est donc PAS une
anomalie de l'outil : c'est la différence entre ce que TU as écrit et ce que l'app
MONTE. Dès que la question porte sur l'app, le chiffre juste est celui d'`inspect` —
compter dans les sources répond à une autre question que celle posée.

**Si la commande te résiste, répare l'APPEL — ne te rabats pas sur les sources.**
C'est le réflexe qui coûte le plus cher, parce qu'il produit une réponse d'allure
normale : un shell qui manque un outil (`timeout` n'existe pas sur macOS), un `jq`
mal formé, et l'on se replie sur ce qu'on sait lire. Les fichiers répondront
toujours quelque chose — mais pas à la question posée. Relance sans le tube pour
voir la sortie brute, puis remets ton filtre.

N'invente pas d'attente : `--wait` ne rend la main qu'une fois les ports en écoute
— un `sleep` arbitraire est soit trop court (test rouge sans raison), soit du temps
perdu à chaque exécution. `npm run test:e2e` gère déjà ce cycle tout seul.

## Méthode de travail

1. **Budget tokens = une règle de conception** : lire ciblé via les tables
   ci-dessus ; ne jamais scanner le projet entier.
2. **Le poids du modèle est un CHOIX, et il est mesuré ici** (si ton outil sait
   déléguer à des sous-agents). Une tâche couverte par un **générateur** ne
   demande pas un gros modèle : c'est le générateur qui porte le savoir, pas le
   modèle. Mesuré sur ce framework, « ajoute une ressource REST » rend le MÊME
   résultat en modèle léger et en modèle fort — mêmes contrôles verts, écart
   d'étapes dans le bruit — pour **~3× moins cher**. À l'inverse, le socle SANS
   générateur (flux, session, cycle de vie) fait échouer le modèle léger environ
   une fois sur deux. Donc : **léger** pour appeler un générateur, inventorier,
   lire, vérifier un fait, appliquer un patron ; **fort** pour écrire du socle
   sans générateur et pour arbitrer une architecture. Le test qui tranche en une
   seconde : _la tâche a-t-elle une bonne réponse vérifiable ?_ Aucun nom de
   modèle ici — ils changent tous les trimestres ; raisonne en poids.
3. **Une règle = une source** : ce fichier POINTE la doc, il ne la recopie
   pas ; n'y recopie rien non plus.
4. **Batcher les modifs serveur** puis UN SEUL cycle build/restart ; le
   frontend passe en HMR, zéro restart.
5. **Vérifier avant de dire « fait »** : `npm run verify`, jamais `npm test`
   seul — vitest n'inspecte AUCUN type, une app peut être verte et ne pas
   compiler ; un vert ne couvre que le diff qui l'a produit ; suspecte ton
   propre diff.
6. **La mémoire de l'app est ci-dessous** : accumule les leçons DURABLES dans
   la zone Notes — pas dans des commentaires éparpillés.

## Notes de cette app (zone préservée à la régénération)

Fichier 100 % généré (nodefony 10.0.0-alpha.4) — régénéré par les
commandes `create`, il ne peut pas mentir. Tes leçons propres à CETTE app vont
dans la zone ci-dessous : elle survit à la régénération.

<!-- app-notes:start -->

_(vide — leçons, gotchas et conventions propres à cette app, au fil des sessions)_

<!-- app-notes:end -->
