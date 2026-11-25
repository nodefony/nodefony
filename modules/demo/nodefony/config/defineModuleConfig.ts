import { parseModuleConfig } from "nodefony";
import { demoConfigSchema } from "./config";
import { configJsonSchema } from "./configSchema";
import type { IDemoConfig } from "./config";

/**
 * @nodefony/demo — LE COMMENT : builder PUR de la config.
 *
 * ⭐ TL;DR : ce fichier VALIDE et GÈLE. Il ne porte AUCUNE valeur — les défauts
 * vivent dans le schéma de `./config.ts` (règle d'or ADR-0006). Pour changer un
 * défaut, c'est là-bas ; ici, on ne fait que le faire respecter.
 *
 * Le nom du FICHIER est le même dans tous les modules Nodefony
 * (`defineModuleConfig.ts`) ; la FONCTION, elle, est préfixée par le module —
 * deux modules importés côte à côte ne se marchent pas dessus.
 *
 * L'environnement ne se lit JAMAIS ici. La surcharge générique
 * (`NF__DEMO__<CHEMIN>`) comme un nom court (`NF_DEMO_<RÉGLAGE>`) sont
 * posés par le Kernel avant cette validation. Un nom court se DÉCLARE sur son
 * champ, dans `./config.ts` : `.meta({ env: "NF_DEMO_<RÉGLAGE>" })`.
 *
 * 🔴 **La validation passe par `parseModuleConfig`, du cœur** — un seul endroit
 * pour une seule règle. Il lève une `BootConfigurationError`, et pas une `Error`
 * ordinaire : le kernel distingue les deux. Un hook de cycle de vie qui lève une
 * erreur QUELCONQUE est absorbé en développement (fail-soft — il protège la DX
 * d'un module optionnel cassé), tandis qu'une erreur de CONFIGURATION interrompt
 * le boot dans TOUS les environnements. Mesuré sur un module généré : avec une
 * `Error`, `use("@nodefony/demo", { gretting: "…" })` laissait l'application
 * démarrer, servir, et rendre 0 — la faute de frappe n'atteignait personne. Une
 * configuration explicite qu'on ne peut pas honorer ne se répare pas en
 * continuant.
 *
 * ⚠️ Ne PAS réécrire ce bloc à la main : les dix modules du framework portaient
 * chacun leur copie du `try`/`catch`, et elles avaient divergé sur les deux
 * points qui comptent — le type de l'erreur levée et la langue du message.
 *
 * @param config - config brute venue de `use("@nodefony/demo", { … })` — typée
 *   `unknown` parce qu'elle est VALIDÉE ici : l'affirmer d'un type serait mentir
 *   au compilateur juste avant de la vérifier.
 * @returns config validée et gelée.
 * @throws BootConfigurationError si un champ est invalide ou inconnu (toutes les
 *   erreurs Zod agrégées, par champ) — le boot s'interrompt, en dev comme en prod.
 */
export function defineDemoConfig(config: unknown = {}): IDemoConfig {
  return Object.freeze(
    parseModuleConfig(demoConfigSchema, config, "@nodefony/demo"),
  );
}

/**
 * JSON Schema de la config — Studio en dérive son formulaire d'édition
 * (libellés, types, défauts, descriptions), sans une ligne d'UI écrite à la main.
 */
export function demoConfigJsonSchema(): unknown {
  return configJsonSchema();
}
