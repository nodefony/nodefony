# Ce que le formateur ne doit PAS toucher.
#
# `npm run format` lance `prettier --write .` sur tout le projet. Prettier
# écarte `node_modules` de lui-même — mais PAS `dist/`, ni `var/`, ni les
# artefacts du build front. Sans ce fichier, un seul `npm run format` reformate
# le BUILD : des milliers de lignes modifiées, un diff illisible, et un `dist`
# qui ne correspond plus à ce que le bundler vient d'écrire.

# Artefacts générés / build
dist/
public/dist/
**/dist/**
node_modules/
var/
.turbo/
coverage/

# Photos jetables (captures, journaux) — elles se refont, on ne les aligne pas.
tmp/

# Lockfiles & minifiés : ni lisibles ni à relire.
package-lock.json
**/*.min.js
**/*.min.css
