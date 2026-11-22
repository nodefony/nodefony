import { z } from "zod";
import type { IRealtimeContract } from "nodefony/client";
import { defineRecord } from "../kit/records";

/**
 * Météores — ce que le serveur et la page partagent : l'adresse de la socket,
 * le canal, les dimensions du monde, le contrat qui type les deux bouts, et la
 * forme de chaque entrée en OCTETS (écrite par le serveur, lue par la page).
 *
 * Guide pour un agent : importé par `MeteorService.ts`, `MeteorController.ts`
 * ET par la page (`meteorClient.ts`, `meteorScene.ts`). Les enregistrements
 * binaires viennent de la brique commune de la démo (`kit/records.ts`) : le
 * même objet écrit côté serveur et lit côté page.
 */

// #region meteor-shared
/** Préfixe des routes du jeu. */
export const METEOR_PATH = "/demo/api/meteor";

/** La socket du jeu, dédiée : ses trames ne se mêlent pas à celles du chat. */
export const METEOR_SOCKET = `${METEOR_PATH}/realtime`;

/** Le canal d'état : le monde entier, à chaque tour. */
export const METEOR_CHANNEL = "meteor:state";

/** La commande d'un joueur : où il vise, s'il tire. */
export const AIM_EVENT = "meteor:aim";

/** Tours du serveur par seconde : chaque tour publie une trame d'état. */
export const METEOR_HZ = 30;

/** Rayon de la planète, en unités du monde. */
export const PLANET_RADIUS = 70;

/** Rayon de l'anneau sur lequel glissent les canons. */
export const RING_RADIUS = 112;

/** Rayon du ciel : les météores naissent à son bord. */
export const FIELD_RADIUS = 560;

/** Vitesse d'un tir, en unités par seconde. */
export const SHOT_SPEED = 620;

/** Au plus, à l'écran : météores, tirs, pilotes humains. */
export const MAX_METEORS = 300;
export const MAX_SHOTS = 160;
export const MAX_PILOTS = 8;

/** Les robots complètent la défense jusqu'à ce nombre de canons. */
export const DEFENDERS = 5;

/** Positions en Int16 au dixième d'unité ; angles au dix-millième de radian. */
export const POS_SCALE = 10;
export const ANGLE_SCALE = 10_000;

/** Un canon dans la trame : `flags` porte ces bits. */
export const CANNON_ROBOT = 1;
export const CANNON_FIRING = 2;

/** Une explosion : un météore détruit, ou un impact sur la planète. */
export const BOOM_METEOR = 0;
export const BOOM_PLANET = 1;

/** Une trame d'état : les compteurs en clair, le monde en octets (enregistrements ci-dessous). */
export interface IMeteorFrame {
  seq: number;
  /** `fallen` : la planète est tombée, la partie repart dans quelques secondes. */
  phase: "play" | "fallen";
  wave: number;
  /** Vie de la planète, de 0 à 100. */
  health: number;
  score: number;
  /** Meilleure vague atteinte depuis le démarrage du serveur. */
  best: number;
  /** Pilotes humains connectés. */
  pilots: number;
  /** Retard du dernier réveil de la boucle serveur, en millisecondes. */
  lag: number;
  meteors: Uint8Array;
  shots: Uint8Array;
  cannons: Uint8Array;
  booms: Uint8Array;
}

/**
 * Ce que le joueur envoie : un angle, la gâchette, et l'étiquette qu'il a
 * tirée au hasard pour RECONNAÎTRE son canon dans la trame. L'étiquette ne
 * donne aucun droit : l'identité d'un canon, c'est la connexion qui l'a créé.
 */
export const AimParams = z.strictObject({
  angle: z.number().min(-1000).max(1000),
  fire: z.boolean(),
  tag: z.number().int().min(0).max(65_535),
});

export type IMeteorAim = z.infer<typeof AimParams>;

export interface MeteorContract extends IRealtimeContract {
  serverToClient: { "meteor:state": IMeteorFrame };
  clientToServer: { "meteor:aim": IMeteorAim };
}
// #endregion

// #region meteor-wire
/** Un météore sur le fil : 8 octets. Positions au dixième d'unité. */
export const meteorRecord = defineRecord([
  { name: "id", type: "u16" },
  { name: "x", type: "i16", scale: POS_SCALE },
  { name: "y", type: "i16", scale: POS_SCALE },
  { name: "r", type: "u8" },
  { name: "hp", type: "u8" },
] as const);

/** Un tir : 6 octets. Il va tout droit : la page le prolonge entre deux trames. */
export const shotRecord = defineRecord([
  { name: "x", type: "i16", scale: POS_SCALE },
  { name: "y", type: "i16", scale: POS_SCALE },
  { name: "angle", type: "i16", scale: ANGLE_SCALE },
] as const);

/** Un canon : 6 octets. `flags` porte `CANNON_ROBOT` et `CANNON_FIRING`. */
export const cannonRecord = defineRecord([
  { name: "angle", type: "i16", scale: ANGLE_SCALE },
  { name: "tag", type: "u16" },
  { name: "slot", type: "u8" },
  { name: "flags", type: "u8" },
] as const);

/** Une explosion du tour : 6 octets. `kind` : `BOOM_METEOR` ou `BOOM_PLANET`. */
export const boomRecord = defineRecord([
  { name: "x", type: "i16", scale: POS_SCALE },
  { name: "y", type: "i16", scale: POS_SCALE },
  { name: "size", type: "u8" },
  { name: "kind", type: "u8" },
] as const);
// #endregion
