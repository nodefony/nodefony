import { createElement, useEffect, useState, type ReactNode } from "react";
import {
  CSV_MAX_ROWS,
  JSON_MAX_DEPTH,
  JSON_OPEN_DEPTH,
  type NatureBlock,
} from "./detect";
import { highlightCode, type ICodeToken } from "./codeHighlight";
import { MarkdownText } from "./MarkdownText";
import { countLines } from "./preview";
import { MathView } from "./MathView";

/**
 * Le rendu d'un bloc de message selon sa NATURE : code coloré, JSON en arbre,
 * tableau, diff, formule — ou le texte Markdown.
 *
 * Guide pour un agent : brique du KIT. La nature vient de `detectBlocks`
 * (`detect.ts`), jamais d'une devinette ici : le `switch` de
 * `NatureBlockView` est EXHAUSTIF sur l'union `NatureBlock` (une nature
 * ajoutée à l'union ne compile plus tant qu'elle n'est pas rendue). Tout est
 * rendu en éléments React — aucun HTML injecté — et rien ne défile : une zone
 * qui défile échappe au clavier, donc le code et le diff se replient à la
 * ligne. Chaque bloc porte son bouton « Copier » (la source entière, même ce
 * qui n'est pas montré). La coloration du code (`codeHighlight.ts`) et KaTeX
 * (`MathView.tsx`) arrivent par `import()` : le bloc s'affiche d'abord en
 * texte à chasse fixe, de sa taille finale.
 */

/** Un nœud JSON montre au plus cent enfants ; le reste se copie avec la source. */
export const JSON_MAX_CHILDREN = 100;

/** Un bloc, rendu selon sa nature. */
export function NatureBlockView({ block }: { block: NatureBlock }): ReactNode {
  switch (block.nature) {
    case "text":
      return <MarkdownText text={block.source} />;
    case "code":
      return <CodeBlock source={block.source} language={block.language} />;
    case "json":
      return <JsonBlock source={block.source} value={block.value} />;
    case "csv":
      return <CsvBlock block={block} />;
    case "diff":
      return <DiffBlock source={block.source} />;
    case "math":
      return (
        <div className="nb nb-math">
          <MathView tex={block.tex} display />
        </div>
      );
    default:
      return exhaustive(block);
  }
}

/** Une nature que le `switch` n'a pas prévue : impossible tant que l'union compile. */
function exhaustive(block: never): never {
  throw new Error(`nature de bloc inconnue : ${JSON.stringify(block)}`);
}

/** Le bouton qui copie la SOURCE entière d'un bloc. */
export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setDone(false), 1500);
    return () => window.clearTimeout(timer);
  }, [done]);
  return (
    <button
      type="button"
      className="nb-copy"
      onClick={() => {
        navigator.clipboard.writeText(text).then(
          () => setDone(true),
          () => undefined,
        );
      }}
    >
      {done ? "Copié" : "Copier"}
    </button>
  );
}

/** Le cadre commun : sa nature, son bouton, puis le contenu. */
function Frame({
  label,
  source,
  className,
  children,
}: {
  label: string;
  source: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <figure className={`nb ${className}`}>
      <figcaption className="nb-head">
        <span>{label}</span>
        <CopyButton text={source} />
      </figcaption>
      {children}
    </figure>
  );
}

/** Au-delà de ce nombre de lignes, un bloc de code s'ouvre replié. */
export const CODE_FOLD_LINES = 16;

/**
 * Les jetons colorés d'un code — `null` tant que `highlight.js` n'est pas là,
 * ou si la langue reste inconnue (le code s'affiche alors en texte brut).
 *
 * @param source - le code
 * @param language - sa langue, ou `null` pour la deviner
 */
export function useCodeTokens(
  source: string,
  language: string | null,
): ICodeToken[] | null {
  const [tokens, setTokens] = useState<ICodeToken[] | null>(null);
  useEffect(() => {
    let alive = true;
    setTokens(null);
    highlightCode(source, language).then(
      (found) => {
        if (alive) setTokens(found);
      },
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, [source, language]);
  return tokens;
}

/** Un `<code>` : le texte brut, ou ses jetons colorés. */
export function CodeTokens({
  source,
  tokens,
}: {
  source: string;
  tokens: readonly ICodeToken[] | null;
}): ReactNode {
  return tokens === null
    ? createElement("code", null, source)
    : createElement(
        "code",
        null,
        ...tokens.map((token) =>
          createElement(
            "span",
            {
              className:
                token.kind === "plain" ? undefined : `tok-${token.kind}`,
            },
            token.text,
          ),
        ),
      );
}

/** Du code : en texte tout de suite, coloré dès que `highlight.js` est là. */
function CodeBlock({
  source,
  language,
}: {
  source: string;
  language: string | null;
}) {
  const tokens = useCodeTokens(source, language);
  // Un long bloc (un fichier collé) s'ouvre REPLIÉ sur ses premières lignes :
  // le fil reste lisible, et rien n'y défile dans le défilement — le bouton
  // déplie le bloc entier dans le fil.
  const lines = countLines(source);
  const foldable = lines > CODE_FOLD_LINES;
  const [unfolded, setUnfolded] = useState(false);
  const folded = foldable && !unfolded;
  return (
    <Frame
      label={language ?? "code"}
      source={source}
      className={folded ? "nb-code is-folded" : "nb-code"}
    >
      <pre style={folded ? { maxHeight: `${CODE_FOLD_LINES}lh` } : undefined}>
        <CodeTokens source={source} tokens={tokens} />
      </pre>
      {foldable && (
        <button
          type="button"
          className="nb-fold"
          aria-expanded={unfolded}
          onClick={() => setUnfolded(!unfolded)}
        >
          {unfolded ? "Replier" : `Tout afficher — ${lines} lignes`}
        </button>
      )}
    </Frame>
  );
}

/** Une valeur JSON qui n'est ni un objet ni une liste. */
function Scalar({ value }: { value: unknown }) {
  if (typeof value === "string")
    return <span className="json-string">{JSON.stringify(value)}</span>;
  if (typeof value === "number")
    return <span className="json-number">{String(value)}</span>;
  return <span className="json-literal">{String(value)}</span>;
}

/** Les enfants d'un objet ou d'une liste JSON : `[clé, valeur]`. */
function entriesOf(value: object): [string, unknown][] {
  return Array.isArray(value)
    ? value.map((item: unknown, index): [string, unknown] => [
        String(index),
        item,
      ])
    : Object.entries(value);
}

/**
 * Un nœud de l'arbre JSON. Replié, il ne rend PAS ses enfants : un JSON de
 * 64 Kio ne fabrique que ce qu'on déplie.
 */
function JsonNode({
  name,
  value,
  depth,
}: {
  name: string | null;
  value: unknown;
  depth: number;
}) {
  const [open, setOpen] = useState(depth < JSON_OPEN_DEPTH);
  const key = name === null ? null : <span className="json-key">{name}: </span>;
  if (typeof value !== "object" || value === null)
    return (
      <div className="json-leaf">
        {key}
        <Scalar value={value} />
      </div>
    );
  if (depth > JSON_MAX_DEPTH)
    return (
      <div className="json-leaf">
        {key}
        <span className="json-literal">…</span>
      </div>
    );
  const entries = entriesOf(value);
  const list = Array.isArray(value);
  return (
    <details
      className="json-node"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        {key}
        <span className="json-literal">
          {list ? `[ ${entries.length} ]` : `{ ${entries.length} }`}
        </span>
      </summary>
      {open && (
        <div className="json-children">
          {entries.slice(0, JSON_MAX_CHILDREN).map(([childName, child]) => (
            <JsonNode
              key={childName}
              name={list ? null : childName}
              value={child}
              depth={depth + 1}
            />
          ))}
          {entries.length > JSON_MAX_CHILDREN && (
            <p className="att-note">
              … {entries.length - JSON_MAX_CHILDREN} de plus : copier pour tout
              lire
            </p>
          )}
        </div>
      )}
    </details>
  );
}

/** Un JSON valide : un arbre replié au-delà de `JSON_OPEN_DEPTH`. */
function JsonBlock({ source, value }: { source: string; value: unknown }) {
  return (
    <Frame label="JSON" source={source} className="nb-json">
      <div className="json-tree">
        <JsonNode name={null} value={value} depth={0} />
      </div>
    </Frame>
  );
}

/** Un tableau : ses `CSV_MAX_ROWS` premières lignes, le reste annoncé. */
function CsvBlock({
  block,
}: {
  block: Extract<NatureBlock, { nature: "csv" }>;
}) {
  const more = block.total - block.rows.length;
  return (
    <Frame
      label={`Tableau · ${block.header.length} colonnes · ${block.total} ligne${block.total > 1 ? "s" : ""}`}
      source={block.source}
      className="nb-csv"
    >
      <table className="nb-table">
        <caption className="sr-only">
          Tableau de {block.total} ligne{block.total > 1 ? "s" : ""}, lu depuis
          le message
        </caption>
        <thead>
          {createElement(
            "tr",
            null,
            ...block.header.map((cell) =>
              createElement("th", { scope: "col" }, cell),
            ),
          )}
        </thead>
        {createElement(
          "tbody",
          null,
          ...block.rows.map((row) =>
            createElement(
              "tr",
              null,
              ...row.map((cell) => createElement("td", null, cell)),
            ),
          ),
        )}
      </table>
      {more > 0 && (
        <p className="att-note">
          … {more} ligne{more > 1 ? "s" : ""} de plus (les {CSV_MAX_ROWS}{" "}
          premières sont montrées) : copier pour tout lire
        </p>
      )}
    </Frame>
  );
}

/** La classe d'une ligne de diff d'après son premier caractère. */
function diffClass(line: string): string {
  if (line.startsWith("@@")) return "diff-line diff-hunk";
  if (line.startsWith("+++") || line.startsWith("---"))
    return "diff-line diff-file";
  if (line.startsWith("+")) return "diff-line diff-add";
  if (line.startsWith("-")) return "diff-line diff-del";
  return "diff-line";
}

/** Un diff : chaque ligne teintée selon son signe (le signe reste écrit). */
function DiffBlock({ source }: { source: string }) {
  return (
    <Frame label="Diff" source={source} className="nb-diff">
      <pre>
        {createElement(
          "code",
          null,
          ...source
            .split("\n")
            .map((line) =>
              createElement("span", { className: diffClass(line) }, line),
            ),
        )}
      </pre>
    </Frame>
  );
}
