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
      degree: z.enum(["S1", "S2", "S3", "Profesi"], { error: "Pilih jenjang." }),
      major: z.string().trim().min(1, "Program studi wajib diisi.").max(150),
      institution: z.string().trim().min(1, "Institusi wajib diisi.").max(200),
      gradYear: z.coerce.number().int().min(1950, "Tahun lulus tidak valid.").max(2100),
    }),
  )
  .max(10);

const certifications = z
  .array(
    z.object({
      number: z.string().trim().min(1, "Nomor sertifikat wajib diisi.").max(80),
      institution: z.string().trim().min(1, "Institusi penerbit wajib diisi.").max(200),
      title: z.string().trim().min(1, "Gelar/sebutan profesi wajib diisi.").max(120),
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
  expertiseGroup: z.preprocess((v) => (v === "" || v == null ? null : v), z.enum(["perancangan", "teori_sejarah", "sains_bangunan"]).nullable()),
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
  wosId: f.optText(40),
  serdosNumber: f.optText(60),
  serdosInstitution: f.optText(200),
  sintaUrl: f.url(),
  scholarUrl: f.url(),
  websiteUrl: f.url(),
  isActive: f.bool(),
  sortOrder: f.optInt(0, 9999).transform((v) => v ?? 0),
  status: f.status(),
  education: f.json(education),
  certifications: f.json(certifications),
});

export async function saveLecturer(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { education: edu, certifications: certs, ...d } = parsed.data;
  if (d.serdosNumber && !d.serdosInstitution) {
    return { ok: false, message: "Lengkapi institusi penerbit sertifikasi dosen.", errors: { serdosInstitution: "Isi institusi penerbit sertifikat dosen." } };
  }
  const eduCreate = { create: edu.map((e) => ({ ...e })) };
  const certCreate = { create: certs.map((c, i) => ({ ...c, sortOrder: i + 1 })) };

  try {
    if (id) {
      const before = await db.lecturer.findUnique({ where: { id } });
      if (!before) return { ok: false, message: "Data tidak ditemukan." };
      await db.lecturer.update({
        where: { id },
        data: { ...d, education: { deleteMany: {}, ...eduCreate }, certifications: { deleteMany: {}, ...certCreate } },
      });
      await audit(user, "update", "lecturer", id, { name: d.fullName, changed: changedKeys(before, d) });
    } else {
      const created = await db.lecturer.create({ data: { ...d, education: eduCreate, certifications: certCreate } });
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
