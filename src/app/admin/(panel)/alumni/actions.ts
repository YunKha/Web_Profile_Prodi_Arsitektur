"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { f, formValues, fromZod, type FormState } from "@/lib/admin/form";

const schema = z.object({
  name: f.text(200, "Nama"),
  gradYear: f.optInt(1970, 2100),
  jobTitle: f.optText(150),
  company: f.optText(200),
  testimonial: f.optText(3000),
  photoId: f.optId(),
  status: f.status(),
});

export async function saveAlumnus(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;
  const row = id ? await db.alumnus.update({ where: { id }, data: d }) : await db.alumnus.create({ data: d });
  await audit(user, id ? "update" : "create", "alumnus", row.id, { name: d.name });
  updateTag("alumni");
  redirect(`/admin/alumni?ok=${encodeURIComponent(`Data ${d.name} disimpan.`)}`);
}

export async function deleteAlumnus(id: number) {
  const user = await requireUser();
  const row = await db.alumnus.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "alumnus", id, { name: row.name });
  updateTag("alumni");
  redirect(`/admin/alumni?ok=${encodeURIComponent("Data alumni dihapus.")}`);
}
