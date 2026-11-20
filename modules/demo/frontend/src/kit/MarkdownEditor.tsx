import {
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import {
  applyMention,
  codeMark,
  continueList,
  linkMark,
  mathMark,
  mentionAt,
  prefixLines,
  suggestMentions,
  toggleMark,
} from "./markdown";
import { MessageBody } from "./MessageBody";

/** Au plus ce nombre de noms proposés sous une `@mention` en cours. */
const MENTION_LIMIT = 8;

/** Les boutons de la barre d'outils, parcourus aux flèches (motif « Toolbar » de l'APG). */
const BAR_ITEMS = ".md-tool";

/** Un geste d'édition : rend le texte et la sélection à reposer. */
type Edit = (
  value: string,
  start: number,
  end: number,
) => { value: string; start: number; end: number };

/** Ce que l'éditeur prête aux outils de l'appelant (émoticônes…). */
export interface IEditorHandle {
  /** Insère un texte à la place de la sélection. */
  insert: (text: string) => void;
  /** Donne le focus au champ. */
  focus: () => void;
}

/** Les boutons de mise en forme, et leur raccourci (Ctrl ou ⌘), s'il y en a. */
const FORMATS: readonly {
  id: string;
  label: string;
  glyph: string;
  key: string | null;
  apply: Edit;
}[] = [
  {
    id: "b",
    label: "Gras",
    glyph: "G",
    key: "b",
    apply: (v, s, e) => toggleMark(v, s, e, "**"),
  },
  {
    id: "i",
    label: "Italique",
    glyph: "I",
    key: "i",
    apply: (v, s, e) => toggleMark(v, s, e, "_"),
  },
  { id: "e", label: "Code", glyph: "</>", key: "e", apply: codeMark },
  { id: "k", label: "Lien", glyph: "🔗", key: "k", apply: linkMark },
  { id: "m", label: "Formule", glyph: "∑", key: null, apply: mathMark },
  {
    id: "ul",
    label: "Liste à puces",
    glyph: "•",
    key: null,
    apply: (v, s, e) => prefixLines(v, s, e, "- "),
  },
  {
    id: "ol",
    // Le nom CONTIENT le texte visible « 1. » (WCAG 2.5.3, « label in name »).
    label: "1. Liste numérotée",
    glyph: "1.",
    key: null,
    apply: (v, s, e) => prefixLines(v, s, e, "1. "),
  },
  {
    id: "q",
    label: "Citation",
    glyph: "❝",
    key: null,
    apply: (v, s, e) => prefixLines(v, s, e, "> "),
  },
];

/** Le nom d'un bouton, avec son raccourci. */
function titleOf(item: (typeof FORMATS)[number]): string {
  return item.key === null
    ? item.label
    : `${item.label} (Ctrl+${item.key.toUpperCase()})`;
}

/**
 * Un éditeur de texte Markdown d'une seule boîte : le champ, puis une barre
 * qui porte les outils de l'appelant, la mise en forme (gras, italique, code,
 * lien, formule, listes, citation), l'onglet « Aperçu » et les actions.
 *
 * Guide pour un agent : brique du KIT, partagée par les démos — le salon
 * l'habille de pièces jointes et d'émoticônes (`ChatComposer.tsx`). Le texte
 * reste du Markdown BRUT (`markdown.ts`) ; « Aperçu » le montre avec le rendu
 * EXACT du salon, natures comprises (`MessageBody.tsx`). Chaque geste passe
 * par une fonction pure de `markdown.ts`, puis la sélection est reposée AVANT
 * toute frappe suivante (`useLayoutEffect`). Entrée sur une ligne de liste
 * ouvre l'élément suivant ; ailleurs, elle appelle `onEnter` s'il est fourni
 * (envoyer), sinon va à la ligne. Maj+Entrée va toujours à la ligne.
 *
 * `@` en début de mot propose les `mentions` qui commencent par ce qui est
 * tapé. Le champ garde son rôle `textbox` (ARIA in HTML n'en permet pas
 * d'autre) : `aria-autocomplete="list"`, `aria-controls` vers la liste et
 * `aria-activedescendant` vers le nom choisi ; clavier du motif « Combobox »
 * de l'APG — ↑↓ choisit, Entrée ou Tab valide, Échap ferme. Liste ouverte,
 * Entrée valide le nom et n'envoie pas.
 *
 * La barre est un `toolbar` (APG) : UN arrêt de tabulation, les flèches ←→,
 * Début et Fin s'y déplacent ; les actions restent hors de la barre.
 *
 * @param mentions - noms proposés après `@` (absent : aucune suggestion)
 * @param editor - reçoit la poignée d'édition (`insert`), pour les outils
 * @param tools - outils de l'appelant, en tête de barre (classe `md-tool`)
 * @param actions - en fin de boîte, hors de la barre (« Envoyer »…)
 * @param above - au-dessus du champ, dans la boîte (pièces en attente…)
 */
export function MarkdownEditor({
  value,
  onChange,
  onEnter,
  label,
  placeholder,
  maxLength,
  onPaste,
  onKeyDown,
  mentions,
  editor,
  tools,
  actions,
  above,
}: {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  label: string;
  placeholder?: string;
  maxLength?: number;
  onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  mentions?: readonly string[];
  editor?: Ref<IEditorHandle>;
  tools?: ReactNode;
  actions?: ReactNode;
  above?: ReactNode;
}) {
  const inputId = useId();
  const listId = useId();
  const tabsId = useId();
  const field = useRef<HTMLTextAreaElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [previewing, setPreviewing] = useState(false);

  // La mention en cours : recalculée du texte et du curseur à chaque rendu.
  // `pick` retient le nom choisi POUR une frappe donnée (sa clé) : une lettre
  // de plus ramène le choix en tête ; Échap ferme la liste de CE `@`.
  const [caret, setCaret] = useState<number | null>(null);
  const [pick, setPick] = useState({ key: "", index: 0 });
  const [dismissed, setDismissed] = useState<number | null>(null);
  const mention =
    mentions === undefined || caret === null || previewing
      ? null
      : mentionAt(value, caret);
  const options =
    mention === null || mentions === undefined
      ? []
      : suggestMentions(mentions, mention.query, MENTION_LIMIT);
  const open =
    mention !== null && options.length > 0 && dismissed !== mention.start;
  const pickKey = mention === null ? "" : `${mention.start}:${mention.query}`;
  const chosen =
    pick.key === pickKey ? Math.min(pick.index, options.length - 1) : 0;
  const track = (el: HTMLTextAreaElement) => {
    const at = el.selectionStart === el.selectionEnd ? el.selectionStart : null;
    setCaret(at);
    if (at === null || mentionAt(el.value, at) === null) setDismissed(null);
  };

  // Barre d'outils : un seul bouton atteint par Tab (`tabIndex` 0), le
  // dernier visité. Posé au DOM à chaque rendu : les outils de l'appelant
  // n'appartiennent pas à ce composant, et ils sont une dizaine.
  const rove = useRef(0);
  const barItems = (): HTMLButtonElement[] =>
    bar.current === null
      ? []
      : [...bar.current.querySelectorAll<HTMLButtonElement>(BAR_ITEMS)].filter(
          (item) => !item.disabled,
        );
  const roveTo = (items: readonly HTMLButtonElement[], index: number) => {
    rove.current = index;
    items.forEach((item, at) => {
      item.tabIndex = at === index ? 0 : -1;
    });
  };
  useLayoutEffect(() => {
    const items = barItems();
    roveTo(items, Math.min(rove.current, items.length - 1));
  });
  const barKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = barItems();
    const from = items.findIndex((item) => item === event.target);
    if (from < 0) return;
    const to =
      event.key === "ArrowRight"
        ? from + 1
        : event.key === "ArrowLeft"
          ? from - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? items.length - 1
              : null;
    if (to === null) return;
    event.preventDefault();
    const index = (to + items.length) % items.length;
    roveTo(items, index);
    items[index]?.focus();
  };
  // La sélection à reposer après le rendu du nouveau texte : en
  // `useLayoutEffect`, AVANT toute frappe suivante (un `requestAnimationFrame`
  // arrivait après une frappe rapide, qui remplaçait alors la sélection).
  const selection = useRef<{ start: number; end: number } | null>(null);
  useLayoutEffect(() => {
    const el = field.current;
    const next = selection.current;
    if (el === null || next === null) return;
    selection.current = null;
    el.focus();
    el.setSelectionRange(next.start, next.end);
  }, [value, previewing]);

  const apply = (edit: Edit) => {
    const el = field.current;
    const next = edit(
      value,
      el?.selectionStart ?? value.length,
      el?.selectionEnd ?? value.length,
    );
    selection.current = { start: next.start, end: next.end };
    setCaret(next.start === next.end ? next.start : null);
    onChange(next.value);
  };

  // Écrire / Aperçu : deux onglets (motif Tabs de l'APG, activation
  // automatique) — ←/→ passent de l'un à l'autre, un seul arrêt de tabulation.
  const writeTab = useRef<HTMLButtonElement>(null);
  const previewTab = useRef<HTMLButtonElement>(null);
  const showPreview = (next: boolean) => {
    // Le focus RESTE sur l'onglet (APG) : le champ garde sa sélection.
    if (next !== previewing) setPreviewing(next);
  };
  const tabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home" ? false : event.key === "End" ? true : !previewing;
    showPreview(next);
    (next ? previewTab : writeTab).current?.focus();
  };

  const accept = (name: string) => {
    if (mention !== null) apply((v) => applyMention(v, mention, name));
  };

  useImperativeHandle(editor, () => ({
    insert: (text) =>
      apply((v, s, e) => ({
        value: v.slice(0, s) + text + v.slice(e),
        start: s + text.length,
        end: s + text.length,
      })),
    focus: () => field.current?.focus(),
  }));

  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    // `open` garantit une mention et au moins un nom (`chosen` y est borné).
    if (open && !event.nativeEvent.isComposing) {
      const name = options.find((_, index) => index === chosen);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        setPick({
          key: pickKey,
          index: (chosen + step + options.length) % options.length,
        });
        return;
      }
      if (
        (event.key === "Enter" || event.key === "Tab") &&
        !event.shiftKey &&
        name !== undefined
      ) {
        event.preventDefault();
        accept(name);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setDismissed(mention.start);
        return;
      }
    }
    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      const shortcut = FORMATS.find(
        (item) => item.key === event.key.toLowerCase(),
      );
      if (shortcut !== undefined) {
        event.preventDefault();
        apply(shortcut.apply);
        return;
      }
    }
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    const el = event.currentTarget;
    const list =
      el.selectionStart === el.selectionEnd
        ? continueList(value, el.selectionStart)
        : null;
    if (list !== null) {
      event.preventDefault();
      selection.current = { start: list.start, end: list.end };
      onChange(list.value);
      return;
    }
    if (onEnter !== undefined) {
      event.preventDefault();
      onEnter();
    }
  };

  return (
    <div className="md-editor">
      {above}
      <div
        className="md-tabs"
        role="tablist"
        // Hors de l'ordre de tabulation : ce sont ses onglets qu'on atteint.
        tabIndex={-1}
        aria-label={`Mode : ${label}`}
        onKeyDown={tabKey}
      >
        <button
          ref={writeTab}
          type="button"
          role="tab"
          id={`${tabsId}-write`}
          aria-controls={`${tabsId}-write-panel`}
          aria-selected={!previewing}
          tabIndex={previewing ? -1 : 0}
          // Le nom porte le champ et COMMENCE par le libellé visible : deux
          // éditeurs peuvent cohabiter (envoi, modification).
          aria-label={`Écrire : ${label}`}
          onClick={() => showPreview(false)}
        >
          Écrire
        </button>
        <button
          ref={previewTab}
          type="button"
          role="tab"
          id={`${tabsId}-preview`}
          aria-controls={`${tabsId}-preview-panel`}
          aria-selected={previewing}
          tabIndex={previewing ? 0 : -1}
          aria-label={`Aperçu : ${label}`}
          onClick={() => showPreview(true)}
        >
          Aperçu
        </button>
      </div>
      <div
        id={`${tabsId}-write-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-write`}
        className="md-write"
        hidden={previewing}
      >
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        <textarea
          id={inputId}
          ref={field}
          rows={2}
          value={value}
          maxLength={maxLength}
          autoComplete="off"
          placeholder={placeholder}
          aria-autocomplete={mentions === undefined ? undefined : "list"}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open ? `${listId}-${chosen}` : undefined}
          onPaste={onPaste}
          onKeyDown={keyDown}
          onSelect={(event) => track(event.currentTarget)}
          onBlur={() => setCaret(null)}
          onChange={(event) => {
            track(event.target);
            onChange(event.target.value);
          }}
        />
        {open && (
          <div
            id={listId}
            role="listbox"
            className="md-mentions"
            aria-label="Personnes à mentionner"
          >
            {options.map((name, index) => (
              // Le clavier reste au CHAMP (`aria-activedescendant`) : un nom ne
              // prend jamais le focus, d'où `tabIndex={-1}` et le `mousedown` retenu.
              <div
                key={name}
                id={`${listId}-${index}`}
                role="option"
                tabIndex={-1}
                aria-selected={index === chosen}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => accept(name)}
                // Un nom focalisé autrement (lecteur d'écran) se valide aussi au clavier.
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    accept(name);
                  }
                }}
              >
                @{name}
              </div>
            ))}
          </div>
        )}
        {mentions !== undefined && (
          <p className="sr-only" aria-live="polite">
            {open
              ? `${options.length} personne${options.length > 1 ? "s" : ""} à mentionner`
              : ""}
          </p>
        )}
      </div>
      <div
        id={`${tabsId}-preview-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-preview`}
        className="md-preview"
        // Un panneau qui défile se joint au clavier (WCAG 2.1.1).
        tabIndex={0}
        hidden={!previewing}
      >
        {previewing &&
          (value.trim() === "" ? (
            <p className="md-empty">Rien à prévisualiser.</p>
          ) : (
            <MessageBody text={value} />
          ))}
      </div>
      <div className="md-toolbar">
        <div
          ref={bar}
          className="md-bar"
          role="toolbar"
          // Hors de l'ordre de tabulation : ce sont ses boutons qu'on atteint.
          tabIndex={-1}
          aria-label={`Outils : ${label}`}
          onKeyDown={barKey}
          onFocus={(event) => {
            // Le focus arrive sur un BOUTON de la barre : la cible n'est pas la barre.
            const focused: EventTarget = event.target;
            const items = barItems();
            const index = items.findIndex((item) => item === focused);
            if (index >= 0) roveTo(items, index);
          }}
        >
          {tools}
          <div className="md-formats" role="group" aria-label="Mise en forme">
            {FORMATS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`md-tool md-tool-${item.id}`}
                aria-label={titleOf(item)}
                title={titleOf(item)}
                disabled={previewing}
                onClick={() => apply(item.apply)}
              >
                {item.glyph}
              </button>
            ))}
          </div>
        </div>
        {actions}
      </div>
    </div>
  );
}
