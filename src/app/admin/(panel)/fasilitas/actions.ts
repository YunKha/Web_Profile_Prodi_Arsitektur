"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { changedKeys, f, formValues, fromPrisma, fromZod, galleryItems, type FormState } from "@/lib/admin/form";

const features = z
  .array(
    z.object({
      icon: z.string().trim().max(60).optional().default("check"),
      title: z.string().trim().min(1, "Nama fitur wajib diisi.").max(200),
      description: z.string().trim().max(500).optional().default(""),
    }),
  )
  .max(30);

const schema = z.object({
  name: f.text(150, "Nama"),
  slug: f.slug(),
  navLabel: f.optText(60),
  headline: f.optText(200),
  summary: f.optText(500),
  body: f.optText(20000),
  capacity: f.optInt(0, 100000),
  sortOrder: f.optInt(0, 9999).transform((v) => v ?? 0),
  status: f.status(),
  features: f.json(features),
  images: f.json(galleryItems),
});

export async function saveFacility(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { features: feats, images, ...d } = parsed.data;
  const children = {
    features: { create: feats.map((ft, i) => ({ icon: ft.icon || "check", title: ft.title, description: ft.description || null, sortOrder: i + 1 })) },
    images: { create: images.map((img, i) => ({ mediaId: img.mediaId, caption: img.caption ?? null, sortOrder: i + 1 })) },
  };

  try {
    if (id) {
      const before = await db.facility.findUnique({ where: { id } });
      if (!before) return { ok: false, message: "Data tidak ditemukan." };
      await db.facility.update({
        where: { id },
        data: { ...d, features: { deleteMany: {}, ...children.features }, images: { deleteMany: {}, ...children.images } },
      });
      await audit(user, "update", "facility", id, { name: d.name, changed: changedKeys(before, d) });
    } else {
      const created = await db.facility.create({ data: { ...d, ...children } });
      await audit(user, "create", "facility", created.id, { name: d.name });
    }
  } catch (err) {
    return fromPrisma(err, "slug", "Slug");
  }

  updateTag("facilities");
  redirect(`/admin/fasilitas?ok=${encodeURIComponent(`Fasilitas “${d.name}” disimpan.`)}`);
}

export async function deleteFacility(id: number) {
  const user = await requireUser();
  const row = await db.facility.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "facility", id, { name: row.name });
  updateTag("facilities");
  redirect(`/admin/fasilitas?ok=${encodeURIComponent("Fasilitas dihapus.")}`);
}
