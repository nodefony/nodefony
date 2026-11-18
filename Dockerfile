# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Image de nodefony — Nodefony, doctrine cloud-native.
#
# 1 process = 1 container. La montée en charge se fait par RÉPLIQUES de
# l'orchestrateur (k8s, Swarm, Nomad, Cloud Run, Fargate), jamais par un
# gestionnaire de process dans l'image.
#
# Le container DIALOGUE avec l'orchestrateur par SIGTERM (`docker stop`,
# éviction k8s) : le framework draine — `/readyz` passe en 503, les sockets
# ferment en 1001, les requêtes en vol vont à leur terme, puis exit 0 — sous
# `shutdownDeadline` (15 s par défaut). Garder la période de grâce AU-DESSUS :
# k8s donne 30 s, `docker stop` 10 s (`-t 20` pour être large).
# ─────────────────────────────────────────────────────────────────────────────

# ── La BASE de l'image — un choix MESURÉ, et comment en changer ──────────────
#
# Deux lignes `FROM` décident de tout : la libc, la surface de vulnérabilités,
# le poids, et ce que `docker exec` te donnera le jour où il faudra entrer
# dedans. Elles se changent ENSEMBLE — l'étage de construction et l'étage
# d'exécution doivent partager la MÊME libc, sinon un binaire natif installé
# d'un côté ne se charge pas de l'autre, et le message ne parle pas de libc.
#
# Mesuré sur une application Nodefony `complete`, contenu identique, sur les
# images FINALES (`docker scout quickview`), pas sur les bases seules. Le banc
# se rejoue : skill `nodefony-devops`, `scripts/bench-bases.mjs`.
#
#     base                                      poids   critiques  hautes  Node     démarre
#     gcr.io/distroless/nodejs24-debian13 ← ICI  416 Mo      0        0    24.22.2  oui
#     node:24-alpine                             444 Mo      1        7    24.22.2  oui
#     node:24-slim                               531 Mo      0       13    24.22.2  oui
#     gcr.io/distroless/nodejs24-debian12        404 Mo      4       33    24.14.0  NON
#
# POURQUOI distroless `debian13`. Aucune vulnérabilité critique ni haute :
# l'image ne porte que Node et les bibliothèques dont il a besoin — ni shell, ni
# gestionnaire de paquets, ni npm. Celles d'Alpine viennent de paquets que ton
# application n'emploie pas : zlib et musl (le système, que seule une nouvelle
# image Alpine corrige) et le npm embarqué (undici, tar, brace-expansion),
# inutile une fois les dépendances installées. `debian13` suit la ligne
# courante de Node 24 ; `debian12` est restée figée en Node 24.14.0, sous le
# plancher du framework (`engines`) — elle se construit, puis meurt au
# démarrage sur une API de `node:crypto` que son Node n'a pas.
#
# CE QU'ON Y PERD, et c'est le prix de ce zéro : pas de `docker exec … sh` pour
# diagnostiquer (l'étiquette `:debug` de distroless ajoute un shell busybox, le
# temps d'un diagnostic seulement), et pas de gestionnaire de paquets dans
# l'image finale. Un outil système (ffmpeg, ImageMagick…) passe par l'AUTRE
# fin de ce fichier, `with-packages`, décrite plus bas.
#
# Les modules natifs (`better-sqlite3`, `@node-rs/argon2`) sont compilés pour la
# libc de l'étage de construction : il est donc en `node:24-slim` (glibc), comme
# l'image finale. Un étage Alpine (musl) produirait des `.node` qui ne se
# chargent pas — au DÉMARRAGE, jamais à l'installation.
#
# COMMENT EN CHANGER — SANS toucher à ce fichier. Les deux bases sont des
# arguments de construction, et ce fichier reste ainsi celui que le framework
# sait mettre à jour (une copie retouchée ne se met plus à jour) :
#
#   NODE_IMAGE     image Node AVEC shell — construction, et fin `with-packages`
#   RUNTIME_IMAGE  image d'exécution de la fin par défaut (distroless)
#
# Leur DÉFAUT est écrit dans le `FROM` (`${NODE_IMAGE:-…}`), pas dans l'`ARG` :
# compose et la CI relaient toujours la variable, souvent VIDE, et un `ARG`
# vide écraserait son défaut — `FROM ""` ne construit rien. Compose et la CI
# les lisent dans `NF_IMAGE_NODE` et `NF_IMAGE_RUNTIME`.
#
#   # un registre interne, qui sert les mêmes images sous son propre nom
#   docker build --build-arg NODE_IMAGE=registre.interne/node:24-slim \
#                --build-arg RUNTIME_IMAGE=registre.interne/distroless/nodejs24-debian13 .
#
#   # une autre ligne de Node : les DEUX bases bougent ensemble, et la libc
#   # reste la même des deux côtés (glibc : `-slim` et distroless)
#   docker build --build-arg NODE_IMAGE=node:26-slim \
#                --build-arg RUNTIME_IMAGE=gcr.io/distroless/nodejs26-debian13 .
#
#   # Alpine, ou slim, comme image FINALE : c'est la fin `with-packages`, qui
#   # part de `NODE_IMAGE` — construction et exécution sur la MÊME base
#   docker build --target with-packages --build-arg NODE_IMAGE=node:24-alpine .
#
# Après tout changement de base : reconstruire, DÉMARRER, et vérifier que
# l'application répond — « ça construit » ne prouve rien (vécu : `debian12` se
# construisait, et mourait au démarrage sur un Node sous le plancher `engines`).
# ─────────────────────────────────────────────────────────────────────────────
ARG NODE_IMAGE
ARG RUNTIME_IMAGE

# ── Étape de construction : la chaîne de compilation ne descend PAS en prod ───
FROM ${NODE_IMAGE:-node:24-slim} AS build
WORKDIR /app

# Les sources d'ABORD, en un seul geste — et non le manifeste seul comme le
# veut l'usage. Une dépendance d'application Nodefony peut être LOCALE : les
# workspaces `modules/*` que pose `nodefony create module`, ou une archive
# `file:` avant publication. Installer avant de les avoir copiées échouerait
# sur elles. Ce qui ne doit pas entrer est listé dans `.dockerignore` — c'est
# lui qui tient les secrets (`.env`) et le `dist/` de la machine dehors.
COPY . ./

# Le cache npm est monté plutôt que gravé : la couche est invalidée dès qu'une
# source change, mais les paquets déjà téléchargés ne le sont pas. On garde
# donc une installation VIERGE, sans la repayer en réseau à chaque build.
#
# 🔴 `--ignore-scripts` n'est PAS une précaution de confort — sans lui, cette
# image ne se construit pas dès que le dépôt porte un `package-lock.json`,
# c'est-à-dire dès le premier `npm install` du développeur. La cause est un
# défaut de npm, ouvert en amont : `npm/cli#9837`, dont le correctif proposé
# est `npm/cli#9859`. `better-sqlite3` (tiré par `@nodefony/drizzle`)
# embarque ses binaires prébâtis et pose `gypfile: false` pour interdire à npm
# de SYNTHÉTISER un `install: node-gyp rebuild` à la vue de son `binding.gyp`.
# Or ce refus n'est lu que sur un arbre bâti depuis le registre : un nœud venu
# d'un LOCKFILE ne porte pas le champ, donc npm invente le script — et le
# paquet se fait recompiler contre sa volonté.
#
# Mesuré dans `node:24-alpine` : SANS verrou, aucun script et aucun message ;
# AVEC verrou, npm 11.19 exécute `node-gyp rebuild`, qui meurt faute de Python
# et de chaîne de compilation. npm 12 le refuserait — sa politique
# `allowScripts` BLOQUE un script non approuvé, là où celle de npm 11 se
# contente d'avertir — mais c'est npm 11.19 que `node:24-alpine` embarque.
# (Le défaut ne dépend donc pas de la distribution : il a été constaté à
# l'identique sur `node:24-slim` en npm 11.16.)
#
# Le sauter est de toute façon ce qu'il faut faire : les paquets natifs d'une
# application Nodefony embarquent leurs binaires prébâtis (vérifié —
# `better-sqlite3` ouvre et interroge une base après une installation sans
# scripts). Et c'est un durcissement : un script d'installation est le vecteur
# des compromissions de chaîne d'approvisionnement, et une image de production
# n'a aucune raison d'en exécuter.
#
# `npm ci` DÈS QU'UN VERROU EST LÀ, et c'est ce qui rend l'image reproductible :
# il installe l'arbre EXACT du verrou et REFUSE un `package.json` désaccordé,
# là où `npm install` réécrit le verrou et peut résoudre autrement d'un jour à
# l'autre — deux constructions du même commit, deux arbres de dépendances,
# dans une image qu'on publie. Le repli n'est pas une commodité : un gabarit ne
# peut pas supposer le verrou, qui naît du premier `npm install` du développeur
# et n'existe donc pas dans une application fraîchement créée.
#
# Le gestionnaire est celui choisi à la création (npm) : chaque outil a
# son verrou, son cache et sa syntaxe, et aucun ne lit le verrou d'un autre.
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
      npm ci --ignore-scripts --no-audit --no-fund; \
    else \
      npm install --ignore-scripts --no-audit --no-fund; \
    fi

# Le build passe par le script de l'application (`rolldown`, plus le build du
# frontend quand il y en a un) : ce Dockerfile n'a donc jamais à connaître la
# forme de la compilation. `prune` retire ensuite ce qui n'est que du
# développement — la toolchain a fini son travail.
#
# ⚠️ La toolchain front ne descend PAS dans l'image, et c'est une promesse
# qu'un contrôle tient : `@nodefony/frontend` ne déclare Vite ni en dépendance,
# ni en pair, ni en optionnel — tout y passe par `await import()`. C'est ce qui
# permet à `prune` de l'emporter. Une seule ligne de manifeste suffirait à faire
# revenir la régression, et rien ne la signalerait : l'image marcherait, en
# pesant beaucoup plus. Le banc de publication le constate donc à chaque passe
# (`vite`, `vue`, `typescript` absents de l'image).
#
# Corollaire à ne pas rater : Vite n'est pas disponible à l'EXÉCUTION. Un front
# non construit ne peut pas se rattraper au démarrage ici — l'application le dit
# alors en clair, et continue de servir son API.
#
# 🔴 Et le build NETTOIE ce qu'il a écrit, ICI — dans l'étage de construction,
# jamais après le `COPY`. `npm run build` BOOTE l'application : le service de
# certificats fabrique alors une clé privée TLS de développement
# (`certificates.ts`, sur `onBoot`, dès qu'un port HTTPS est configuré), et
# l'ORM crée sa base sous `var/`. Aucun des deux n'a de raison de voyager.
#
# `.dockerignore` ne peut RIEN contre eux : il filtre le CONTEXTE, pas ce que
# la construction FABRIQUE. Et un `rm` placé après `COPY --from=build` ne les
# retire pas non plus — la couche du `COPY` reste lisible par qui télécharge
# l'image, même recouverte. Vécu : la `10.0.0-alpha.4` a été publiée avec
# `nodefony/config/certificates/server/privkey.pem`, et le banc de release a
# repris le même chemin sur le scénario à frontend — le seul dont le build
# boote le noyau.
#
# Effacer ici fonctionne parce que les couches de cet étage ne descendent PAS
# dans l'image finale : seul l'état final de `/app` est copié.
#
# Le cache du gestionnaire est monté ici AUSSI : un élagage qui réinstalle
# (yarn 1, bun) y relit ses paquets au lieu de les retélécharger.
RUN --mount=type=cache,target=/root/.npm \
    npm run build && npm prune --omit=dev \
 && rm -rf nodefony/config/certificates var tmp

# ── Frontal nginx (profil `edge`) — DEUX étages qui ne descendent JAMAIS dans
#    l'image de l'application ─────────────────────────────────────────────────
#
# Ils ne sont construits QUE si on les demande (`--target edge`) : BuildKit ne
# bâtit que le graphe nécessaire à la cible, donc un `docker build .` ordinaire
# ne paie rien de ce qui suit.
#
#   docker build --target edge -t nodefony-edge .
#
# Et si ton application a été générée avec le contenu COMPLET, le compose la
# monte avec son frontal en une commande (le fichier n'existe que dans ce
# contenu-là ; ailleurs, cette commande répondrait « no configuration file
# provided ») :
#
#   docker compose --profile edge up -d --build
#
# POURQUOI un frontal, et pourquoi généré : en production l'application vit
# derrière un proxy, et c'est lui qui décide de l'adresse cliente, du scheme
# annoncé, de la taille de corps acceptée et du sort d'une WebSocket silencieuse.
# Une configuration écrite à la main diverge du serveur qu'elle sert — ici elle
# est DÉRIVÉE de l'application par `proxy:generate`, à partir de ses hôtes de
# confiance, ses montages statiques réels, son `maxBodySize` et son battement
# WebSocket. Change l'application, refais l'image : la configuration suit.
FROM build AS proxyconf

# 🔴 En PRODUCTION, comme le serveur qu'elle décrit. La configuration se dérive
# de la configuration effective : générée en développement, elle porterait les
# valeurs du développement (hôtes, limites, statiques) et décrirait un
# déploiement qui n'existe pas.
ENV NODE_ENV=production

# Ce que le frontal doit savoir de son déploiement. Tout le reste vient de
# l'application. `EDGE_BACKEND` est le nom du service qui porte l'application
# sur le réseau du proxy (compose : le service ; Kubernetes : le Service).
ARG EDGE_BACKEND=app
ARG EDGE_HOSTS=localhost
ARG EDGE_HTTP_PORT=8080
ARG EDGE_TLS_PORT=8443

# La barrière `Host` du serveur et le `server_name` du frontal doivent dire la
# MÊME chose, sinon la configuration décrit un déploiement que le serveur
# refuserait. Une seule valeur les pose tous les deux (le compose passe la même
# à l'exécution de l'application).
ENV NF__HTTP__TRUSTEDHOSTS=$EDGE_HOSTS

# Le `grep` final n'est pas un ornement : sans lui, une commande qui écrirait un
# fichier VIDE laisserait construire une image de frontal qui ne route rien, et
# la panne n'apparaîtrait qu'au premier client. Le constat se fait ici.
#
# `assets:publish` assemble un arbre MIROIR des préfixes d'URL — les `public/`
# des modules sous `/<module>/`, les bundles Vite sous `/_assets/<nom>/`. Il ne
# prend PAS le `public/` de l'application, servi lui à la racine : on le verse
# donc dans le même arbre, et le frontal sert alors `/favicon.ico` comme le
# reste, sans jamais joindre Node.
RUN mkdir -p /srv/assets \
 && node_modules/.bin/nodefony assets:publish --out /srv/assets \
 && if [ -d public ]; then cp -R public/. /srv/assets/; fi \
 && node_modules/.bin/nodefony proxy:generate nginx \
      --backend "$EDGE_BACKEND" \
      --listen "$EDGE_HTTP_PORT" \
      --assets-root /srv/assets \
      --tls-cert /etc/nginx/certs/fullchain.pem \
      --tls-key /etc/nginx/certs/privkey.pem \
      --tls-listen "$EDGE_TLS_PORT" \
      --out /srv/nginx.conf \
 && grep -q "upstream nodefony" /srv/nginx.conf

FROM nginx:1.30-alpine AS edge

# Les chemins sont les MÊMES que dans l'étage qui a généré la configuration :
# elle nomme `/srv/assets`, c'est donc là que l'arbre doit atterrir.
COPY --from=proxyconf /srv/nginx.conf /etc/nginx/nginx.conf
COPY --from=proxyconf /srv/assets /srv/assets

# 🔴 AUCUN certificat ici, et c'est délibéré. Une clé privée gravée dans une
# image reste lisible par quiconque la télécharge, même effacée par une couche
# suivante : `COPY` puis `RM` laisse le secret dans la couche du `COPY`.
#
# ⚠️ Ne compte pas sur un contrôle : celui qui garde les images du framework
# vit dans le dépôt de Nodefony, il n'est pas publié — TON image n'est
# contrôlée par personne aujourd'hui. C'est l'objet du ticket #358, qui donnera
# la même garde aux applications. En attendant, la seule protection est de ne
# jamais faire entrer de matière cryptographique dans le contexte de
# construction ni dans ce que le build FABRIQUE.
#
# La configuration générée pointe `/etc/nginx/certs/` : c'est un
# MONTAGE, à pourvoir au déploiement (volume compose, secret Kubernetes).
# En développement, le certificat auto-signé de l'application fait l'affaire :
#   npx nodefony http:certificates      # écrit nodefony/config/certificates/
#
# Le master nginx reste root — c'est le comportement de l'image officielle, qui
# fait tourner ses workers sous l'utilisateur `nginx`. Pour un frontal non-root
# de bout en bout : `nginxinc/nginx-unprivileged` (ports 8080/8443 déjà, comme
# ici — ils sont au-dessus de 1024, donc joignables sans privilège).
EXPOSE 8080 8443

HEALTHCHECK --interval=10s --timeout=2s --start-period=5s --retries=3 \
  CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/livez"]

# ── Points de montage : distroless n'a pas de shell pour les créer ───────────
# Un `RUN mkdir` est impossible dans l'image finale. Les deux dossiers naissent
# donc ici, VIDES, et descendent par un `COPY --chown` (plus bas).
FROM ${NODE_IMAGE:-node:24-slim} AS nf-dirs
# 🔴 Des paquets demandés sans la fin qui les installe seraient IGNORÉS sans un
# mot : l'image distroless se construirait, et l'outil manquerait à la première
# requête qui l'appelle. Cet étage n'est construit QUE pour la fin par défaut —
# c'est donc ici que la demande incohérente s'arrête, en la nommant.
ARG PACKAGES=""
RUN if [ -n "$PACKAGES" ]; then \
      echo "PACKAGES=\"$PACKAGES\" exige la fin with-packages : docker build --target with-packages (compose et CI : NF_IMAGE_TARGET=with-packages)" >&2; \
      exit 1; \
    fi \
 && mkdir -p /out/tmp /out/var

# ── Fin `with-packages` : la même application, AVEC des paquets système ──────
#
#   docker build --target with-packages --build-arg PACKAGES="ffmpeg" -t nodefony .
#
# Pour l'application qui APPELLE un outil système — ffmpeg, ImageMagick,
# Ghostscript : distroless n'a pas de gestionnaire de paquets, cette fin-ci en
# a un (`apt-get` sur Debian, `apk` si `NODE_IMAGE` est Alpine). Le prix se
# paie en surface d'attaque : `node:24-slim` porte à lui seul les failles
# hautes mesurées en tête de ce fichier, plus celles des paquets ajoutés. Ne
# la prendre que pour un outil réellement appelé.
#
# Elle part de `NODE_IMAGE`, la base de l'étage de construction : même libc
# PAR CONSTRUCTION, les modules natifs s'y chargent sans qu'on y pense.
#
# Le CONTRAT est celui de la fin par défaut, à l'identique — utilisateur 1000
# numérique, `var/` et `tmp/` à lui et vides, code à root, port 5151, sonde
# `/readyz`, forme exec, et `node` à `/nodejs/bin/node`. Les raisons sont
# écrites à l'étage d'exécution plus bas ; seule diffère la façon de créer les
# dossiers, qu'une base À SHELL permet d'écrire en un `RUN`.
#
# ⚠️ Deux différences ASSUMÉES, à connaître avant de valider sur une fin et de
# déployer l'autre :
#   - l'utilisateur 1000 a ici un nom (`node`) et un `HOME` inscriptible
#     (`/home/node`) ; sur distroless il n'a ni l'un ni l'autre (`HOME=/`). Un
#     outil qui écrit son cache sous `$HOME` (fontconfig, ImageMagick) doit
#     recevoir un dossier explicite, sous `/app/tmp` — sinon il échouera sous
#     `readOnlyRootFilesystem` ;
#   - `node` est PID 1 et ne récolte pas les processus qu'il n'a pas lancés : un
#     outil qui se dédouble laisse des zombies. Lancer le conteneur avec
#     `--init` (compose : `init: true`), et arrêter ses enfants pendant le drain
#     — un ffmpeg encore en vol à la fin de la grâce est tué par SIGKILL.
#
# Compose et la CI générés choisissent la fin par `NF_IMAGE_TARGET`
# (`with-packages`) et les paquets par `NF_IMAGE_PACKAGES` — sans retouche
# d'aucun fichier, eux non plus.
FROM ${NODE_IMAGE:-node:24-slim} AS with-packages
# Root le temps d'installer : une base durcie (`USER` non-root) le refuserait
# sinon, sur un « Permission denied » qui ne parle pas d'utilisateur.
USER 0
ARG PACKAGES=""
RUN if [ -n "$PACKAGES" ]; then \
      if command -v apk >/dev/null 2>&1; then \
        apk add --no-cache $PACKAGES; \
      elif command -v apt-get >/dev/null 2>&1; then \
        apt-get update \
        && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends $PACKAGES \
        && rm -rf /var/lib/apt/lists/*; \
      else \
        echo "NODE_IMAGE n'a ni apk ni apt-get : PACKAGES ne peut pas s'installer" >&2; \
        exit 1; \
      fi; \
    fi
ENV NODE_ENV=production
WORKDIR /app
ARG VCS_REF=""
ARG BUILD_DATE=""
ARG VERSION="0.1.0"
LABEL org.opencontainers.image.title="nodefony" \
      org.opencontainers.image.description="nodefony — application Nodefony" \
      org.opencontainers.image.version="$VERSION" \
      org.opencontainers.image.revision="$VCS_REF" \
      org.opencontainers.image.created="$BUILD_DATE"
COPY --from=build /app ./
# 🔴 `node` au MÊME chemin que sur distroless. Tout ce qui lance Node dans
# l'image le nomme `/nodejs/bin/node` — la sonde ci-dessous, l'`ENTRYPOINT`, le
# `docker exec` de la CI de production et du README. Sans ce lien, ces
# commandes échoueraient sur cette fin seulement, sur un « no such file » qui
# ne parle pas de la base.
RUN mkdir -p /app/tmp /app/var /nodejs/bin \
 && chown 1000:1000 /app/tmp /app/var \
 && ln -s "$(command -v node)" /nodejs/bin/node
USER 1000:1000
EXPOSE 5151
HEALTHCHECK --interval=10s --timeout=2s --start-period=20s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:5151/readyz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
# Le MÊME `ENTRYPOINT` que distroless : le même `CMD`, et un lanceur qui change
# la commande (`args:` Kubernetes, `command:` compose) passe d'une fin à
# l'autre sans retouche. Sans lui, c'est le `docker-entrypoint.sh` de l'image
# Node qui déciderait, selon que le script est exécutable ou non.
ENTRYPOINT ["/nodejs/bin/node"]
CMD ["node_modules/nodefony/bin/nodefony", "production"]

# ── Étape d'exécution : minimale, non-root — la fin PAR DÉFAUT ───────────────
# 🔴 Elle reste la DERNIÈRE du fichier : c'est ce qui fait d'elle l'image que
# rend un `docker build .` sans `--target`. Son nom, `runtime`, ne sert qu'à la
# DÉSIGNER (`--target runtime`, `NF_IMAGE_TARGET`) : il ne change rien au défaut.
FROM ${RUNTIME_IMAGE:-gcr.io/distroless/nodejs24-debian13} AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Étiquettes OCI — ce qui permet de remonter d'une image en production au commit
# qui l'a produite. Sans elles, `docker inspect` ne dit rien de son origine, et
# un scanner de vulnérabilités n'a pas de version à laquelle rattacher son
# verdict. Les valeurs viennent de la chaîne de construction, jamais du gabarit :
#   docker build --build-arg VCS_REF=$(git rev-parse HEAD) \
#                --build-arg BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
#                --build-arg VERSION=$(node -p "require('./package.json').version") .
#
# Pas d'`org.opencontainers.image.licenses` : cette application est la TIENNE et
# ce gabarit ne connaît pas sa licence. L'ajouter d'après celle du framework
# apposerait sur ton image une déclaration légale qui n'est pas la tienne.
ARG VCS_REF=""
ARG BUILD_DATE=""
ARG VERSION="0.1.0"
LABEL org.opencontainers.image.title="nodefony" \
      org.opencontainers.image.description="nodefony — application Nodefony" \
      org.opencontainers.image.version="$VERSION" \
      org.opencontainers.image.revision="$VCS_REF" \
      org.opencontainers.image.created="$BUILD_DATE"

# Un seul COPY, et c'est délibéré : il emporte `dist/`, les `node_modules`
# élagués, les assets du frontend et les workspaces `modules/*` — dont
# l'existence n'est pas connue au moment où ce fichier est généré. Nommer les
# chemins un à un ferait échouer la construction sur le premier dossier absent.
#
# SANS `--chown` : le code appartient à `root`, le processus tourne en 1000. Une
# application qui peut réécrire son propre `dist/` offre à une faille d'exécution
# de code un moyen de PERSISTER d'un redémarrage à l'autre. Seules les données
# lui appartiennent, et c'est le `RUN` ci-dessous qui le décide.
COPY --from=build /app ./

# 🔴 Ces deux dossiers doivent EXISTER dans l'image, avant tout montage.
# `var/` et `tmp/` sont écrits au démarrage et exclus du contexte de
# construction (`.dockerignore`) : sans ce `mkdir`, Docker crée le point de
# montage d'un `-v <app>-var:/app/var` en `root:root`, et le premier `mkdir` de
# l'application meurt en `EACCES` — sur un message qui ne parle ni de volume ni
# de droits. Un volume nommé neuf HÉRITE du propriétaire du dossier qu'il
# recouvre : c'est ce qui fait que la persistance marche du premier coup.
# En Kubernetes, c'est aussi ce que `fsGroup` prend pour base.
#
# 🔴 Et ils naissent VIDES. L'étage de construction tourne en `root` et lance
# `npm run build`, qui BOOTE l'application : l'ORM y crée `var/databases/` au
# passage, en root. Le `COPY --from=build` l'emporterait tel quel, et un `chown`
# NON RÉCURSIF ne le rattrape pas — `/app/var` appartiendrait bien à 1000,
# `/app/var/databases` resterait à root. L'application démarre alors, puis meurt
# en `SQLITE_CANTOPEN` sur sa propre base : « unable to open database file », un
# message qui envoie chercher du côté de la configuration alors que la cause est
# un bit de permission. Constaté sur une application générée, avec ET sans volume.
#
# C'est l'étage de CONSTRUCTION qui les efface (voir plus haut), et pas ce `RUN` :
# un `rm` posé ICI laisserait la couche du `COPY` lisible par qui télécharge
# l'image. Ce `COPY` ne fait donc que ce qu'il est seul à pouvoir faire — poser
# les points de montage et les donner à l'utilisateur qui tourne.
COPY --from=nf-dirs --chown=1000:1000 /out/ /app/

# Jamais root : les ports de Nodefony (5151, 5152) n'exigent aucun privilège.
# NUMÉRIQUE, pas `node` : le kubelet refuse `runAsNonRoot: true` quand l'image
# ne déclare qu'un NOM d'utilisateur, qu'il ne sait pas résoudre en identifiant.
# distroless n'a pas d'entrée 1000 dans `/etc/passwd` (son utilisateur non-root
# est 65532) : un identifiant NUMÉRIQUE n'en a pas besoin, et 1000 garde le
# propriétaire des volumes et le `fsGroup` qu'emploient les autres bases.
USER 1000:1000
EXPOSE 5151

# Sonde de Docker / compose / Swarm sur `/readyz`, la route native du framework.
# ⚠️ k8s IGNORE HEALTHCHECK : y déclarer `livenessProbe: /livez` (le process
# est-il vivant ?) et `readinessProbe: /readyz` (peut-il recevoir du trafic ?).
# ⚠️ PODMAN construit en format OCI par défaut, et l'OCI ne porte PAS cette
# directive : la sonde est retirée de l'image SANS erreur (`podman inspect
# --format '{{.HealthCheck}}'` rend alors `<nil>`). Constaté, avec son remède :
#   podman build --format docker -t <image> .
# Le reste passe tel quel sous Podman — cache monté, forme exec, node en PID 1,
# arrêt gracieux en 0.
HEALTHCHECK --interval=10s --timeout=2s --start-period=20s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:5151/readyz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

# Forme EXEC obligatoire : `node` devient PID 1 et reçoit le SIGTERM. En forme
# shell (`CMD npx nodefony production`), c'est `/bin/sh` qui est PID 1 — il ne
# transmet pas les signaux, donc plus aucun arrêt gracieux et un SIGKILL à
# chaque déploiement. L'image marcherait, et rien ne signalerait la perte.
# L'`ENTRYPOINT` de distroless est `/nodejs/bin/node` : ce `CMD` devient ses
# ARGUMENTS, et le script se lit sans passer par son shebang (`/usr/bin/env`
# n'existe pas ici). Pour la même raison, un lanceur (Kubernetes, compose) qui
# change la commande passe par `args:`, jamais par `command:`, qui remplacerait
# l'`ENTRYPOINT`. Le script est celui du PAQUET, jamais `node_modules/.bin/` :
# sous pnpm, ce dernier est un script shell, que `node` lirait comme du
# JavaScript — et qu'aucun shell ne peut lire ici.
CMD ["node_modules/nodefony/bin/nodefony", "production"]
