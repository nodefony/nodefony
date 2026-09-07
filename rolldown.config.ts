import { defineNodefonyRolldownConfig } from "nodefony/bundler";

/**
 * Build de l'app — tout le socle (preserveModules, treeshake, décorateurs lus
 * du tsconfig) vit dans `nodefony/bundler`. `externalDeps` : le runtime vient
 * de `node_modules`, seul TON code est bundlé.
 */
export default defineNodefonyRolldownConfig({ externalDeps: true });
