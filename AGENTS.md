# AGENTS.md — nodefony

<!-- nodefony:start -->

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
> 🔴 **Charge le skill `nodefony-dev` AVANT ta première modification**, quelle
> que soit la tâche : il porte la conduite complète et dit quel skill
> spécialisé prendre. Et sache ceci dès maintenant — **la référence est
> INSTALLÉE, mais `rg` ne descend pas dans `node_modules`** : 70 pages
> paraissent absentes. Une commande les lit, avec la ligne exacte :
> `node node_modules/@nodefony/devkit/skills/nodefony-dev/scripts/docs.mjs <termes>`.
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
| Frontend Vite — page, formulaire de connexion et temps réel LIVRÉS                                      | `npx nodefony create front <nom> --frontend <react\|vue\|angular\|svelte> [--module <m>]`        |
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

## Vérités du framework (anti-préjugés — ce que tu crois savoir est faux ici)

- **Le cœur `nodefony` est ISOMORPHE** : le même paquet se charge côté Node
  ET navigateur. La porte client EXPLICITE est le subpath `nodefony/client`
  (`RealtimeClient`, notices, rôles — résolu à l'identique par Vite, Node et
  le typecheck), et le moteur front de CE projet a la sienne :
  `nodefony/react`. Ne réécris
  JAMAIS un client WebSocket/JSON-RPC, ne duplique JAMAIS un type entre front
  et back : un seul contrat, vérifié par le compilateur des deux bouts.

- **Le geste concret avec `nodefony/react`** — les hooks React du
  paquet `nodefony`, résolus à l'identique par Vite, Node et le typecheck. Le
  fournisseur est monté une fois ; un composant s'abonne ensuite sans jamais
  toucher à la socket, et l'abonnement se libère au démontage :

```tsx
// frontend/src/App.tsx — ce que l'écran d'accueil généré fait déjà
import { NodefonyProvider, useNodefonyChannelData } from "nodefony/react";

function Live() {
  const last = useNodefonyChannelData<{ message: string }>("live:events");
  return <p>{last?.message ?? "en attente…"}</p>;
}

export function App() {
  return (
    <NodefonyProvider url="/api/live/realtime">
      <Live />
    </NodefonyProvider>
  );
}
```

Les autres hooks (`useNodefony`, `useNodefonyState`, `useNodefonyIdentity`,
`useNodefonyChannel`), le comptage de références et les notices :
`node_modules/nodefony/docs/react-hooks.md`.

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

- **Le container DI est PROTOTYPAL** : les services vivent sur une chaîne de
  prototypes — un scope de requête VOIT tous les services du kernel sans
  aucune copie (coût d'un scope ≈ un `Object.create`), et ce qu'on `set()`
  dans un scope MEURT avec la requête. Ne fabrique donc ni cache de services
  par requête, ni singleton maison : `container.get("<nom>")` remonte la
  chaîne, c'est le mécanisme.

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

**Avant de chercher, demande.** `npx nodefony doctor` (ou `npm run doctor`) LIT ton
app sans rien en exécuter — donc il répond même quand elle ne démarre plus — depuis
n'importe quel sous-dossier, et `--json` le rend exploitable par un script. `check`
en est un alias historique ; le nom à retenir est `doctor`.

Il imprime lui-même ses familles de contrôles, ce qu'il n'a **pas** contrôlé et le
geste à taper ensuite : ne paraphrase pas sa sortie, lis-la. Trois choses qu'elle ne
peut pas t'apprendre d'avance :

- il ne montre un contrôle **que s'il a quelque chose à en dire** — sur une app saine,
  « Câblage » tient en une ligne et ne détaille rien ;
- il nomme la **classe écrite que rien ne déclare** (entité hors `@entities([…])`,
  controller hors `@controllers([…])`) : elle compile, ses tests passent, et la panne
  n'arrive qu'au démarrage suivant — table jamais créée, route en 404. C'est le mode
  d'échec de la COPIE, celui qu'on fait en recopiant le voisin au lieu d'appeler le
  générateur ;
- il relit le bilan du **dernier démarrage** (`var/last-boot.json`), seule façon
  d'apprendre APRÈS COUP qu'une app a démarré **amputée** — base injoignable, module
  écarté par sa `policy`. Tout a l'air sain, et une brique manque.

`--live` ajoute ce qui exige une app qui tourne (migrations, cohérence du firewall,
écart avec l'environnement visé) ; `--deep` LANCE les gardes du projet et interroge
le registre npm. Sans eux, ces lignes sortent en « non demandé » — pas en « bon ».

## Voir un écran toi-même — un navigateur, pas un `curl`

Un `curl` prouve qu'une route répond ; il ne dit pas si l'écran **se monte**. Le
devkit porte des sondes prêtes à l'emploi :

```bash
npm run see:setup
node node_modules/@nodefony/devkit/skills/nodefony-browser/scripts/inspect.mjs /
```

Tu obtiens un JSON : le titre, la langue, le thème, les **scripts réellement servis**,
les erreurs de console, une capture horodatée — et surtout des **mesures** qu'aucune
capture ne donne : la couleur, le fond effectif, le **contraste calculé** et la taille
de chaque élément que tu sondes (`NF_BROWSER_PROBES`). C'est la différence entre « ça
me paraît lisible » et « 7,39:1, donc AAA ».

À côté : `watch.mjs` regarde le temps qui coule plutôt qu'un instant (frames WebSocket
horodatées, réponses ≥ 400, reconnexions en boucle), `socket.mjs` pilote le socket
depuis la page avec ses cookies, et Lighthouse s'exécute **sur une page authentifiée**
— ce que l'extension du navigateur ne sait pas faire :

```bash
npm run audit:setup
npm run audit:web -- /tableau-de-bord
```

🔴 **Le mode d'emploi est le skill `nodefony-browser`**, installé avec le devkit et
pointé dans `.agents/skills/` par `ai:sync`. Charge-le AVANT de conclure quoi que ce
soit d'un écran : il porte le décor en conteneur, les variables de chaque sonde, et
les pièges qui font conclure FAUX — mesurer avant que l'écran soit peuplé, viser le
mauvais hôte, juger la performance sur un serveur de développement, et observer un
bundle qui n'est pas celui que tu as bâti.

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

## Annexes — ouvre la page quand SA situation est la tienne

Ces pages vivent dans `agents/nodefony/`. **Elles ne se chargent pas toutes
seules** : aucun outil ne les lit d'office, c'est à toi d'ouvrir celle dont la
ligne ci-dessous décrit ta situation MAINTENANT. Le dossier appartient au
framework et se régénère en bloc — n'y écris rien, tes notes vont plus bas.

- **tu ne sais pas quoi lire avant de coder une tâche précise** →
  `agents/nodefony/avant-de-coder.md`
- **quelque chose ne marche pas et le message ne suffit pas** →
  `agents/nodefony/depannage.md`
- **tu veux l'état RÉEL de l'app** — routes, services, configuration — au lieu
  de le déduire du code → `agents/nodefony/inspecter-l-app.md`
- **tu cherches quelle commande lancer** → `agents/nodefony/commandes.md`
- **tu vas lire ou écrire une variable d'environnement** →
  `agents/nodefony/variables-d-environnement.md`
- **tu dois démarrer, arrêter ou redémarrer le serveur** →
  `agents/nodefony/lancer-le-serveur.md`
- **tu touches aux entités, au stockage, ou au service d'un fichier** →
  `agents/nodefony/donnees-et-fichiers.md`
- **tu touches à l'authentification, aux droits, au CSRF ou aux comptes** →
  `agents/nodefony/securite-et-droits.md`
- **tu touches au temps réel** — WebSocket, canaux, diffusion →
  `agents/nodefony/temps-reel.md`

<!-- nodefony:end -->

## Notes de cette app

Cette section — et tout ce qui suit le marqueur ci-dessus — **t'appartient**.
Nodefony ne la réécrit jamais : il ne régénère que le bloc délimité plus haut et
le dossier `agents/nodefony/`. Accumule ici les conventions de l'équipe, les
décisions de domaine et les leçons propres à ce projet.
