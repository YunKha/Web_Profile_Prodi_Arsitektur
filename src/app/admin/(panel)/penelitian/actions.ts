"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { changedKeys, f, formValues, fromPrisma, fromZod, galleryItems, idList, type FormState } from "@/lib/admin/form";
import { sanitizeRichText } from "@/lib/sanitize";

const files = z.array(z.object({ title: z.string().trim().min(1, "Judul dokumen wajib diisi.").max(200), mediaId: z.number().int().positive() })).max(20);

const schema = z.object({
  title: f.text(400, "Judul"),
  slug: f.slug(),
  abstract: f.optText(20000),
  body: z.string().max(1_000_000).default(""),
  year: f.optInt(1970, 2100),
  scheme: f.optText(150),
  field: f.optText(120),
  locationName: f.optText(200),
  progress: z.enum(["berlangsung", "selesai"]),
  authorsText: f.optText(400),
  authors: f.json(idList),
  externalUrl: f.url(),
  coverId: f.optId(),
  images: f.json(galleryItems),
  files: f.json(files),
  isFeatured: f.bool(),
  status: f.status(),
});

export async function saveResearch(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { authors, images, files: docs, ...d } = parsed.data;
  const data = { ...d, body: sanitizeRichText(d.body) || null };

  const children = {
    authors: { create: authors.map((lecturerId, i) => ({ lecturerId, authorOrder: i + 1 })) },
    images: { create: images.map((img, i) => ({ mediaId: img.mediaId, caption: img.caption ?? null, sortOrder: i + 1 })) },
    files: { create: docs.map((doc, i) => ({ mediaId: doc.mediaId, title: doc.title, sortOrder: i + 1 })) },
  };

  try {
    // Hanya satu penelitian unggulan yang tampil di halaman Penelitian.
    if (data.isFeatured) await db.research.updateMany({ where: { isFeatured: true, ...(id ? { id: { not: id } } : {}) }, data: { isFeatured: false } });
    if (id) {
      const before = await db.research.findUnique({ where: { id } });
      if (!before) return { ok: false, message: "Data tidak ditemukan." };
      await db.research.update({
        where: { id },
        data: {
          ...data,
          authors: { deleteMany: {}, ...children.authors },
          images: { deleteMany: {}, ...children.images },
          files: { deleteMany: {}, ...children.files },
        },
      });
      await audit(user, "update", "research", id, { title: data.title, changed: changedKeys(before, data) });
    } else {
      const created = await db.research.create({ data: { ...data, ...children } });
      await audit(user, "create", "research", created.id, { title: data.title });
    }
  } catch (err) {
    return fromPrisma(err, "slug", "Slug");
  }

  updateTag("research");
  updateTag("lecturers");
  redirect(`/admin/penelitian?ok=${encodeURIComponent(`Penelitian “${data.title.slice(0, 80)}” disimpan.`)}`);
}

export async function deleteResearch(id: number) {
  const user = await requireUser();
  const row = await db.research.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "research", id, { title: row.title });
  updateTag("research");
  updateTag("lecturers");
  redirect(`/admin/penelitian?ok=${encodeURIComponent("Penelitian dihapus.")}`);
}
