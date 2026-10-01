import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { MIME_BY_EXT, resolveUploadPath } from "@/lib/storage";

/** Melayani file unggahan dari folder storage (di luar public/). */
export async function GET(request: Request, { params }: RouteContext<"/media/[...path]">) {
  const { path: segments } = await params;
  const rel = segments.join("/");
  const abs = resolveUploadPath(rel);
  const ext = path.extname(rel).slice(1).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!abs || !mime) return new Response("Not found", { status: 404 });

  const info = await stat(abs).catch(() => null);
  if (!info?.isFile()) return new Response("Not found", { status: 404 });

  const download = new URL(request.url).searchParams.get("download");
  const headers = new Headers({
    "Content-Type": mime,
    "Content-Length": String(info.size),
    // Nama file acak dan tidak pernah ditimpa, jadi aman di-cache selamanya.
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  if (download) {
    const name = download.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || path.basename(rel);
    headers.set("Content-Disposition", `attachment; filename="${name}"`);
  } else if (mime === "application/pdf") {
    headers.set("Content-Disposition", "inline");
  }

  const stream = Readable.toWeb(createReadStream(abs)) as ReadableStream;
  return new Response(stream, { headers });
}
