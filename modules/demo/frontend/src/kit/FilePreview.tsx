import {
  Fragment,
  createContext,
  createElement,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { canonicalLanguage } from "./codeHighlight";
import { CodeTokens, CopyButton, useCodeTokens } from "./NatureBlocks";
import {
  countLines,
  formatSize,
  type IFilePreview,
  type PreviewFormat,
} from "./preview";

/**
 * La boîte d'un fichier, selon son genre : image, PDF, texte, archive,
 * document, tableur — sinon un fichier à télécharger.
 *
 * Guide pour un agent : brique du KIT, partagée par les démos. Elle MONTRE un
 * aperçu (`IFilePreview`), elle ne le calcule pas : `describeFile`
 * (`preview.ts`) le rend, dans le navigateur avant l'envoi comme sur le
 * serveur à la réception. `url` sert l'image, le PDF et le texte entier — une
 * adresse du serveur, ou une adresse locale (`blob:`) pour une pièce pas
 * encore partie. Une image s'ouvre en grand dans un `<dialog>` (Échap ou
 * « Fermer »), un PDF dans la visionneuse du navigateur, un texte se déplie
 * (borné) ; archive, document et tableur montrent ce que l'aperçu en a LU.
 * Une pièce LOCALE n'a rien à télécharger, et son PDF n'a pas d'aperçu : la
 * politique de sécurité du framework n'autorise pas une page à encadrer une
 * adresse `blob:` (`frame-src`), l'élargir serait un mauvais échange — et
 * l'ouvrir dans un autre onglet PERDAIT la personne (vu par l'auteur). C'est
 * son propre fichier : la boîte en dit le nom, la taille et la nature. `controls={false}` rend l'aperçu SANS aucune
 * action (ni dépli, ni fenêtre, ni téléchargement) : ce qu'il faut dans une
 * bulle de survol, qui ne prend jamais le focus.
 *
 * @param url - l'adresse du contenu ; `null` : aucun contenu à ouvrir
 * @param local - pièce encore dans le navigateur (`url` en `blob:`)
 * @param controls - les actions de la boîte ; `false` : aperçu seul
 */
export function FilePreview({
  file,
  url,
  local = false,
  controls = true,
}: {
  file: IPreviewedFile;
  url: string | null;
  local?: boolean;
  controls?: boolean;
}) {
  if (controls) return <PieceBox file={file} url={url} local={local} />;
  return (
    <WithControls.Provider value={false}>
      <PieceBox file={file} url={url} local={local} />
    </WithControls.Provider>
  );
}

/** Les actions de la boîte sont-elles montrées ? Faux dans une bulle. */
const WithControls = createContext(true);

/** La boîte selon le genre de la pièce. */
function PieceBox({
  file,
  url,
  local,
}: {
  file: IPreviewedFile;
  url: string | null;
  local: boolean;
}) {
  if (url === null)
    return <Box icon="📄" piece={{ ...file, url: "", local: true }} />;
  const piece: IPiece = { ...file, url, local };
  switch (piece.kind) {
    case "image":
      return <ImagePiece piece={piece} />;
    case "text":
      return <TextPiece piece={piece} />;
    case "pdf":
      return <PdfPiece piece={piece} />;
    case "archive":
      return <ArchivePiece piece={piece} />;
    case "document":
      return <DocumentPiece piece={piece} />;
    case "sheet":
      return <SheetPiece piece={piece} />;
    case "file":
      return <Box icon="📄" piece={piece} />;
  }
}

/** Le nom lisible d'un format. */
const FORMAT_LABEL: Record<PreviewFormat, string> = {
  zip: "Archive ZIP",
  tar: "Archive TAR",
  "tar.gz": "Archive TAR.GZ",
  docx: "Document Word",
  odt: "Document ODT",
  xlsx: "Tableur Excel",
  ods: "Tableur ODS",
};

/** Un fichier et son aperçu. */
export interface IPreviewedFile extends IFilePreview {
  name: string;
  size: number;
}

/** Ce que reçoit chaque boîte. */
interface IPiece extends IPreviewedFile {
  url: string;
  local: boolean;
}

/** L'adresse du contenu. */
function urlOf(piece: IPiece): string {
  return piece.url;
}

/**
 * Une liste FIGÉE (rendue d'un bloc par l'aperçu, jamais réordonnée) :
 * ses enfants passent en arguments, sans clé. `tag` nul = un fragment.
 */
function fixed(
  tag: "ul" | "tbody" | "tr" | null,
  className: string | null,
  children: readonly ReactNode[],
  last?: ReactNode,
): ReactNode {
  const all = [...children, last];
  return tag === null
    ? createElement(Fragment, null, ...all)
    : createElement(tag, className === null ? null : { className }, ...all);
}

/** Le lien de téléchargement. */
function Download({ piece }: { piece: IPiece }) {
  if (piece.local) return null;
  return (
    <a href={urlOf(piece)} download={piece.name}>
      Télécharger
    </a>
  );
}

/**
 * La boîte commune : icône, nom, ce qu'on en sait — puis l'aperçu, et les
 * actions (le téléchargement, toujours).
 */
function Box({
  icon,
  piece,
  meta,
  className,
  actions,
  children,
}: {
  icon: string;
  piece: IPiece;
  meta?: string;
  className?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const withControls = useContext(WithControls);
  return (
    <div
      className={className === undefined ? "att-box" : `att-box ${className}`}
    >
      <div className="att-head">
        <span aria-hidden="true">{icon}</span>
        <strong>{piece.name}</strong>
        <span className="att-size">
          {meta === undefined ? "" : `${meta} · `}
          {formatSize(piece.size)}
        </span>
      </div>
      {children}
      {withControls && (
        <div className="att-actions">
          {actions}
          <Download piece={piece} />
        </div>
      )}
    </div>
  );
}

/** Le bouton qui déplie un aperçu borné. */
function More({
  open,
  toggle,
  label,
}: {
  open: boolean;
  toggle: () => void;
  label: string;
}) {
  return (
    <button type="button" aria-expanded={open} onClick={toggle}>
      {open ? "Réduire" : label}
    </button>
  );
}

/** Une image : la vignette, puis l'image entière dans une fenêtre modale. */
function ImagePiece({ piece }: { piece: IPiece }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className="att-thumb"
        aria-label={`Agrandir ${piece.name}`}
        onClick={() => dialog.current?.showModal()}
      >
        <img src={urlOf(piece)} alt={piece.name} loading="lazy" />
      </button>
      <dialog ref={dialog} className="att-dialog" aria-label={piece.name}>
        <img src={urlOf(piece)} alt={piece.name} />
        <p>
          {piece.name} · {formatSize(piece.size)}{" "}
          <button type="button" onClick={() => dialog.current?.close()}>
            Fermer
          </button>
        </p>
      </dialog>
    </>
  );
}

/**
 * Un PDF : la visionneuse du navigateur, dans une fenêtre modale. Le cadre
 * n'existe que fenêtre ouverte — un PDF n'est chargé que si on le regarde.
 */
function PdfPiece({ piece }: { piece: IPiece }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  if (piece.local) return <Box icon="📕" piece={piece} meta="PDF" />;
  return (
    <Box
      icon="📕"
      piece={piece}
      meta="PDF"
      actions={
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            dialog.current?.showModal();
          }}
        >
          Aperçu
        </button>
      }
    >
      <dialog
        ref={dialog}
        className="att-dialog att-pdf"
        aria-label={piece.name}
        onClose={() => setOpen(false)}
      >
        {/* La barre EN HAUT, comme une visionneuse : ce qu'on regarde, et
            comment en sortir — sans chercher sous le document. */}
        <p className="att-dialog-bar">
          <strong>{piece.name}</strong>
          <span className="att-size">{formatSize(piece.size)}</span>
          <a href={urlOf(piece)} download={piece.name}>
            Télécharger
          </a>
          <button type="button" onClick={() => dialog.current?.close()}>
            Fermer
          </button>
        </p>
        {open && (
          // Pas de `sandbox` : Chrome refuse d'afficher un PDF dans un cadre
          // isolé. Servi par le salon, il part sans script de la page, et seule
          // l'application peut l'encadrer (`ChatController.file`).
          <iframe src={urlOf(piece)} title={`Aperçu de ${piece.name}`} />
        )}
      </dialog>
    </Box>
  );
}

/**
 * Au-delà de ce poids, le texte entier se montre SANS coloration : colorer
 * deux mégaoctets figerait la page plusieurs secondes.
 */
export const VIEWER_HIGHLIGHT_BYTES = 262_144;

/** La langue d'un fichier d'après son extension, ou `null` (devinée). */
export function languageOfFile(name: string): string | null {
  const dot = name.lastIndexOf(".");
  return dot <= 0 ? null : canonicalLanguage(name.slice(dot + 1).toLowerCase());
}

/**
 * Un texte : nom, lignes, ses premières lignes colorées — puis « Voir tout »
 * l'ouvre dans une VISIONNEUSE, comme un PDF : le texte entier, coloré selon
 * son extension, numéroté, avec Copier, Télécharger et Fermer en haut. La
 * fenêtre est la seule zone qui défile, et le fil ne bouge pas.
 */
function TextPiece({ piece }: { piece: IPiece }) {
  const withControls = useContext(WithControls);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState<string | null>(null);
  const lines = piece.lines ?? 0;
  const language = languageOfFile(piece.name);
  const show = () => {
    setOpen(true);
    dialog.current?.showModal();
    if (full !== null) return;
    fetch(urlOf(piece))
      .then((response) =>
        response.ok
          ? response.text()
          : Promise.reject(new Error(String(response.status))),
      )
      .then(setFull)
      .catch(() => setFull("(pièce illisible, ou sortie du stockage)"));
  };
  return (
    <Box
      icon="📝"
      piece={piece}
      className="att-text"
      meta={`${lines} ligne${lines > 1 ? "s" : ""}`}
      actions={
        <button type="button" onClick={show}>
          Voir tout
        </button>
      }
    >
      <TextExcerpt source={piece.preview ?? ""} language={language} />
      {/* Dans une bulle de survol : l'aperçu seul, aucune fenêtre ni action. */}
      {withControls && (
        <dialog
          ref={dialog}
          className="att-dialog att-viewer"
          aria-label={piece.name}
          onClose={() => setOpen(false)}
        >
          <p className="att-dialog-bar">
            <strong>{piece.name}</strong>
            <span className="att-size">
              {lines} ligne{lines > 1 ? "s" : ""} · {formatSize(piece.size)}
            </span>
            {full !== null && <CopyButton text={full} />}
            <Download piece={piece} />
            <button type="button" onClick={() => dialog.current?.close()}>
              Fermer
            </button>
          </p>
          {open &&
            (full === null ? (
              <p className="att-note">Chargement…</p>
            ) : (
              <TextViewer source={full} language={language} />
            ))}
        </dialog>
      )}
    </Box>
  );
}

/** Les premières lignes d'un texte, colorées comme dans la visionneuse. */
function TextExcerpt({
  source,
  language,
}: {
  source: string;
  language: string | null;
}) {
  const tokens = useCodeTokens(source, language);
  return (
    <pre className="att-pre">
      <CodeTokens source={source} tokens={tokens} />
    </pre>
  );
}

/** Le texte entier, numéroté ; coloré s'il n'est pas trop lourd. */
function TextViewer({
  source,
  language,
}: {
  source: string;
  language: string | null;
}) {
  const numbers = useMemo(() => {
    const count = Math.max(1, countLines(source));
    let out = "1";
    for (let line = 2; line <= count; line += 1) out += `\n${line}`;
    return out;
  }, [source]);
  return (
    <div className="att-viewer-body">
      <pre className="att-gutter" aria-hidden="true">
        {numbers}
      </pre>
      <pre className="att-code">
        {source.length > VIEWER_HIGHLIGHT_BYTES ? (
          <code>{source}</code>
        ) : (
          <HighlightedText source={source} language={language} />
        )}
      </pre>
    </div>
  );
}

/** Un texte coloré — un composant à part : son hook ne court que s'il est montré. */
function HighlightedText({
  source,
  language,
}: {
  source: string;
  language: string | null;
}) {
  const tokens = useCodeTokens(source, language);
  return <CodeTokens source={source} tokens={tokens} />;
}

/** Entrées d'archive montrées avant dépli. */
const ARCHIVE_FOLDED = 5;

/** Une archive : son index, lu par l'aperçu — rien n'est extrait. */
function ArchivePiece({ piece }: { piece: IPiece }) {
  const [open, setOpen] = useState(false);
  const entries = piece.entries ?? [];
  const total = piece.total ?? entries.length;
  const visible = open ? entries : entries.slice(0, ARCHIVE_FOLDED);
  const hidden = total - visible.length;
  return (
    <Box
      icon="🗜️"
      piece={piece}
      meta={`${piece.format === undefined ? "Archive" : FORMAT_LABEL[piece.format]} · ${total}${piece.truncated === true ? "+" : ""} entrée${total > 1 ? "s" : ""}`}
      actions={
        entries.length > ARCHIVE_FOLDED ? (
          <More
            open={open}
            toggle={() => setOpen((was) => !was)}
            label={`Voir ${entries.length} entrées`}
          />
        ) : null
      }
    >
      {fixed(
        "ul",
        "att-entries",
        visible.map((entry) =>
          createElement(
            "li",
            null,
            <span className="att-entry-name">{entry.name}</span>,
            entry.name.endsWith("/") ? null : (
              <span className="att-size">{formatSize(entry.size)}</span>
            ),
          ),
        ),
        hidden > 0 && (
          <li className="att-more">
            … et {hidden}
            {piece.truncated === true ? "+" : ""} autre{hidden > 1 ? "s" : ""}
          </li>
        ),
      )}
      {piece.truncated === true && (
        <p className="att-note">
          Aperçu partiel : la décompression s'arrête au premier mégaoctet.
        </p>
      )}
    </Box>
  );
}

/** Paragraphes montrés avant dépli. */
const DOCUMENT_FOLDED = 2;

/** Un document Word ou ODT : ses premiers paragraphes, sans mise en page. */
function DocumentPiece({ piece }: { piece: IPiece }) {
  const [open, setOpen] = useState(false);
  const paragraphs = piece.paragraphs ?? [];
  return (
    <Box
      icon="📃"
      piece={piece}
      meta={
        piece.format === undefined ? "Document" : FORMAT_LABEL[piece.format]
      }
      actions={
        paragraphs.length > DOCUMENT_FOLDED ? (
          <More
            open={open}
            toggle={() => setOpen((was) => !was)}
            label="Lire le début"
          />
        ) : null
      }
    >
      <div className="att-doc">
        {paragraphs.length === 0 ? (
          <p className="att-note">
            Aucun texte lisible : télécharger pour l'ouvrir.
          </p>
        ) : (
          fixed(
            null,
            null,
            (open ? paragraphs : paragraphs.slice(0, DOCUMENT_FOLDED)).map(
              (paragraph) => createElement("p", null, paragraph),
            ),
          )
        )}
      </div>
    </Box>
  );
}

/** Lignes de tableur montrées avant dépli. */
const SHEET_FOLDED = 4;

/** Un tableur : le coin haut-gauche de sa première feuille. */
function SheetPiece({ piece }: { piece: IPiece }) {
  const [open, setOpen] = useState(false);
  const rows = piece.rows ?? [];
  const visible = open ? rows : rows.slice(0, SHEET_FOLDED);
  return (
    <Box
      icon="📊"
      piece={piece}
      meta={piece.format === undefined ? "Tableur" : FORMAT_LABEL[piece.format]}
      actions={
        rows.length > SHEET_FOLDED ? (
          <More
            open={open}
            toggle={() => setOpen((was) => !was)}
            label={`Voir ${rows.length} lignes`}
          />
        ) : null
      }
    >
      {rows.length === 0 ? (
        <p className="att-note">Feuille vide : télécharger pour l'ouvrir.</p>
      ) : (
        <table className="att-sheet">
          <caption className="sr-only">
            Premières cellules de la première feuille de {piece.name}
          </caption>
          {fixed(
            "tbody",
            null,
            visible.map((row) =>
              fixed(
                "tr",
                null,
                row.map((cell) => createElement("td", null, cell)),
              ),
            ),
          )}
        </table>
      )}
    </Box>
  );
}
