import { z } from "zod";
import { demoConfigSchema } from "./config";

/**
 * JSON Schema de la configuration de @nodefony/demo — lu SANS démarrer
 * l'application, par `nodefony env` et la notice `.env.example`, qui y
 * trouvent les noms courts (`.meta({ env })`).
 *
 * Déclaré dans `package.json` → `nodefony.configSchema` ; le nom de l'export
 * est FIXE. Fichier FEUILLE : il n'importe que zod et le schéma, et n'ouvre
 * rien à l'import — une commande qui ne démarre pas l'application l'exécute.
 *
 * @returns le JSON Schema, métadonnées Nodefony comprises.
 */
export function configJsonSchema(): unknown {
  return z.toJSONSchema(demoConfigSchema);
}
