import { useId, useMemo, useState, type CSSProperties } from "react";
import type { IPresenceSnapshot } from "nodefony/client";
import type { MemberState, RoomRole } from "./rooms";
import {
  ARRIVAL_MARK_MS,
  DEPARTURE_MARK_MS,
  type IMemberRow,
  type IRosterRow,
} from "./roster";

/** Au-delà de ce nombre de présents, un champ de recherche apparaît. */
const SEARCH_FROM = 12;

/** Les initiales d'un nom, pour la pastille : « Jean-Luc » → « JL ». */
function initialsOf(name: string | null): string {
  if (name === null) return "…";
  const parts = name.split(/[\s._-]+/u).filter((part) => part !== "");
  const letters = parts.map((part) => part.charAt(0)).join("");
  return (
    letters.length >= 2 ? letters.slice(0, 2) : name.slice(0, 2)
  ).toUpperCase();
}

/**
 * La teinte d'une pastille, tirée de l'identité : la même personne garde sa
 * couleur d'un salon à l'autre et d'une visite à l'autre.
 */
function hueOf(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1)
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

/** « 1 onglet », « 2 onglets ». */
function tabsLabel(tabs: number): string {
  return tabs === 1 ? "1 onglet ouvert" : `${tabs} onglets ouverts`;
}

/** Ce que le lecteur d'écran entend : les arrivées et départs du moment. */
function announcementOf(rows: readonly IRosterRow[]): string {
  const said: string[] = [];
  for (const row of rows) {
    if (row.me || row.name === null) continue;
    if (row.state === "arrived") said.push(`${row.name} est arrivé·e`);
    else if (row.state === "left") said.push(`${row.name} est parti·e`);
  }
  return said.join(", ");
}

/**
 * Le départ s'estompe pendant EXACTEMENT la durée où la règle le garde
 * visible : la durée vient de `roster.ts`, jamais recopiée dans le CSS.
 * Hissé au niveau du module : un seul objet, aucun à chaque rendu.
 */
const LEAVE_STYLE: CSSProperties = {
  animationDuration: `${DEPARTURE_MARK_MS}ms`,
};

/** Le voile d'arrivée (pseudo-élément) hérite de cette durée. */
const ARRIVE_STYLE: CSSProperties = {
  animationDuration: `${ARRIVAL_MARK_MS}ms`,
};

/** La durée d'animation d'une ligne, selon son état. */
function styleOf(row: IRosterRow): CSSProperties | undefined {
  if (row.state === "left") return LEAVE_STYLE;
  if (row.state === "arrived") return ARRIVE_STYLE;
  return undefined;
}

/** La ligne sous le nom : soi, la frappe, l'arrivée ou le départ. */
function PersonSub({
  row,
  typing,
}: {
  row: IRosterRow;
  typing: string | null;
}) {
  if (row.me) return <span className="person-sub">vous</span>;
  if (row.state === "left")
    return <span className="person-sub">vient de partir</span>;
  if (typing !== null && typing === row.name)
    return (
      <span className="person-sub">
        <span className="typing-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        écrit…
      </span>
    );
  if (row.state === "arrived")
    return <span className="person-sub">vient d'arriver</span>;
  return <span className="person-sub" />;
}

/** Ce que dit la ligne d'un membre sous son nom (D51). */
const STATE_TEXT: Readonly<Record<MemberState, string>> = {
  here: "dans le salon",
  online: "en ligne ailleurs",
  away: "absent·e",
};

/** Le rôle affiché à côté du nom ; un simple membre n'en porte pas. */
const ROLE_TEXT: Readonly<Record<RoomRole, string | null>> = {
  owner: "propriétaire",
  moderator: "modérateur",
  member: null,
};

/** Une ligne du panneau des membres : son état, son rôle, ses gestes. */
function MemberItem({
  row,
  typing,
  onMention,
  onDirect,
  onRemove,
}: {
  row: IMemberRow;
  typing: string | null;
  onMention: ((name: string) => void) | null;
  onDirect: ((userId: string) => void) | null;
  onRemove: ((userId: string, name: string) => void) | null;
}) {
  const role = ROLE_TEXT[row.role];
  const mention = row.state === "here" ? onMention : null;
  const remove = row.removable ? onRemove : null;
  return (
    <li className={`person is-${row.state}${row.me ? " is-me" : ""}`}>
      <span
        className="person-avatar"
        aria-hidden="true"
        style={{ backgroundColor: `hsl(${hueOf(row.id)} 45% 36%)` }}
      >
        {initialsOf(row.name)}
      </span>
      <span className="person-who">
        <span className="person-name">
          {row.name}
          {role !== null && <span className="person-role">{role}</span>}
        </span>
        <span className="person-sub">
          {row.me ? (
            "vous"
          ) : typing !== null && typing === row.name ? (
            <>
              <span className="typing-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              écrit…
            </>
          ) : (
            STATE_TEXT[row.state]
          )}
        </span>
      </span>
      <span />
      {!row.me &&
        (mention !== null || onDirect !== null || remove !== null) && (
          <span className="person-actions">
            {mention !== null && (
              <button
                type="button"
                onClick={() => mention(row.name)}
                aria-label={`Mentionner ${row.name}`}
              >
                @
              </button>
            )}
            {onDirect !== null && (
              <button
                type="button"
                onClick={() => onDirect(row.id)}
                aria-label={`Écrire en privé à ${row.name}`}
                title="Message privé"
              >
                ✉
              </button>
            )}
            {remove !== null && (
              <button
                type="button"
                className="is-danger"
                onClick={() => remove(row.id, row.name)}
                aria-label={`Exclure ${row.name} du salon`}
                title="Exclure du salon"
              >
                ⨯
              </button>
            )}
          </span>
        )}
    </li>
  );
}

/** Ce que le panneau reçoit de l'écran du salon. */
export interface IChatPeopleProps {
  presence: IPresenceSnapshot;
  rows: readonly IRosterRow[];
  /** Le nom de qui écrit en ce moment, s'il y en a un. */
  typing: string | null;
  /** Insère `@nom` dans le champ d'écriture ; absent pour un lecteur anonyme. */
  onMention: ((name: string) => void) | null;
  /**
   * Ouvre le salon à deux avec cette personne (son identité stable) ; absent
   * pour un anonyme, et dans un salon déjà à deux.
   */
  onDirect: ((userId: string) => void) | null;
  /**
   * Les membres d'un salon PRIVÉ et leur état (D51) ; `null` pour un salon
   * public, où le panneau ne montre que les présents.
   */
  members: readonly IMemberRow[] | null;
  /** Ouvre la confirmation d'exclusion ; absent si l'on ne modère pas. */
  onRemove: ((userId: string, name: string) => void) | null;
}

/**
 * Le panneau « Dans le salon » : qui est là, combien d'onglets, qui écrit,
 * qui arrive et qui part — tout vient de la présence du canal (ADR-0025) et
 * de l'annuaire du salon, rien n'est inventé par la page.
 *
 * Guide pour un agent : la règle (tri, marques d'arrivée et de départ) vit
 * dans `roster.ts`, pure et testée ; ce composant ne fait que la montrer.
 * Le mouvement est rare et doux : un fondu d'opacité à l'arrivée, coupé sous
 * `prefers-reduced-motion`. Sur un écran étroit, le panneau se replie derrière
 * un bouton qui donne le nombre de présents.
 */
export function ChatPeople({
  presence,
  rows,
  typing,
  onMention,
  onDirect,
  members,
  onRemove,
}: IChatPeopleProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const total = presence.count + presence.unnamed;
  const searchable = rows.length >= SEARCH_FROM;
  const shown = useMemo(() => {
    const wanted = query.trim().toLocaleLowerCase("fr");
    if (!searchable || wanted === "") return rows;
    return rows.filter((row) =>
      (row.name ?? "").toLocaleLowerCase("fr").includes(wanted),
    );
  }, [rows, query, searchable]);
  // Au-delà du seuil de la trame, le serveur n'envoie que des nombres.
  const namesHidden =
    presence.ready && presence.count > 0 && presence.members.size === 0;
  // Un salon privé : les présents qui ne sont pas membres (invités d'un
  // événement) restent visibles, sous les membres.
  const guests = useMemo(() => {
    if (members === null) return null;
    const ids = new Set(members.map((member) => member.id));
    return rows.filter((row) => !ids.has(row.id));
  }, [members, rows]);

  return (
    <aside className="people" aria-labelledby={`${listId}-title`}>
      <div className="people-head">
        <h3 id={`${listId}-title`} className="people-title">
          {members === null ? "Dans le salon" : "Membres"}
        </h3>
        <button
          type="button"
          className="people-toggle"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((was) => !was)}
        >
          {presence.ready ? `${total} présent${total > 1 ? "s" : ""}` : "…"}
        </button>
      </div>

      <div id={listId} className={open ? "people-body is-open" : "people-body"}>
        <p className="people-count" aria-busy={!presence.ready}>
          <span className="people-total">{presence.ready ? total : "…"}</span>
          <span className="people-split">
            <span>
              {presence.count} nommé{presence.count > 1 ? "s" : ""}
            </span>
            <span>
              {presence.unnamed} anonyme{presence.unnamed > 1 ? "s" : ""}
            </span>
          </span>
        </p>

        {searchable && (
          <div className="people-search">
            <label htmlFor={`${listId}-q`} className="sr-only">
              Chercher une personne présente
            </label>
            <input
              id={`${listId}-q`}
              type="search"
              placeholder="Chercher…"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        )}

        {members !== null && guests !== null ? (
          <>
            <ul className="people-list">
              {members.map((row) => (
                <MemberItem
                  key={row.id}
                  row={row}
                  typing={typing}
                  onMention={onMention}
                  onDirect={onDirect}
                  onRemove={onRemove}
                />
              ))}
            </ul>
            {guests.length > 0 && (
              <>
                <p className="people-subtitle">Aussi dans le salon</p>
                <ul className="people-list">
                  {guests.map((row) => (
                    <li
                      key={row.id}
                      className={`person is-${row.state}${row.me ? " is-me" : ""}`}
                      style={styleOf(row)}
                    >
                      <span
                        className="person-avatar"
                        aria-hidden="true"
                        style={{
                          backgroundColor: `hsl(${hueOf(row.id)} 45% 36%)`,
                        }}
                      >
                        {initialsOf(row.name)}
                      </span>
                      <span className="person-who">
                        <span className="person-name">{row.name ?? "…"}</span>
                        <PersonSub row={row} typing={typing} />
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : namesHidden ? (
          <p className="people-note">
            Le salon est trop grand pour lister chacun : seuls les nombres sont
            envoyés.
          </p>
        ) : (
          <ul className="people-list">
            {shown.map((row) => (
              <li
                key={row.id}
                className={`person is-${row.state}${row.me ? " is-me" : ""}`}
                style={styleOf(row)}
              >
                <span
                  className="person-avatar"
                  aria-hidden="true"
                  style={{ backgroundColor: `hsl(${hueOf(row.id)} 45% 36%)` }}
                >
                  {initialsOf(row.name)}
                </span>
                <span className="person-who">
                  <span className="person-name">{row.name ?? "…"}</span>
                  <PersonSub row={row} typing={typing} />
                </span>
                {row.state !== "left" && (
                  <span className="person-tabs" title={tabsLabel(row.tabs)}>
                    <span className="sr-only">{tabsLabel(row.tabs)}</span>
                    {Array.from({ length: Math.min(row.tabs, 4) }, (_, i) => (
                      <i key={i} aria-hidden="true" />
                    ))}
                    {row.tabs > 4 && <b aria-hidden="true">+{row.tabs - 4}</b>}
                  </span>
                )}
                {!row.me &&
                  row.state !== "left" &&
                  row.name !== null &&
                  (onMention !== null || onDirect !== null) && (
                    <span className="person-actions">
                      {onMention !== null && (
                        <button
                          type="button"
                          onClick={() => onMention(row.name ?? "")}
                          aria-label={`Mentionner ${row.name}`}
                        >
                          @
                        </button>
                      )}
                      {onDirect !== null && (
                        <button
                          type="button"
                          onClick={() => onDirect(row.id)}
                          aria-label={`Écrire en privé à ${row.name}`}
                          title="Message privé"
                        >
                          ✉
                        </button>
                      )}
                    </span>
                  )}
              </li>
            ))}
            {presence.unnamed > 0 && (
              <li className="person is-anonymous">
                <span className="person-avatar" aria-hidden="true">
                  ?
                </span>
                <span className="person-who">
                  <span className="person-name">
                    {presence.unnamed} anonyme{presence.unnamed > 1 ? "s" : ""}
                  </span>
                  <span className="person-sub">comptés, jamais nommés</span>
                </span>
              </li>
            )}
            {searchable && shown.length === 0 && (
              <li className="people-empty">
                Personne de ce nom dans le salon.
              </li>
            )}
          </ul>
        )}

        <p
          className={
            presence.partial ? "people-state is-partial" : "people-state"
          }
          role="status"
        >
          {!presence.ready
            ? "Connexion à la présence…"
            : presence.partial
              ? "Liste peut-être incomplète : on garde la dernière vue connue."
              : "Liste à jour."}
        </p>
        <p className="sr-only" aria-live="polite">
          {announcementOf(rows)}
        </p>
      </div>
    </aside>
  );
}
