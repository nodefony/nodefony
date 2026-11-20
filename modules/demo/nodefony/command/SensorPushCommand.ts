import { setInterval } from "node:timers/promises";
import type { MessageInitShape } from "@bufbuild/protobuf";
import { timestampFromMs } from "@bufbuild/protobuf/wkt";
import { Code, ConnectError, createClient } from "@connectrpc/connect";
import { createGrpcTransport } from "@connectrpc/connect-node";
import {
  Command,
  CliKernel,
  CONSOLE_DATA_RUN_PROFILE,
  type OptionsCommandInterface,
} from "nodefony";
import {
  TelemetryService,
  type PushRequestSchema,
} from "../gen/demo/telemetry/v1/telemetry_pb";
import {
  DEFAULT_MACHINE,
  DEFAULT_PUSH_HZ,
  TELEMETRY_PUSH_SCOPE,
} from "../../frontend/src/grpc/grpcDemo";
import { MACHINES, QUANTITIES } from "../../frontend/src/sensor/sensorDemo";
import { TELEMETRY_AREA } from "../config/security";
import { createPlant, temperatureSlot } from "../sensor/plant";
import { createRandom } from "../sensor/random";
import PartnerTokenService, {
  PARTNER_TOKEN_SERVICE,
  PartnerTokenError,
} from "../service/PartnerTokenService";
import { CallFailure, networkFailure } from "./PartnerCallCommand";

/**
 * Nom de la commande — cité par `demos.ts` et par la page ; le test du module
 * vérifie que le renvoi désigne bien cette commande.
 */
export const SENSOR_PUSH_COMMAND = "demo:sensor:push";

/** Bornes de la cadence : le simulateur de la Sonde est réglé pour 50 lectures par seconde. */
export const PUSH_HZ_MAX = 50;

/**
 * Le cycle de vie d'une commande est commenté dans le gabarit de
 * `npx nodefony create command`. Ce fichier ne commente que ce qui lui est
 * propre : être un CLIENT gRPC de l'application qui tourne.
 */
const options: OptionsCommandInterface = {
  // Le jeton se signe pour un compte lu en base : sans base, la commande n'a
  // pas de sens, elle échoue donc franchement.
  runProfile: CONSOLE_DATA_RUN_PROFILE,
  showBanner: false,
  // Services prêts, AUCUN serveur ouvert : la commande APPELLE l'application
  // qui tourne déjà (`npm run dev`), elle n'en démarre pas une seconde.
  kernelEvent: "onReady",
  quietBoot: true,
  examples: [
    "nodefony demo:sensor:push",
    "nodefony demo:sensor:push --count 50",
    'nodefony demo:sensor:push --machine "Compresseur C-201" --rate 2',
  ],
};

/**
 * La MACHINE de la démo gRPC : elle simule la pompe de la Sonde et pousse sa
 * température en gRPC natif (HTTP/2, TLS) sur un seul appel `Push`, ouvert
 * tant qu'elle mesure.
 *
 * Guide pour un agent : un client gRPC Node, c'est un TRANSPORT
 * (`createGrpcTransport` de `@connectrpc/connect-node`) et un CLIENT typé par
 * le code généré (`createClient(TelemetryService, …)`). Un flux client se
 * donne comme un itérable asynchrone : chaque `yield` est un message, la fin
 * de l'itérable ferme l'envoi, et le serveur répond alors. Le jeton vient du
 * même service que `demo:partner:call` (`PartnerTokenService`), pour la
 * ressource de la zone `demo-telemetry`, avec le scope qui ouvre `Push`.
 * Lancée par `nodefony`, la commande reconnaît d'office l'autorité de
 * développement qui a signé le certificat de 5152 — un script Node isolé
 * devrait la déclarer (`NODE_EXTRA_CA_CERTS`). Doc :
 * `@nodefony/framework/docs/grpc.md` ; skill livré :
 * `nodefony-add-grpc-service`.
 */
class SensorPushCommand extends Command {
  constructor(cli: CliKernel) {
    super(
      SENSOR_PUSH_COMMAND,
      "pousse la température d'une machine en gRPC, jusqu'à Ctrl+C",
      cli,
      options,
    );
    this.addOption(
      "-m, --machine <name>",
      `nom de la machine (défaut « ${DEFAULT_MACHINE} »)`,
    );
    this.addOption(
      "-r, --rate <hz>",
      `mesures par seconde, de 1 à ${PUSH_HZ_MAX} (défaut ${DEFAULT_PUSH_HZ})`,
    );
    this.addOption(
      "-c, --count <n>",
      "s'arrête après n mesures, et affiche ce que le serveur a retenu",
    );
    this.addOption(
      "-a, --as <account>",
      "compte porteur du jeton (défaut admin)",
    );
    this.addOption("-u, --url <base>", "adresse de l'application appelée");
    this.addOption("-j, --json", "sortie JSON (scriptable)");
  }

  override async generate(opts: {
    machine?: string;
    rate?: string;
    count?: string;
    as?: string;
    url?: string;
    json?: boolean;
  }): Promise<this> {
    try {
      const machine = opts.machine ?? DEFAULT_MACHINE;
      const hz = integerOption(
        "--rate",
        opts.rate,
        DEFAULT_PUSH_HZ,
        PUSH_HZ_MAX,
      );
      const count = integerOption(
        "--count",
        opts.count,
        Number.POSITIVE_INFINITY,
        Number.MAX_SAFE_INTEGER,
      );
      const tokens = this.#tokens();
      const resource = tokens.resource(TELEMETRY_AREA);
      const base = opts.url ?? new URL(resource).origin;
      // Le scope est DEMANDÉ ; l'émetteur ne le donne qu'à un administrateur.
      // Un autre compte reçoit un jeton sans lui, et c'est le SERVEUR qui
      // refuse (7) : la commande ne juge pas à sa place.
      const { accessToken } = await tokens.issueFor(
        opts.as ?? "admin",
        TELEMETRY_AREA,
        [TELEMETRY_PUSH_SCOPE],
      );
      if (!opts.json) {
        process.stdout.write(
          `▶ ${machine} → ${base} (gRPC, ${hz} mesure${hz > 1 ? "s" : ""}/s)` +
            (Number.isFinite(count)
              ? `, ${count} mesures\n`
              : " — Ctrl+C pour arrêter\n"),
        );
      }
      const result = await this.#push(base, accessToken, machine, hz, count);
      process.stdout.write(
        opts.json
          ? `${JSON.stringify({ machine, ...result })}\n`
          : `■ ${result.sent} envoyées, ${result.accepted} retenues par le serveur\n`,
      );
    } catch (error) {
      if (error instanceof CallFailure) return this.#fail(error);
      if (error instanceof PartnerTokenError) {
        return this.#fail(new CallFailure(error.message, error.remedy));
      }
      throw error;
    }
    return this;
  }

  // #region grpc-client
  /** Ouvre UN appel `Push` et y envoie les mesures, une par tour de cadence. */
  async #push(
    base: string,
    accessToken: string,
    machine: string,
    hz: number,
    count: number,
  ): Promise<{ sent: number; accepted: number }> {
    // gRPC natif : HTTP/2 obligatoire, donc le port TLS (5152 en développement).
    const client = createClient(
      TelemetryService,
      createGrpcTransport({ baseUrl: base }),
    );
    const sent = { n: 0 };
    try {
      const { accepted } = await client.push(
        readings(machine, hz, count, sent),
        { headers: { authorization: `Bearer ${accessToken}` } },
      );
      return { sent: sent.n, accepted };
    } catch (error) {
      throw pushFailure(error, base);
    }
  }
  // #endregion

  /** Le service qui émet les jetons de l'application — le même que `demo:partner:call`. */
  #tokens(): PartnerTokenService {
    const service = this.kernel?.container?.get(PARTNER_TOKEN_SERVICE);
    if (!(service instanceof PartnerTokenService)) {
      throw new CallFailure(
        "service PartnerTokenService introuvable.",
        "le module demo est-il chargé ? npx nodefony inspect modules",
      );
    }
    return service;
  }

  /** Dit la panne et son geste sur la sortie d'erreur, et sort en 1. */
  #fail(failure: CallFailure): this {
    process.stderr.write(`✖ ${failure.message}\n  → ${failure.remedy}\n`);
    process.exitCode = 1;
    return this;
  }
}

// #region grpc-readings
/**
 * Les messages du flux : une mesure par tour de cadence, datée par la
 * machine. La température vient du simulateur de la Sonde (`sensor/plant.ts`) :
 * la même pompe, par un autre chemin.
 */
async function* readings(
  machine: string,
  hz: number,
  count: number,
  sent: { n: number },
): AsyncIterable<MessageInitShape<typeof PushRequestSchema>> {
  const index = Math.max(
    0,
    MACHINES.findIndex((m) => m.name === machine),
  );
  const slot = index * QUANTITIES.length + temperatureSlot;
  const plant = createPlant(createRandom(Date.now() % 0x7fffffff));
  const dt = 1 / hz;
  for await (const _ of setInterval(1000 / hz)) {
    const value = plant.step(dt)[slot] ?? 0;
    yield {
      reading: {
        machine,
        celsius: Math.round(value * 100) / 100,
        measuredAt: timestampFromMs(Date.now()),
      },
    };
    sent.n += 1;
    // Fin de l'itérable = fin de l'envoi : le serveur répond alors.
    if (sent.n >= count) return;
  }
}
// #endregion

/** Traduit un refus ou une panne de l'appel en geste. */
function pushFailure(error: unknown, base: string): CallFailure {
  if (error instanceof ConnectError) {
    if (error.code === Code.Unauthenticated) {
      return new CallFailure(
        `jeton refusé (16 UNAUTHENTICATED) par ${base}.`,
        "l'application qui tourne a-t-elle la même configuration ? relance `npm run dev`",
      );
    }
    if (error.code === Code.PermissionDenied) {
      return new CallFailure(
        `scope refusé (7 PERMISSION_DENIED) par ${base}.`,
        `le jeton doit porter ${TELEMETRY_PUSH_SCOPE} : --as admin`,
      );
    }
    if (error.code === Code.Unimplemented) {
      return new CallFailure(
        `${base} ne sert pas TelemetryService (12 UNIMPLEMENTED).`,
        "le module demo est-il chargé, et bâti ? npx nodefony inspect routes",
      );
    }
  }
  return networkFailure(error, `L'application (${base})`, "npm run dev");
}

/**
 * Lit une option entière bornée.
 *
 * @throws CallFailure si la valeur n'est pas un entier de 1 à `max`
 */
function integerOption(
  name: string,
  raw: string | undefined,
  fallback: number,
  max: number,
): number {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new CallFailure(
      `${name} ${raw} : un entier de 1 à ${max} est attendu.`,
      `${name} ${Math.min(DEFAULT_PUSH_HZ, max)}`,
    );
  }
  return value;
}

export default SensorPushCommand;
