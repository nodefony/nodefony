import { z } from "zod";
import type { IRealtimeContract } from "nodefony/client";
import { defineRecord } from "../kit/records";

/**
 * Prisme — ce que le serveur et la page partagent : l'adresse de la socket, le
 * canal, la grille hexagonale, le contrat, et la forme des drones en OCTETS.
 *
 * Guide pour un agent : importé par `PrismService.ts`, `PrismController.ts` ET
 * par la page (`prismClient.ts`, `prismScene.ts`). La grille se CALCULE des
 * deux côtés par la même fonction (`prismTiles`) : la trame n'envoie que le
 * propriétaire de chaque case, dans cet ordre.
 */

// #region prism-shared
/** Préfixe des routes du jeu. */
export const PRISM_PATH = "/demo/api/prism";

/** La socket du jeu, dédiée. */
export const PRISM_SOCKET = `${PRISM_PATH}/realtime`;

/** Le canal d'état : la grille et les drones, à chaque tour. */
export const PRISM_CHANNEL = "prism:state";

/** La commande d'un joueur : une direction. */
export const STEER_EVENT = "prism:steer";

/** Tours du serveur par seconde. */
export const PRISM_HZ = 30;

/** Rayon de la grille, en cases : 3 × 11 × 12 + 1 = 397 cases. */
export const PRISM_RADIUS = 11;

/** Quatre équipes, deux drones chacune ; les robots complètent. */
export const PRISM_TEAMS = 4;
export const PRISM_CREW = 8;

/** Couleur et nom de chaque équipe : une seule source, pour la scène 3D et le bandeau. */
export const prismTeamColors = [
  0x3ee6ff, 0xff4fd8, 0xffb547, 0x9dff6a,
] as const;
export const prismTeamNames = ["Cyan", "Rose", "Ambre", "Lime"] as const;

/** Vitesse d'un drone, en unités (rayons de case) par seconde. */
export const DRONE_SPEED = 6.5;

/** Durée d'une manche, puis du podium, en secondes. */
export const ROUND_SECONDS = 60;
export const PODIUM_SECONDS = 5;

/** Un drone sur le fil : 8 octets. Positions au centième d'unité. */
export const droneRecord = defineRecord([
  { name: "id", type: "u8" },
  { name: "team", type: "u8" },
  { name: "tag", type: "u16" },
  { name: "x", type: "i16", scale: 100 },
  { name: "z", type: "i16", scale: 100 },
] as const);

/** Une trame d'état. `tiles[i]` = équipe propriétaire de la case i, plus un (0 : neutre). */
export interface IPrismFrame {
  seq: number;
  phase: "play" | "podium";
  /** Secondes restantes dans la phase. */
  left: number;
  round: number;
  /** Cases tenues par chaque équipe. */
  scores: number[];
  /** L'équipe gagnante pendant le podium, sinon -1. */
  winner: number;
  pilots: number;
  /** Retard du dernier réveil de la boucle serveur, en millisecondes. */
  lag: number;
  drones: Uint8Array;
  tiles: Uint8Array;
}

/**
 * Ce que le joueur envoie : une direction, et l'étiquette qui lui fait
 * reconnaître son drone. L'identité, c'est la connexion.
 */
export const SteerParams = z.strictObject({
  dx: z.number().min(-1).max(1),
  dz: z.number().min(-1).max(1),
  tag: z.number().int().min(0).max(65_535),
});

export type IPrismSteer = z.infer<typeof SteerParams>;

export interface PrismContract extends IRealtimeContract {
  serverToClient: { "prism:state": IPrismFrame };
  clientToServer: { "prism:steer": IPrismSteer };
}
// #endregion

/** Une case de la grille : coordonnées axiales et position dans le monde. */
export interface IPrismTile {
  q: number;
  r: number;
  x: number;
  z: number;
}

/** La grille, dans l'ordre de la trame. Case de rayon 1, pointe en haut. */
export const prismTiles: readonly IPrismTile[] = (() => {
  const tiles: IPrismTile[] = [];
  const R = PRISM_RADIUS;
  for (let q = -R; q <= R; q += 1) {
    for (let r = Math.max(-R, -q - R); r <= Math.min(R, -q + R); r += 1) {
      tiles.push({ q, r, x: Math.sqrt(3) * (q + r / 2), z: 1.5 * r });
    }
  }
  return tiles;
})();

const TILE_INDEX = new Map(prismTiles.map((t, i) => [`${t.q},${t.r}`, i]));

/** L'index de la case sous un point du monde, ou -1 hors de la grille. */
export function tileAt(worldX: number, worldZ: number): number {
  const q = (Math.sqrt(3) / 3) * worldX - worldZ / 3;
  const r = (2 / 3) * worldZ;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(-q - r);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs + q + r);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  return TILE_INDEX.get(`${rq},${rr}`) ?? -1;
}
