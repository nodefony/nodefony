import { Service, Module, injectable } from "nodefony";
import type { IDemoPulse } from "../../frontend/src/pulse";

/** Intervalle minimal entre deux publications du pouls : au plus une par seconde. */
export const PULSE_MIN_INTERVAL_MS = 1000;

/**
 * Clé d'INSTANCE du service dans le conteneur (`this.get(…)`) — à ne pas
 * confondre avec le nom de CLASSE que prend `@Inject("DemoPulseService")`.
 */
export const DEMO_PULSE_SERVICE = "demoPulse";

/**
 * Le pouls de la démo : ses compteurs vivants, et leur diffusion COALESCÉE sur
 * le canal d'état `demo:pulse`.
 *
 * Guide pour un agent :
 *  • UN service pour tous : les contrôleurs sont instanciés par requête ou par
 *    connexion, le compteur doit survivre à chacun — il vit ici, injecté par
 *    `@Inject("DemoPulseService")` dans `PartnerController` (qui compte) et
 *    `DemoRealtimeController` (qui diffuse) ; `ChatService` le retrouve par sa
 *    clé de conteneur (`DEMO_PULSE_SERVICE`) ;
 *  • un canal d'ÉTAT ne publie pas à chaque événement : il publie la dernière
 *    valeur, au plus une fois par intervalle. Cent appels dans la même seconde
 *    donnent UNE trame ; un appel isolé part tout de suite ;
 *  • rien ne part tant que personne n'écoute — `attach` au premier abonné,
 *    détachement au dernier. Aucun battement périodique : une socket qui se tait
 *    quand il ne se passe rien. Compter reste permis sans abonné : un entier.
 *
 * Les compteurs sont ceux de CE processus depuis son démarrage.
 */
@injectable()
class DemoPulseService extends Service {
  #partnerCalls = 0;
  #chatMessages = 0;
  #publish: ((pulse: IDemoPulse) => void) | null = null;
  #lastSent = Number.NEGATIVE_INFINITY;
  #timer: ReturnType<typeof setTimeout> | null = null;

  /**
   * @param module - le module qui le déclare ; absent dans un test, qui le
   *   construit sans kernel
   */
  constructor(module?: Module) {
    super(
      DEMO_PULSE_SERVICE,
      module?.container ?? undefined,
      module?.notificationsCenter,
    );
  }

  /** Le pouls courant — l'état initial d'une page qui arrive. */
  snapshot(): IDemoPulse {
    return {
      partner: { calls: this.#partnerCalls },
      chat: { messages: this.#chatMessages },
    };
  }

  /** Un appel authentifié a atteint `/demo/api/partner`. */
  recordPartnerCall(): void {
    this.#partnerCalls += 1;
    this.#schedule();
  }

  /** Un message a été envoyé au salon du chat. */
  recordChatMessage(): void {
    this.#chatMessages += 1;
    this.#schedule();
  }

  /**
   * Branche la diffusion — au premier abonné du canal.
   *
   * @param publish - publie une valeur sur `demo:pulse`
   * @returns le détachement, à appeler au départ du dernier abonné
   */
  attach(publish: (pulse: IDemoPulse) => void): () => void {
    this.#publish = publish;
    return () => {
      this.#publish = null;
      if (this.#timer !== null) {
        clearTimeout(this.#timer);
        this.#timer = null;
      }
    };
  }

  /** Une publication au plus par intervalle ; les changements suivants s'y fondent. */
  #schedule(): void {
    if (this.#publish === null || this.#timer !== null) return;
    const wait = Math.max(
      0,
      this.#lastSent + PULSE_MIN_INTERVAL_MS - Date.now(),
    );
    this.#timer = setTimeout(() => this.#flush(), wait);
  }

  #flush(): void {
    this.#timer = null;
    if (this.#publish === null) return;
    this.#lastSent = Date.now();
    this.#publish(this.snapshot());
  }
}

export default DemoPulseService;
