import { Service, Module, injectable } from "nodefony";
import type {
  ITelemetryReading,
  ITelemetryState,
  TelemetryEvent,
} from "../../frontend/src/grpc/grpcDemo";

/**
 * Clé d'INSTANCE du service dans le conteneur (`this.get(…)`) — à ne pas
 * confondre avec le nom de CLASSE que prend `@Inject("TelemetryRelayService")`.
 */
export const TELEMETRY_RELAY_SERVICE = "telemetryRelay";

/** Bornes d'une mesure plausible : au-delà, elle est écartée sans être relayée. */
export const CELSIUS_MIN = -273.15;
export const CELSIUS_MAX = 2000;
export const MACHINE_NAME_MAX = 64;

/**
 * Écart toléré entre l'horloge de la machine et celle du serveur. Une mesure
 * datée d'il y a un jour, ou de demain, est écartée.
 */
export const CLOCK_SKEW_MS = 24 * 60 * 60 * 1000;

/**
 * Le relais de la démo gRPC : il reçoit les mesures du contrôleur gRPC et les
 * republie sur le canal `demo:telemetry` de la socket de la démo.
 *
 * Guide pour un agent :
 *  • UN service pour tous : le contrôleur gRPC est un singleton, le contrôleur
 *    de la socket est instancié par connexion ; la dernière mesure doit
 *    survivre à chacun — elle vit ici, injectée par
 *    `@Inject("TelemetryRelayService")` des deux côtés ;
 *  • rien ne part tant que personne ne regarde : `attach` au premier abonné du
 *    canal, détachement au dernier (patron de `DemoPulseService`). Sans
 *    abonné, le relais garde la dernière mesure (une entrée par machine) pour
 *    `Latest`, et c'est tout ;
 *  • un seul processus : derrière plusieurs exemplaires, une page ne voit que
 *    les machines du sien. Le pont gRPC ↔ hub du framework, qui traversera les
 *    exemplaires, est prévu pour la 10.1 (#745).
 *
 * Doc : `@nodefony/framework/docs/grpc.md` § « La logique dans un service injecté ».
 */
// #region grpc-relay
@injectable()
class TelemetryRelayService extends Service {
  /** La dernière mesure de chaque machine — une entrée par machine, mise à jour en place. */
  readonly #latest = new Map<string, ITelemetryReading>();
  /** Le nombre de flux `Push` ouverts par machine. */
  readonly #pushing = new Map<string, number>();
  #publish: ((event: TelemetryEvent) => void) | null = null;
  // #endregion

  /**
   * @param module - le module qui le déclare ; absent dans un test, qui le
   *   construit sans kernel
   */
  constructor(module?: Module) {
    super(
      TELEMETRY_RELAY_SERVICE,
      module?.container ?? undefined,
      module?.notificationsCenter,
    );
  }

  // #region grpc-relay-publish
  /**
   * Retient une mesure et la relaie aux pages qui regardent.
   *
   * @param machine - la machine qui l'a prise
   * @param celsius - la température mesurée
   * @param measuredAt - l'instant de la mesure, horloge de la machine (ms)
   * @returns `false` si la mesure n'est pas plausible : elle n'est ni retenue
   *   ni relayée, et le flux continue
   */
  publish(machine: string, celsius: number, measuredAt: number): boolean {
    const receivedAt = Date.now();
    if (!isPlausible(machine, celsius, measuredAt, receivedAt)) return false;
    let reading = this.#latest.get(machine);
    if (reading === undefined) {
      reading = { machine, celsius, measuredAt, receivedAt };
      this.#latest.set(machine, reading);
    } else {
      reading.celsius = celsius;
      reading.measuredAt = measuredAt;
      reading.receivedAt = receivedAt;
    }
    // `null` sans abonné : aucune trame n'est construite.
    this.#publish?.({ kind: "reading", ...reading });
    return true;
  }
  // #endregion

  /**
   * Un flux `Push` s'ouvre : la machine s'est nommée par sa première mesure.
   *
   * @param machine - la machine qui pousse
   */
  open(machine: string): void {
    this.#pushing.set(machine, (this.#pushing.get(machine) ?? 0) + 1);
    this.#publish?.({ kind: "push", machine, open: true, accepted: 0 });
  }

  /**
   * Un flux `Push` se ferme — la machine a fini, ou la connexion est tombée.
   *
   * @param machine - la machine qui poussait
   * @param accepted - les mesures retenues sur tout le flux
   */
  close(machine: string, accepted: number): void {
    const left = (this.#pushing.get(machine) ?? 1) - 1;
    if (left > 0) this.#pushing.set(machine, left);
    else this.#pushing.delete(machine);
    this.#publish?.({ kind: "push", machine, open: false, accepted });
  }

  /**
   * La dernière mesure d'une machine — ce que rend `Latest`.
   *
   * @param machine - la machine demandée
   * @returns `undefined` tant qu'elle n'a rien envoyé
   */
  latest(machine: string): ITelemetryReading | undefined {
    return this.#latest.get(machine);
  }

  /** L'état courant — celui d'une page qui arrive. */
  snapshot(): ITelemetryState {
    return {
      pushing: [...this.#pushing.keys()],
      latest: [...this.#latest.values()],
    };
  }

  /**
   * Branche la diffusion — au premier abonné du canal.
   *
   * @param publish - publie un événement sur `demo:telemetry`
   * @returns le détachement, à appeler au départ du dernier abonné
   */
  attach(publish: (event: TelemetryEvent) => void): () => void {
    this.#publish = publish;
    return () => {
      this.#publish = null;
    };
  }
}

/**
 * Une mesure qu'on accepte de relayer : un nom de machine court et non vide,
 * une température physique, une date proche de l'horloge du serveur. Le
 * contrat garantit les TYPES ; les VALEURS, c'est au serveur de les juger.
 */
export function isPlausible(
  machine: string,
  celsius: number,
  measuredAt: number,
  now: number,
): boolean {
  return (
    machine.length > 0 &&
    machine.length <= MACHINE_NAME_MAX &&
    Number.isFinite(celsius) &&
    celsius >= CELSIUS_MIN &&
    celsius <= CELSIUS_MAX &&
    Math.abs(now - measuredAt) <= CLOCK_SKEW_MS
  );
}

export default TelemetryRelayService;
