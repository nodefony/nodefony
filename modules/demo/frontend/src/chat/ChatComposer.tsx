import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { FilePreview } from "../kit/FilePreview";
import { MarkdownEditor, type IEditorHandle } from "../kit/MarkdownEditor";
import { describeFile, type IFilePreview } from "../kit/preview";
import {
  ATTACHMENT_MAX_BYTES,
  ATTACHMENT_MAX_COUNT,
  MESSAGE_MAX_BYTES,
  type ChatReplyRef,
} from "./chatContract";
import {
  EMOJIS,
  attachmentProblem,
  fencePaste,
  pasteRoute,
  pastedFileName,
  textProblem,
} from "./attachments";

/** Une pièce en attente d'envoi — locale à l'écrivain, rien n'est parti. */
interface IPending {
  key: string;
  file: File;
  /** Adresse locale du contenu (`blob:`), posée avec l'aperçu, rendue au retrait. */
  url: string | null;
  /** L'aperçu lu dans le navigateur ; `null` pendant la lecture. */
  preview: IFilePreview | null;
}

/**
 * Le brouillon d'UN salon : son texte, ses pièces, et le message auquel il
 * répond — rien n'est parti.
 */
interface IDraft {
  readonly text: string;
  readonly pending: readonly IPending[];
  readonly replyTo: ChatReplyRef | null;
}

/** Le brouillon d'un salon où rien n'est écrit. */
const EMPTY_DRAFT: IDraft = { text: "", pending: [], replyTo: null };

/** Une pièce en attente, née d'un fichier choisi, déposé ou collé. */
function pendingFile(file: File): IPending {
  return { key: crypto.randomUUID(), file, url: null, preview: null };
}

/**
 * L'adresse locale d'une pièce lue. Un PDF est RETYPÉ d'après ses octets :
 * le type déclaré vient du nom, et un fichier nommé `.html` ouvert dans un
 * onglet s'exécuterait sous l'origine de la page.
 */
function localUrl(file: File, preview: IFilePreview): string {
  return URL.createObjectURL(
    preview.kind === "pdf"
      ? new Blob([file], { type: "application/pdf" })
      : file,
  );
}

/** Rend l'adresse locale d'une pièce, s'il y en a une. */
function release(piece: IPending): void {
  if (piece.url !== null) URL.revokeObjectURL(piece.url);
}

/**
 * L'aperçu d'une pièce, lu DANS LE NAVIGATEUR par le même code que le
 * serveur (`describeFile`). Une pièce vide ou trop grosse n'est pas lue :
 * l'envoi la refusera.
 */
async function previewOf(file: File): Promise<IFilePreview> {
  if (file.size === 0 || file.size > ATTACHMENT_MAX_BYTES)
    return { kind: "file" };
  try {
    const described = await describeFile(
      new Uint8Array(await file.arrayBuffer()),
    );
    return described.fields;
  } catch {
    return { kind: "file" };
  }
}

/**
 * La zone d'écriture du salon : l'éditeur Markdown du kit, habillé des
 * pièces jointes (trombone, glisser-déposer, image collée) et des
 * émoticônes. Un collage reste un message : du code collé entre dans un bloc
 * de code, seul un collage plus lourd qu'un message devient une pièce.
 *
 * Guide pour un agent : tout ici reste LOCAL jusqu'à « Envoyer » ; ensuite le
 * message n'apparaît que lorsque le serveur l'annonce sur le salon. Une pièce
 * montre son aperçu dès qu'on la choisit — les MÊMES boîtes que le salon
 * (`FilePreview.tsx`), calculées dans le navigateur par `describeFile` ; le
 * serveur refait le sien à la réception et ne croit jamais celui-ci. Les
 * règles (nombre, taille, grand collage) viennent de `attachments.ts`, que le
 * serveur rejoue. L'édition (mise en forme, listes, aperçu, `@mention`) est
 * celle du kit (`MarkdownEditor.tsx`).
 *
 * Un brouillon par salon (`roomId`) : changer de salon range le texte et les
 * pièces de celui qu'on quitte et ressort ceux de l'autre — jamais un
 * brouillon d'un salon privé envoyé dans un public. Gardés en mémoire tant
 * que la page vit (pas de stockage : les pièces n'y survivraient pas, et un
 * brouillon à moitié revenu trompe).
 *
 * @param roomId - le salon où l'on écrit
 * @param mentions - noms proposés après `@` (les présents, sans soi)
 * @param replyRef - reçoit de quoi répondre à un message (XEP-0461) : la
 *   citation s'affiche au-dessus du champ, Échap ou ✕ l'annule
 */
export function ChatComposer({
  author,
  roomId,
  mentions,
  send,
  notifyTyping,
  insertRef,
  replyRef,
}: {
  author: string;
  roomId: string;
  mentions: readonly string[];
  send: (
    text: string,
    files: readonly File[],
    replyTo: string | null,
  ) => Promise<void>;
  notifyTyping: () => void;
  /** Reçoit de quoi insérer un texte dans le champ (une `@mention` du panneau). */
  insertRef?: RefObject<((text: string) => void) | null>;
  /** Reçoit de quoi répondre à un message de la liste. */
  replyRef?: RefObject<((target: ChatReplyRef) => void) | null>;
}) {
  const zone = useRef<HTMLFormElement>(null);
  const editor = useRef<IEditorHandle>(null);
  const emojiButton = useRef<HTMLButtonElement>(null);
  const emojiWrap = useRef<HTMLDivElement>(null);

  // Le panneau des présents écrit `@nom` ici, sans tenir l'éditeur lui-même.
  useEffect(() => {
    if (insertRef === undefined) return;
    insertRef.current = (text) => editor.current?.insert(text);
    return () => {
      insertRef.current = null;
    };
  }, [insertRef]);
  const picker = useRef<HTMLInputElement>(null);
  // Clé texte, quelques salons, accès à chaque frappe : une `Map`, recopiée
  // à chaque changement (état React immuable) — une poignée d'entrées.
  const [drafts, setDrafts] = useState<ReadonlyMap<string, IDraft>>(
    () => new Map(),
  );
  const { text: draft, pending, replyTo } = drafts.get(roomId) ?? EMPTY_DRAFT;
  // Une erreur appartient au salon où elle est née.
  const [failure, setFailure] = useState<{
    room: string;
    message: string;
  } | null>(null);
  const error = failure?.room === roomId ? failure.message : null;
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const pasteCount = useRef(0);

  // Change le brouillon d'un salon ; un brouillon vide est oublié.
  const patch = useCallback((room: string, change: (was: IDraft) => IDraft) => {
    setDrafts((map) => {
      const next = change(map.get(room) ?? EMPTY_DRAFT);
      const copy = new Map(map);
      if (
        next.text === "" &&
        next.pending.length === 0 &&
        next.replyTo === null
      )
        copy.delete(room);
      else copy.set(room, next);
      return copy;
    });
  }, []);

  // « Répondre » dans la liste : la citation entre dans le brouillon du
  // salon, et le focus dans le champ.
  useEffect(() => {
    if (replyRef === undefined) return;
    replyRef.current = (target) => {
      patch(roomId, (was) => ({ ...was, replyTo: target }));
      editor.current?.focus();
    };
    return () => {
      replyRef.current = null;
    };
  }, [replyRef, roomId, patch]);

  // Les adresses locales de TOUS les brouillons sont rendues au démontage.
  const known = useRef(drafts);
  useEffect(() => {
    known.current = drafts;
  }, [drafts]);
  useEffect(
    () => () => {
      for (const kept of known.current.values())
        for (const piece of kept.pending) release(piece);
    },
    [],
  );

  // La grille d'émoticônes se ferme d'un appui hors d'elle.
  useEffect(() => {
    if (!emojiOpen) return;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        emojiWrap.current?.contains(event.target) === true
      )
        return;
      setEmojiOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [emojiOpen]);

  // Échap, depuis la grille ou son bouton : fermer, et rendre le focus au bouton.
  const closeEmojiOnEscape = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Escape" || !emojiOpen) return;
    event.preventDefault();
    setEmojiOpen(false);
    emojiButton.current?.focus();
  };

  const problem = attachmentProblem(
    draft.trim(),
    pending.map((piece) => piece.file),
  );
  // Une pièce en attente ou un texte trop lourd : le motif s'affiche tout de
  // suite, sans attendre « Envoyer ».
  const blocked =
    problem !== null &&
    problem !== "message vide" &&
    (pending.length > 0 || textProblem(draft.trim()) !== null);

  // Ajoute les pièces au brouillon du salon courant, puis lit leur aperçu —
  // rangé dans CE salon même si l'on en a changé entre-temps ; une pièce
  // retirée ou envoyée pendant la lecture ne revient pas.
  const add = useCallback(
    (files: readonly File[]) => {
      if (files.length === 0) return;
      const room = roomId;
      const pieces = files.map(pendingFile);
      patch(room, (was) => ({ ...was, pending: [...was.pending, ...pieces] }));
      setFailure(null);
      for (const piece of pieces)
        void previewOf(piece.file).then((preview) => {
          const url = localUrl(piece.file, preview);
          patch(room, (was) => {
            // Retirée pendant la lecture : son adresse est rendue aussitôt.
            if (!was.pending.some((item) => item.key === piece.key))
              URL.revokeObjectURL(url);
            return {
              ...was,
              pending: was.pending.map((item) =>
                item.key === piece.key ? { ...item, preview, url } : item,
              ),
            };
          });
        });
    },
    [roomId, patch],
  );

  const remove = (key: string) => {
    patch(roomId, (was) => ({
      ...was,
      pending: was.pending.filter((piece) => {
        if (piece.key !== key) return true;
        release(piece);
        return false;
      }),
    }));
  };

  const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = [...event.clipboardData.files];
    if (files.length > 0) {
      event.preventDefault();
      add(files);
      return;
    }
    const text = event.clipboardData.getData("text/plain");
    const route = pasteRoute(text);
    if (route === "text") return;
    event.preventDefault();
    if (route === "code") {
      // Du code : un bloc, que le salon montre en code sur toute la largeur.
      // La clôture ouvre sa propre ligne, même collée après du texte.
      const lead = draft === "" || draft.endsWith("\n") ? "" : "\n";
      editor.current?.insert(lead + fencePaste(text));
      return;
    }
    // Plus lourd qu'un message : une pièce, comme un fichier.
    pasteCount.current += 1;
    add([
      new File([text], pastedFileName(pasteCount.current), {
        type: "text/plain",
      }),
    ]);
  };

  // Glisser-déposer : un raccourci de souris — le trombone en est l'équivalent
  // clavier. Écouté sur le formulaire, retiré au démontage.
  useEffect(() => {
    const el = zone.current;
    if (el === null) return;
    const over = (event: DragEvent) => {
      event.preventDefault();
      setDragging(true);
    };
    const leave = (event: DragEvent) => {
      if (event.target === el) setDragging(false);
    };
    const drop = (event: DragEvent) => {
      event.preventDefault();
      setDragging(false);
      add([...(event.dataTransfer?.files ?? [])]);
    };
    el.addEventListener("dragover", over);
    el.addEventListener("dragleave", leave);
    el.addEventListener("drop", drop);
    return () => {
      el.removeEventListener("dragover", over);
      el.removeEventListener("dragleave", leave);
      el.removeEventListener("drop", drop);
    };
  }, [add]);

  const submit = () => {
    const text = draft.trim();
    if (problem !== null || sending) {
      if (problem !== null && problem !== "message vide")
        setFailure({ room: roomId, message: problem });
      return;
    }
    // Le salon et les pièces de CET envoi : on peut changer de salon avant la réponse.
    const room = roomId;
    const sent = pending;
    setSending(true);
    send(
      text,
      sent.map((piece) => piece.file),
      replyTo?.id ?? null,
    )
      .then(() => {
        for (const piece of sent) release(piece);
        patch(room, () => EMPTY_DRAFT);
        setFailure(null);
      })
      .catch((reason: unknown) => {
        setFailure({
          room,
          message:
            reason instanceof Error
              ? reason.message
              : "envoi refusé par le serveur",
        });
      })
      .finally(() => setSending(false));
  };

  return (
    <form
      ref={zone}
      className={
        dragging ? "room-foot composer dragging" : "room-foot composer"
      }
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <MarkdownEditor
        label="Message"
        value={draft}
        maxLength={MESSAGE_MAX_BYTES}
        placeholder={`Écrire en tant que ${author}`}
        mentions={mentions}
        onChange={(value) => {
          patch(roomId, (was) => ({ ...was, text: value }));
          notifyTyping();
        }}
        onEnter={submit}
        onPaste={onPaste}
        onKeyDown={(event) => {
          if (event.key === "Escape" && emojiOpen) {
            event.preventDefault();
            setEmojiOpen(false);
          } else if (event.key === "Escape" && replyTo !== null) {
            event.preventDefault();
            patch(roomId, (was) => ({ ...was, replyTo: null }));
          }
        }}
        above={
          <>
            {replyTo !== null && (
              <p className="composer-reply">
                <span className="composer-reply-body">
                  <span className="quote-head">
                    <span aria-hidden="true">↩ </span>
                    Réponse à <strong>{replyTo.author}</strong>
                  </span>
                  {replyTo.excerpt !== "" && (
                    <span className="quote-text">{replyTo.excerpt}</span>
                  )}
                </span>
                <button
                  type="button"
                  className="pending-remove"
                  aria-label="Annuler la réponse"
                  title="Annuler la réponse"
                  onClick={() => {
                    patch(roomId, (was) => ({ ...was, replyTo: null }));
                    editor.current?.focus();
                  }}
                >
                  ✕
                </button>
              </p>
            )}
            {pending.length > 0 && (
              <ul className="pending" aria-label="Pièces à envoyer">
                {pending.map((piece) => (
                  <li key={piece.key} className="pending-piece">
                    <FilePreview
                      file={{
                        name: piece.file.name,
                        size: piece.file.size,
                        ...(piece.preview ?? { kind: "file" }),
                      }}
                      url={piece.url}
                      local
                    />
                    {piece.preview === null && (
                      <span className="pending-reading">lecture…</span>
                    )}
                    <button
                      type="button"
                      className="pending-remove"
                      aria-label={`Retirer ${piece.file.name}`}
                      title={`Retirer ${piece.file.name}`}
                      onClick={() => remove(piece.key)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        }
        editor={editor}
        tools={
          <>
            <button
              type="button"
              className="md-tool"
              aria-label={`Joindre des fichiers (${ATTACHMENT_MAX_COUNT} au plus)`}
              title={`Joindre des fichiers (${ATTACHMENT_MAX_COUNT} au plus)`}
              onClick={() => picker.current?.click()}
            >
              📎
            </button>
            <input
              ref={picker}
              type="file"
              multiple
              hidden
              onChange={(event) => {
                add([...(event.target.files ?? [])]);
                event.target.value = "";
              }}
            />
            <div className="emoji-wrap" ref={emojiWrap}>
              <button
                ref={emojiButton}
                type="button"
                className="md-tool"
                aria-label="Émoticônes"
                title="Émoticônes"
                aria-expanded={emojiOpen}
                onClick={() => setEmojiOpen((open) => !open)}
                onKeyDown={closeEmojiOnEscape}
              >
                🙂
              </button>
              {emojiOpen && (
                <div
                  className="emoji-grid"
                  role="group"
                  aria-label="Émoticônes"
                >
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji.char}
                      type="button"
                      aria-label={emoji.label}
                      title={emoji.label}
                      onKeyDown={closeEmojiOnEscape}
                      onClick={() => {
                        editor.current?.insert(emoji.char);
                        setEmojiOpen(false);
                      }}
                    >
                      {emoji.char}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        }
        actions={
          <button
            type="submit"
            className="btn primary md-send"
            disabled={sending || blocked}
          >
            {sending ? "Envoi…" : "Envoyer"}
          </button>
        }
      />
      {(error ?? (blocked ? problem : null)) !== null && (
        <p className="room-error" role="alert">
          {error ?? problem}
        </p>
      )}
    </form>
  );
}
