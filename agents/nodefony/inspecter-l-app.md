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

⚠️ **Cette porte n'authentifie que si on lui en donne les moyens — et un seul
réglage commande la posture** : `authorizationServers` (config du module devkit).
Laissé vide, c'est le défaut : la porte reste anonyme, bornée par son périmètre
(`policy: "dev"`) et ses gardes de transport, et tout outil exigeant des scopes
reste **invisible** — absent de `tools/list` ET inappelable en le nommant.

Renseigné, elle refuse l'appelant non identifié en citant `resource_metadata`
(RFC 9728) — l'en-tête qui apprend au client OÙ obtenir un jeton — puis lit les
scopes de celui qu'on lui présente. Le geste, côté client :

```bash
npx nodefony ai:mcp --auth            # l'en-tête porte ${NF_MCP_TOKEN}, jamais le jeton
npx nodefony security:token --write   # émet le jeton et le pose chez tes agents
```

Donc un outil protégé qui ne répond pas n'est **pas** une panne : c'est la posture
fermée par défaut, ou un jeton absent, ou un jeton sans le scope exigé.

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
