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
- **Client isomorphe (navigateur), liaison `nodefony/react`** — `node_modules/nodefony/docs/client.md` + `react-hooks.md`
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
