import type { IWireTap } from "../kit/probe";
import { readWire } from "../binary/wire";

/**
 * Le fil d'un jeu, mesuré : la brique de la page que les jeux de la démo
 * partagent pour afficher ce qui passe VRAIMENT sur la socket.
 *
 * Guide pour un agent : la sonde de la démo (`wireTap`, `kit/probe.ts`) note
 * chaque trame qui traverse le transport ; ce compteur les relit
 * (`readWire`, `binary/wire.ts`) et rend, sur la dernière seconde, trames et
 * octets dans chaque sens. Aucun nombre n'est déduit du contenu : chacun vient
 * d'une trame qui a traversé le fil.
 */

/** Ce que le fil a porté pendant la dernière seconde. */
export interface IWireStats {
  /** Trames reçues par seconde. */
  framesIn: number;
  /** Octets reçus par seconde. */
  bytesIn: number;
  /** Taille de la dernière trame reçue. */
  lastFrame: number;
  /** Trames envoyées par seconde. */
  framesOut: number;
  /** Octets envoyés par seconde. */
  bytesOut: number;
  /** La connexion est-elle en binaire (CBOR) ? `null` avant la première trame. */
  binary: boolean | null;
}

interface IMark {
  at: number;
  dir: "in" | "out";
  bytes: number;
}

// #region game-wire-meter
/** Branche un compteur sur la sonde d'une socket ; `stop` le débranche. */
export function meterWire(tap: IWireTap): {
  stats(): IWireStats;
  stop(): void;
} {
  const marks: IMark[] = [];
  let lastFrame = 0;
  let binary: boolean | null = null;
  tap.listen({
    note: (text) => {
      const line = readWire([{ at: 0, text }]).at(0);
      if (line === undefined) return;
      marks.push({ at: performance.now(), dir: line.dir, bytes: line.bytes });
      if (line.dir === "in") {
        lastFrame = line.bytes;
        binary = line.binary;
      }
    },
    created: () => {},
    closed: () => {},
    opened: () => {},
  });
  return {
    stats() {
      const since = performance.now() - 1000;
      while ((marks[0]?.at ?? since) < since) marks.shift();
      const stats: IWireStats = {
        framesIn: 0,
        bytesIn: 0,
        lastFrame,
        framesOut: 0,
        bytesOut: 0,
        binary,
      };
      for (const mark of marks) {
        if (mark.dir === "in") {
          stats.framesIn += 1;
          stats.bytesIn += mark.bytes;
        } else {
          stats.framesOut += 1;
          stats.bytesOut += mark.bytes;
        }
      }
      return stats;
    },
    stop() {
      tap.listen(null);
      marks.length = 0;
    },
  };
}
// #endregion
