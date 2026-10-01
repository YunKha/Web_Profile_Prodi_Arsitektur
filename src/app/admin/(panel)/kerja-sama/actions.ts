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
    partnerName: f.text(250, "Nama mitra"),
    partnerType: f.optText(80),
    scope: f.optText(5000),
    startDate: f.optDate(),
    endDate: f.optDate(),
    url: f.url(),
    logoId: f.optId(),
    showOnHome: f.bool(),
    sortOrder: f.optInt(0, 9999).transform((v) => v ?? 0),
    status: f.status(),
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, { path: ["endDate"], message: "Tanggal berakhir harus setelah tanggal mulai." });

export async function savePartnership(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;
  if (d.showOnHome && !d.logoId) return { ok: false, message: "Mitra di Beranda wajib memiliki logo.", errors: { logoId: "Pilih logo untuk ditampilkan di Beranda." } };
  const row = id ? await db.partnership.update({ where: { id }, data: d }) : await db.partnership.create({ data: d });
  await audit(user, id ? "update" : "create", "partnership", row.id, { name: d.partnerName });
  updateTag("partners");
  redirect(`/admin/kerja-sama?ok=${encodeURIComponent(`Mitra “${d.partnerName}” disimpan.`)}`);
}

export async function deletePartnership(id: number) {
  const user = await requireUser();
  const row = await db.partnership.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "partnership", id, { name: row.partnerName });
  updateTag("partners");
  redirect(`/admin/kerja-sama?ok=${encodeURIComponent("Data kerja sama dihapus.")}`);
}
