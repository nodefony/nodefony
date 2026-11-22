/**
 * Des enregistrements binaires décrits par un schéma — la brique que la démo
 * partage pour mettre sur le fil le monde d'un jeu comme les mesures d'une
 * sonde.
 *
 * Guide pour un agent : un schéma = une liste de champs, chacun avec son type
 * (`u8`, `u16`, `u32`, `i16`, `f32`) et, pour un entier qui porte un réel, son
 * facteur (`scale: 10` = au dixième). Le MÊME objet écrit côté serveur et lit
 * côté page : `meteorRecord.write(list)` dans le service, `.read(bytes)` dans
 * le client. Tout en petit-boutiste, écrit explicitement. Un octet décalé ne
 * peut pas passer inaperçu : le test fait l'aller-retour.
 */

/** Les types d'un champ, et ce que chacun pèse. */
const SIZES = { u8: 1, u16: 2, u32: 4, i16: 2, f32: 4 } as const;

export type FieldType = keyof typeof SIZES;

/** Un champ du schéma ; `N` est l'union des noms de champs. */
export interface IFieldSpec<N extends string = string> {
  readonly name: N;
  readonly type: FieldType;
  /** Facteur appliqué avant d'écrire un entier, retiré à la lecture. */
  readonly scale?: number;
}

/** Un enregistrement lu ou à écrire : un nombre par champ du schéma. */
export type RecordOf<N extends string> = Record<N, number>;

/** Ce que rend `defineRecord` : la taille d'une entrée, et les deux sens. */
export interface IRecordCodec<N extends string> {
  readonly bytes: number;
  write(list: readonly RecordOf<N>[]): Uint8Array;
  read(bytes: Uint8Array): RecordOf<N>[];
}

const LIMITS: Record<FieldType, readonly [number, number]> = {
  u8: [0, 255],
  u16: [0, 65_535],
  u32: [0, 4_294_967_295],
  i16: [-32_768, 32_767],
  f32: [-Infinity, Infinity],
};

// #region kit-records
/**
 * Décrit un enregistrement et rend son écrivain et son lecteur. Un entier hors
 * de son type est BORNÉ, jamais replié : une position au-delà du bord reste au
 * bord, elle ne réapparaît pas de l'autre côté.
 */
export function defineRecord<const N extends string>(
  fields: readonly IFieldSpec<N>[],
): IRecordCodec<N> {
  const offsets: number[] = [];
  let size = 0;
  for (const field of fields) {
    offsets.push(size);
    size += SIZES[field.type];
  }
  const put = (
    view: DataView,
    at: number,
    field: IFieldSpec,
    value: number,
  ) => {
    const [min, max] = LIMITS[field.type];
    const scaled = value * (field.scale ?? 1);
    if (field.type === "f32") {
      view.setFloat32(at, scaled, true);
      return;
    }
    const n = Math.max(min, Math.min(max, Math.round(scaled)));
    if (field.type === "u8") view.setUint8(at, n);
    else if (field.type === "u16") view.setUint16(at, n, true);
    else if (field.type === "u32") view.setUint32(at, n, true);
    else view.setInt16(at, n, true);
  };
  const get = (view: DataView, at: number, field: IFieldSpec): number => {
    const raw =
      field.type === "f32"
        ? view.getFloat32(at, true)
        : field.type === "u8"
          ? view.getUint8(at)
          : field.type === "u16"
            ? view.getUint16(at, true)
            : field.type === "u32"
              ? view.getUint32(at, true)
              : view.getInt16(at, true);
    return raw / (field.scale ?? 1);
  };
  return {
    bytes: size,
    write(list) {
      const out = new Uint8Array(list.length * size);
      const view = new DataView(out.buffer);
      list.forEach((entry, i) => {
        fields.forEach((field, f) => {
          put(view, i * size + (offsets[f] ?? 0), field, entry[field.name]);
        });
      });
      return out;
    },
    read(bytes) {
      // Bornée à SA tranche : un Uint8Array reçu ne commence pas toujours
      // au début de son tampon.
      const view = new DataView(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength,
      );
      const list: RecordOf<N>[] = [];
      for (let at = 0; at + size <= bytes.byteLength; at += size) {
        const entry: Partial<RecordOf<N>> = {};
        fields.forEach((field, f) => {
          entry[field.name] = get(view, at + (offsets[f] ?? 0), field);
        });
        // Seule conversion du kit, et elle est sûre : `N` est déduit de
        // `fields`, que la boucle vient de parcourir en entier — chaque nom
        // a reçu sa valeur. Le compilateur ne suit pas un objet rempli clé
        // par clé ; il faut le lui dire.
        list.push(entry as RecordOf<N>);
      }
      return list;
    },
  };
}
// #endregion

/** Un angle ramené dans ]-π, π] : il tient dans un Int16 au dix-millième. */
export function wrapAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}
