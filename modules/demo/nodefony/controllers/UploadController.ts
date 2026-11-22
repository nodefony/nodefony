import { Inject } from "nodefony";
import {
  Body,
  contentDisposition,
  controller,
  Controller,
  Get,
  HttpCode,
  IsGranted,
  Post,
  UploadedFiles,
} from "@nodefony/framework";
import type { RouteInput } from "@nodefony/framework";
import { HttpError } from "@nodefony/http";
import type { ContextType, IUploadedFile } from "@nodefony/http";
import {
  RawQuery,
  UPLOAD_MAX_BYTES,
  UPLOAD_MAX_FILES,
  UPLOAD_PATH,
  UploadBody,
  UploadParams,
  type IStoredFile,
  type IUploadReply,
} from "../../frontend/src/upload/uploadDemo";
import type UploadService from "../service/UploadService";

/**
 * Envoi de fichiers — recevoir un fichier en flux jusqu'au disque, le
 * ranger sous un nom choisi par le serveur, le reconnaître à ses octets, et
 * le rendre tel qu'il est arrivé.
 *
 * Guide pour un agent : le corps multipart est lu par le framework AVANT
 * l'action — les fichiers arrivent déjà écrits dans un temporaire, bornés
 * par l'option de route `upload` (taille, nombre, empreinte), et effacés à
 * la fin de la requête si l'action ne les déplace pas. Le corps BRUT
 * (`bodyStream: true`) n'est lu par personne avant l'action : c'est elle qui
 * compte ses octets. Le contrôleur est un SINGLETON : rien ne se garde sur
 * `this`, les fichiers vivent dans `UploadService`. Doc :
 * `@nodefony/http/docs/upload.md`.
 *
 * Les blocs `// #region <nom>` sont CITÉS par la page d'apprentissage
 * (`frontend/src/upload/UploadLesson.tsx`) : les renommer casse son test.
 */
// #region upload-class
@controller(UPLOAD_PATH)
@IsGranted(["ROLE_USER"])
class UploadController extends Controller {
  constructor(
    context: ContextType,
    @Inject("UploadService") private readonly uploads: UploadService,
  ) {
    super("upload", context);
  }
  // #endregion

  /** La personne connectée : chaque fichier est rangé sur SON compte. */
  #me(): string {
    const me = this.user;
    if (me === null) throw new HttpError("connexion requise", 401);
    return me.id;
  }

  // #region upload-send
  // Les fichiers arrivent DÉJÀ sur le disque : le framework a lu le
  // corps en flux, coupé tout fichier de plus de 8 Mio (413) et calculé
  // l'empreinte de chacun. L'action n'a qu'à les déplacer — un fichier
  // laissé dans son temporaire est effacé à la fin de la requête. Les
  // bornes se fixent TOUTES : une clé omise garde celle de l'application.
  @Post("", {
    upload: {
      maxFileSize: UPLOAD_MAX_BYTES,
      maxTotalFileSize: UPLOAD_MAX_BYTES * UPLOAD_MAX_FILES,
      maxFiles: UPLOAD_MAX_FILES,
      hashAlgorithm: "sha256",
    },
  })
  @HttpCode(201)
  async send(
    @UploadedFiles() files: IUploadedFile[] | undefined,
    @Body("label") label: unknown,
  ): Promise<IUploadReply> {
    const me = this.#me();
    const fields = UploadBody.safeParse({ label });
    if (!fields.success) throw new HttpError("libellé invalide", 400);
    if (files === undefined || files.length === 0)
      throw new HttpError("aucun fichier dans l'envoi", 400);
    const kept: IStoredFile[] = [];
    for (const file of files) kept.push(await this.uploads.keep(me, file));
    return { label: fields.data.label ?? null, files: kept };
  }
  // #endregion

  // #region upload-raw-route
  // Le corps entier EST le fichier : `bodyStream: true`, le framework ne
  // le lit pas, ses bornes ne s'appliquent pas — le service compte.
  @Post("/raw", { schema: { query: RawQuery }, bodyStream: true })
  @HttpCode(201)
  async raw(
    input: RouteInput<{ query: typeof RawQuery }, true>,
  ): Promise<IStoredFile> {
    const me = this.#me();
    if (input.body === undefined)
      throw new HttpError("aucun corps à garder", 400);
    const declared = this.request?.headers["content-type"];
    return this.uploads.keepStream(
      me,
      input.query.name,
      typeof declared === "string" ? declared : null,
      input.body,
      UPLOAD_MAX_BYTES,
    );
  }
  // #endregion

  // #region upload-list
  /** Les fichiers du compte, du plus récent au plus ancien. */
  @Get("")
  list(): IStoredFile[] {
    return this.uploads.list(this.#me());
  }
  // #endregion

  // #region upload-read
  // Le fichier, tel qu'il est arrivé : le TYPE vient de ses octets,
  // jamais du client ; `nosniff` interdit au navigateur d'en deviner un
  // autre ; `attachment` le télécharge sous le nom donné par le client.
  // `Repr-Digest` (RFC 9530) porte son empreinte : le client vérifie.
  @Get("/{id}", { schema: { params: UploadParams } })
  async read(
    input: RouteInput<{ params: typeof UploadParams }>,
  ): Promise<void> {
    const stored = this.uploads.find(this.#me(), input.params.id);
    if (stored === undefined) throw new HttpError("fichier introuvable", 404);
    await this.renderFileDownload(stored.file, undefined, {
      "Content-Type": stored.meta.type,
      "Content-Disposition": contentDisposition("attachment", stored.meta.name),
      "X-Content-Type-Options": "nosniff",
      "Repr-Digest": `sha-256=:${Buffer.from(stored.meta.sha256, "hex").toString("base64")}:`,
    });
  }
  // #endregion
}

export default UploadController;
