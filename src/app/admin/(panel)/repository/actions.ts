"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { changedKeys, f, formValues, fromPrisma, fromZod, type FormState } from "@/lib/admin/form";
import { plainText, sanitizeRichText } from "@/lib/sanitize";

const driveLinkSchema = z.array(
  z.object({
    title: f.text(200, "Keterangan/judul berkas"),
    url: f.url(),
  }),
).max(50);

const schema = z.object({
  title: f.text(400, "Judul"),
  slug: f.slug(),
  authors: f.optText(300),
  year: f.optInt(1900, 2100),
  category: f.optText(100),
  abstract: f.optText(10_000),
  body: z.string().max(1_000_000).default(""),
  driveLinks: f.json(driveLinkSchema),
  coverId: f.optId(),
  status: f.status(),
});

export async function saveRepositoryArticle(
  id: number | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const d = parsed.data;
  const rawBody = d.body;
  const body = rawBody ? sanitizeRichText(rawBody) : "";

  // Setidaknya judul harus terisi, dan abstrak atau isi atau link drive ada isian
  if (!d.abstract && !plainText(body) && d.driveLinks.length === 0) {
    return {
      ok: false,
      message: "Isi abstrak, ulasan lengkap, atau minimal satu tautan berkas Google Drive.",
      errors: { abstract: "Abstrak atau tautan berkas Google Drive wajib diisi." },
    };
  }

  const data = {
    ...d,
    body: body || null,
    driveLinks: d.driveLinks.length ? d.driveLinks : undefined,
  };

  let savedId = id;
  try {
    if (id) {
      const before = await db.repositoryArticle.findUnique({ where: { id } });
      if (!before) return { ok: false, message: "Artikel repositori tidak ditemukan." };
      await db.repositoryArticle.update({
        where: { id },
        data: {
          ...data,
          driveLinks: data.driveLinks ?? [],
        },
      });
      await audit(user, "update", "repository_article", id, {
        title: data.title,
        changed: changedKeys(before, data),
      });
    } else {
      const created = await db.repositoryArticle.create({
        data: {
          ...data,
          driveLinks: data.driveLinks ?? [],
        },
      });
      savedId = created.id;
      await audit(user, "create", "repository_article", created.id, { title: data.title });
    }
  } catch (err) {
    return fromPrisma(err, "slug", "Slug");
  }

  updateTag("repository");
  redirect(
    `/admin/repository?ok=${encodeURIComponent(`Artikel repositori “${data.title}” berhasil disimpan.`)}${
      savedId ? `&id=${savedId}` : ""
    }`,
  );
}

export async function deleteRepositoryArticle(id: number) {
  const user = await requireUser();
  const row = await db.repositoryArticle.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Artikel repositori tidak ditemukan." };
  await audit(user, "delete", "repository_article", id, { title: row.title });
  updateTag("repository");
  redirect(`/admin/repository?ok=${encodeURIComponent("Artikel repositori dihapus.")}`);
}
