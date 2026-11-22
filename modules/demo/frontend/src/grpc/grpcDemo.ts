/**
 * Ce que la page « gRPC » et le serveur partagent : les chemins des deux
 * méthodes, le canal par lequel la page suit la machine, le scope qui ouvre
 * `Push`, et la forme de ce que le canal transporte. Écrit UNE fois, importé
 * des deux côtés.
 *
 * Guide pour un agent : le CONTRAT gRPC est `proto/demo/telemetry/v1/telemetry.proto`
 * (source unique, code généré dans `nodefony/gen/`, jamais édité) ; ce fichier
 * ne recopie que ses CHEMINS, parce que la page n'embarque aucune bibliothèque
 * gRPC (le navigateur suit par la socket). Le test du module vérifie que ces
 * chemins sont bien ceux du contrat. Le contrôleur est
 * `nodefony/controllers/TelemetryController.ts`, le relais
 * `nodefony/service/TelemetryRelayService.ts`, la machine la commande
 * `npx nodefony demo:sensor:push`. Les blocs `// #region` sont CITÉS par la
 * page : les renommer casse le test du module.
 */

// #region grpc-shared
/** Le service du contrat : `paquet.Service`, tel que le protocole l'écrit. */
export const TELEMETRY_SERVICE = "demo.telemetry.v1.TelemetryService";

/**
 * Les chemins des méthodes, IMPOSÉS par le protocole (`/paquet.Service/Méthode`) :
 * ils échappent au préfixe `/demo` des autres routes de la démo.
 */
export const TELEMETRY_PUSH_PATH = `/${TELEMETRY_SERVICE}/Push`;
export const TELEMETRY_LATEST_PATH = `/${TELEMETRY_SERVICE}/Latest`;

/**
 * Le scope qu'un jeton doit porter pour POUSSER des mesures. Seul un
 * administrateur peut l'obtenir (`grantableScopes`, `nodefony/config/security.ts`).
 */
export const TELEMETRY_PUSH_SCOPE = "demo:telemetry:push";

/** Le canal de la socket de la démo sur lequel la page suit les machines. */
export const TELEMETRY_CHANNEL = "demo:telemetry";

/** Méthode de la socket : l'état courant, pour une page qui arrive. */
export const TELEMETRY_STATE = "demo:telemetry:state";
// #endregion

/** La machine que pousse la commande par défaut — celle de la Sonde. */
export const DEFAULT_MACHINE = "Pompe P-101";

/** Cadence par défaut de la commande : mesures par seconde. */
export const DEFAULT_PUSH_HZ = 10;

/** La commande que la page affiche, à lancer dans un second terminal. */
export const PUSH_COMMAND = "npx nodefony demo:sensor:push";

// #region grpc-frames
/** Une mesure reçue, telle que la page la reçoit. */
export interface ITelemetryReading {
  machine: string;
  celsius: number;
  /** Datée par la MACHINE (ms depuis 1970). */
  measuredAt: number;
  /** Reçue par le SERVEUR (ms depuis 1970) : l'écart avec `measuredAt` est le trajet. */
  receivedAt: number;
}

/**
 * Ce que porte le canal : une mesure, ou un flux `Push` qui s'ouvre (à la
 * première mesure, quand la machine se nomme) ou se ferme (avec son total).
 */
export type TelemetryEvent =
  | ({ kind: "reading" } & ITelemetryReading)
  | { kind: "push"; machine: string; open: boolean; accepted: number };

/** L'état courant : les machines dont un flux `Push` est ouvert, et la dernière mesure de chacune. */
export interface ITelemetryState {
  pushing: string[];
  latest: ITelemetryReading[];
}
// #endregion
