"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { changedKeys, f, formValues, fromPrisma, fromZod, galleryItems, type FormState } from "@/lib/admin/form";
import { sanitizeRichText } from "@/lib/sanitize";

const team = z.array(z.object({ name: z.string().trim().min(1).max(150), role: z.string().trim().max(100).optional().default("") })).max(30);

const schema = z.object({
  kind: z.enum(["dosen", "mahasiswa"], { error: "Pilih jenis pengabdian." }),
  title: f.text(300, "Judul"),
  slug: f.slug().refine((s) => !["dosen", "mahasiswa"].includes(s), "Slug ini dipakai sistem; pilih slug lain."),
  summary: f.optText(500),
  body: z.string().max(1_000_000).default(""),
  locationName: f.optText(200),
  lat: f.optNumber(-90, 90),
  lng: f.optNumber(-180, 180),
  year: f.optInt(1970, 2100),
  partnerName: f.optText(200),
  team: f.json(team),
  coverId: f.optId(),
  images: f.json(galleryItems),
  status: f.status(),
});

export async function saveService(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { images, team: members, ...d } = parsed.data;
  if ((d.lat === null) !== (d.lng === null)) {
    return { ok: false, message: "Isi lintang dan bujur sekaligus.", errors: { lat: "Lintang & bujur harus diisi berpasangan." } };
  }
  const data = { ...d, body: sanitizeRichText(d.body) || null, team: members.length ? members : undefined };
  const gallery = { create: images.map((img, i) => ({ mediaId: img.mediaId, caption: img.caption ?? null, sortOrder: i + 1 })) };

  try {
    if (id) {
      const before = await db.communityService.findUnique({ where: { id } });
      if (!before) return { ok: false, message: "Data tidak ditemukan." };
      const publishedAt = d.status === "published" ? (before.publishedAt ?? new Date()) : before.publishedAt;
      await db.communityService.update({
        where: { id },
        data: { ...data, team: members.length ? members : [], publishedAt, images: { deleteMany: {}, ...gallery } },
      });
      await audit(user, "update", "community_service", id, { title: d.title, changed: changedKeys({ ...before, lat: Number(before.lat), lng: Number(before.lng) }, d) });
    } else {
      const created = await db.communityService.create({
        data: { ...data, publishedAt: d.status === "published" ? new Date() : null, images: gallery },
      });
      await audit(user, "create", "community_service", created.id, { title: d.title });
    }
  } catch (err) {
    return fromPrisma(err, "slug", "Slug");
  }

  updateTag("services");
  redirect(`/admin/pengabdian?ok=${encodeURIComponent(`Kegiatan “${d.title}” disimpan.`)}`);
}

export async function deleteService(id: number) {
  const user = await requireUser();
  const row = await db.communityService.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "community_service", id, { title: row.title });
  updateTag("services");
  redirect(`/admin/pengabdian?ok=${encodeURIComponent("Kegiatan pengabdian dihapus.")}`);
}
