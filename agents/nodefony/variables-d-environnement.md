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
