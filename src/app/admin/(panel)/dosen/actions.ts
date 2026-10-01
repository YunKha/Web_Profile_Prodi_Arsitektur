"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { changedKeys, f, formValues, fromPrisma, fromZod, type FormState } from "@/lib/admin/form";

const education = z
  .array(
    z.object({
      degree: z.enum(["S1", "S2", "S3"]),
      major: z.string().trim().min(1, "Program studi wajib diisi.").max(150),
      institution: z.string().trim().min(1, "Institusi wajib diisi.").max(200),
      gradYear: z.coerce.number().int().min(1950, "Tahun lulus tidak valid.").max(2100),
    }),
  )
  .max(10);

const schema = z.object({
  fullName: f.text(200, "Nama lengkap"),
  slug: f.slug(),
  frontTitle: f.optText(60),
  backTitle: f.optText(80),
  staffType: z.enum(["dosen", "tendik"]),
  structuralRole: f.optText(120),
  academicRank: f.optText(80),
  civilRank: f.optText(80),
  studyProgram: f.optText(120),
  startYear: f.optInt(1950, 2100),
  expertise: f.optText(255),
  bio: f.optText(5000),
  photoId: f.optId(),
  email: f.email(),
  nidn: f.optText(30),
  nuptk: f.optText(30),
  sintaId: f.optText(40),
  scopusId: f.optText(40),
  orcidId: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null)
    .refine((v) => v === null || /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(v), "Format ORCID: 0000-0000-0000-0000"),
  sintaUrl: f.url(),
  scholarUrl: f.url(),
  websiteUrl: f.url(),
  isActive: f.bool(),
  sortOrder: f.optInt(0, 9999).transform((v) => v ?? 0),
  status: f.status(),
  education: f.json(education),
});

export async function saveLecturer(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { education: edu, ...d } = parsed.data;
  const eduCreate = { create: edu.map((e) => ({ ...e })) };

  try {
    if (id) {
      const before = await db.lecturer.findUnique({ where: { id } });
      if (!before) return { ok: false, message: "Data tidak ditemukan." };
      await db.lecturer.update({ where: { id }, data: { ...d, education: { deleteMany: {}, ...eduCreate } } });
      await audit(user, "update", "lecturer", id, { name: d.fullName, changed: changedKeys(before, d) });
    } else {
      const created = await db.lecturer.create({ data: { ...d, education: eduCreate } });
      await audit(user, "create", "lecturer", created.id, { name: d.fullName });
    }
  } catch (err) {
    return fromPrisma(err, "slug", "Slug");
  }

  updateTag("lecturers");
  updateTag("settings");
  redirect(`/admin/dosen?ok=${encodeURIComponent(`Data ${d.fullName} disimpan.`)}`);
}

export async function deleteLecturer(id: number) {
  const user = await requireUser();
  const row = await db.lecturer.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "lecturer", id, { name: row.fullName });
  updateTag("lecturers");
  redirect(`/admin/dosen?ok=${encodeURIComponent(`${row.fullName} dihapus.`)}`);
}
