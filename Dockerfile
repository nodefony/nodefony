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

# ── Étape de construction : la chaîne de compilation ne descend PAS en prod ───
FROM node:24-slim AS build
WORKDIR /app

# Les sources d'ABORD, en un seul geste — et non le manifeste seul comme le
# veut l'usage. Une dépendance d'application Nodefony peut être LOCALE : les
# workspaces `modules/*` que pose `nodefony create module`, ou une archive
# `file:` avant publication. Installer avant de les avoir copiées échouerait
# sur elles. Ce qui ne doit pas entrer est listé dans `.dockerignore` — c'est
# lui qui tient les secrets (`*.local`) et le `dist/` de la machine dehors.
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
# Mesuré dans `node:24-slim` : SANS verrou, aucun script et aucun message ;
# AVEC verrou, npm 11.16 exécute `node-gyp rebuild`, qui meurt faute de Python
# et de chaîne de compilation. npm 12 le refuserait — sa politique
# `allowScripts` BLOQUE un script non approuvé, là où celle de npm 11 se
# contente d'avertir — mais c'est npm 11.16 que `node:24-slim` embarque.
#
# Le sauter est de toute façon ce qu'il faut faire : les paquets natifs d'une
# application Nodefony embarquent leurs binaires prébâtis (vérifié —
# `better-sqlite3` ouvre et interroge une base après une installation sans
# scripts). Et c'est un durcissement : un script d'installation est le vecteur
# des compromissions de chaîne d'approvisionnement, et une image de production
# n'a aucune raison d'en exécuter.
RUN --mount=type=cache,target=/root/.npm npm install --ignore-scripts --no-audit --no-fund

# Le build passe par le script de l'application (`rolldown`, plus le build du
# frontend quand il y en a un) : ce Dockerfile n'a donc jamais à connaître la
# forme de la compilation. `prune` retire ensuite ce qui n'est que du
# développement — la toolchain a fini son travail.
#
# ⚠️ Une application à FRONTEND garde malgré tout Vite : son plugin est une
# devDependency, et `prune` ne retire pas ce qui satisfait la dépendance de
# pair (optionnelle) d'un paquet de production. Refaire l'arbre depuis zéro
# n'y change rien — le `package-lock.json` l'a figé, et c'est mesuré : 161 Mo
# dans les deux cas. Le jour où cela se corrige, ce sera en amont, dans la
# façon dont `@nodefony/frontend` déclare Vite.
RUN npm run build && npm prune --omit=dev

# ── Étape d'exécution : minimale, non-root ───────────────────────────────────
FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app

# `/app` doit appartenir à `node` : le démarrage écrit (tmp/, journaux, var/).
RUN chown node:node /app

# Un seul COPY, et c'est délibéré : il emporte `dist/`, les `node_modules`
# élagués, les assets du frontend et les workspaces `modules/*` — dont
# l'existence n'est pas connue au moment où ce fichier est généré. Nommer les
# chemins un à un ferait échouer la construction sur le premier dossier absent.
COPY --from=build --chown=node:node /app ./

# Jamais root : les ports de Nodefony (5151, 5152) n'exigent aucun privilège.
USER node
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
  CMD ["node", "-e", "fetch('http://127.0.0.1:5151/readyz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

# Forme EXEC obligatoire : `node` devient PID 1 et reçoit le SIGTERM. En forme
# shell (`CMD npx nodefony production`), c'est `/bin/sh` qui est PID 1 — il ne
# transmet pas les signaux, donc plus aucun arrêt gracieux et un SIGKILL à
# chaque déploiement. L'image marcherait, et rien ne signalerait la perte.
CMD ["node_modules/.bin/nodefony", "production"]
