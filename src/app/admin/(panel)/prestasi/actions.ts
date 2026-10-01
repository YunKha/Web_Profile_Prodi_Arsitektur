"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { changedKeys, f, formValues, fromPrisma, fromZod, galleryItems, idList, type FormState } from "@/lib/admin/form";

const schema = z.object({
  title: f.text(255, "Judul"),
  slug: f.slug(),
  studentName: f.text(200, "Nama mahasiswa"),
  nim: f.optText(30),
  cohortYear: f.optInt(1990, 2100),
  achievementYear: f.int(1990, 2100, "Tahun prestasi"),
  level: z.enum(["lokal", "nasional", "internasional"], { error: "Pilih tingkat." }),
  rankLabel: f.optText(60),
  category: f.optText(100),
  organizer: f.optText(200),
  eventLocation: f.optText(200),
  eventDate: f.optDate(),
  workTitle: f.optText(200),
  summary: f.optText(500),
  competitionInfo: f.optText(20000),
  concept: f.optText(20000),
  coverId: f.optId(),
  studentPhotoId: f.optId(),
  images: f.json(galleryItems),
  advisors: f.json(idList),
  isFeatured: f.bool(),
  status: f.status(),
});

export async function saveAchievement(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { images, advisors, ...d } = parsed.data;

  const children = {
    images: { create: images.map((img, i) => ({ mediaId: img.mediaId, caption: img.caption ?? null, sortOrder: i + 1 })) },
    advisors: { create: advisors.map((lecturerId) => ({ lecturerId })) },
  };

  try {
    if (id) {
      const before = await db.achievement.findUnique({ where: { id } });
      if (!before) return { ok: false, message: "Data tidak ditemukan." };
      const publishedAt = d.status === "published" ? (before.publishedAt ?? new Date()) : before.publishedAt;
      await db.achievement.update({
        where: { id },
        data: {
          ...d,
          publishedAt,
          images: { deleteMany: {}, ...children.images },
          advisors: { deleteMany: {}, ...children.advisors },
        },
      });
      await audit(user, "update", "achievement", id, { title: d.title, changed: changedKeys(before, d) });
    } else {
      const created = await db.achievement.create({
        data: { ...d, publishedAt: d.status === "published" ? new Date() : null, ...children },
      });
      await audit(user, "create", "achievement", created.id, { title: d.title });
    }
  } catch (err) {
    return fromPrisma(err, "slug", "Slug");
  }

  updateTag("achievements");
  redirect(`/admin/prestasi?ok=${encodeURIComponent(`Prestasi “${d.title}” disimpan.`)}`);
}

export async function deleteAchievement(id: number) {
  const user = await requireUser();
  const row = await db.achievement.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "achievement", id, { title: row.title });
  updateTag("achievements");
  redirect(`/admin/prestasi?ok=${encodeURIComponent("Prestasi dihapus.")}`);
}
