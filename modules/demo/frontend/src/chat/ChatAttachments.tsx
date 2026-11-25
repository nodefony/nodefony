import {
  createElement,
  useId,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { FilePreview } from "../kit/FilePreview";
import { HoverBubble, type IBubbleAnchor } from "../kit/HoverBubble";
import { formatSize, type PreviewKind } from "../kit/preview";
import { CHAT_FILE_PATH, type ChatAttachment } from "./chatContract";

/**
 * Les pièces d'un message, dans la fenêtre du salon — la MÊME pour tous,
 * l'expéditeur compris : elles ne s'affichent qu'une fois annoncées par le
 * serveur, jamais en aperçu local.
 *
 * Guide pour un agent : le rendu suit le `kind` POSÉ PAR LE SERVEUR d'après les
 * octets (`ChatService` → `describeFile` du kit), jamais le nom du fichier ;
 * chaque pièce est une boîte du kit (`FilePreview.tsx`), la même que celle
 * qui montre une pièce avant l'envoi. Une IMAGE s'affiche en vignette (la
 * boîte du kit) ; toute autre pièce tient en une PASTILLE — nom et taille —,
 * un bouton qui DÉPLIE sous lui la boîte complète, actions comprises
 * (`aria-expanded`). Au survol ou au focus, une bulle (`kit/HoverBubble.tsx`)
 * en montre l'aperçu SANS action : une bulle ne prend jamais le focus, un
 * bouton qu'elle porterait serait inatteignable au clavier. Une liste de
 * pièces ne prend pas la hauteur de leurs aperçus.
 */
export function ChatAttachments({
  pieces,
}: {
  pieces: readonly ChatAttachment[];
}) {
  return (
    <ul className="att-list" aria-label="Pièces jointes">
      {pieces.map((piece) => (
        <li key={piece.id}>
          {piece.expired === true ? (
            <span className="att-box att-gone">
              {piece.name} — retirée : le stockage de la démo est borné
            </span>
          ) : piece.kind === "image" ? (
            <FilePreview file={piece} url={urlOf(piece)} />
          ) : (
            <Pill piece={piece} />
          )}
        </li>
      ))}
    </ul>
  );
}

/** L'adresse d'une pièce sur le serveur. */
function urlOf(piece: ChatAttachment): string {
  return `${CHAT_FILE_PATH}/${encodeURIComponent(piece.id)}`;
}

/** Le pictogramme d'un genre de pièce. */
function iconOf(kind: PreviewKind): string {
  switch (kind) {
    case "image":
      return "🖼️";
    case "text":
      return "📝";
    case "pdf":
      return "📕";
    case "archive":
      return "🗜️";
    case "document":
      return "📃";
    case "sheet":
      return "📊";
    case "file":
      return "📄";
  }
}

/**
 * Une pastille : le nom et la taille. Cliquée, elle déplie la boîte complète
 * sous elle ; repliée, sa bulle montre l'aperçu sans action, construit
 * SEULEMENT bulle ouverte.
 */
function Pill({ piece }: { piece: ChatAttachment }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const toggle = () => setOpen((was) => !was);
  if (open)
    return (
      <>
        <PillButton piece={piece} open controls={id} toggle={toggle} />
        <div id={id} className="att-unfolded">
          <FilePreview file={piece} url={urlOf(piece)} />
        </div>
      </>
    );
  return (
    <HoverBubble
      bubble={createElement(FilePreview, {
        file: piece,
        url: urlOf(piece),
        controls: false,
      })}
      trigger={pillTrigger(piece, id, toggle)}
    />
  );
}

/** Le déclencheur d'une pastille repliée, défini hors du rendu. */
function pillTrigger(
  piece: ChatAttachment,
  controls: string,
  toggle: () => void,
): (anchor: IBubbleAnchor) => ReactNode {
  return (anchor) =>
    createElement(PillButton, {
      piece,
      open: false,
      controls,
      toggle,
      anchor,
    });
}

/**
 * Le bouton de la pastille. Au toucher, le premier appui n'ouvre que la bulle
 * (`anchor.onClick` annule le geste) ; le suivant déplie.
 */
function PillButton({
  piece,
  open,
  controls,
  toggle,
  anchor,
}: {
  piece: ChatAttachment;
  open: boolean;
  controls: string;
  toggle: () => void;
  anchor?: IBubbleAnchor;
}) {
  const onClick = (event: MouseEvent<HTMLElement>) => {
    anchor?.onClick(event);
    if (!event.defaultPrevented) toggle();
  };
  return (
    <button
      type="button"
      className="att-pill"
      aria-expanded={open}
      aria-controls={controls}
      aria-describedby={anchor?.["aria-describedby"]}
      onClick={onClick}
    >
      <span aria-hidden="true">{iconOf(piece.kind)}</span>
      <span className="att-pill-name">{piece.name}</span>
      <span className="att-size">{formatSize(piece.size)}</span>
    </button>
  );
}
