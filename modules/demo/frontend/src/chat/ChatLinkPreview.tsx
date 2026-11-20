import {
  createElement,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { HoverBubble, type IBubbleAnchor } from "../kit/HoverBubble";
import { MdLink, type ILinkSlot } from "../kit/MarkdownText";
import { MessageBody } from "../kit/MessageBody";
import { LINK_INDEX_MAX, type ChatLinkPreview } from "./chatContract";

/**
 * Le texte d'un message du salon, et l'aperçu de ses liens au survol.
 *
 * Guide pour un agent : la page ne demande JAMAIS une adresse au serveur —
 * elle désigne le lien de rang `index` d'un message (`CHAT_LINK_PATH`, route
 * `GET …/messages/{message}/links/{index}` du contrat) ; le serveur relit le
 * message, applique l'admission du salon, et lit le site tiers (garde SSRF
 * côté serveur). Ce que le serveur rend est une DONNÉE (`ChatLinkPreview`) :
 * `LinkOutcome` en traite chaque état par un `switch` exhaustif. Le rang suit
 * `messageLinks` (`kit/messageLinks.ts`), la règle partagée avec le serveur.
 * La bulle (`kit/HoverBubble.tsx`) ne lit RIEN avant d'être ouverte ; la
 * réponse se garde PAR ADRESSE dans la page (`PREVIEWS`, bornée) — le même
 * lien dans dix messages ne fait qu'une lecture. Un quota dépassé (429) ou un
 * échec ne se garde pas : la bulle montre alors le domaine et l'adresse
 * complète, rien d'autre. Aucune image n'est jamais chargée (D29).
 */

/** La route du contrat : le lien de rang `index` du message `message`. */
export const CHAT_LINK_PATH =
  "/demo/chat/rooms/{room}/messages/{message}/links/{index}";

/** Les adresses gardées dans la page : au-delà, la plus ancienne part. */
export const PREVIEW_CACHE_MAX = 200;

/** Ce que la page a obtenu : un aperçu, le quota, ou rien. */
type Outcome =
  | { kind: "preview"; preview: ChatLinkPreview }
  | { kind: "busy" }
  | { kind: "failed" };

/** Les lectures en cours ou finies, par adresse. */
const PREVIEWS = new Map<string, Promise<Outcome>>();

/** Lit un champ texte d'une réponse, ou `null`. */
function textField(body: object, name: string): string | null {
  const value: unknown = Reflect.get(body, name);
  return typeof value === "string" ? value : null;
}

/** Reconnaît un `ChatLinkPreview` dans la réponse — sans rien présumer d'elle. */
function readPreview(body: unknown): ChatLinkPreview | null {
  if (typeof body !== "object" || body === null) return null;
  const state = textField(body, "state");
  const url = textField(body, "url");
  const site = textField(body, "site");
  if (url === null || site === null) return null;
  if (state === "read") {
    const title = textField(body, "title");
    if (title === null) return null;
    return {
      state,
      url,
      site,
      title,
      description: textField(body, "description"),
    };
  }
  if (
    state === "internal" ||
    state === "timeout" ||
    state === "not-html" ||
    state === "unreachable"
  )
    return { state, url, site };
  return null;
}

/** Demande l'aperçu au serveur. */
async function fetchPreview(
  roomId: string,
  messageId: string,
  index: number,
): Promise<Outcome> {
  const response = await fetch(
    CHAT_LINK_PATH.replace("{room}", encodeURIComponent(roomId))
      .replace("{message}", encodeURIComponent(messageId))
      .replace("{index}", String(index)),
    { credentials: "same-origin" },
  );
  if (response.status === 429) return { kind: "busy" };
  if (!response.ok) return { kind: "failed" };
  const preview = readPreview(await response.json().catch(() => null));
  return preview === null ? { kind: "failed" } : { kind: "preview", preview };
}

/** L'aperçu d'une adresse : gardé s'il est lu, refait sinon. */
function previewOf(
  href: string,
  roomId: string,
  messageId: string,
  index: number,
): Promise<Outcome> {
  const known = PREVIEWS.get(href);
  if (known !== undefined) return known;
  const pending = fetchPreview(roomId, messageId, index).catch((): Outcome => ({
    kind: "failed",
  }));
  PREVIEWS.set(href, pending);
  if (PREVIEWS.size > PREVIEW_CACHE_MAX) {
    const oldest = PREVIEWS.keys().next();
    if (!oldest.done) PREVIEWS.delete(oldest.value);
  }
  void pending.then((outcome) => {
    if (outcome.kind !== "preview" && PREVIEWS.get(href) === pending)
      PREVIEWS.delete(href);
  });
  return pending;
}

/** Le domaine et l'adresse complète : tout ce que la bulle sait sans le site. */
function Address({ slot }: { slot: ILinkSlot }) {
  return (
    <>
      <strong className="link-host">{slot.host}</strong>
      <span className="link-url">{slot.href}</span>
    </>
  );
}

/** Une issue de lecture, en bulle. */
function LinkOutcome({
  slot,
  outcome,
}: {
  slot: ILinkSlot;
  outcome: Outcome | null;
}) {
  if (outcome === null)
    return (
      <>
        <Address slot={slot} />
        <span className="link-note">Lecture de l'aperçu…</span>
      </>
    );
  if (outcome.kind === "busy")
    return (
      <>
        <Address slot={slot} />
        <span className="link-note">
          Trop d'aperçus demandés : réessaie dans une minute.
        </span>
      </>
    );
  if (outcome.kind === "failed") return <Address slot={slot} />;
  const preview = outcome.preview;
  switch (preview.state) {
    case "read":
      return (
        <>
          <strong className="link-title">{preview.title}</strong>
          {preview.description !== null && (
            <span className="link-desc">{preview.description}</span>
          )}
          <span className="link-host">{preview.site}</span>
          <span className="link-url">{preview.url}</span>
        </>
      );
    case "internal":
    case "timeout":
    case "not-html":
    case "unreachable":
      return <Address slot={slot} />;
    default:
      return exhaustive(preview);
  }
}

/** Un état que le `switch` n'a pas prévu : impossible tant que le contrat compile. */
function exhaustive(preview: never): never {
  throw new Error(`état d'aperçu inconnu : ${JSON.stringify(preview)}`);
}

/** Le déclencheur d'un lien, défini hors du rendu. */
function linkTrigger(slot: ILinkSlot): (anchor: IBubbleAnchor) => ReactNode {
  return (anchor) => createElement(MdLink, { slot, anchor });
}

/** Le contenu d'une bulle de lien : monté bulle OUVERTE seulement, il lit alors. */
function LinkBubble({
  slot,
  roomId,
  messageId,
}: {
  slot: ILinkSlot;
  roomId: string;
  messageId: string;
}) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  useEffect(() => {
    let alive = true;
    void previewOf(slot.href, roomId, messageId, slot.index).then((found) => {
      if (alive) setOutcome(found);
    });
    return () => {
      alive = false;
    };
  }, [slot.href, slot.index, roomId, messageId]);
  return (
    <span className="link-bubble">
      <LinkOutcome slot={slot} outcome={outcome} />
    </span>
  );
}

/**
 * Le texte d'un message, ses liens munis d'une bulle d'aperçu.
 *
 * @param roomId - le salon du message
 * @param messageId - l'identifiant STABLE du message (celui du serveur)
 */
export function ChatMessageText({
  roomId,
  messageId,
  text,
}: {
  roomId: string;
  messageId: string;
  text: string;
}) {
  const renderLink = useCallback(
    (slot: ILinkSlot): ReactNode =>
      slot.index > LINK_INDEX_MAX ? (
        <MdLink slot={slot} />
      ) : (
        <HoverBubble
          bubble={createElement(LinkBubble, { slot, roomId, messageId })}
          trigger={linkTrigger(slot)}
        />
      ),
    [roomId, messageId],
  );
  return (
    <MessageBody className="room-text" text={text} renderLink={renderLink} />
  );
}
