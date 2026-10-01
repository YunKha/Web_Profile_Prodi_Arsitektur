import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";
import { db } from "@/lib/db/client";

/** Folder unggahan, di luar `public/` agar file baru langsung bisa dilayani di production. */
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "storage", "uploads"));

const MB = 1024 * 1024;

type FileKind = { mime: string; ext: string; image: boolean; maxBytes: number };

const KINDS: Record<string, FileKind> = {
  jpg: { mime: "image/jpeg", ext: "jpg", image: true, maxBytes: 8 * MB },
  png: { mime: "image/png", ext: "png", image: true, maxBytes: 8 * MB },
  webp: { mime: "image/webp", ext: "webp", image: true, maxBytes: 8 * MB },
  gif: { mime: "image/gif", ext: "gif", image: true, maxBytes: 8 * MB },
  pdf: { mime: "application/pdf", ext: "pdf", image: false, maxBytes: 25 * MB },
};

export const MIME_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.values(KINDS).map((k) => [k.ext, k.mime]),
);

/** Deteksi tipe dari isi file (magic bytes), bukan dari nama atau header klien. */
function sniff(buf: Buffer): FileKind | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return KINDS.jpg;
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return KINDS.png;
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return KINDS.webp;
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") return KINDS.gif;
  if (buf.subarray(0, 5).toString("ascii") === "%PDF-") return KINDS.pdf;
  return null;
}

export class UploadError extends Error {}

export type UploadAccept = "image" | "document" | "any";

export async function saveUpload(
  file: File,
  opts: { accept?: UploadAccept; altText?: string | null; userId?: number | null } = {},
) {
  const accept = opts.accept ?? "any";
  if (!file || file.size === 0) throw new UploadError("File kosong.");

  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniff(buf);
  if (!kind) throw new UploadError("Format tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau PDF.");
  if (accept === "image" && !kind.image) throw new UploadError("File harus berupa gambar (JPG, PNG, WEBP, GIF).");
  if (accept === "document" && kind.image) throw new UploadError("File harus berupa dokumen PDF.");
  if (buf.length > kind.maxBytes) {
    throw new UploadError(`Ukuran maksimal ${kind.maxBytes / MB} MB untuk ${kind.image ? "gambar" : "PDF"}.`);
  }

  let width: number | null = null;
  let height: number | null = null;
  if (kind.image) {
    try {
      const dim = imageSize(buf);
      width = dim.width ?? null;
      height = dim.height ?? null;
    } catch {
      throw new UploadError("Gambar rusak atau tidak bisa dibaca.");
    }
  }

  const now = new Date();
  const dir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rel = `${dir}/${randomBytes(12).toString("hex")}.${kind.ext}`;
  await mkdir(path.join(UPLOAD_DIR, dir), { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, rel), buf);

  return db.media.create({
    data: {
      path: rel,
      mime: kind.mime,
      sizeBytes: buf.length,
      width,
      height,
      altText: opts.altText?.trim() || null,
      originalName: file.name?.slice(0, 255) || null,
      uploadedById: opts.userId ?? null,
    },
  });
}

/** Path absolut yang aman untuk path relatif media, atau null bila keluar dari folder unggahan. */
export function resolveUploadPath(rel: string): string | null {
  const abs = path.resolve(UPLOAD_DIR, rel);
  return abs.startsWith(UPLOAD_DIR + path.sep) ? abs : null;
}

export async function deleteUploadFile(rel: string) {
  const abs = resolveUploadPath(rel);
  if (!abs) return;
  await unlink(abs).catch(() => undefined);
}
