/**
 * Afficher entre deux trames : la brique de la page que les jeux de la démo
 * partagent pour rester fluides à 60 images/s quand le serveur publie 30 fois.
 *
 * Guide pour un agent : la page garde les dernières trames DÉCODÉES, datées à
 * leur ARRIVÉE (une seule horloge, celle du navigateur), et affiche l'instant
 * `maintenant − retard`. Le retard vaut deux intervalles du serveur : il y a
 * presque toujours deux trames qui encadrent l'instant affiché, même quand le
 * réseau en regroupe deux. Ce qui va tout droit (un tir) se PROLONGE depuis la
 * dernière trame au lieu d'attendre : `extrapolate`.
 */

/** Une trame décodée, et l'instant où elle est arrivée (`performance.now()`). */
export interface ISnapshot<D> {
  data: D;
  at: number;
}

/** Deux trames qui encadrent l'instant affiché, et la fraction entre elles. */
export interface ISnapshotPair<D> {
  from: ISnapshot<D>;
  to: ISnapshot<D>;
  /** 0 = `from`, 1 = `to`. */
  k: number;
}

/** Trames gardées : bien plus que les deux qu'il faut, sans grandir. */
const KEEP = 8;

// #region game-snapshots
/** Les dernières trames reçues, et la paire à afficher à un instant donné. */
export class SnapshotBuffer<D> {
  readonly #list: ISnapshot<D>[] = [];
  readonly #delayMs: number;

  /** @param hz - trames par seconde publiées par le serveur */
  constructor(hz: number) {
    this.#delayMs = 2000 / hz;
  }

  /** Retard d'affichage, en millisecondes. */
  get delayMs(): number {
    return this.#delayMs;
  }

  push(data: D, at: number): void {
    this.#list.push({ data, at });
    if (this.#list.length > KEEP) this.#list.shift();
  }

  /** La plus récente, ou `null` avant la première. */
  latest(): ISnapshot<D> | null {
    return this.#list.at(-1) ?? null;
  }

  /** Oublie tout : après une reconnexion, l'ancien monde n'encadre plus rien. */
  clear(): void {
    this.#list.length = 0;
  }

  /** Les deux trames autour de `now − retard`, ou la dernière seule. */
  pair(now: number): ISnapshotPair<D> | null {
    const target = now - this.#delayMs;
    const list = this.#list;
    for (let i = list.length - 1; i > 0; i -= 1) {
      const from = list.at(i - 1);
      const to = list.at(i);
      if (from !== undefined && to !== undefined && from.at <= target) {
        const span = to.at - from.at;
        const k = span > 0 ? (target - from.at) / span : 1;
        return { from, to, k: Math.max(0, Math.min(1, k)) };
      }
    }
    const only = list.at(0);
    return only === undefined ? null : { from: only, to: only, k: 1 };
  }
}

/**
 * Mélange deux listes d'entités par identifiant : chaque entité de `to` est
 * placée entre sa position dans `from` et la sienne. Une entité absente de
 * `from` (née entre les deux) est montrée telle quelle ; une absente de `to`
 * (détruite) disparaît.
 */
export function interpolateById<T extends { id: number }>(
  from: readonly T[],
  to: readonly T[],
  k: number,
  mix: (a: T, b: T, k: number) => T,
): T[] {
  if (k >= 1 || from === to) return [...to];
  const before = new Map<number, T>();
  for (const entity of from) before.set(entity.id, entity);
  return to.map((entity) => {
    const previous = before.get(entity.id);
    return previous === undefined ? entity : mix(previous, entity, k);
  });
}
// #endregion

/** `a + (b − a) × k`. */
export function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

/** Le plus court chemin entre deux angles, à la fraction `k`. */
export function lerpAngle(a: number, b: number, k: number): number {
  return a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
}

/** Prolonge un mouvement rectiligne de `seconds` à `speed` unités par seconde. */
export function extrapolate(
  x: number,
  y: number,
  angle: number,
  speed: number,
  seconds: number,
): { x: number; y: number } {
  return {
    x: x + Math.cos(angle) * speed * seconds,
    y: y + Math.sin(angle) * speed * seconds,
  };
}
