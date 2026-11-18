<div align="center">

<a href="https://github.com/nodefony/nodefony-core"><img src="https://raw.githubusercontent.com/nodefony/nodefony-core/main/docs/assets/nodefony-logo.png" alt="Nodefony" height="72"></a>

# nodefony

**HTTP et WebSocket dans le même contrôleur, une base qui persiste, un pare-feu
applicatif et une console d'administration** — engendrée par
[`nodefony create app`](https://github.com/nodefony/nodefony-core), câblée et prête à tourner.

[![Nodefony](https://img.shields.io/badge/Nodefony-10.0.0-1f6feb?style=flat-square)](https://github.com/nodefony/nodefony-core)
[![Node 24.16+ ou 26+](https://img.shields.io/badge/Node.js-24.16%2B%20%7C%2026%2B-green?style=flat-square)](package.json)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](tsconfig.json)

**[📖 Documentation](https://nodefony.net/docs/)** · [Par où commencer](https://nodefony.net/docs/demarrer/) · [Le framework](https://github.com/nodefony/nodefony-core)

</div>

## Ce dépôt, et le framework

**Ce dépôt est une application.** Il ne contient pas Nodefony : il l'utilise, comme une
application React ne contient pas React. Le framework vit ailleurs, et c'est une distinction
qui évite beaucoup de temps perdu.

- **Comprendre ce que fait le framework** → [la documentation](https://nodefony.net/docs/), en
  commençant par [Par où commencer](https://nodefony.net/docs/demarrer/).
- **Ce qu'est Nodefony, et ce que ses partis pris coûtent** →
  [l'architecture en vue d'ensemble](https://nodefony.net/docs/architecture/vue-ensemble/).
- **Le code d'un paquet que cette app importe** → [`nodefony/nodefony-core`](https://github.com/nodefony/nodefony-core),
  dans `src/packages/@nodefony/<nom>`.
- **Brancher TON implémentation** — authentification, stockage, bus temps réel →
  [Étendre le framework](https://nodefony.net/docs/guides/etendre/), quatorze points d'accroche.
- **Signaler un défaut, demander une évolution** → [les issues de `nodefony-core`](https://github.com/nodefony/nodefony-core/issues).
- **Qui décide, et comment** → [la gouvernance](https://github.com/nodefony/nodefony-core/blob/main/GOVERNANCE.md).

⚠️ **Ce dont tu n'hérites PAS.** `nodefony-core` est un monorepo de développement : il porte les
paquets du framework, mais aussi ses bancs de mesure, ses gabarits, ses suites de test et son
outillage d'agent. **Rien de tout cela n'entre dans cette application** — le lire donne
l'implémentation du framework, jamais ce que ton application embarque. Ce qu'elle embarque
vraiment se lit dans **son** `package.json`, ici même.

## Le temps réel, de bout en bout

**Nodefony est un framework temps réel.** Une application vivante pose toujours les mêmes questions :
pousser au navigateur, dans un sens ou dans les deux ; ouvrir des salons et savoir qui s'y trouve ;
décider qui entre ; faire passer des octets ; tenir à plusieurs instances ; voir ce qui se passe
quand ça coince. Chacune a sa réponse dans le framework, écrite contre la norme qui la définit, et
éprouvée par des tests.

| Ce qu'il te faut                | Ce que Nodefony fournit                                                                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Échanger dans les deux sens** | La **socket Nodefony** : des canaux à volonté sur une seule connexion — le serveur diffuse, le client appelle et attend la réponse, ou pousse sans attendre. JSON-RPC 2.0 sur WebSocket (RFC 6455), dans le pipeline HTTP |
| **Pousser dans un seul sens**   | Les **flux SSE** (`text/event-stream`) : une action répond par `this.renderSse()`, en HTTP/1.1 comme en HTTP/2. Le client isomorphe se reconnecte avec `Last-Event-ID`, et sait envoyer un `POST` et des en-têtes         |
| **Des salons et leurs membres** | **Canaux à membres** : lister qui est là, abonner d'office, éjecter un compte, fermer le salon, sur toutes les instances. Un message privé atteint une personne par `publishToUser`                                       |
| **Décider qui entre**           | Une **règle d'admission** par canal (`allow`, fonction ou service injecté), sous le même pare-feu que le HTTP. Origine vérifiée à la poignée de main ; un jeton expiré ferme la socket avec un code dédié                 |
| **Faire passer des octets**     | **CBOR** (RFC 8949), négocié connexion par connexion — détaillé ci-dessous                                                                                                                                                |
| **Tenir à plusieurs instances** | Un bus de diffusion entre workers ou par Redis, messages scellés (HMAC-SHA256). Un seul producteur par canal et par processus, quel que soit le nombre d'abonnés                                                          |
| **Tenir la charge**             | Contre-pression en sortie, débit borné en entrée, cadence de diffusion qui s'adapte à chaque client                                                                                                                       |
| **Des types de bout en bout**   | Un **contrat** écrit une fois type le contrôleur, la socket et les hooks React, Vue, Svelte et Angular. Les routes qu'il annonce sont vérifiées au démarrage                                                              |
| **Voir et tester**              | Une sonde, la console d'administration, les onglets Socket et SSE de la barre de débogage, un traceur de trames ; une identité d'essai pour tester un canal protégé                                                       |
| **gRPC**                        | Des services gRPC servis par le même pipeline HTTP/2, déclarés depuis un module ; la réflexion et la santé standard sont à venir                                                                                          |

Chaque besoin a son exemple complet et testé : jeu (déplacements, recherche de partie), salon privé
sur invitation, sonde industrielle, tableau de bord partagé, notification privée, tâche d'agent.

### Le binaire, sans conversion

JSON reste le format par défaut. Dès que des octets circulent — image, son, mesures de capteur,
état d'une partie —, le serveur accepte **CBOR**, un JSON binaire. Nodefony embarque son propre
codec : isomorphe, sans dépendance, environ 6 Ko compressés, et téléchargé seulement par la page
qui l'importe. Il rend exactement ce que JSON rendrait, à une exception près : un `Uint8Array`
voyage en octets et revient en `Uint8Array`. Un message ordinaire pèse 30 à 45 % de moins, et 64 Ko
d'octets en occupent 65,6 au lieu des 87,4 du base64.

Le codec se **négocie connexion par connexion**. Le client qui l'offre parle CBOR ; celui qui ne
l'offre pas reste en texte et reçoit les mêmes données. Aucun client ne casse, et un canal suivi par
les deux sortes de connexions paie un encodage par codec, jamais un par abonné.

```ts
// nodefony.config.ts — le serveur accepte CBOR
use("@nodefony/realtime", { codec: "cbor" });
```

```ts
// navigateur — le client l'offre à l'ouverture
import { NodefonySocket } from "nodefony/client";
import { CBOR_FRAME_CODEC } from "nodefony/cbor";

const socket = NodefonySocket.shared({
  url: "/chat/realtime",
  codec: CBOR_FRAME_CODEC,
});
```

→ [La socket Nodefony](https://nodefony.net/docs/modules/realtime/) ·
[Les cas d'usage](https://nodefony.net/docs/modules/realtime/cas-d-usage/) ·
[Les flux SSE](https://nodefony.net/docs/modules/http/sse/) ·
[Le codec CBOR](https://nodefony.net/docs/modules/core/cbor/)

## L'IA : ton application, ouverte aux agents

**Un agent d'IA atteint une application par une porte standard : le Model Context Protocol
(MCP).** Il demande quels outils elle offre, reçoit pour chacun un nom, une description et un
schéma d'entrée, puis les appelle. `@nodefony/ai` donne cette porte à ton application et tient
le protocole à ta place — versions, erreurs, autorisation, progression, annulation. Tu écris
une fonction ; elle devient un outil, que Claude, ChatGPT, Copilot ou l'agent d'un client savent
appeler.

| Ce qu'il te faut                     | Ce que Nodefony fournit                                                                                                                                                                                   |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ouvrir une porte MCP**             | `npx nodefony create controller mcp --kind mcp` génère la porte, deux outils d'exemple et leur test. MCP révision `2026-07-28`, clients plus anciens acceptés                                             |
| **Suivre un outil long**             | Sur la même requête HTTP, la réponse passe en **flux SSE** : l'agent reçoit l'avancement (`notifications/progress`), puis le résultat — et peut annuler en route, l'outil s'arrête proprement             |
| **Servir un agent sans serveur**     | Le transport **stdio** : `npx nodefony ai:stdio`, pour une intégration continue ou un agent qui lance lui-même son serveur. Les mêmes outils, la même fonction                                            |
| **Ouvrir en production**             | `--expose oauth` : jeton exigé, serveur d'autorisation annoncé (RFC 9728), un scope par outil — un appelant ne voit que ce qu'il peut appeler. `--expose mixte` : des outils publics, les autres réservés |
| **Agir au nom de quelqu'un**         | `actsForUser` : l'outil s'exécute avec le compte de l'appelant, sous les mêmes règles qu'une route protégée                                                                                               |
| **Dire ce que fait l'outil**         | Chaque outil annonce s'il lit ou s'il modifie, pour que l'agent sache quand demander confirmation ; le test généré refuse un outil qui ne le dit pas                                                      |
| **Des outils dans chaque module**    | Un module déclare les siens par `getMcpTools()` ; une porte les ramasse tous, sans registre à tenir                                                                                                       |
| **Développer avec un agent de code** | `@nodefony/devkit` ouvre en développement la porte `/nodefony/mcp` : l'agent interroge l'application qui tourne — carte, santé, routes, trafic, profil d'une route — au lieu de deviner                   |

`@nodefony/ai` ne monte aucune route tant que tu n'ouvres pas de porte ; paquet **expérimental**, il suit la spécification MCP et peut évoluer en version mineure, toujours annoncé au journal des versions.

→ [Le module IA](https://nodefony.net/docs/modules/ai/) ·
[La boîte à outils MCP](https://nodefony.net/docs/modules/ai/mcp/)

## Démarrage

**Sur ton poste : Node 24.16+ ou 26+, et c'est tout** — npm vient avec lui (bun, pnpm et yarn
marchent aussi). Le reste est
facultatif : **mkcert** donne un HTTPS de développement que le navigateur approuve (sans lui, un
certificat auto-signé), **git** versionne le projet, et **Docker** construit l'image de production
depuis le `Dockerfile`.

```bash
npm install
npm run build
npm run dev
```

- `http://127.0.0.1:5151/` — ton application react, rechargée à chaud pendant que tu écris.
- `http://127.0.0.1:5151/nodefony` — **Studio**, la console d'administration.

> **Le compte d'administration existe déjà** : `admin` / `nodefony-dev-42`. Il
> est semé au PREMIER démarrage, et le journal te le redit alors en clair. Pour
> en changer, décommente `NF_ADMIN_PASSWORD` dans `.env`.
>
> 🔴 **Ce mot de passe par défaut n'existe qu'en développement.** En production,
> `NF_ADMIN_PASSWORD` est OBLIGATOIRE : sans elle, aucun compte n'est créé —
> rien n'est semé en silence avec un secret que le monde entier connaît. Le
> démarrage le dit et nomme le geste :
> `npx nodefony security:user:add admin --admin`.

> L'app **persiste déjà** : sans aucune base déclarée, l'ORM Drizzle crée une sqlite locale
> (`var/databases/`) — comptes, sessions et jetons survivent aux redémarrages.

## Ce que l'application contient — et ce qu'elle ne contient pas

Une application GÉNÉRIQUE : ce qui est ici, tu le gardes. Aucun exemple à
supprimer avant d'écrire ton premier controller.

- **Frontend react (Vite + HMR)** — http://127.0.0.1:5151/ — une page minimale, la tienne : le nom de l'application, la connexion, le compte connecté
- **Sécurité FERMÉE par défaut** — sans session, toute route sous `/api` répond 401 avant ton controller ; une route publique se DÉCLARE (`nodefony/config/security.ts`)
- **Connexion** — `/login`, servie par le framework ; zones `secure` (rôle exigé), `machine` (clé d'API) et `service` (jeton) prêtes, sans controller
- **Studio (console admin, dev)** — http://127.0.0.1:5151/nodefony — config, sessions, logs, routes
- **ORM + persistance** — Drizzle : sans `NF_DATABASE_URL`, sqlite locale automatique
- **Firewall + audit** — chaque requête traverse le pipeline sécurité (logs `audit`)
- **Redis (opt-in)** — `NF_REDIS_URL` présente ⇔ module chargé, stores basculent dessus
- **Probes cloud-native** — `curl http://127.0.0.1:5151/livez` (liveness k8s)

Ton premier controller : `npx nodefony create controller hello --kind hello`
génère **une route GET et une route WEBSOCKET dans la même classe** — même
pipeline, pas deux mondes séparés. `npx nodefony create --help` liste les
autres générateurs (REST, temps réel, MCP, entité, service, commande).

## Le framework se regarde tourner

`@nodefony/studio` est une console d'administration livrée avec le framework : topologie du runtime,
journaux en direct avec rejeu, suivi d'une requête de bout en bout par son identifiant, schéma de la
base, graphe des classes par module, gouvernance de la sécurité (audit, pare-feu, rôles, sessions,
clés d'API), et les générateurs de code pilotables à la souris, la sortie diffusée comme un terminal.

<img src="https://raw.githubusercontent.com/nodefony/nodefony-core/main/docs/assets/studio-supervision.png" alt="Supervision du runtime dans la console d'administration" width="100%">

Sa force est en dessous : **elle ne consomme aucune API privée.** Toutes ses données viennent d'un
plan de données JSON protégé par les mêmes règles d'accès que le reste, **auto-décrit** — un appel en
renvoie le catalogue — et **duplex** : le même point d'accès répond en HTTP et par la socket. Ce
qu'affiche la console, un script ou un agent peut le lire tel quel.

Le suivi d'une requête en est l'illustration la plus directe : chaque requête porte un identifiant
propagé dans tout le pipeline, et la console rejoue son trajet complet — phases, requêtes de base de
données, décisions du pare-feu.

<img src="https://raw.githubusercontent.com/nodefony/nodefony-core/main/docs/assets/studio-request.png" alt="Suivi d'une requête de bout en bout par son identifiant" width="100%">

## Structure du projet

- `nodefony.config.ts` — LA config de l'app : uniquement les ÉCARTS aux défauts du framework.
  Pour savoir ce qu'on a le droit d'y écrire : `npx nodefony inspect schema <module>` —
  chaque clé, son type, son défaut, sa valeur actuelle et ce qu'elle fait.
- `env.ts` — catalogue **typé** des variables d'environnement (seul lecteur de `process.env`, validé au boot)
- `.env` — TES valeurs de poste (clés de dev, URL de la base) — **jamais commité**. Sa notice,
  commitée, est `.env.example`. Un coéquipier qui clone : `cp .env.example .env`, décommente
  ce qu'il lui faut, puis `npx nodefony security:secrets --write` pour ses propres clés.
  En production, aucun fichier : l'orchestrateur ou le gestionnaire de secrets fournit tout.
- `index.ts` — point d'entrée : la classe `App` (module racine) + ses controllers + l'entry frontend (`registerEntry`)
- `nodefony/controllers/` — tes controllers (`@controller` + `@route`, HTTP **et** WS)
- `frontend/src/` — ton app react, servie par Vite (HMR dev, build prod)
- `tests/` — tests vitest : unitaires (`npm test`) + e2e réel (`npm run test:e2e`)
- `AGENTS.md` — instructions pour un agent IA, 100 % généré (régénéré par `create`) ; tes notes vivent dans sa zone préservée
- `compose.yaml` — infra de dev docker : Redis, Loki/Grafana (profil)
- `rolldown.config.ts` — build : 3 lignes, délègue tout au socle publié `nodefony/bundler`
- `.oxlintrc.json` — lint non-intrusif (warn) ; le style est délégué à Prettier
- `vitest.config.ts` — tests unitaires ; porte le bloc `oxc` décorateurs (OBLIGATOIRE, commenté)
- `vitest.e2e.config.ts` — tests e2e, config séparée : `npm test` ne montre que ce qu'il exécute
- `var/` — données locales (sqlite, logs fichiers), gitignoré

## Infra de développement (docker)

L'app démarre **sans docker** : la base est une **sqlite locale** (`var/databases/`),
retenue à la création. Le `compose.yaml` fournit le cran au-dessus :

```bash
npm run infra:up                          # Redis (sessions partagées, realtime multi-process)
docker compose --profile loki up -d       # + Loki + Grafana (logs centralisés)
npm run infra:down                        # arrêt (les volumes survivent)
```

### Éprouver la topologie de PRODUCTION — l'app derrière son frontal

En production ton application vit derrière un proxy, et c'est lui qui décide de
l'adresse cliente retenue, du protocole annoncé et du sort d'une WebSocket
silencieuse. Le profil `edge` monte cette topologie en local — l'application en
image, **sans aucun port publié**, et un frontal nginx devant :

```bash
npx nodefony http:certificates            # une fois — le certificat de développement
docker compose --profile edge up -d --build
curl -k https://localhost:8443/livez
```

La configuration du frontal n'est pas écrite : elle est **dérivée de ton
application** à la construction de l'image (`nodefony proxy:generate nginx`),
avec tes hôtes de confiance, tes fichiers statiques, ta taille de corps acceptée
et le battement de tes WebSockets. Tu changes l'application, tu reconstruis : la
configuration suit.

Rejouer ta suite de bout en bout **à travers le proxy**, sans la modifier :

```bash
NF_E2E_BASE_URL=https://localhost:8443 \
NODE_EXTRA_CA_CERTS=nodefony/config/certificates/ca/nodefony-root-ca.crt.pem \
  npm run test:e2e
```

> Le certificat est **monté**, jamais gravé dans l'image : une clé privée dans
> une image reste lisible par qui la télécharge, même effacée par une couche
> suivante. En production, c'est ton hébergeur ou ton ingress qui le fournit.

Câblage côté app — une variable, tout le reste se dérive (`store: "auto"`) :

```bash
NF_REDIS_URL="redis://:nodefony-dev@127.0.0.1:6379"   # dans .env
```

Pour passer sur une vraie base SQL : déclare `NF_DATABASE_URL`. Le dialecte est
déduit du **scheme de l'URL** (`postgres://`, `mysql://`, `sqlite:`) — changer de
base ne change **rien d'autre** dans l'app. Le service docker correspondant n'est
pas dans ce `compose.yaml` (une app y retient un seul dialecte) : ajoute-le, ou
recrée une app avec `nodefony create app <nom> --database postgres`.

## Tests — `npm test` est ton PREMIER diagnostic

```bash
npm test             # unitaires : l'app se CHARGE (imports, décorateurs, config) — < 1 s
npm run test:e2e     # build + boot RÉEL (production --detach --wait) + HTTP + WS + probes
```

**Réflexe** : quelque chose semble cassé → `npm test` AVANT de relire du code ou
de redémarrer. En une seconde il prouve que l'app s'importe, que les décorateurs
compilent et que la config valide — ou te donne le fichier exact qui casse.

Le rapport est **franc** : les e2e ont leur propre config (`vitest.e2e.config.ts`),
`npm test` n'affiche jamais de tests « skipped » qui semblent verts sans avoir
rien prouvé. Le test e2e utilise le lancement détaché natif du framework :
`--wait` ne rend la main que quand la readiness est sondée (aucun `sleep`
arbitraire), et `nodefony stop` arrête proprement. Le client WebSocket est le
`WebSocket` **natif** de Node — zéro dépendance de test.

## Qualité du code

```bash
npm run typecheck    # tsgo — le bundler ne type-check PAS : gate séparé, obligatoire
npm run doctor        # cohérence du projet : config, modules déclarés, wiring
npm run lint         # oxlint — garde-fous en warn, non-intrusif
npm run format       # prettier — le style, c'est lui qui décide
```

Le lint et le typecheck sont **deux gates distincts**, et c'est volontaire :
`tsgo` juge les TYPES, `oxlint` juge tout ce qu'un type ne dit pas — code mort,
promesse mal formée, import Node sans son préfixe. Aucun des deux ne remplace
l'autre.

`oxlint` s'appuie sur le même analyseur que le bundler (`rolldown`) : un seul
lecteur de ta syntaxe, donc aucun risque que l'un accepte ce que l'autre refuse.
Il n'a **pas** besoin du paquet `typescript` — celui-ci ne reste dans les
dépendances que pour ton éditeur.

Les règles sont dans `.oxlintrc.json`, commentées par leur intention. Deux
familles ne pardonnent pas : le code mort (il finit par mentir) et le préfixe
`node:` sur les modules du runtime (sans lui, un paquet npm homonyme peut prendre
la place d'un module natif). Le reste avertit sans bloquer.

## Quand ça casse

Dans l'ordre — chaque étape isole un étage, du moins cher au plus cher :

1. **`npm test`** — l'app se charge-t-elle ? Import cassé, décorateur, config
   invalide : le fichier fautif est nommé.
2. **`npm run typecheck`** — un vert vitest ne type-check RIEN (les types sont
   effacés à la transpilation) ; `tsgo` attrape ce que le build laisse passer.
3. **`npx nodefony status`** — un serveur tourne-t-il déjà ? (port occupé,
   vieux process détaché). `npx nodefony stop` arrête proprement. Si le port est
   tenu par une AUTRE application Nodefony, `status` la nomme :
   `npx nodefony stop <nom>` l'arrête sans changer de dossier.
4. **Rebuild** — comportement fantôme après un gros changement : `npm run build`
   puis relance (le serveur charge `dist/`, pas tes sources).

### `npm install` s'arrête sur « gyp ERR! find Python »

Ton manifeste porte ceci, et il faut l'y laisser :

```json
"allowScripts": { "better-sqlite3": false }
```

`better-sqlite3` (le pilote SQLite, tiré par `@nodefony/drizzle`) livre ses
binaires **déjà compilés** et demande à npm de ne pas le recompiler. npm oublie
cette demande dès qu'un `package-lock.json` existe — donc dès ton premier
`npm install` — et lance alors `node-gyp rebuild`, qui exige Python et un
compilateur C++ ([npm/cli#9837](https://github.com/npm/cli/issues/9837)). La
ligne ci-dessus le lui interdit explicitement, ce qu'il respecte dans toutes
les versions.

Si tu l'as retirée et que l'installation casse : remets-la, supprime
`node_modules`, relance `npm install`. Rien à compiler, SQLite fonctionne.

## Production (cloud-native)

```bash
npm run build        # backend (rolldown) + frontend (vite → public/dist, fingerprinté)
npm start            # nodefony production — bind 0.0.0.0, logs stdout, probes /livez /readyz
```

**Plusieurs processus.** Par défaut, un seul process Node par pod : la mise à
l'échelle est le travail de l'orchestrateur. Sur une machine dédiée, trois voies
règlent le nombre de workers, de la plus forte à la plus faible :
`npx nodefony production --workers <n|auto>` (ou `npx nodefony cluster`) >
`NF_WORKERS=<n|auto>` (déclarée dans `env.ts`) >
`nodefony/config/cluster/cluster.config.ts`. Ce fichier n'est **pas généré** : sa
valeur serait le défaut (`workers: 1`), et chaque application porterait un
fichier qui ne dit rien. Crée-le si la topologie doit vivre en git :

```ts
// nodefony/config/cluster/cluster.config.ts — lu par le maître AVANT le boot,
// donc sans le moindre import du kernel.
import type { IClusterConfig } from "nodefony";
export default { workers: "auto" } satisfies IClusterConfig;
```

`auto` = un worker par cœur **alloué** (quota cgroup du conteneur), jamais
`os.cpus()`. `npm run dev` ignore ce réglage : le développement est toujours
mono-process.

> Le front de production est un build Vite figé (`public/dist/`), servi en
> statics par Nodefony — `npm run build` le produit (il chaîne
> `nodefony frontend:build`). Si tu lances `npm start` sans build, le boot le
> construit une fois pour toi quand Vite est installé (poste de dev) et le DIT
> dans les logs ; dans une image de production sans devDependencies, builde à
> l'image — sinon la page est servie sans interface et le boot le signale en
> ERROR.

### Image de container

`Dockerfile` et `.dockerignore` sont générés avec l'app ; la doctrine y est
commentée ligne à ligne (multi-stage, `USER 1000:1000`, sonde sur `/readyz`,
forme exec du `CMD`).

```bash
docker build -t nodefony .
docker run -p 5151:5151 -v nodefony-var:/app/var nodefony
docker stop -t 20 <container>   # SIGTERM → drain → exit 0
```

> 🔴 **Le `-v` n'est pas optionnel si tu veux garder tes données.** L'app
> persiste par défaut en sqlite, dans `var/databases/` : sans volume, comptes,
> sessions, jetons et passkeys disparaissent au premier `docker rm`, **sans
> aucun message**. Le volume nommé les met hors du conteneur.
>
> Et tant que la base est sqlite, **une seule réplique** : c'est un fichier, pas
> un serveur. Deux conteneurs sur le même volume se corrompent mutuellement ;
> deux conteneurs sur deux volumes travaillent sur deux bases divergentes, ce
> que rien ne signale. Pour répliquer, passer à PostgreSQL ou MySQL — il suffit
> de poser `NF_DATABASE_URL`, l'ORM déduit le dialecte du scheme et rien d'autre
> ne change dans l'app.

> ⚠️ **La période de grâce doit rester au-dessus de `shutdownDeadline`** (15 s
> par défaut) : `docker stop` n'attend que 10 s sans `-t`, et k8s 30 s. En
> dessous, le drain est coupé par un SIGKILL et les requêtes en vol meurent —
> sans erreur ni trace, à chaque déploiement.

Le code de l'image appartient à `root` et le processus tourne en `1000:1000` :
l'application ne peut pas réécrire son propre `dist/`. Seuls `tmp/` et `var/`
lui appartiennent, ce qui est exactement ce dont elle a besoin pour écrire.

#### Sur quelle base l'image est construite

`gcr.io/distroless/nodejs24-debian13`, et c'est un choix **mesuré** — quatre candidates
construites avec un contenu identique, scannées, puis **démarrées** :

| Base                                                       | Image finale | Critiques | Hautes | Node                      | libc  | Shell dedans |
| ---------------------------------------------------------- | -----------: | --------: | -----: | ------------------------- | ----- | ------------ |
| **`gcr.io/distroless/nodejs24-debian13`**                  |   **416 Mo** |     **0** |  **0** | 24.22.2                   | glibc | **non**      |
| `node:24-alpine`                                           |       444 Mo |         1 |      7 | 24.22.2                   | musl  | oui (`sh`)   |
| `node:24-slim`                                             |       531 Mo |         0 |     13 | 24.22.2                   | glibc | oui (`bash`) |
| `gcr.io/distroless/nodejs24-debian12` — **ne démarre pas** |       404 Mo |         4 |     33 | 24.14.0, sous le plancher | glibc | **non**      |

Distroless ne porte que Node et les bibliothèques dont il a besoin : ni shell, ni gestionnaire de
paquets, ni npm. Les failles d'Alpine viennent de paquets que ton application n'emploie pas — zlib
et musl, que seule une nouvelle image Alpine corrige, et le npm qu'elle embarque. `debian12`, elle,
est restée figée en Node 24.14.0, sous le plancher du framework : elle se construit, puis ne démarre
pas.

**Ce que tu y perds**, et c'est le prix de ce zéro : pas de `docker exec … sh` pour diagnostiquer
(l'étiquette `:debug` de distroless ajoute un shell, le temps d'un diagnostic), pas de
`RUN apk add` dans l'image finale, et `node` n'est pas sur le PATH. Tout passe donc par Node
lui-même :

```bash
docker exec <conteneur> /nodejs/bin/node node_modules/nodefony/bin/nodefony orm:migrate:status
```

Pour la même raison, un lanceur qui change la commande la passe en **arguments** : `args:` en
Kubernetes (jamais `command:`, qui remplacerait le Node d'entrée de l'image), `command:` dans
compose, qui ne touche que les arguments.

**Pour en changer — sans retoucher le `Dockerfile`**, qui reste ainsi celui que le framework
sait mettre à jour. Les deux bases sont des arguments de construction : `NODE_IMAGE` (construction)
et `RUNTIME_IMAGE` (exécution). Un registre interne ou une autre ligne de Node passent par
`--build-arg` ; les deux bases bougent **ensemble**, sur la même libc (les modules natifs sont
compilés pour celle de l'étage de construction, et le symptôme d'un mélange est au DÉMARRAGE, pas
à l'installation).

Pour un **outil système** (ffmpeg, ImageMagick…), une seconde fin du même fichier part de
`NODE_IMAGE`, avec un gestionnaire de paquets — au prix de la surface d'attaque mesurée plus haut :

```bash
docker build --target with-packages --build-arg PACKAGES="ffmpeg" -t mon-app .
docker build --target with-packages --build-arg NODE_IMAGE=node:24-alpine -t mon-app .   # Alpine
```

Même contrat que la fin par défaut — utilisateur 1000, `/readyz`, même `CMD`, et `node` au même
chemin `/nodejs/bin/node` : toutes les commandes de cette page servent les deux fins. Compose et la
CI générés y conduisent sans retouche, par des variables : `NF_IMAGE_TARGET=with-packages` et
`NF_IMAGE_PACKAGES`, plus `NF_IMAGE_NODE` / `NF_IMAGE_RUNTIME` pour changer de base (l'environnement
ou le `.env` pour compose, les variables du dépôt pour la CI — à poser AUX DEUX endroits, sinon la CI
éprouve une autre image que la tienne). Des paquets demandés sans `with-packages` arrêtent la
construction en le disant, au lieu d'être ignorés.

Un serveur ARM (AWS Graviton, Raspberry Pi 4/5 en 64 bits, nœuds Kubernetes ARM) ? Pose la
variable du dépôt `NF_IMAGE_PLATFORMS=linux/amd64,linux/arm64` : la CI construit et contrôle
aussi l'image arm64, et la chaîne de production la démarre et l'arrête — chacune sur un runner
ARM **natif** (`ubuntu-24.04-arm` sur GitHub, `saas-linux-small-arm64` sur GitLab.com ; un
runner auto-hébergé se désigne par `NF_IMAGE_ARM64_RUNNER` ou `NF_IMAGE_ARM64_RUNNER_TAG`).
C'est là que cassent les modules natifs, au démarrage et jamais à l'installation. Sans la
variable, rien ne change ; une valeur inconnue arrête la CI en la nommant.

#### Si tu PUBLIES cette image

L'image emporte `node_modules` élagué : la **publier** — sur un registre public,
ou en la livrant à un tiers — te rend distributeur du code de tes dépendances.
MIT, BSD, ISC et Apache-2.0 demandent alors que leur texte et leur copyright
accompagnent le code. C'est déjà le cas matériellement : chaque paquet porte son
propre fichier de licence dans `node_modules`, et l'image les emporte avec lui.

Ce qui manque, c'est l'inventaire — npm le produit sans rien installer :

```bash
npm sbom --sbom-format spdx --omit=dev > sbom.spdx.json
```

> Un **déploiement interne** (ton propre registre, ton cluster) n'est pas une
> distribution : ces obligations ne s'y appliquent pas. Et un inventaire écrit à
> la main serait faux dès le premier `npm install` — c'est pourquoi il se
> régénère plutôt qu'il ne se commite.

Un process Node = un pod/container ; le scaling horizontal vient de
l'orchestrateur (k8s, Swarm, Cloud Run…). Studio est chargé en dev seulement
(`policy: "dev"`) — pour l'exposer en production, protège `/nodefony` par une
zone firewall puis passe la policy à `"mandatory"` (la recette est commentée
dans `nodefony.config.ts`).

## Développer le framework lui-même

Si cette app a été générée avec `--link`, les dépendances `nodefony`/`@nodefony/*`
pointent en `file:` vers un checkout local de `nodefony-core` : tu modifies le
framework, tu rebuilds le checkout, ton app le voit. Ne publie pas ce
`package.json` tel quel — après la release npm, régénère sans `--link`
(versions `^10.0.0`).

## Où aller ensuite

- **Ajouter une route** : une méthode décorée `@route` dans un controller — c'est tout.
- **Un état propre à chaque requête** : chaque requête a son propre conteneur de services
  (un scope, posé comme un calque sur celui de l'application et jeté à la fin — en WebSocket,
  à la fin de la connexion). `RequestContext.getScope()` le rend depuis n'importe quel code de
  la requête ; `@injectable({ name: "tenant", scope: "request" })` y crée un service par
  requête, nettoyé (`clean()`) à sa fermeture — son constructeur reçoit le scope :
  `super("tenant", scope, false)`. Détail : `node_modules/nodefony/docs/service.md`.
- **Régler un module sans deviner** : `npx nodefony inspect schema <module>` liste les clés
  configurables avec leur description ; `npx nodefony inspect config` montre ce qui est
  posé aujourd'hui et d'où ça vient. Une clé inconnue est REFUSÉE au démarrage, en la nommant.
- **Régénérer autrement** : `nodefony create app` (interactif) ou
  `--preset <complete|minimal> --frontend <none|react|vue|angular|svelte>`
  `--database <sqlite|postgres|mariadb|mysql>` (scriptable).
- **Protéger une zone** : `use("@nodefony/security", { firewalls: { … } })` dans
  `nodefony.config.ts` (validée Zod au boot, config invalide = échec franc).
- **Canaux temps réel** : le module realtime multiplexe N canaux duplex sur une
  seule socket — voir la doc du framework.
- **Studio** est ta carte du territoire : modules chargés, routes, config
  résolue, sessions, logs — tout ce que le framework sait, il te le montre.
