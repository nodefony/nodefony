import type {
  AlarmState,
  IAlarm,
  IAlarmBoard,
  IAlarmEvent,
} from "../../frontend/src/sensor/sensorDemo";

/**
 * Les alarmes de la supervision : une moyenne glissante qui juge, et une
 * machine d'états ISA-18.2 / IEC 62682 qui se souvient — active, acquittée,
 * revenue à la normale sans acquittement — avec son journal.
 *
 * Guide pour un agent : une alarme ne se juge JAMAIS sur un échantillon brut
 * (le bruit d'un capteur RMS la ferait battre à chaque tour) mais sur la
 * moyenne d'une fenêtre (`MovingAverage`), avec une hystérésis à la retombée.
 * `AlarmEngine.observe(id, mean)` applique les transitions et rend `true` quand
 * l'état a changé — c'est alors seulement que le service pousse le tableau.
 * L'acquittement porte l'identité de la SESSION (`acknowledge(id, by)`), jamais
 * un nom envoyé par la page.
 */

// #region sensor-moving-average
/**
 * Moyenne glissante sur les `size` dernières valeurs : tampon circulaire
 * pré-alloué, somme entretenue — O(1) par valeur, et la somme est recalculée
 * à chaque tour complet du tampon pour que l'arrondi flottant ne dérive pas.
 */
export class MovingAverage {
  readonly #buffer: Float64Array;
  #head = 0;
  #count = 0;
  #sum = 0;

  /**
   * @param size - nombre de valeurs moyennées (entier ≥ 1)
   */
  constructor(size: number) {
    if (!Number.isInteger(size) || size < 1) {
      throw new RangeError(`MovingAverage : taille invalide ${size}`);
    }
    this.#buffer = new Float64Array(size);
  }

  /** Ajoute une valeur et rend la moyenne des valeurs présentes. */
  push(value: number): number {
    const size = this.#buffer.length;
    if (this.#count === size) {
      this.#sum -= this.#buffer.at(this.#head) ?? 0;
    } else {
      this.#count += 1;
    }
    this.#buffer[this.#head] = value;
    this.#sum += value;
    this.#head += 1;
    if (this.#head === size) {
      this.#head = 0;
      this.#resum();
    }
    return this.#sum / this.#count;
  }

  /** Vrai quand la fenêtre est pleine : la moyenne porte sur `size` valeurs. */
  get full(): boolean {
    return this.#count === this.#buffer.length;
  }

  /** Oublie tout. */
  reset(): void {
    this.#head = 0;
    this.#count = 0;
    this.#sum = 0;
  }

  #resum(): void {
    let sum = 0;
    for (let i = 0; i < this.#count; i += 1) sum += this.#buffer.at(i) ?? 0;
    this.#sum = sum;
  }
}
// #endregion

/** Ce qui définit une alarme : son seuil, sa marge de retombée, et comment la nommer. */
export interface IAlarmDefinition {
  id: string;
  /** Ce qui la porte, lisible : « M3 · Vibration ». */
  source: string;
  unit: string;
  /** L'alarme se lève quand la moyenne atteint `limit`… */
  limit: number;
  /** …et retombe quand elle passe sous `limit − hysteresis`. */
  hysteresis: number;
}

/** Une alarme et sa définition, côte à côte. */
interface IAlarmEntry {
  readonly alarm: IAlarm;
  readonly definition: IAlarmDefinition;
}

// #region sensor-alarm-engine
/**
 * La machine d'états ISA-18.2 de chaque alarme, et le journal de leurs
 * transitions :
 *
 * - `normal` → (moyenne ≥ seuil) → `unacknowledged`
 * - `unacknowledged` → (acquittement) → `acknowledged`
 * - `unacknowledged` → (moyenne < seuil − hystérésis) → `returned`
 * - `acknowledged` → (moyenne < seuil − hystérésis) → `normal`
 * - `returned` → (acquittement) → `normal`
 * - `returned` → (moyenne ≥ seuil) → `unacknowledged`
 *
 * Un acquittement d'une alarme normale, ou inconnue, est refusé (`false`).
 * Chaque transition ajoute une ligne au journal, borné : les plus anciennes
 * sortent.
 */
export class AlarmEngine {
  readonly #entries = new Map<string, IAlarmEntry>();
  readonly #alarms: IAlarm[] = [];
  readonly #journal: IAlarmEvent[] = [];
  readonly #journalSize: number;
  readonly #now: () => number;
  #seq = 0;

  /**
   * @param definitions - les alarmes supervisées, dans l'ordre d'affichage
   * @param journalSize - lignes gardées au journal
   * @param now - l'horloge (ms depuis l'époque), injectée pour les tests
   */
  constructor(
    definitions: readonly IAlarmDefinition[],
    journalSize: number,
    now: () => number,
  ) {
    this.#journalSize = journalSize;
    this.#now = now;
    const t = now();
    for (const definition of definitions) {
      const alarm: IAlarm = {
        id: definition.id,
        source: definition.source,
        state: "normal",
        value: 0,
        limit: definition.limit,
        unit: definition.unit,
        since: t,
        ackBy: null,
      };
      this.#alarms.push(alarm);
      this.#entries.set(definition.id, { alarm, definition });
    }
  }

  /**
   * Juge une alarme sur sa moyenne glissante. La valeur est retenue dans tous
   * les cas ; le retour dit si l'ÉTAT a changé (le tableau mérite d'être poussé).
   */
  observe(id: string, mean: number): boolean {
    const entry = this.#entries.get(id);
    if (entry === undefined) return false;
    const { alarm, definition } = entry;
    alarm.value = mean;
    const high = mean >= definition.limit;
    const low = mean < definition.limit - definition.hysteresis;
    let next: AlarmState | null = null;
    switch (alarm.state) {
      case "normal":
        if (high) next = "unacknowledged";
        break;
      case "unacknowledged":
        if (low) next = "returned";
        break;
      case "acknowledged":
        if (low) next = "normal";
        break;
      case "returned":
        if (high) next = "unacknowledged";
        break;
    }
    if (next === null) return false;
    this.#transition(alarm, next, null);
    return true;
  }

  /**
   * Acquitte une alarme au nom de `by` (l'identité de la session). Vrai si
   * l'état a changé ; faux pour une alarme normale, déjà acquittée ou inconnue.
   */
  acknowledge(id: string, by: string): boolean {
    const entry = this.#entries.get(id);
    if (entry === undefined) return false;
    const { alarm } = entry;
    if (alarm.state === "unacknowledged") {
      this.#transition(alarm, "acknowledged", by);
      return true;
    }
    if (alarm.state === "returned") {
      this.#transition(alarm, "normal", by);
      return true;
    }
    return false;
  }

  /** Le tableau tel que la page le reçoit : une copie, alarmes et journal. */
  board(): IAlarmBoard {
    return {
      alarms: this.#alarms.map((alarm) => ({ ...alarm })),
      journal: this.#journal.slice(),
    };
  }

  #transition(alarm: IAlarm, state: AlarmState, by: string | null): void {
    const t = this.#now();
    alarm.state = state;
    alarm.since = t;
    if (state === "normal") alarm.ackBy = null;
    else if (by !== null) alarm.ackBy = by;
    this.#seq += 1;
    this.#journal.push({
      seq: this.#seq,
      t,
      id: alarm.id,
      source: alarm.source,
      state,
      value: alarm.value,
      by,
    });
    while (this.#journal.length > this.#journalSize) this.#journal.shift();
  }
}
// #endregion
