import { audit } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth/session";
import { saveUpload, UploadError, type UploadAccept } from "@/lib/storage";

/** Unggah satu file ke pustaka media. Dipakai pemilih media di formulir admin. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sesi berakhir. Silakan masuk lagi." }, { status: 401 });

  // Lapisan tambahan anti-CSRF selain cookie SameSite=Lax.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return Response.json({ error: "Asal permintaan tidak valid." }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "File tidak ditemukan." }, { status: 400 });

  const acceptRaw = String(form?.get("accept") ?? "any");
  const accept: UploadAccept = acceptRaw === "image" || acceptRaw === "document" ? acceptRaw : "any";
  // Teks alternatif wajib untuk gambar (aksesibilitas); bila kosong pakai nama file.
  const altText =
    String(form?.get("altText") ?? "").trim().slice(0, 255) || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 255);

  try {
    const media = await saveUpload(file, { accept, altText, userId: user.id });
    await audit(user, "upload", "media", media.id, { path: media.path, name: media.originalName });
    const { id, path, mime, width, height, altText: alt, originalName, sizeBytes } = media;
    return Response.json({ id, path, mime, width, height, altText: alt, originalName, sizeBytes });
  } catch (err) {
    if (err instanceof UploadError) return Response.json({ error: err.message }, { status: 400 });
    console.error(err);
    return Response.json({ error: "Gagal mengunggah file." }, { status: 500 });
  }
}
