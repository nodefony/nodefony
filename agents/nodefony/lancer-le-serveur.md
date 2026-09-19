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
