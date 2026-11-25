import { defineNodefonyRolldownConfig } from "nodefony/bundler";

/**
 * Build du module — socle rolldown PARTAGÉ du framework (`nodefony/bundler`),
 * exactement comme l'app : `preserveModules` (l'arborescence source est
 * reproduite dans `dist/`), plateforme node, ESM.
 *
 * `externalDeps` externalise tout ce que le module DÉCLARE (peerDependencies +
 * dependencies) : `nodefony`, `@nodefony/*` et `zod` ne sont pas recopiés dans
 * le bundle — ils sont résolus au runtime depuis les node_modules de l'app.
 * Le Kernel charge ensuite `dist/index.js` par le nom du paquet
 * (manifeste `modules` de `nodefony.config.ts`).
 *
 * `cleanDir` vide `dist/` juste avant l'écriture : les fichiers périmés
 * disparaissent, et le dossier n'est jamais absent pendant la compilation. Un
 * front publié dans `dist/` doit donc être bâti APRÈS (script enchaîné).
 */
export default defineNodefonyRolldownConfig({
  externalDeps: true,
  cleanDir: true,
});
