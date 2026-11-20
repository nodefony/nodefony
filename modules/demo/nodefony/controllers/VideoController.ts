import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { controller, Controller, Get } from "@nodefony/framework";
import type { RouteInput } from "@nodefony/framework";
import { HttpError } from "@nodefony/http";
import type { ContextType } from "@nodefony/http";
import {
  MediaParams,
  VIDEO_PATH,
  type IMediaFile,
} from "../../frontend/src/video/videoDemo";

/**
 * Vidéo par plages — servir les vidéos du dossier `media/` du module comme un
 * lecteur les attend : par MORCEAUX (`Range`, réponse 206), pour sauter à
 * n'importe quel instant sans télécharger ce qui précède, et sans jamais
 * charger le fichier en mémoire.
 *
 * Guide pour un agent : `renderMediaStream()` porte toute la règle
 * (RFC 9110 §14) — plage, plage ouverte ou par la fin, plage impossible
 * (416), en-tête invalide ignoré, `If-Range`, `ETag` et 304 ; l'action n'a
 * qu'à désigner le fichier. `renderFileDownload()`, lui, envoie toujours le
 * fichier entier. Le contrôleur est un SINGLETON : rien ne se garde sur
 * `this`. Doc : `@nodefony/http/docs/byte-stream.md`.
 *
 * Les blocs `// #region <nom>` sont CITÉS par la page d'apprentissage
 * (`frontend/src/video/VideoLesson.tsx`) : les renommer casse son test.
 */
// #region video-class
@controller(VIDEO_PATH)
class VideoController extends Controller {
  constructor(context: ContextType) {
    super("video", context);
  }
  // #endregion

  /** Le dossier des vidéos : `media/`, à la racine du module. */
  private get mediaDir(): string {
    return path.join(this.module?.path ?? "", "media");
  }

  /** Le fichier d'une vidéo du dossier, ou un 404 qui le dit. */
  private async mediaFile(name: string): Promise<string> {
    const file = path.join(this.mediaDir, name);
    const found = await stat(file).catch(() => null);
    if (found === null || !found.isFile()) {
      throw new HttpError(`vidéo « ${name} » absente de media/`, 404);
    }
    return file;
  }

  // #region video-list
  // Ce que le dossier contient — seulement les noms que la route
  // `/{name}` accepte : la liste ne propose rien qu'on ne puisse
  // lire. Une vidéo déposée dans `media/` y apparaît aussitôt.
  @Get("")
  async list(): Promise<IMediaFile[]> {
    const entries = await readdir(this.mediaDir, { withFileTypes: true });
    const files: IMediaFile[] = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!MediaParams.safeParse({ name: entry.name }).success) continue;
      const { size } = await stat(path.join(this.mediaDir, entry.name));
      files.push({ name: entry.name, size });
    }
    return files;
  }
  // #endregion

  // #region video-serve
  // UNE ligne pour tout `Range` : 206 et `Content-Range` pour une
  // plage, 416 pour une plage hors du fichier, 200 entier pour un
  // en-tête invalide. Le fichier est lu en FLUX, morceau demandé
  // seulement. Le nom est validé par `MediaParams` AVANT l'action.
  @Get("/{name}", { schema: { params: MediaParams } })
  async serve(input: RouteInput<{ params: typeof MediaParams }>) {
    const file = await this.mediaFile(input.params.name);
    await this.renderMediaStream(file);
  }
  // #endregion

  // #region video-download
  // La même vidéo, en pièce à enregistrer : `attachment`, et le
  // fichier ENTIER, `Range` ou pas — un téléchargement ne reprend
  // pas au milieu. Pour un lecteur, c'est `renderMediaStream()`.
  @Get("/{name}/download", { schema: { params: MediaParams } })
  async download(input: RouteInput<{ params: typeof MediaParams }>) {
    const file = await this.mediaFile(input.params.name);
    await this.renderFileDownload(file);
  }
  // #endregion
}

export default VideoController;
