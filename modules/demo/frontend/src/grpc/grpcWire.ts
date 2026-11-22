import { GRPC_ENVELOPE_BYTES } from "./grpcClient";

/**
 * Lire une trame gRPC octet par octet, pour la DESSINER : enveloppe, clés,
 * texte, nombres. La page lit les octets que le serveur a vraiment rendus.
 *
 * Guide pour un agent : un lecteur du format protobuf réduit à ce que la
 * démo transporte (varint, double, longueur) — pas un décodeur général. Les
 * champs qui sont eux-mêmes des messages se déclarent dans `NESTED` : le
 * format ne dit pas si des octets « longueur » sont un texte ou un message,
 * seul le contrat le sait. Fonctions pures, éprouvées par le test du module
 * contre `toBinary` de `@bufbuild/protobuf`.
 */

/** Ce qu'un morceau de trame porte : la légende du dessin. */
export type WirePart =
  "envelope" | "key" | "text" | "number" | "trailer" | "rest";

/** Un morceau de trame : ses octets `[start, end)`, et ce qu'ils disent. */
export interface IWireSegment {
  part: WirePart;
  start: number;
  end: number;
  label: string;
}

/** Les champs du contrat de la démo, par chemin de numéros (`1.3` = `reading.measured_at`). */
const FIELDS: Readonly<Record<string, string>> = {
  "1": "reading",
  "1.1": "machine",
  "1.2": "celsius",
  "1.3": "measured_at",
  "1.3.1": "seconds",
  "1.3.2": "nanos",
};

/** Les champs qui sont des MESSAGES : leurs octets se relisent comme une trame. */
const NESTED: ReadonlySet<string> = new Set(["1", "1.3"]);

/** Les types de fil protobuf, par numéro. */
const WIRE_TYPES = ["varint", "64 bits", "longueur", "", "", "32 bits"];

/**
 * Découpe une réponse gRPC-Web en morceaux légendés, dans l'ordre du fil :
 * chaque message (enveloppe, puis champs), puis le message de FIN (drapeau
 * `0x80`) qui porte le statut en texte. Des octets illisibles (réponse
 * coupée, type inconnu) finissent en `rest` : rien n'est inventé, rien
 * n'est perdu.
 *
 * @param frame - le corps reçu, tel quel
 */
export function readGrpcFrame(frame: Uint8Array): IWireSegment[] {
  const segments: IWireSegment[] = [];
  const view = new DataView(frame.buffer, frame.byteOffset, frame.byteLength);
  let at = 0;
  while (at < frame.byteLength) {
    if (at + GRPC_ENVELOPE_BYTES > frame.byteLength) {
      rest(segments, at, frame.byteLength);
      break;
    }
    const flag = view.getUint8(at);
    const length = view.getUint32(at + 1);
    const trailer = (flag & 0x80) !== 0;
    segments.push(
      {
        part: "envelope",
        start: at,
        end: at + 1,
        label: trailer
          ? "drapeau 0x80 : message de fin"
          : `drapeau ${flag} : message, non compressé`,
      },
      {
        part: "envelope",
        start: at + 1,
        end: at + GRPC_ENVELOPE_BYTES,
        label: `longueur : ${length} octets`,
      },
    );
    const start = at + GRPC_ENVELOPE_BYTES;
    const end = Math.min(start + length, frame.byteLength);
    if (trailer) {
      segments.push({
        part: "trailer",
        start,
        end,
        label: `statut : « ${new TextDecoder().decode(frame.subarray(start, end)).trim()} »`,
      });
    } else {
      readMessage(frame, view, start, end, "", segments);
    }
    at = start + length;
  }
  return segments;
}

/** Lit les champs de `[start, end)`, et y descend pour un champ message. */
function readMessage(
  frame: Uint8Array,
  view: DataView,
  start: number,
  end: number,
  path: string,
  segments: IWireSegment[],
): void {
  let at = start;
  while (at < end) {
    const key = readVarint(frame, at, end);
    if (key === null) {
      rest(segments, at, end);
      return;
    }
    const field = Math.floor(key.value / 8);
    const type = key.value % 8;
    const fieldPath = path === "" ? `${field}` : `${path}.${field}`;
    const name = FIELDS[fieldPath] ?? `champ ${field}`;
    segments.push({
      part: "key",
      start: at,
      end: key.next,
      label: `clé : champ ${field} (${name}), ${WIRE_TYPES[type] || `type ${type}`}`,
    });
    at = key.next;
    if (type === 0) {
      const value = readVarint(frame, at, end);
      if (value === null) {
        rest(segments, at, end);
        return;
      }
      segments.push({
        part: "number",
        start: at,
        end: value.next,
        label: `${name} = ${value.value}`,
      });
      at = value.next;
    } else if (type === 1 && at + 8 <= end) {
      segments.push({
        part: "number",
        start: at,
        end: at + 8,
        label: `${name} = ${view.getFloat64(at, true)}`,
      });
      at += 8;
    } else if (type === 2) {
      const length = readVarint(frame, at, end);
      if (length === null || length.next + length.value > end) {
        rest(segments, at, end);
        return;
      }
      segments.push({
        part: "key",
        start: at,
        end: length.next,
        label: `longueur : ${length.value} octets`,
      });
      const inner = length.next + length.value;
      if (NESTED.has(fieldPath)) {
        readMessage(frame, view, length.next, inner, fieldPath, segments);
      } else {
        segments.push({
          part: "text",
          start: length.next,
          end: inner,
          label: `${name} = « ${new TextDecoder().decode(frame.subarray(length.next, inner))} »`,
        });
      }
      at = inner;
    } else {
      rest(segments, at, end);
      return;
    }
  }
}

/** Un varint lu à `at` : sa valeur et l'octet suivant, ou `null` s'il déborde. */
function readVarint(
  frame: Uint8Array,
  at: number,
  end: number,
): { value: number; next: number } | null {
  let value = 0;
  // Multiplier plutôt que décaler : un varint de 5 octets dépasse 32 bits.
  let scale = 1;
  for (let i = at; i < end && i < at + 8; i += 1) {
    const byte = frame[i] ?? 0;
    value += (byte & 0x7f) * scale;
    if (byte < 0x80) return { value, next: i + 1 };
    scale *= 128;
  }
  return null;
}

/** Les octets restants, illisibles pour ce lecteur. */
function rest(
  segments: IWireSegment[],
  start: number,
  end: number,
): IWireSegment[] {
  if (end > start) {
    segments.push({
      part: "rest",
      start,
      end,
      label: `${end - start} octets non lus`,
    });
  }
  return segments;
}
