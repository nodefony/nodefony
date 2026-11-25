import { formatSize } from "../kit/preview";
import type { IUploadProgress } from "./uploadClient";
import { UPLOAD_MAX_BYTES } from "./uploadDemo";

/**
 * Ce que la page « Envoi de fichiers » dessine : le choix d'un fichier du
 * poste, et la barre d'un envoi en cours avec la frise de ses avancements.
 *
 * Guide pour un agent : utilisé par `UploadLesson.tsx`. Les blocs
 * `// #region` sont CITÉS par la page : les renommer casse le test du module.
 */

// #region client-picker
/**
 * Un fichier du poste : un `<input type="file">`. Le navigateur rend un
 * `File`, qui EST un `Blob` — il part tel quel dans un `FormData`, sans être
 * lu par la page.
 */
export function FilePicker({
  file,
  onPick,
}: {
  file: File | null;
  onPick: (file: File | null) => void;
}) {
  return (
    <div className="steps-fields">
      <label>
        Votre fichier (8 Mio au plus)
        <input
          type="file"
          onChange={(event) => onPick(event.currentTarget.files?.[0] ?? null)}
        />
      </label>
      {file !== null && (
        <p className="upload-chosen">
          <strong>{file.name}</strong> · {formatSize(file.size)} ·{" "}
          {file.type || "type non déclaré"}
          {file.size > UPLOAD_MAX_BYTES &&
            " — trop gros : le serveur le refusera"}
        </p>
      )}
    </div>
  );
}
// #endregion

/**
 * L'envoi en cours, vu du navigateur : la barre suit `upload.onprogress`, la
 * frise dit QUAND chaque avancement est arrivé.
 *
 * @param events - les avancements reçus, du plus ancien au plus récent
 */
export function UploadProgress({
  events,
}: {
  events: readonly IUploadProgress[];
}) {
  const last = events.at(-1);
  if (last === undefined) return null;
  const ratio = last.total === 0 ? 0 : last.loaded / last.total;
  return (
    <figure className="wire-figure">
      <figcaption>
        <strong>L'envoi</strong> — {Math.round(ratio * 100)}&nbsp;% de{" "}
        {formatSize(last.total)}, formulaire compris. Sur ce poste l'envoi est
        presque instantané ; sur un vrai réseau, la barre avance.
      </figcaption>
      <div
        className="mcp-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={last.total}
        aria-valuenow={last.loaded}
        aria-label="Avancement de l'envoi"
      >
        <i style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
      <ol className="mcp-timeline">
        {events.map((event) => (
          <li key={`${event.at}-${event.loaded}`}>
            <span className="mcp-at">{event.at}&nbsp;ms</span>
            <span>
              {formatSize(event.loaded)} / {formatSize(event.total)}
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
