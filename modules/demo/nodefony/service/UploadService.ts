import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, rm, unlink } from "node:fs/promises";
import path from "node:path";
import { Service, Module, injectable } from "nodefony";
import { HttpError, type IUploadedFile } from "@nodefony/http";
import { USER_REVOKED_EVENT, type IUserRevokedEvent } from "@nodefony/user";
import {
  KIND_HEAD_BYTES,
  kindOf,
  UPLOAD_KEEP,
  type IStoredFile,
} from "../../frontend/src/upload/uploadDemo";

/** Fichiers gardés en tout, tous comptes confondus : la borne du disque. */
export const UPLOAD_LIMIT = 40;

/** Sous-dossier du dossier temporaire de l'application. */
export const UPLOAD_DIR = "demo-upload";

/** Un fichier rangé, et ce que le serveur seul en sait. */
export interface IStoredUpload {
  meta: IStoredFile;
  ownerId: string;
  /** Chemin sur le disque — nommé par l'identifiant, jamais par le client. */
  file: string;
}

/**
 * Les fichiers reçus par la démo « Envoi de fichiers » : chacun DÉPLACÉ sous
 * un nom tiré par le serveur, reconnu à ses octets, et compté sur son compte.
 *
 * Guide pour un agent : utilisé par `controllers/UploadController.ts`,
 * injecté par `@Inject("UploadService")`. L'index vit en mémoire et le
 * dossier est vidé au premier usage (même choix que les pièces du chat) :
 * une démo jetable, pas un stockage. Au-delà de `UPLOAD_KEEP` fichiers par
 * compte, ou de `UPLOAD_LIMIT` en tout, le plus ancien sort — le disque reste
 * borné quoi que fassent les visiteurs.
 */
@injectable()
class UploadService extends Service {
  readonly #files = new Map<string, IStoredUpload>();
  readonly #dir: string | null;
  #ready: Promise<string> | null = null;

  /**
   * @param module - le module qui le déclare
   * @param dir - dossier imposé (tests) ; sinon le temporaire de l'application
   */
  constructor(module?: Module, dir?: string) {
    // « demo-upload », jamais « upload » : c’est le nom du service d’envoi du
    // framework, que chaque requête relit — le même nom l’écraserait.
    super(
      "demo-upload",
      module?.container ?? undefined,
      module?.notificationsCenter,
    );
    this.#dir = dir ?? null;
    this.kernel?.on(USER_REVOKED_EVENT, (event: IUserRevokedEvent) => {
      if (event.reason !== "deleted") return;
      this.forget(event.id).catch((error: unknown) =>
        this.log(
          `fichiers du compte ${event.id} non effacés : ${error instanceof Error ? error.message : String(error)}`,
          "ERROR",
        ),
      );
    });
  }

  // #region upload-keep
  /**
   * Garde un fichier reçu en multipart : DÉPLACÉ (jamais relu en entier)
   * sous un identifiant tiré ici, puis reconnu à ses premiers octets.
   * L'empreinte vient de la réception : la route la demande
   * (`upload.hashAlgorithm`), le framework la calcule pendant le flux.
   */
  async keep(ownerId: string, upload: IUploadedFile): Promise<IStoredFile> {
    const id = randomUUID();
    const file = path.join(await this.#directory(), id);
    await upload.moveAsync(file);
    const sha256 =
      typeof upload.hash === "string" ? upload.hash : await hashFile(file);
    return this.#store(ownerId, id, file, {
      name: upload.filename,
      size: upload.size,
      declared: upload.mimeType || null,
      sha256,
      head: await readHead(file),
    });
  }
  // #endregion

  // #region upload-raw
  /**
   * Garde un corps BRUT, lu en flux par l'action : rien n'a été lu avant
   * elle, donc aucune borne du pipeline ne s'applique — c'est ICI qu'on
   * compte. Au-delà de `max` octets, le fichier commencé est effacé et la
   * requête reçoit 413.
   */
  async keepStream(
    ownerId: string,
    name: string,
    declared: string | null,
    body: AsyncIterable<unknown>,
    max: number,
  ): Promise<IStoredFile> {
    const id = randomUUID();
    const file = path.join(await this.#directory(), id);
    const handle = await open(file, "w");
    const hasher = createHash("sha256");
    const head = new Uint8Array(KIND_HEAD_BYTES);
    const encoder = new TextEncoder();
    let size = 0;
    try {
      for await (const chunk of body) {
        const bytes =
          chunk instanceof Uint8Array ? chunk : encoder.encode(String(chunk));
        if (size < head.length) {
          head.set(bytes.subarray(0, head.length - size), size);
        }
        size += bytes.byteLength;
        if (size > max) {
          throw new HttpError(`corps de plus de ${max} octets`, 413);
        }
        hasher.update(bytes);
        await handle.write(bytes);
      }
    } catch (error) {
      await handle.close();
      await unlink(file).catch(() => undefined);
      throw error;
    }
    await handle.close();
    return this.#store(ownerId, id, file, {
      name,
      size,
      declared,
      sha256: hasher.digest("hex"),
      head: head.subarray(0, Math.min(size, head.length)),
    });
  }
  // #endregion

  /** Les fichiers d'un compte, du plus récent au plus ancien. */
  list(ownerId: string): IStoredFile[] {
    const mine: IStoredFile[] = [];
    for (const stored of this.#files.values())
      if (stored.ownerId === ownerId) mine.push(stored.meta);
    return mine.reverse();
  }

  /**
   * Un fichier du compte, ou `undefined` — celui d'un autre compte aussi :
   * un identifiant d'ailleurs ne dit pas qu'il existe.
   */
  find(ownerId: string, id: string): IStoredUpload | undefined {
    const stored = this.#files.get(id);
    return stored?.ownerId === ownerId ? stored : undefined;
  }

  /** Un compte supprimé : ses fichiers quittent le disque. */
  async forget(ownerId: string): Promise<void> {
    for (const [id, stored] of this.#files) {
      if (stored.ownerId !== ownerId) continue;
      this.#files.delete(id);
      await unlink(stored.file).catch(() => undefined);
    }
  }

  /** Range un fichier reçu, puis fait de la place au-delà des bornes. */
  async #store(
    ownerId: string,
    id: string,
    file: string,
    received: {
      name: string;
      size: number;
      declared: string | null;
      sha256: string;
      head: Uint8Array;
    },
  ): Promise<IStoredFile> {
    const { kind, type } = kindOf(received.head);
    const meta: IStoredFile = {
      id,
      name: received.name,
      size: received.size,
      declared: received.declared,
      type,
      kind,
      sha256: received.sha256,
      at: Date.now(),
    };
    this.#files.set(id, { meta, ownerId, file });
    await this.#evict(ownerId);
    return meta;
  }

  /**
   * Au-delà des bornes, les plus anciens sortent : d'abord ceux du compte qui
   * vient de déposer, au-delà de SA borne, puis les plus anciens de tous.
   * L'ordre d'insertion de la `Map` est l'ordre d'âge.
   */
  async #evict(ownerId: string): Promise<void> {
    let owned = 0;
    for (const stored of this.#files.values())
      if (stored.ownerId === ownerId) owned++;
    for (const [id, stored] of this.#files) {
      if (owned <= UPLOAD_KEEP) break;
      if (stored.ownerId !== ownerId) continue;
      owned--;
      this.#files.delete(id);
      await unlink(stored.file).catch(() => undefined);
    }
    for (const [id, stored] of this.#files) {
      if (this.#files.size <= UPLOAD_LIMIT) return;
      this.#files.delete(id);
      await unlink(stored.file).catch(() => undefined);
    }
  }

  /**
   * Le dossier des fichiers, vidé au premier usage : l'index vit en mémoire.
   * Un sous-dossier par processus : sous `nodefony cluster`, un worker ne
   * vide pas celui d'un autre.
   */
  #directory(): Promise<string> {
    this.#ready ??= (async () => {
      const tmp = this.kernel?.tmpDir?.path;
      const dir =
        this.#dir ??
        (typeof tmp === "string"
          ? path.join(tmp, UPLOAD_DIR, String(process.pid))
          : null);
      if (dir === null)
        throw new Error("UploadService : aucun dossier pour les fichiers");
      await rm(dir, { recursive: true, force: true });
      await mkdir(dir, { recursive: true });
      return dir;
    })();
    return this.#ready;
  }
}

/** Les premiers octets d'un fichier, de quoi le reconnaître. */
async function readHead(file: string): Promise<Uint8Array> {
  const handle = await open(file, "r");
  try {
    const head = new Uint8Array(KIND_HEAD_BYTES);
    const { bytesRead } = await handle.read(head, 0, head.length, 0);
    return head.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

/** L'empreinte d'un fichier, lue en flux — filet si la route n'en a pas demandé. */
async function hashFile(file: string): Promise<string> {
  const hasher = createHash("sha256");
  for await (const chunk of createReadStream(file)) {
    if (chunk instanceof Uint8Array) hasher.update(chunk);
  }
  return hasher.digest("hex");
}

export default UploadService;
