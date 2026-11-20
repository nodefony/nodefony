import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { readdir, rename } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { afterAll, describe, expect, it } from "vitest";
import type { IUploadedFile } from "@nodefony/http";
import { FileClass } from "nodefony";
import { decodeText } from "../frontend/src/kit/preview";
import {
  kindOf,
  reprDigestSha256,
  UPLOAD_KEEP,
} from "../frontend/src/upload/uploadDemo";
import UploadService from "../nodefony/service/UploadService";

const PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);
const utf8 = (text: string) => new TextEncoder().encode(text);
const sha256 = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

describe("demo upload — un fichier se reconnaît à ses OCTETS", () => {
  it("image, PDF, archive, texte, binaire : jamais d'après le nom ni le type déclaré", () => {
    expect(kindOf(PNG)).toEqual({ kind: "image", type: "image/png" });
    expect(kindOf(utf8("%PDF-1.7\n"))).toEqual({
      kind: "pdf",
      type: "application/pdf",
    });
    expect(kindOf(utf8("PK\u0003\u0004…")).kind).toBe("archive");
    expect(kindOf(new Uint8Array([0x1f, 0x8b, 0x08])).kind).toBe("archive");
    expect(kindOf(utf8("bonjour nodefony\n"))).toEqual({
      kind: "texte",
      type: "text/plain; charset=utf-8",
    });
    expect(kindOf(new Uint8Array([0x61, 0x00, 0x62])).kind).toBe("binaire");
  });

  it("🔴 un texte dont la TÊTE coupe un caractère reste un texte", () => {
    // « é » = C3 A9 : la tête de 512 octets peut s'arrêter entre les deux.
    const head = new Uint8Array([...utf8("réponse "), 0xc3]);
    expect(decodeText(head)).toBeNull();
    expect(decodeText(head, true)).toBe("réponse ");
    expect(kindOf(head).kind).toBe("texte");
    // Un octet invalide AU MILIEU n'est pas une coupure : binaire.
    expect(kindOf(new Uint8Array([0x61, 0xff, 0x62])).kind).toBe("binaire");
  });

  it("Repr-Digest (RFC 9530) se relit en hexadécimal ; absent ou autre algorithme → null", () => {
    const bytes = utf8("bonjour nodefony\n");
    const header = `sha-256=:${Buffer.from(sha256(bytes), "hex").toString("base64")}:`;
    expect(reprDigestSha256(header)).toBe(sha256(bytes));
    expect(reprDigestSha256(`sha-512=:AAAA:, ${header}`)).toBe(sha256(bytes));
    expect(reprDigestSha256("sha-512=:AAAA:")).toBeNull();
    expect(reprDigestSha256(null)).toBeNull();
  });
});

describe("demo upload — le rangement des fichiers reçus", () => {
  const work = mkdtempSync(path.join(os.tmpdir(), "nf-demo-upload-"));
  afterAll(() => rmSync(work, { recursive: true, force: true }));
  let seq = 0;

  /** Un fichier reçu, tel que le sous-système d'envoi le rend. */
  const received = (
    filename: string,
    bytes: Uint8Array,
    hash: string | null = null,
  ): IUploadedFile => {
    seq += 1;
    let at = path.join(work, `incoming-${seq}`);
    writeFileSync(at, bytes);
    const file: IUploadedFile = {
      filename,
      size: bytes.length,
      prettySize: `${bytes.length} o`,
      mimeType: "image/png", // ce que le navigateur DÉCLARE
      hash,
      hashAlgorithm: hash === null ? false : "sha256",
      lastModifiedDate: null,
      // Le fichier de DESTINATION, comme le vrai : un `FileClass`.
      move: () => {
        throw new Error("move() synchrone : jamais appelé par la démo");
      },
      moveAsync: async (target) => {
        await rename(at, target);
        at = target;
        return FileClass.from(target);
      },
      getMimeType: () => file.mimeType,
      getSize: () => file.size,
      getPrettySize: () => file.prettySize,
    };
    return file;
  };
  const store = () =>
    new UploadService(undefined, path.join(work, `s${seq++}`));

  it("🔴 un fichier est rangé sous un IDENTIFIANT : le nom du client n'est qu'une étiquette", async () => {
    const uploads = store();
    const meta = await uploads.keep(
      "u1",
      received("../../etc/passwd", utf8("bonjour\n")),
    );
    const stored = uploads.find("u1", meta.id);
    expect(path.basename(stored?.file ?? "")).toBe(meta.id);
    expect(meta.name).toBe("../../etc/passwd");
    expect(existsSync(path.join(work, "etc"))).toBe(false);
  });

  it("🔴 le type servi vient des octets ; le type déclaré est gardé pour comparaison", async () => {
    const meta = await store().keep(
      "u1",
      received("photo.png", utf8("texte\n")),
    );
    expect(meta).toMatchObject({
      declared: "image/png",
      kind: "texte",
      type: "text/plain; charset=utf-8",
    });
  });

  it("l'empreinte de la réception est reprise ; sans elle, calculée sur le disque", async () => {
    const bytes = utf8("bonjour nodefony\n");
    const uploads = store();
    expect(
      (await uploads.keep("u1", received("a.txt", bytes, "f".repeat(64))))
        .sha256,
    ).toBe("f".repeat(64));
    expect((await uploads.keep("u1", received("b.txt", bytes))).sha256).toBe(
      sha256(bytes),
    );
  });

  it("🔴 un fichier d'un AUTRE compte est introuvable, jamais servi", async () => {
    const uploads = store();
    const meta = await uploads.keep("u1", received("a.txt", utf8("a\n")));
    expect(uploads.find("u1", meta.id)).toBeDefined();
    expect(uploads.find("u2", meta.id)).toBeUndefined();
    expect(uploads.list("u2")).toEqual([]);
  });

  it(`🔴 au-delà de ${UPLOAD_KEEP} fichiers par compte, le plus ancien sort — du disque aussi`, async () => {
    const uploads = store();
    const ids: string[] = [];
    for (let i = 0; i <= UPLOAD_KEEP; i++)
      ids.push(
        (await uploads.keep("u1", received(`${i}.txt`, utf8(`${i}\n`)))).id,
      );
    const oldest = ids[0] ?? "";
    expect(uploads.find("u1", oldest)).toBeUndefined();
    expect(uploads.list("u1").map((file) => file.id)).toEqual(
      ids.slice(1).reverse(),
    );
    const dir = path.dirname(uploads.find("u1", ids[1] ?? "")?.file ?? "");
    expect((await readdir(dir)).toSorted()).toEqual(ids.slice(1).toSorted());
  });

  it("un compte supprimé : ses fichiers quittent le disque", async () => {
    const uploads = store();
    const meta = await uploads.keep("u1", received("a.txt", utf8("a\n")));
    const file = uploads.find("u1", meta.id)?.file ?? "";
    await uploads.forget("u1");
    expect(uploads.list("u1")).toEqual([]);
    expect(existsSync(file)).toBe(false);
  });

  it("un corps brut est compté, haché et reconnu au fil de l'eau", async () => {
    const uploads = store();
    const parts = [PNG, utf8("suite du fichier")];
    const meta = await uploads.keepStream(
      "u1",
      "brut.bin",
      "application/octet-stream",
      Readable.from(parts),
      1024,
    );
    const whole = new Uint8Array([...PNG, ...utf8("suite du fichier")]);
    expect(meta).toMatchObject({
      name: "brut.bin",
      size: whole.length,
      kind: "image",
      sha256: sha256(whole),
    });
  });

  it("🔴 un corps brut au-delà de la borne : 413, et rien ne reste sur le disque", async () => {
    const uploads = store();
    // Un premier fichier fixe le dossier : on y compte ce qui reste.
    const first = await uploads.keep("u1", received("a.txt", utf8("a\n")));
    const dir = path.dirname(uploads.find("u1", first.id)?.file ?? "");
    const refused = uploads.keepStream(
      "u1",
      "trop.bin",
      null,
      Readable.from([new Uint8Array(600), new Uint8Array(600)]),
      1024,
    );
    await expect(refused).rejects.toMatchObject({ code: 413 });
    expect(await readdir(dir)).toEqual([first.id]);
    expect(uploads.list("u1")).toHaveLength(1);
  });
});
