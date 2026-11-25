/**
 * La boucle d'un jeu, à pas fixe : la brique serveur que les jeux de la démo
 * partagent (`GameRoom`), et que tout ce qui « tourne » à cadence régulière peut
 * reprendre.
 *
 * Guide pour un agent : un `setInterval` nu DÉRIVE — chaque retard de la boucle
 * d'événements décale tous les tours suivants. Ici l'heure du prochain tour se
 * calcule sur `process.hrtime.bigint()` : un tour en retard est rattrapé (au plus
 * `MAX_CATCH_UP` d'un coup), au-delà le retard est abandonné plutôt que de
 * figer le serveur à rattraper. Chaque tour reçoit le MÊME pas (`1 / hz`) : la
 * simulation reste déterministe quelle que soit la charge.
 */

/** Au plus, tours rattrapés en un réveil : au-delà, on repart de maintenant. */
const MAX_CATCH_UP = 4;

/** Une boucle lancée : son arrêt, et ce qu'elle mesure. */
export interface IFixedStep {
  /** Arrête la boucle ; idempotent. */
  stop(): void;
  /** Retard du dernier réveil sur l'heure prévue, en millisecondes. */
  readonly lagMs: number;
  /** Tours abandonnés depuis le départ, faute de pouvoir les rattraper. */
  readonly dropped: number;
}

// #region kit-fixed-step
/**
 * Lance `tick` `hz` fois par seconde, à pas fixe, jusqu'à `stop()`.
 *
 * @param hz - tours par seconde
 * @param tick - un pas de simulation ; reçoit le pas, en secondes
 * @returns la boucle, et son retard mesuré
 */
export function startFixedStep(
  hz: number,
  tick: (dt: number) => void,
): IFixedStep {
  const step = BigInt(Math.round(1e9 / hz));
  const dt = 1 / hz;
  let next = process.hrtime.bigint() + step;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lagMs = 0;
  let dropped = 0;
  const wake = () => {
    const now = process.hrtime.bigint();
    lagMs = now > next ? Number(now - next) / 1e6 : 0;
    let done = 0;
    while (now >= next && done < MAX_CATCH_UP) {
      tick(dt);
      next += step;
      done += 1;
    }
    if (now >= next) {
      // Trop en retard : on abandonne ces tours plutôt que d'empiler.
      dropped += Number((now - next) / step) + 1;
      next = now + step;
    }
    const wait = Number(next - process.hrtime.bigint()) / 1e6;
    timer = setTimeout(wake, Math.max(0, wait));
    // Un serveur qui s'arrête n'attend pas le prochain tour.
    timer.unref();
  };
  timer = setTimeout(wake, 1000 / hz);
  timer.unref();
  return {
    stop() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
    },
    get lagMs() {
      return lagMs;
    },
    get dropped() {
      return dropped;
    },
  };
}
// #endregion
