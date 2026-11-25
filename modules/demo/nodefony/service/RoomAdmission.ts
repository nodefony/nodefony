import { Inject, Service, injectable } from "nodefony";
import type { IChannelAdmission, ISubscriberIdentity } from "nodefony";
import { admissionOf, roomIdOf } from "../../frontend/src/chat/rooms";
import type RoomService from "./RoomService";

// #region rooms-admission-class
/**
 * Qui entre dans un salon — la règle d'admission du canal `chat:room:*`,
 * demandée UNE fois au `subscribe` (et à chaque reconnexion).
 *
 * Guide pour un agent : une CLASSE, parce que la règle lit la base (les
 * membres, les invitations) ; ses services arrivent par le constructeur, et
 * une seule instance sert tous les abonnés — elle ne garde rien par abonné.
 * La décision elle-même est la règle pure `admissionOf`
 * (`frontend/src/chat/rooms.ts`), éprouvée sans base ni serveur. Seul
 * `true` admet ; une exception vaut refus. La réponse est RETENUE sur la
 * connexion : un retrait passe par une éjection explicite
 * (`RoomService.removeMember`). Doc :
 * `@nodefony/realtime/docs/canaux-a-membres.md`.
 */
@injectable()
class RoomAdmission extends Service implements IChannelAdmission {
  constructor(@Inject("RoomService") private readonly rooms: RoomService) {
    super("roomAdmission");
  }

  /** Admet-on `who` sur ce salon ? Lu en base, tranché par la règle pure. */
  async allow(channel: string, who: ISubscriberIdentity): Promise<boolean> {
    const roomId = roomIdOf(channel);
    if (roomId === null) return false;
    const userId = who.account ? who.id : null;
    const facts = await this.rooms.admissionFacts(roomId, userId);
    return admissionOf(facts, Date.now()) !== "refused";
  }
}
// #endregion

export default RoomAdmission;
