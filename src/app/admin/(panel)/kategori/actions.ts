"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { f, formValues, fromPrisma, fromZod, type FormState } from "@/lib/admin/form";
import { slugify } from "@/lib/slug";

const schema = z.object({ name: f.text(100, "Nama"), slug: z.string().trim().max(120).optional() });

type Kind = "category" | "tag";

export async function saveTaxonomy(kind: Kind, id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const name = parsed.data.name;
  const slug = slugify(parsed.data.slug || name);
  if (!slug) return { ok: false, errors: { slug: "Slug tidak valid." }, message: "Slug tidak valid." };

  try {
    if (kind === "category") {
      const row = id ? await db.newsCategory.update({ where: { id }, data: { name, slug } }) : await db.newsCategory.create({ data: { name, slug } });
      await audit(user, id ? "update" : "create", "news_category", row.id, { name });
    } else {
      const row = id ? await db.tag.update({ where: { id }, data: { name, slug } }) : await db.tag.create({ data: { name, slug } });
      await audit(user, id ? "update" : "create", "tag", row.id, { name });
    }
  } catch (err) {
    return fromPrisma(err, "slug", "Slug");
  }
  updateTag("taxonomy");
  updateTag("news");
  refresh();
  return { ok: true, message: `“${name}” disimpan.` };
}

export async function deleteTaxonomy(kind: Kind, id: number) {
  const user = await requireUser();
  if (kind === "category") {
    // Berita di kategori ini menjadi "tanpa kategori" (onDelete: SetNull).
    const row = await db.newsCategory.delete({ where: { id } }).catch(() => null);
    if (!row) return { ok: false, message: "Data tidak ditemukan." };
    await audit(user, "delete", "news_category", id, { name: row.name });
  } else {
    const row = await db.tag.delete({ where: { id } }).catch(() => null);
    if (!row) return { ok: false, message: "Data tidak ditemukan." };
    await audit(user, "delete", "tag", id, { name: row.name });
  }
  updateTag("taxonomy");
  updateTag("news");
  refresh();
  return { ok: true };
}
