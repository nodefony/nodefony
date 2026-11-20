# AGENTS.md — @nodefony/demo

> Instructions agent de CE module. Standard AGENTS.md : **le fichier le plus
> proche gagne** — quand tu travailles dans ce dossier, il prime sur celui de
> l'app. Vérité COURANTE, jamais un journal : un fait périmé se CORRIGE.

## Rôle

La démo de Nodefony : ce que le framework sait faire, dans du code qui tourne,
servi sous `/demo` (pages ET API). Chaque fichier est écrit comme un MODÈLE à
recopier, pas comme un test : son TSDoc nomme le type à utiliser, la page de
doc, la commande qui génère l'équivalent et le skill à charger.

## Trouver la bonne démo — avant d'ouvrir un fichier

**`demos.ts` est l'index, et la source unique** : pour chaque démo, son niveau,
ce qu'elle apprend, les fichiers à lire DANS L'ORDRE, les types publics, la doc
(sous `node_modules`), la commande et le skill. L'accueil `/demo` en tire son
catalogue ; il n'existe aucun JSON parallèle.

Le test du module vérifie chaque renvoi de l'index (fichier présent, page de
doc installée, type exporté par son paquet, commande existante, skill livré) :
un renvoi mort le fait échouer.

## Composants

- `index.ts` — `DemoModule` : enregistre contrôleurs, services, commande et
  l'entrée front `demo`.
- `nodefony/controllers/` — une démo = un contrôleur sous `/demo/…` :
  `FirstStepsController` (`/demo/api/first`, les gestes de base d'un contrôleur :
  rendre, rediriger, valider, flux, fichier, `Response` Web, même action en
  WebSocket — le point de départ d'un débutant),
  `SseController` (`/demo/api/sse`, les flux d'événements serveur : nommés et
  typés, reprise par `Last-Event-ID`, battement, négociation, `POST` en flux),
  `VideoController` (`/demo/api/media`, les vidéos du dossier `media/` servies
  par plages : `Range`, 206, 416, `If-Range` — `sample.mp4` y est posée à la
  création, une vidéo qu'on y dépose est servie pareil),
  `UploadController` (`/demo/api/upload`, les fichiers reçus en flux jusqu'au
  disque : bornes propres à la route, empreinte `Repr-Digest`, type reconnu
  aux octets, corps brut — rangés sur le compte par `UploadService`),
  `BinaryController` (`/demo/api/binary/realtime`, des octets sur une socket
  dédiée : vibrations Int16, positions Float32, empreinte d'un envoi — la
  config de la démo passe le serveur en `codec: "cbor"` et relève
  `maxPayload` à 2 Mio, `nodefony/config/config.ts`),
  `ChatController` (HTTP + socket, `ContractRealtimeController`),
  `DemoMcpController` (`/mcp/demo`, la porte MCP de la démo : une route, tout
  le protocole dans la porte que définit `DemoMcpService` avec `defineMcpGate`
  de `@nodefony/ai` ; outils dans `nodefony/mcp/demoTools.ts`),
  `McpTokenController` (`/demo/api/mcp/token`, le RACCOURCI qui remet un jeton
  au visiteur connecté — un vrai agent suit la chaîne RFC 9728 → RFC 8414),
  `PartnerController` (`/demo/api/partner`, zone `demo-partner` du firewall),
  `MeteorController` et `PrismController` (`/demo/api/meteor/realtime`,
  `/demo/api/prism/realtime` : deux jeux, deux portes chacun — le canal
  d'état et la commande du joueur), `SensorController`
  (`/demo/api/sensor/realtime` : la sonde, un canal CADENCÉ
  `sensor:plant:<ms>` par surcharge de `createRealtimeChannel`, quatre canaux
  de laboratoire ; lire est public, acquitter et régler la source exigent une
  session), les pages et l'accueil.
- `nodefony/kit/fixedStep.ts` — la boucle à pas fixe sur `hrtime`, partagée par
  tout ce qui tourne à cadence régulière (les jeux, l'acquisition de la sonde).
- `nodefony/kit/rateLimit.ts` — le quota par fenêtre fixe et par clé (compte,
  sinon adresse) : `take` rend les secondes à attendre, le contrôleur en fait un
  429 + `Retry-After`. Partagé par les aperçus de liens et les écritures du chat.
- `frontend/src/kit/records.ts` — enregistrements binaires décrits par schéma
  (`u8`, `u16`, `u32`, `i16`, `f32`), ISOMORPHES : le serveur écrit, la page
  lit. Servent aux jeux et à la sonde.
- `nodefony/game/GameRoom.ts` — la salle commune aux jeux, à réutiliser pour un
  jeu neuf : pilotes identifiés par leur CONNEXION, robots qui complètent,
  boucle tant que quelqu'un regarde, trame publiée à chaque tour. Un jeu
  n'écrit que ses `IGameRules` : `MeteorService.ts`, `PrismService.ts`.
- `nodefony/sensor/` — les simulations de la sonde, PURES et testées : usine
  et réduction par fenêtre (`plant.ts`), moyenne glissante et alarmes ISA-18.2
  (`alarms.ts`), source gamma avec temps mort (`gamma.ts`), cryostat à
  dilution (`cryostat.ts`), test de Bell et qubit (`quantum.ts`). Les données
  sont SIMULÉES ; Nodefony supervise, il ne commande aucun verrouillage.
- `frontend/src/sensor/` — le contrat de la sonde (`sensorDemo.ts`), son
  client (`sensorClient.ts`, AIMD par `socket.adaptiveChannel()`), les calculs
  isomorphes (`sensorStats.ts` : CHSH, vecteur de Bloch), les figures
  (`SensorCharts.tsx`, `BlochView.tsx` — Three.js chargé à la demande).
- `frontend/src/game/` — les briques PAGE communes aux jeux : socket (`gameSocket.ts`), interpolation entre deux trames
  (`snapshots.ts`), envoi des commandes (`commandSender.ts`), boucle
  d'affichage (`useGameLoop.ts`), fil mesuré (`wireMeter.ts`, `WireHud.tsx`),
  mise en page (`GamePage.tsx`). Un jeu n'écrit que son contrat, son client,
  son écran et sa scène (`meteor/`, `prism/` — Three.js chargé à la demande).
- `nodefony/service/` — l'état qui survit à une connexion (`ChatService`),
  le pouls de l'accueil (`DemoPulseService`, canal `demo:pulse`), la porte MCP
  et son fil en direct (`DemoMcpService`, canal `demo:mcp`), la salle de
  chaque jeu (`MeteorService`, `PrismService`), la sonde (`SensorService` :
  une boucle à 50 Hz qui ne tourne que tant qu'un écran regarde).
- `nodefony/config/security.ts` — les zones qu'apporte la démo :
  `demo` (session, puis anonyme), `demo-partner` (jeton, `^/demo/api/partner`)
  et `demo-mcp` (la RESSOURCE de la porte MCP, `^/mcp/demo$` : rendue absolue
  contre `jwt.issuer`, elle n'authentifie personne) ; et `grantableScopes`
  (`demo:write` réservé à `ROLE_ADMIN`).
- `nodefony/command/PartnerCallCommand.ts` — `npx nodefony demo:partner:call`.
- `frontend/src/` — React, un seul front. Les types de messages sont PARTAGÉS
  avec le serveur (`chat/chatContract.ts`, `chat/chatSchemas.ts`).
- `frontend/src/kit/` — les briques PARTAGÉES par les démos, à réutiliser
  plutôt que recopier : l'éditeur Markdown (`MarkdownEditor.tsx`), son rendu
  (`MarkdownText.tsx`, `markdown.ts`), l'aperçu d'un fichier d'après ses
  octets (`preview.ts`, ISOMORPHE : le navigateur avant l'envoi, le serveur à
  la réception) et ses boîtes (`FilePreview.tsx`), le compte de la barre du
  haut (`Account.tsx`), la sonde qui appelle une route depuis la page et
  montre statut, en-têtes, flux, trames et événements SSE (`probe.ts`,
  `ProbeResult.tsx`), la mise en page des leçons à gestes — carte en haut, un
  geste à l'écran (`StepsLesson.tsx`).
- Leçons à gestes — chaque geste cite le contrôleur ET le code CLIENT qui
  tourne (`first/firstClient.ts`, `sse/sseClient.ts`, `binary/binaryClient.ts`, `mcp/mcpClient.ts`, régions
  `// #region client-*`) : la page prépare la requête ou ouvre le flux, la
  sonde ne fait qu'envoyer et écouter. Un visuel dit ce que la réponse veut
  dire (`first/FirstVisuals.tsx` : l'aller-retour ; `sse/SseVisuals.tsx` :
  la frise du flux ; `video/VideoVisuals.tsx` : la carte du fichier ;
  `binary/BinaryVisuals.tsx` : tailles, débits et temps MESURÉS sur le fil par
  `probeRealtime`) ; leur lecture vit dans un module pur, testé (`exchange.ts`,
  `sseTimeline.ts`, `fileMap.ts`, `wire.ts`).

## Les extraits de code des pages

Une page d'apprentissage ne recopie jamais de code : elle CITE des régions
`// #region <nom>` … `// #endregion` des vrais fichiers
(`frontend/src/chat/chatTabs.ts`, `frontend/src/partner/partnerTabs.ts` ;
mécanisme commun dans `frontend/src/lesson/`), lus par Vite au build. Renommer ou vider
une région citée fait échouer le test du module — mettre à jour la liste dans
le même geste.

## Ajouter une démo

1. Une entrée dans `DEMOS` (`demos.ts`), `status: "soon"` tant qu'elle n'a pas
   de page — la carte s'affiche grisée « Démo à venir ».
2. Son contrôleur sous `/demo/<id>` : `npx nodefony create controller <nom>
--module @nodefony/demo` (ajouter `--kind realtime` pour une socket).
3. Sa page, sur le gabarit commun (`frontend/src/lesson/LessonCode.tsx`) :
   ses onglets PAR COUCHE (`ILesson` de `frontend/src/lesson/lesson.ts` —
   config, sécurité, contrôleur, service, données, commande, front, devops,
   dans cet ordre, seulement ceux où la démo a du code), chacun en paragraphes
   qui suivent la logique métier, chaque paragraphe suivi de la région qu'il
   explique ; TOUS les décorateurs des fichiers cités, expliqués en une ligne.
   Ajouter la démo à `LESSONS` dans `tests/demo.test.ts`.
4. Puis `status: "ready"`, `path`, `files`, `types`, `doc`, `command`,
   `skill` dans `demos.ts` — le test vérifie aussitôt chaque renvoi.

## Décisions figées

- **Préfixe `/demo`** pour tout : aucune zone de l'application n'est touchée,
  et retirer la démo = supprimer ce dossier + sa ligne du manifeste.
- **La démo ne part pas en production** (`policy: "dev"` au manifeste).
  Ses suites de bout en bout se décrivent donc par `demoDescribe`
  (`tests/realtimeHarness.ts`), jamais par `describe` : jouée contre un
  déploiement (`NF_E2E_BASE_URL`), la suite les SAUTE au lieu de démarrer un
  exemplaire à côté.
- **Lire est libre, écrire exige une session** ; l'auteur d'un message vient
  de `this.user`, jamais d'un champ envoyé par le client.
- **Aucun secret dans la page** : ni mot de passe de développement, ni lien
  vers la console d'administration, ni version du serveur.

## Interdits sans accord

- Modifier `rolldown.config.ts` / `tsconfig.json`.
- Ajouter une dépendance npm runtime sans en peser le coût.
- Allouer par requête ce qui ne sert qu'à une minorité de requêtes, ou
  attacher un écouteur sans prévoir son retrait.
