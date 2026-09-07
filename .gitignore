node_modules/
dist/
var/
public/dist/
*.log

# vitest ≥ 5 : racine unique de ses artefacts (pièces jointes, blobs, rapports
# json/junit/html). Elle apparaît dès le premier `npm test` — sans cette ligne,
# une application fraîche naît avec un dossier non suivi que rien n'explique.
.vitest/

# Artefacts jetables — captures d'écran, journaux de console et arbres produits
# par le navigateur du compose (`--profile browser`). Ce sont des PHOTOS d'un
# instant : elles se refont, elles ne se versionnent pas.
tmp/

# Fichiers d'environnement — convention B (Vite/Next), celle du framework :
#   COMMITÉS (défauts NON-secrets)  : .env, .env.<env>, .env.example
#   GITIGNORÉS (secrets / machine)  : *.local → .env.local, .env.<env>.local
# Les clés de chiffrement générées à la création de l'app vivent dans
# .env.local — ne JAMAIS les committer (rotation : nodefony security:secrets).
*.local

# Clés PRIVÉES. Le certificat public (`cert.pem`, `fullchain.pem`) peut se
# committer ; la clé qui va avec, jamais — un dépôt public la publie
# définitivement, et la retirer d'un commit ne la retire d'aucun clone.
# Régénérer : `npx nodefony http:certificates`.
*.key
privkey*.pem
*-key.pem

# Secrets posés chez les agents de développement (nodefony security:token --write).
# 🔴 `.gemini/.env` porte un JETON PORTEUR : la déclaration de la porte MCP,
# elle, reste versionnable (.gemini/settings.json, .mcp.json) — c'est la CLÉ qui
# ne se commite pas. Un jeton commité est un jeton publié.
.gemini/.env
.gemini/.env.*

# Agents de développement : leur dossier est le home REDIRIGÉ que `ai:mcp` leur
# donne pour que la porte MCP soit déclarée par PROJET (son URL porte un port —
# une déclaration globale ne pourrait désigner qu'une application). Ils y
# déposent aussi leurs fichiers de travail : seule la DÉCLARATION se versionne.
.vibe/*
!.vibe/config.toml
.codex/*
!.codex/config.toml
