import path from "node:path";
import { z } from "zod";
import { sqliteFilenameFromUrl, type IInfra } from "nodefony";
import { demoSecurity } from "./security";
import { PAYLOAD_LIMIT } from "../../frontend/src/binary/binaryDemo";

/**
 * Écritures accordées par compte et par fenêtre de dix secondes, par défaut :
 * envoyer, modifier, retirer, réagir, créer, inviter, exclure, planifier,
 * répondre, ouvrir un salon à deux. Chacune écrit en base et pousse à tout un
 * salon : sans borne, un compte sature la base et les écrans des autres.
 * Trois par seconde en rafale : aucun humain ne les atteint, une boucle si.
 */
export const CHAT_WRITE_QUOTA = 30;

/**
 * @nodefony/demo — CONFIGURATION DE LA DÉMO (schéma Zod = source unique).
 *
 * Même règle que tout module : chaque `.default(...)` est la valeur d'usine,
 * l'application ne surcharge que ses écarts par `use("@nodefony/demo", { … })`,
 * et le déploiement passe par un NOM COURT déclaré sur le champ
 * (`.meta({ env })`), que le Kernel applique et que `nodefony env` montre.
 *
 * `strictObject` : une clé inconnue arrête le démarrage en la nommant, au lieu
 * d'être retirée sans un mot.
 */
export const demoConfigSchema = z.strictObject({
  // #region partner-config
  /**
   * Secret du client machine `nodefony-machine` du realm Keycloak —
   * celui qui obtient un jeton par `client_credentials` pour
   * `nodefony demo:partner:call --issuer keycloak`.
   *
   * `.meta()` EN DERNIER : chaque méthode zod clone, et une méthode posée
   * après perdrait la métadonnée.
   */
  machineSecret: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Secret du client machine Keycloak de la démo (flux client_credentials de demo:partner:call)",
    )
    .meta({ env: "NF_KEYCLOAK_MACHINE_SECRET", secret: true }),
  // #endregion
  /**
   * Écritures du chat accordées par compte et par fenêtre de dix secondes
   * (`CHAT_WRITE_QUOTA` par défaut) ; au-delà, 429 avec `Retry-After`. Une
   * suite de bout en bout ou un banc qui écrit en rafale avec UN compte la
   * relève ; une démo exposée la garde basse.
   */
  chatWriteQuota: z
    .number()
    .int()
    .positive()
    .default(CHAT_WRITE_QUOTA)
    .describe(
      "Écritures du chat accordées par compte et par fenêtre de 10 s (au-delà : 429)",
    )
    .meta({ env: "NF_DEMO_CHAT_WRITE_QUOTA" }),
});

/** Config telle que l'APP l'écrit dans `use()` — tous les champs optionnels. */
export type IDemoConfigInput = z.input<typeof demoConfigSchema>;

/** Config telle que le CODE la lit — défauts appliqués. */
export type IDemoConfig = z.output<typeof demoConfigSchema>;

/** Défauts matérialisés. */
const defaults: IDemoConfig = demoConfigSchema.parse({});

/**
 * Config passée au `super()` du module : les défauts, plus la zone que la
 * démo apporte à `@nodefony/security` (`./security.ts`). Le Kernel consomme
 * la clé `module-security` avant de valider la config de la démo, qui ne la
 * voit donc jamais.
 */
// #region binary-config
/**
 * Temps réel binaire : deux réglages que la démo pose sur d'AUTRES modules,
 * pour toute l'application.
 */
const binaryOverrides = {
  // Le serveur sait parler CBOR. Le codec se NÉGOCIE par connexion : une page
  // qui ne l'offre pas (le chat) reste en texte, et reçoit ses octets sous
  // `{"$bytes":"…"}`, relus en `Uint8Array`.
  "module-realtime": { codec: "cbor" },
  // Un message ENTRANT plafonne à 1 Mio par défaut (fermeture 1009 au-delà) :
  // relevé à 2 Mio, sur les deux serveurs WebSocket (ws et wss).
  "module-http": {
    websocket: { maxPayload: PAYLOAD_LIMIT },
    websocketSecure: { maxPayload: PAYLOAD_LIMIT },
  },
};
// #endregion

// #region demo-module-security
export default {
  ...defaults,
  // La zone de la démo rejoint le firewall de l'application.
  "module-security": demoSecurity,
  ...binaryOverrides,
};
// #endregion

// #region demo-connector
/** Le connecteur des salons du chat : une base SQLite à la démo, jamais celle de l'application. */
export const DEMO_CONNECTOR = "demo";

/**
 * Le connecteur `demo` que la démo ajoute à `@nodefony/drizzle` : une base
 * SQLite à elle, quelle que soit celle de l'application. Un ORM porte
 * plusieurs connecteurs, et deux ORM cohabitent : une application MongoDB
 * charge Drizzle pour la seule démo, sans connecteur `default` (Drizzle ne
 * le crée pas quand la base déclarée est d'une autre famille).
 *
 * Où vit le fichier : il SUIT la base de l'application — à côté d'elle quand
 * elle est en SQLite (sous `var/databases/` en développement, à côté de la
 * base jetable d'un test qui pose `NF_DATABASE_URL`), en mémoire quand elle
 * l'est, sinon `var/databases/nodefony-demo.db`. `ddl: "auto"`
 * est ÉCRIT : un module de développement n'a pas de migration, son schéma se
 * dérive au démarrage (doc `@nodefony/drizzle/docs/migrations.md`).
 *
 * UN pod : un fichier SQLite vit sur le disque d'une machine, il ne se
 * partage pas entre pods. C'est le mode d'une démo et d'un poste de
 * développement, pas d'une application répartie — elle garde ses salons dans
 * une base partagée (PostgreSQL, MySQL).
 *
 * Guide pour un agent : la base arrive DÉJÀ résolue par le noyau
 * (`kernel.infra`, la même lecture que celle de l'application) — un module ne
 * lit jamais `process.env` lui-même, `env.ts` en est le seul lecteur.
 *
 * @param database - la base déclarée de l'application (`kernel.infra.database`)
 * @returns la clé `module-drizzle` à fusionner dans la config du module
 */
export function demoDrizzleOverride(
  database: IInfra["database"],
): Record<string, unknown> {
  const appFile =
    database?.dialect === "sqlite" ? sqliteFilenameFromUrl(database.url) : null;
  const filename =
    appFile === ":memory:"
      ? { filename: ":memory:" }
      : appFile === null
        ? {}
        : { filename: path.join(path.dirname(appFile), "nodefony-demo.db") };
  return {
    "module-drizzle": {
      connectors: {
        [DEMO_CONNECTOR]: { dialect: "sqlite", ddl: "auto", ...filename },
      },
    },
  };
}
// #endregion
