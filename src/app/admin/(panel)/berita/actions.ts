"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { changedKeys, f, formValues, fromPrisma, fromZod, idList, type FormState } from "@/lib/admin/form";
import { plainText, sanitizeRichText } from "@/lib/sanitize";

const schema = z.object({
  title: f.text(300, "Judul"),
  slug: f.slug(),
  excerpt: f.optText(600),
  body: z.string().max(1_000_000).default(""),
  coverId: f.optId(),
  coverCaption: f.optText(255),
  categoryId: f.optId(),
  tags: f.json(idList),
  status: f.status(),
  publishedAt: f.optDateTime(),
  eventDate: f.optDateTime(),
  eventLocation: f.optText(200),
  eventOrganizer: f.optText(200),
});

export async function saveNews(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { tags, ...d } = parsed.data;

  const body = sanitizeRichText(d.body);
  if (!plainText(body) && !body.includes("<img")) {
    return { ok: false, message: "Isi berita masih kosong.", errors: { body: "Isi berita wajib diisi." } };
  }
  // Terbit tanpa tanggal = terbit sekarang. Tanggal di masa depan = terjadwal.
  const publishedAt = d.status === "published" ? (d.publishedAt ?? new Date()) : d.publishedAt;
  const data = { ...d, body, publishedAt };

  let savedId = id;
  try {
    if (id) {
      const before = await db.news.findUnique({ where: { id } });
      if (!before) return { ok: false, message: "Berita tidak ditemukan." };
      await db.news.update({
        where: { id },
        data: { ...data, tags: { deleteMany: {}, create: tags.map((tagId) => ({ tagId })) } },
      });
      await audit(user, "update", "news", id, { title: data.title, changed: changedKeys(before, data) });
    } else {
      const created = await db.news.create({
        data: { ...data, authorId: user.id, tags: { create: tags.map((tagId) => ({ tagId })) } },
      });
      savedId = created.id;
      await audit(user, "create", "news", created.id, { title: data.title });
    }
  } catch (err) {
    return fromPrisma(err, "slug", "Slug");
  }

  updateTag("news");
  redirect(`/admin/berita?ok=${encodeURIComponent(`Berita “${data.title}” disimpan.`)}${savedId ? `&id=${savedId}` : ""}`);
}

export async function deleteNews(id: number) {
  const user = await requireUser();
  const row = await db.news.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Berita tidak ditemukan." };
  await audit(user, "delete", "news", id, { title: row.title });
  updateTag("news");
  redirect(`/admin/berita?ok=${encodeURIComponent("Berita dihapus.")}`);
}
