# Ce qui n'entre PAS dans le contexte de construction de l'image.
# Motifs relatifs à la racine du contexte — `**/` pour atteindre les modules
# locaux (`modules/*/node_modules`, `modules/*/dist`).

# Reconstruits DANS l'image. Entrés depuis la machine, ils masqueraient le
# build de l'étape et l'image partirait avec le code de la veille.
**/node_modules
**/dist

# Écritures du runtime (journaux, pid, sockets) — propres à une machine.
var
*.log

# Secrets — convention B : `*.local` n'est jamais commité, et n'entre pas
# davantage dans une image. Les couches d'une image sont lisibles par qui la
# télécharge, et un secret y reste même effacé par une couche suivante. En
# production, les valeurs viennent de l'orchestrateur (variables
# d'environnement, gestionnaire de secrets).
*.local
**/*.local

# Bruit — sans effet sur l'exécution, mais chaque octet du contexte est envoyé
# au démon Docker à chaque construction.
.git
.gitignore
Dockerfile
.dockerignore
.DS_Store
