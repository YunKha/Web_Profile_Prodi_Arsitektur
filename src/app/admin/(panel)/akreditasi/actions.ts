"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { f, formValues, fromZod, type FormState } from "@/lib/admin/form";

const schema = z
  .object({
    agency: f.text(200, "Lembaga"),
    skNumber: f.text(120, "Nomor SK"),
    rank: f.text(40, "Peringkat"),
    validFrom: f.date("Tanggal berlaku"),
    validTo: f.date("Tanggal berakhir"),
    isCurrent: f.bool(),
    sertifikat: f.optId(),
    lkps: f.optId(),
    led: f.optId(),
  })
  .refine((d) => d.validTo > d.validFrom, { path: ["validTo"], message: "Tanggal berakhir harus setelah tanggal berlaku." });

const docTypes = ["sertifikat", "lkps", "led"] as const;

export async function saveAccreditation(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { sertifikat, lkps, led, ...d } = parsed.data;
  const docs = { sertifikat, lkps, led };

  const row = await db.$transaction(async (tx) => {
    // Hanya satu akreditasi yang berstatus "berlaku".
    if (d.isCurrent) await tx.accreditation.updateMany({ where: { isCurrent: true, ...(id ? { id: { not: id } } : {}) }, data: { isCurrent: false } });
    const saved = id ? await tx.accreditation.update({ where: { id }, data: d }) : await tx.accreditation.create({ data: d });
    for (const type of docTypes) {
      const mediaId = docs[type];
      if (mediaId) {
        await tx.accreditationDocument.upsert({
          where: { accreditationId_type: { accreditationId: saved.id, type } },
          update: { mediaId },
          create: { accreditationId: saved.id, type, mediaId },
        });
      } else {
        await tx.accreditationDocument.deleteMany({ where: { accreditationId: saved.id, type } });
      }
    }
    return saved;
  });

  await audit(user, id ? "update" : "create", "accreditation", row.id, { rank: d.rank, sk: d.skNumber });
  updateTag("accreditation");
  redirect(`/admin/akreditasi?ok=${encodeURIComponent("Data akreditasi disimpan.")}`);
}

export async function deleteAccreditation(id: number) {
  const user = await requireUser();
  const row = await db.accreditation.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "accreditation", id, { sk: row.skNumber });
  updateTag("accreditation");
  redirect(`/admin/akreditasi?ok=${encodeURIComponent("Data akreditasi dihapus.")}`);
}
