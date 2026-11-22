/**
 * Un quota par fenêtre fixe : au plus `limit` gestes par `windowMs` et par
 * clé (un compte, sinon une adresse). La brique que les services de la démo
 * partagent — aperçus de liens, écritures du chat — au lieu d'en recopier la
 * règle.
 *
 * Guide pour un agent : `take` ne lève rien, il rend le nombre de secondes à
 * attendre (`0` = accordé). Le service dit POURQUOI (sa propre raison de
 * refus), le contrôleur dit COMMENT (429 + `Retry-After`). Les clés gardées
 * sont bornées : au-delà de `keysMax`, les fenêtres échues sortent, puis la
 * plus ancienne — une rafale d'adresses forgées ne fait pas grossir la mémoire.
 */

/** Clés gardées par défaut. */
const RATE_KEYS_MAX = 5000;

/** La fenêtre d'une clé : début et compte, mis à jour EN PLACE. */
class RateWindow {
  start = 0;
  count = 0;
}

/** Au plus `limit` gestes par fenêtre de `windowMs`, et par clé. */
export class RateLimiter {
  readonly #limit: number;
  readonly #windowMs: number;
  readonly #keysMax: number;
  readonly #now: () => number;
  /** Allouée au premier geste : un service jamais sollicité ne garde rien. */
  #windows: Map<string, RateWindow> | null = null;

  /**
   * @param limit - gestes accordés par fenêtre
   * @param windowMs - durée de la fenêtre
   * @param now - l'horloge, injectée par un test
   * @param keysMax - clés gardées au plus
   */
  constructor(
    limit: number,
    windowMs: number,
    now: () => number = () => Date.now(),
    keysMax = RATE_KEYS_MAX,
  ) {
    this.#limit = limit;
    this.#windowMs = windowMs;
    this.#now = now;
    this.#keysMax = keysMax;
  }

  /**
   * Compte un geste pour `key`, ou le refuse quand la fenêtre est épuisée.
   *
   * @returns `0` si le geste est accordé ; sinon les secondes à attendre (≥ 1)
   */
  take(key: string): number {
    const now = this.#now();
    this.#windows ??= new Map<string, RateWindow>();
    let window = this.#windows.get(key);
    if (window === undefined) {
      if (this.#windows.size >= this.#keysMax) this.#sweep(this.#windows, now);
      window = new RateWindow();
      this.#windows.set(key, window);
    }
    if (window.count === 0 || now - window.start >= this.#windowMs) {
      window.start = now;
      window.count = 1;
      return 0;
    }
    if (window.count >= this.#limit)
      return Math.max(
        1,
        Math.ceil((window.start + this.#windowMs - now) / 1000),
      );
    window.count++;
    return 0;
  }

  /** Libère de la place : les fenêtres échues, puis la plus ancienne. */
  #sweep(windows: Map<string, RateWindow>, now: number): void {
    for (const [key, window] of windows)
      if (now - window.start >= this.#windowMs) windows.delete(key);
    if (windows.size >= this.#keysMax) {
      const oldest = windows.keys().next();
      if (oldest.done !== true) windows.delete(oldest.value);
    }
  }
}
