import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, rm, unlink } from "node:fs/promises";
import path from "node:path";
import { Service, Module, injectable } from "nodefony";
import type { IUploadedFile } from "@nodefony/http";
import { getRealtimeHub } from "@nodefony/realtime";
import { USER_REVOKED_EVENT, type IUserRevokedEvent } from "@nodefony/user";
import {
  ATTACHMENT_MAX_BYTES,
  messagePreview,
} from "../../frontend/src/chat/chatContract";
import type {
  ChatAttachment,
  ChatMessage,
  ChatContract,
  ChatReaction,
  MessageNotice,
  RoomFrame,
} from "../../frontend/src/chat/chatContract";
import { roomChannel } from "../../frontend/src/chat/rooms";
import DemoPulseService, { DEMO_PULSE_SERVICE } from "./DemoPulseService";
import RoomService from "./RoomService";
import { RateLimiter } from "../kit/rateLimit";
import { CHAT_WRITE_QUOTA } from "../config/config";
import { defineDemoConfig } from "../config/defineModuleConfig";
import { describeFile, sniffImage } from "../../frontend/src/kit/preview";

// La borne vit dans le contrat, lue par la page et le serveur : réexportée
// pour qui la cherche ici.
export { CHAT_HISTORY_LIMIT } from "../../frontend/src/chat/chatContract";

/** Ce qu'un écrivain fournit : le reste (`id`, `sentAt`) est posé à l'archivage. */
export interface IMessageDraft {
  /** L'identité stable du compte (`this.user.id`), jamais montrée au salon. */
  authorId: string;
  /** Le nom affiché, tel qu'il est au moment de l'envoi. */
  author: string;
  text: string;
  attachments?: ChatAttachment[];
  /** Le message auquel il répond (XEP-0461) — l'archive vérifie qu'il est du salon. */
  replyTo?: string;
}

/**
 * Où vivent les messages. `RoomService` l'implémente sur la base de la démo ;
 * un test en donne un en mémoire. Le service du salon ne sait rien de plus.
 */
export interface IMessageArchive {
  /** Archive un message, et le rend avec son `id` et son instant. */
  archive(roomId: string, draft: IMessageDraft): Promise<ChatMessage>;
  /**
   * Les derniers messages d'un salon, dans l'ordre d'envoi.
   *
   * @param limit - nombre maximal de messages rendus
   */
  history(roomId: string, limit: number): Promise<ChatMessage[]>;
  /** Remplace le texte d'un message de son auteur (XEP-0308), et le rend. */
  edit(
    roomId: string,
    messageId: string,
    authorId: string,
    text: string,
  ): Promise<ChatMessage>;
  /**
   * Retire un message (XEP-0424/0425), et rend le message retiré avec les
   * pièces qu'il portait — à effacer du disque.
   */
  retract(
    roomId: string,
    messageId: string,
    userId: string,
  ): Promise<{ message: ChatMessage; attachments: ChatAttachment[] }>;
  /**
   * Remplace l'ensemble des réactions d'une personne sur un message
   * (XEP-0444), et rend toutes celles du message.
   */
  react(
    roomId: string,
    messageId: string,
    who: { id: string; name: string },
    emojis: readonly string[],
  ): Promise<ChatReaction[]>;
  /**
   * Efface tout ce qu'un compte supprimé a laissé (RGPD, art. 17), et rend
   * ce qui reste à faire hors de l'archive.
   */
  forget(userId: string): Promise<IForgotten>;
  /**
   * Les membres d'un salon privé ou à deux qui ne le regardent pas (D53) :
   * ni l'auteur, ni qui est abonné au canal du salon. Un salon public rend
   * une liste vide — on n'alerte pas cent membres d'un salon ouvert.
   *
   * @param authorId - l'auteur du message, jamais alerté de son propre envoi
   */
  absentMembers(roomId: string, authorId: string): Promise<string[]>;
}

/** Ce qu'un compte effacé laisse à faire hors de l'archive. */
export interface IForgotten {
  /** Les pièces que portaient ses messages, à effacer du disque. */
  attachments: ChatAttachment[];
  /**
   * Les trames qui mettent les écrans ouverts à jour : ses messages retirés,
   * les réactions qu'il avait posées chez les autres recomptées.
   */
  frames: { roomId: string; frame: RoomFrame }[];
}

/**
 * Pièces gardées sur disque, tous comptes confondus : au-delà, les plus
 * anciennes sortent. Une borne de DISQUE ; celle d'un compte est plus basse.
 */
export const CHAT_ATTACHMENT_LIMIT = 200;

/**
 * Pièces gardées par compte : au-delà, SES plus anciennes sortent. Sans elle,
 * un seul compte qui enchaîne les envois viderait les pièces de tous les salons.
 */
export const CHAT_ATTACHMENT_PER_ACCOUNT = 20;

/** Écritures accordées par défaut — réglables par `chatWriteQuota` (config de la démo). */
export { CHAT_WRITE_QUOTA };

/** Durée de la fenêtre des quotas d'écriture et de frappe, en ms. */
export const CHAT_WRITE_WINDOW_MS = 10_000;

/**
 * Signaux « j'écris » accordés par compte et par fenêtre : la page en envoie un
 * toutes les deux secondes au plus, soit cinq — le double laisse passer deux
 * onglets ouverts.
 */
export const CHAT_TYPING_QUOTA = 10;

/** Ce que compte un quota du chat : une écriture, ou un signal de frappe. */
export type ChatQuota = "write" | "typing";

/** Le dossier des pièces, sous le `tmp/` de l'application. */
export const CHAT_ATTACHMENT_DIR = "demo-chat";

/** Une pièce gardée : ce que le salon annonce, et de quoi la servir. */
export interface IStoredAttachment {
  meta: ChatAttachment;
  /**
   * Le salon du message qui l'a portée : la servir exige d'y être admis. Sans
   * lui, l'identifiant suffirait — un éjecté, ou le lien d'un salon privé
   * recopié ailleurs, ouvrirait la pièce.
   */
  roomId: string;
  /** Le compte qui l'a déposée : sa borne (`CHAT_ATTACHMENT_PER_ACCOUNT`) se compte sur lui. */
  ownerId: string;
  /** Chemin du fichier, choisi par le serveur (l'id), jamais par le client. */
  file: string;
  /** Le type servi, tiré des octets. */
  mime: string;
}

/**
 * L'historique du salon et ses pièces jointes — un service, parce que le
 * contrôleur temps réel est instancié PAR CONNEXION : l'historique doit
 * survivre à chacune.
 *
 * Guide pour un agent : les messages vivent EN BASE, derrière une archive
 * (`IMessageArchive`) — `RoomService` sur la base SQLite de la démo, un
 * double en mémoire dans un test. Le contrôleur n'en sait rien. Les pièces,
 * elles, vivent sur le disque de CE serveur et repartent à zéro au
 * démarrage : un message relu après coup annonce sa pièce `expired`. Avec
 * plusieurs pods, un stockage partagé (objet, base) les remplace derrière
 * `saveAttachments` et `attachment`. Injecté par `@Inject("ChatService")`.
 */
@injectable()
class ChatService extends Service {
  #archive: IMessageArchive | null;
  readonly #attachments = new Map<string, IStoredAttachment>();
  readonly #dir: string | null;
  #ready: Promise<string> | null = null;
  /** Les quotas, alloués au premier geste compté. */
  /** Le module qui le déclare : sa config règle le quota d'écriture. */
  readonly #module: Module | null;
  #writes: RateLimiter | null = null;
  #typings: RateLimiter | null = null;

  /**
   * @param module - le module qui le déclare ; absent dans un test, qui le
   *   construit sans kernel
   * @param attachmentDir - le dossier des pièces ; par défaut
   *   `<tmp de l'application>/demo-chat`
   * @param archive - où vivent les messages ; par défaut le service des
   *   salons (`rooms`), résolu au premier usage
   */
  constructor(
    module?: Module,
    attachmentDir?: string,
    archive?: IMessageArchive,
  ) {
    super("chat", module?.container ?? undefined, module?.notificationsCenter);
    this.#module = module ?? null;
    this.#dir = attachmentDir ?? null;
    this.#archive = archive ?? null;
    this.kernel?.on(USER_REVOKED_EVENT, (event: IUserRevokedEvent) => {
      if (event.reason !== "deleted") return;
      // Un écouteur d'événement ne rend rien à personne : une erreur non
      // attrapée ici finirait en rejet orphelin, sans trace du compte visé.
      this.forget(event.id).catch((error: unknown) =>
        this.log(
          `effacement du compte ${event.id} incomplet : ${error instanceof Error ? error.message : String(error)}`,
          "ERROR",
        ),
      );
    });
  }

  /**
   * Un compte supprimé de l'application : l'archive efface ses messages,
   * réactions et appartenances ; ici, les pièces de ses messages quittent le
   * disque — plus servies à personne —, et chaque écran ouvert voit ses
   * messages retirés et les réactions recomptées, sans recharger la page.
   */
  async forget(userId: string): Promise<void> {
    const { attachments, frames } = await this.#messages().forget(userId);
    await this.dropAttachments(attachments);
    for (const { roomId, frame } of frames) publishFrame(roomId, frame);
  }

  /**
   * L'archive des messages : celle reçue, sinon le service des salons.
   *
   * @throws Error si aucune n'est joignable (module mal câblé)
   */
  #messages(): IMessageArchive {
    if (this.#archive !== null) return this.#archive;
    const rooms = this.get<unknown>("rooms");
    if (!(rooms instanceof RoomService))
      throw new Error(
        "ChatService : aucune archive de messages (service « rooms » absent)",
      );
    this.#archive = rooms;
    return rooms;
  }

  /**
   * Compte un geste d'écriture du compte `userId`, ou le refuse quand sa
   * fenêtre est épuisée. Le service dit COMBIEN attendre ; le contrôleur en fait
   * un 429 avec `Retry-After`. Appelé AVANT toute lecture en base.
   *
   * @returns `0` si le geste est accordé ; sinon les secondes à attendre
   */
  spend(kind: ChatQuota, userId: string): number {
    if (kind === "typing") {
      this.#typings ??= new RateLimiter(
        CHAT_TYPING_QUOTA,
        CHAT_WRITE_WINDOW_MS,
      );
      return this.#typings.take(userId);
    }
    // Le réglage se lit au premier geste : la config est validée depuis le boot.
    this.#writes ??= new RateLimiter(
      defineDemoConfig(this.#module?.options).chatWriteQuota,
      CHAT_WRITE_WINDOW_MS,
    );
    return this.#writes.take(userId);
  }

  // #region chat-store
  /**
   * Publie un message au salon : archivé (la base lui donne son `id`), diffusé
   * à tous les abonnés de son canal `chat:room:<id>`, compté dans le pouls de
   * l'accueil. SEULE voie d'écriture — la route d'envoi, l'envoi de pièces et
   * l'outil MCP `demo_chat_post` l'appellent : trois copies de ces trois
   * gestes divergeraient.
   *
   * @returns le message tel que le salon l'a reçu
   */
  async publish(roomId: string, draft: IMessageDraft): Promise<ChatMessage> {
    const message = await this.#messages().archive(roomId, draft);
    publishFrame(roomId, { kind: "message", message });
    const pulse = this.get<unknown>(DEMO_PULSE_SERVICE);
    if (pulse instanceof DemoPulseService) pulse.recordChatMessage();
    // L'alerte ne retarde pas l'envoi, et son échec ne le défait pas : le
    // message est archivé et diffusé, seule la pastille d'un absent manquera.
    this.#alertAbsent(roomId, draft.authorId, message).catch((error: unknown) =>
      this.log(
        `alerte du salon ${roomId} non envoyée : ${error instanceof Error ? error.message : String(error)}`,
        "WARNING",
      ),
    );
    return message;
  }

  // #region chat-alerts-server
  /**
   * Prévient les membres absents d'un salon privé ou à deux (D53) : UNE
   * alerte, construite une fois, poussée sur le canal personnel de chacun —
   * il les joint sur tous les serveurs, sur tous leurs onglets.
   */
  async #alertAbsent(
    roomId: string,
    authorId: string,
    message: ChatMessage,
  ): Promise<void> {
    const absent = await this.#messages().absentMembers(roomId, authorId);
    if (absent.length === 0) return;
    const notice: MessageNotice = {
      type: "room:message",
      roomId,
      author: message.author,
      preview: messagePreview(message),
    };
    const hub = getRealtimeHub<ChatContract>();
    for (const userId of absent) hub.publishToUser(userId, notice);
  }
  // #endregion

  /**
   * Les derniers messages, dans l'ordre d'envoi ; une pièce dont le fichier
   * n'est plus là (redémarrage, borne) est annoncée `expired`.
   *
   * @param limit - nombre maximal de messages rendus
   */
  async recent(roomId: string, limit: number): Promise<ChatMessage[]> {
    const messages = await this.#messages().history(roomId, limit);
    for (const message of messages)
      for (const piece of message.attachments ?? [])
        if (!this.#attachments.has(piece.id)) piece.expired = true;
    return messages;
  }

  /**
   * « Untel écrit… » dans un salon : un message ÉPHÉMÈRE du canal, ni gardé ni
   * compté — il suit donc les droits du salon (un salon privé ne fuit pas sa
   * frappe), ce qu'un canal de frappe commun à tous ne ferait pas.
   */
  typing(roomId: string, author: string): void {
    publishFrame(roomId, { kind: "typing", author });
  }
  // #endregion

  // #region chat-gestures
  /**
   * Modifie un message : l'archive vérifie l'auteur, puis le message ENTIER
   * repart sur le salon — chaque page remplace le sien par son `id`.
   */
  async edit(
    roomId: string,
    messageId: string,
    authorId: string,
    text: string,
  ): Promise<ChatMessage> {
    const message = await this.#messages().edit(
      roomId,
      messageId,
      authorId,
      text,
    );
    publishFrame(roomId, { kind: "message", message });
    return message;
  }

  /**
   * Retire un message : effacé en base par l'archive, ses pièces effacées du
   * disque ici, puis annoncé retiré au salon.
   */
  async retract(
    roomId: string,
    messageId: string,
    userId: string,
  ): Promise<ChatMessage> {
    const { message, attachments } = await this.#messages().retract(
      roomId,
      messageId,
      userId,
    );
    await this.dropAttachments(attachments);
    publishFrame(roomId, { kind: "message", message });
    return message;
  }

  /**
   * Réagit à un message : l'ensemble de la personne remplace le précédent,
   * et TOUTES les réactions du message repartent — jamais un delta.
   */
  async react(
    roomId: string,
    messageId: string,
    who: { id: string; name: string },
    emojis: readonly string[],
  ): Promise<ChatReaction[]> {
    const reactions = await this.#messages().react(
      roomId,
      messageId,
      who,
      emojis,
    );
    publishFrame(roomId, { kind: "reactions", messageId, reactions });
    return reactions;
  }
  // #endregion

  // #region chat-attachments
  /**
   * Garde les pièces d'un message : chaque fichier est DÉPLACÉ (jamais lu en
   * entier, sauf une pièce de 2 Mio au plus à prévisualiser) sous un nom tiré
   * par le serveur, puis classé d'après ses octets — image, PDF, archive,
   * document, tableur, texte UTF-8, ou simple fichier.
   *
   * @param roomId - le salon du message : la pièce ne se sert qu'à ses admis
   * @param ownerId - le compte qui les dépose : sa borne se compte sur lui
   * @returns ce que le salon annoncera de chaque pièce
   */
  async saveAttachments(
    roomId: string,
    ownerId: string,
    files: readonly IUploadedFile[],
  ): Promise<ChatAttachment[]> {
    const dir = await this.#directory();
    const saved: ChatAttachment[] = [];
    for (const upload of files) {
      const id = randomUUID();
      const file = path.join(dir, id);
      await upload.moveAsync(file);
      const stored = await classify(
        roomId,
        ownerId,
        id,
        upload.filename,
        upload.size,
        file,
      );
      this.#attachments.set(id, stored);
      saved.push(stored.meta);
    }
    await this.#evict(ownerId);
    return saved;
  }

  /**
   * Efface des pièces gardées — d'un message retiré, ou d'un envoi refusé
   * après leur réception : rien ne reste sur le disque.
   */
  async dropAttachments(pieces: readonly ChatAttachment[]): Promise<void> {
    for (const piece of pieces) {
      const stored = this.#attachments.get(piece.id);
      if (stored === undefined) continue;
      this.#attachments.delete(piece.id);
      await unlink(stored.file).catch(() => undefined);
    }
  }

  /** Une pièce gardée, par son id ; `undefined` si inconnue ou sortie. */
  attachment(id: string): IStoredAttachment | undefined {
    return this.#attachments.get(id);
  }

  /** Efface des fichiers reçus mais refusés : rien ne reste sur le disque. */
  async discard(files: readonly IUploadedFile[]): Promise<void> {
    const dir = await this.#directory();
    for (const upload of files) {
      const file = path.join(dir, randomUUID());
      await upload.moveAsync(file);
      await unlink(file);
    }
  }

  /**
   * Au-delà des bornes, les plus anciennes pièces sortent : fichier effacé.
   * D'abord celles du compte qui vient de déposer, au-delà de SA borne — il ne
   * pousse dehors que les siennes —, puis les plus anciennes de tous, au-delà
   * de la borne du disque. L'historique relu les annonce alors `expired`
   * (`recent`). L'ordre d'insertion de la `Map` est l'ordre d'âge.
   */
  async #evict(ownerId: string): Promise<void> {
    let owned = 0;
    for (const stored of this.#attachments.values())
      if (stored.ownerId === ownerId) owned++;
    for (const [id, stored] of this.#attachments) {
      if (owned <= CHAT_ATTACHMENT_PER_ACCOUNT) break;
      if (stored.ownerId !== ownerId) continue;
      owned--;
      this.#attachments.delete(id);
      await unlink(stored.file).catch(() => undefined);
    }
    for (const [id, stored] of this.#attachments) {
      if (this.#attachments.size <= CHAT_ATTACHMENT_LIMIT) return;
      this.#attachments.delete(id);
      await unlink(stored.file).catch(() => undefined);
    }
  }
  // #endregion

  /**
   * Le dossier des pièces, vidé au premier usage : l'index vit en mémoire, et
   * les fichiers d'un démarrage précédent n'y figurent plus. Un sous-dossier
   * par processus : sous `nodefony cluster`, un worker ne vide pas celui d'un
   * autre.
   */
  #directory(): Promise<string> {
    this.#ready ??= (async () => {
      const tmp = this.kernel?.tmpDir?.path;
      const dir =
        this.#dir ??
        (typeof tmp === "string"
          ? path.join(tmp, CHAT_ATTACHMENT_DIR, String(process.pid))
          : null);
      if (dir === null)
        throw new Error("ChatService : aucun dossier pour les pièces jointes");
      await rm(dir, { recursive: true, force: true });
      await mkdir(dir, { recursive: true });
      return dir;
    })();
    return this.#ready;
  }
}

/**
 * Classe une pièce d'après ses octets : image, puis conteneur reconnu (PDF,
 * archive, bureautique), puis texte, sinon fichier — `describeFile` du kit,
 * le MÊME code que l'aperçu du navigateur avant l'envoi. Le serveur le
 * rejoue : l'aperçu annoncé à tous ne vient jamais du navigateur.
 */
async function classify(
  roomId: string,
  ownerId: string,
  id: string,
  name: string,
  size: number,
  file: string,
): Promise<IStoredAttachment> {
  if (size <= ATTACHMENT_MAX_BYTES) {
    const described = await describeFile(await readFile(file));
    return {
      meta: { id, name, size, ...described.fields },
      roomId,
      ownerId,
      file,
      mime: described.mime,
    };
  }
  // Au-delà du plafond (filet : l'envoi l'a déjà refusé), la tête seule.
  const handle = await open(file, "r");
  const head = new Uint8Array(12);
  try {
    await handle.read(head, 0, head.length, 0);
  } finally {
    await handle.close();
  }
  const image = sniffImage(head);
  return image === null
    ? {
        meta: { id, name, size, kind: "file" },
        roomId,
        ownerId,
        file,
        mime: "application/octet-stream",
      }
    : {
        meta: { id, name, size, kind: "image" },
        roomId,
        ownerId,
        file,
        mime: image,
      };
}

/**
 * Publie une trame sur le canal d'un salon, par le hub lu à travers le
 * contrat : la famille `chat:room:<id>` y est déclarée, une trame qui n'est
 * pas une `RoomFrame` ne compile pas — ici comme dans la page.
 */
function publishFrame(roomId: string, frame: RoomFrame): void {
  getRealtimeHub<ChatContract>().publish(roomChannel(roomId), frame);
}

export default ChatService;
