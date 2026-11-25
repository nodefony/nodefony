import type { MessageInitShape } from "@bufbuild/protobuf";
import { timestampFromMs, timestampMs } from "@bufbuild/protobuf/wkt";
import { Inject } from "nodefony";
import { RequireScope } from "@nodefony/framework";
import { GrpcController, GrpcService } from "@nodefony/framework/grpc";
import type { ContextType } from "@nodefony/http";
import {
  TelemetryService,
  type LatestRequest,
  type LatestResponseSchema,
  type PushRequest,
  type PushResponseSchema,
} from "../gen/demo/telemetry/v1/telemetry_pb";
import { TELEMETRY_PUSH_SCOPE } from "../../frontend/src/grpc/grpcDemo";
import type TelemetryRelayService from "../service/TelemetryRelayService";

/**
 * `demo.telemetry.v1.TelemetryService` : une machine pousse ses mesures
 * (`Push`), n'importe qui lit la dernière (`Latest`).
 *
 * Guide pour un agent : une méthode gRPC est une ROUTE — le pare-feu, les
 * gardes et le journal valent comme partout. Le contrôleur ne fait que
 * TRADUIRE entre les messages du contrat (`nodefony/gen/`, généré par
 * `buf generate`, jamais édité) et le service qui porte la logique
 * (`TelemetryRelayService`). Une méthode du contrat absente de la classe, ou
 * mal typée, ne compile pas. Les trois protocoles (gRPC, gRPC-Web, Connect)
 * sont servis d'office, sur les serveurs déjà ouverts : aucun port neuf.
 * Équivalent généré : `npx nodefony create controller --kind grpc` (à venir,
 * #764) ; skill livré : `nodefony-add-grpc-service`. Doc :
 * `@nodefony/framework/docs/grpc.md`.
 */
// #region grpc-controller
@GrpcService(TelemetryService)
class TelemetryController extends GrpcController {
  // Un singleton : la dernière mesure vit dans le service, pas ici.
  constructor(
    context: ContextType,
    @Inject("TelemetryRelayService")
    private readonly relay: TelemetryRelayService,
  ) {
    super("TelemetryController", context);
  }
  // #endregion

  // #region grpc-push
  /**
   * Flux CLIENT : la machine envoie tant qu'elle mesure, le serveur répond une
   * fois, à la fin, avec le nombre de mesures retenues.
   *
   * La zone `demo-telemetry` exige un jeton émis pour cette méthode ; le scope
   * ci-dessous, qu'il ait été ACCORDÉ. Sans jeton : 16 `UNAUTHENTICATED` ;
   * jeton sans le scope : 7 `PERMISSION_DENIED` — le framework traduit, la
   * méthode n'est jamais appelée.
   */
  @RequireScope(TELEMETRY_PUSH_SCOPE)
  async push(
    requests: AsyncIterable<PushRequest>,
  ): Promise<MessageInitShape<typeof PushResponseSchema>> {
    let accepted = 0;
    let machine: string | null = null;
    try {
      for await (const { reading } of requests) {
        if (reading?.measuredAt === undefined) continue;
        if (machine === null) {
          // La machine se nomme par sa première mesure : le flux « s'ouvre » là.
          machine = reading.machine;
          this.relay.open(machine);
        }
        const measuredAt = timestampMs(reading.measuredAt);
        if (this.relay.publish(reading.machine, reading.celsius, measuredAt)) {
          accepted += 1;
        }
      }
    } finally {
      // Fin normale, machine coupée, serveur qui s'arrête : la page le sait.
      if (machine !== null) this.relay.close(machine, accepted);
    }
    return { accepted };
  }
  // #endregion

  // #region grpc-latest
  /**
   * UNAIRE et sans effet de bord (`NO_SIDE_EFFECTS` dans le contrat) : servie
   * aussi en `GET`, qu'un cache, `curl` ou un simple `fetch` savent appeler.
   */
  latest(
    request: LatestRequest,
  ): MessageInitShape<typeof LatestResponseSchema> {
    const reading = this.relay.latest(request.machine);
    if (reading === undefined) return {};
    return {
      reading: {
        machine: reading.machine,
        celsius: reading.celsius,
        measuredAt: timestampFromMs(reading.measuredAt),
      },
    };
  }
  // #endregion
}

export default TelemetryController;
