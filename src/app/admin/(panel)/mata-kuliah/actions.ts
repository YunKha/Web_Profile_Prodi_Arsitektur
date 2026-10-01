"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { changedKeys, f, formValues, fromPrisma, fromZod, type FormState } from "@/lib/admin/form";

const schema = z.object({
  code: f
    .text(20, "Kode")
    .transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z0-9-]+$/.test(v), "Hanya huruf, angka, dan tanda hubung."),
  name: f.text(200, "Nama mata kuliah"),
  semester: f.int(1, 8, "Semester"),
  credits: f.optInt(0, 24),
  description: f.optText(5000),
  sortOrder: f.optInt(0, 9999).transform((v) => v ?? 0),
  status: f.status(),
  rpsMediaId: f.optId(),
  academicYear: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null)
    .refine((v) => v === null || /^\d{4}\/\d{4}$/.test(v), "Format tahun akademik: 2025/2026"),
});

export async function saveCourse(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { rpsMediaId, academicYear, ...d } = parsed.data;

  try {
    const course = id ? await db.course.update({ where: { id }, data: d }) : await db.course.create({ data: d });
    // Satu dokumen RPS aktif per mata kuliah.
    const existing = await db.courseDocument.findFirst({ where: { courseId: course.id, type: "rps" } });
    if (rpsMediaId) {
      if (existing) await db.courseDocument.update({ where: { id: existing.id }, data: { mediaId: rpsMediaId, academicYear } });
      else await db.courseDocument.create({ data: { courseId: course.id, type: "rps", mediaId: rpsMediaId, academicYear } });
    } else if (existing) {
      await db.courseDocument.deleteMany({ where: { courseId: course.id, type: "rps" } });
    }
    await audit(user, id ? "update" : "create", "course", course.id, { code: d.code, changed: id ? changedKeys(null, d) : undefined });
  } catch (err) {
    return fromPrisma(err, "code", "Kode mata kuliah");
  }

  updateTag("courses");
  redirect(`/admin/mata-kuliah?ok=${encodeURIComponent(`${d.code} ${d.name} disimpan.`)}`);
}

export async function deleteCourse(id: number) {
  const user = await requireUser();
  const row = await db.course.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "course", id, { code: row.code });
  updateTag("courses");
  redirect(`/admin/mata-kuliah?ok=${encodeURIComponent(`${row.code} dihapus.`)}`);
}
