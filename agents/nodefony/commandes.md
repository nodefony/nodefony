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
