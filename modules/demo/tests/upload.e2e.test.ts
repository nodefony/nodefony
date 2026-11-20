import { createHash } from "node:crypto";
import { adminLogin, csrfHeaders, userLogin } from "nodefony/testing";
import { afterAll, beforeAll, expect, it } from "vitest";
import {
  UPLOAD_MAX_BYTES,
  UPLOAD_MAX_FILES,
  UPLOAD_PATH,
} from "../frontend/src/upload/uploadDemo";
import {
  demoDescribe,
  ensureMember,
  httpUrl,
  startDemoServer,
} from "./realtimeHarness";

/**
 * « Envoi de fichiers » de bout en bout, sur l'application démarrée : la
 * borne de la ROUTE qui coupe un fichier pendant son flux, l'empreinte
 * calculée à la réception et rendue en `Repr-Digest`, le type reconnu aux
 * octets, le corps brut compté par l'action, et le cloisonnement par compte.
 */

let stop: () => Promise<void> = async () => {};
let admin: Record<string, string> = {};
let user: Record<string, string> = {};
beforeAll(async () => {
  stop = await startDemoServer();
  const base = httpUrl("");
  admin = await csrfHeaders(base, await adminLogin(base));
  // Le second compte : déjà semé sur une base partagée, créé sinon.
  await ensureMember();
  user = await csrfHeaders(base, await userLogin(base));
});
afterAll(async () => {
  await stop();
});

const sha256 = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

/** Un envoi multipart, sous la session donnée. */
async function send(
  headers: Record<string, string>,
  files: readonly {
    bytes: Uint8Array<ArrayBuffer>;
    name: string;
    type?: string;
  }[],
  label?: string,
): Promise<Response> {
  const form = new FormData();
  if (label !== undefined) form.append("label", label);
  for (const { bytes, name, type } of files)
    form.append(
      "file",
      new Blob([bytes], type === undefined ? {} : { type }),
      name,
    );
  return fetch(httpUrl(UPLOAD_PATH), { method: "POST", headers, body: form });
}

const utf8 = (text: string) => new TextEncoder().encode(text);

/** Les fichiers d'une réponse (un envoi `{ files }`, ou la liste), sans conversion. */
function filesOf(body: unknown): Record<string, unknown>[] {
  const files =
    typeof body === "object" && body !== null && "files" in body
      ? body.files
      : body;
  return Array.isArray(files)
    ? files.filter(
        (file: unknown): file is Record<string, unknown> =>
          typeof file === "object" && file !== null,
      )
    : [];
}

/** L'identifiant du n-ième fichier d'une réponse, `""` s'il n'y en a pas. */
function idOf(body: unknown, index = 0): string {
  const id = filesOf(body).at(index)?.["id"];
  return typeof id === "string" ? id : "";
}

demoDescribe("envoi de fichiers — recevoir, ranger, relire", () => {
  it("un fichier envoyé est rangé ; relu, il revient IDENTIQUE, empreinte à l'appui", async () => {
    const bytes = utf8("bonjour nodefony\n");
    const res = await send(
      admin,
      [{ bytes, name: "bonjour.txt", type: "text/plain" }],
      "essai",
    );
    expect(res.status).toBe(201);
    const reply: unknown = await res.json();
    expect(reply).toMatchObject({ label: "essai" });
    const id = idOf(reply);
    expect(filesOf(reply).at(0)).toMatchObject({
      name: "bonjour.txt",
      size: bytes.length,
      kind: "texte",
      sha256: sha256(bytes),
    });

    const read = await fetch(httpUrl(`${UPLOAD_PATH}/${id}`), {
      headers: admin,
    });
    expect(read.status).toBe(200);
    expect(new Uint8Array(await read.arrayBuffer())).toEqual(bytes);
    expect(read.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(read.headers.get("x-content-type-options")).toBe("nosniff");
    expect(read.headers.get("content-disposition")).toBe(
      'attachment; filename="bonjour.txt"',
    );
    expect(read.headers.get("repr-digest")).toBe(
      `sha-256=:${Buffer.from(sha256(bytes), "hex").toString("base64")}:`,
    );

    const list = await fetch(httpUrl(UPLOAD_PATH), { headers: admin });
    expect(idOf(await list.json())).toBe(id);
  });

  it("🔴 la borne de la ROUTE coupe un fichier de 8 Mio + 1 octet (413) ; 8 Mio tout juste passent", async () => {
    const witness = await send(admin, [
      { bytes: new Uint8Array(UPLOAD_MAX_BYTES), name: "juste.bin" },
    ]);
    expect(witness.status).toBe(201);
    await witness.body?.cancel();
    const refused = await send(admin, [
      { bytes: new Uint8Array(UPLOAD_MAX_BYTES + 1), name: "trop.bin" },
    ]);
    expect(refused.status).toBe(413);
    await refused.body?.cancel();
  });

  it(`🔴 plus de ${UPLOAD_MAX_FILES} fichiers d'un coup : 413 ; aucun fichier : 400`, async () => {
    const many = await send(
      admin,
      Array.from({ length: UPLOAD_MAX_FILES + 1 }, (_, i) => ({
        bytes: utf8(`${i}\n`),
        name: `${i}.txt`,
      })),
    );
    expect(many.status).toBe(413);
    await many.body?.cancel();
    const none = await send(admin, [], "rien");
    expect(none.status).toBe(400);
    await none.body?.cancel();
  });

  it("🔴 le type servi vient des octets ; le nom n'est jamais un chemin", async () => {
    const png = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d,
    ]);
    const res = await send(admin, [
      { bytes: png, name: "note.txt", type: "text/plain" },
      { bytes: utf8("texte\n"), name: "../../etc/passwd", type: "image/png" },
    ]);
    expect(res.status).toBe(201);
    const [image, hostile] = filesOf(await res.json());
    expect(image).toMatchObject({
      declared: "text/plain",
      kind: "image",
      type: "image/png",
    });
    expect(hostile).toMatchObject({ declared: "image/png", kind: "texte" });
    expect(hostile?.["name"]).toBeTypeOf("string");
    expect(hostile?.["name"]).not.toContain("/");
  });

  it("un corps brut est rangé (201) ; au-delà de la borne, l'action répond 413", async () => {
    const bytes = new Uint8Array(3 * 1024 * 1024).map((_, i) => i & 0xff);
    const raw = await fetch(httpUrl(`${UPLOAD_PATH}/raw?name=brut.bin`), {
      method: "POST",
      headers: { ...admin, "content-type": "application/octet-stream" },
      body: bytes,
    });
    expect(raw.status).toBe(201);
    expect(await raw.json()).toMatchObject({
      name: "brut.bin",
      size: bytes.length,
      declared: "application/octet-stream",
      sha256: sha256(bytes),
    });
    const tooBig = await fetch(httpUrl(`${UPLOAD_PATH}/raw?name=trop.bin`), {
      method: "POST",
      headers: { ...admin, "content-type": "application/octet-stream" },
      body: new Uint8Array(UPLOAD_MAX_BYTES + 1),
    });
    expect(tooBig.status).toBe(413);
    await tooBig.body?.cancel();
  });

  it("🔴 sans session : 403, le refus de @IsGranted ; le fichier d'un autre compte : 404, jamais servi", async () => {
    const anonymous = await fetch(httpUrl(UPLOAD_PATH));
    expect(anonymous.status).toBe(403);
    await anonymous.body?.cancel();

    const res = await send(admin, [
      { bytes: utf8("à moi\n"), name: "privé.txt" },
    ]);
    const mine = idOf(await res.json());
    const other = await fetch(httpUrl(`${UPLOAD_PATH}/${mine}`), {
      headers: user,
    });
    expect(other.status).toBe(404);
    await other.body?.cancel();
    // Témoin : le propriétaire, lui, le relit.
    const owner = await fetch(httpUrl(`${UPLOAD_PATH}/${mine}`), {
      headers: admin,
    });
    expect(owner.status).toBe(200);
    await owner.body?.cancel();
  });
});
