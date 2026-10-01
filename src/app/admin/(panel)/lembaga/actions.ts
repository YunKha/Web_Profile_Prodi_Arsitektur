"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { f, formValues, fromZod, type FormState } from "@/lib/admin/form";

const schema = z.object({
  name: f.text(200, "Nama lembaga"),
  abbreviation: f.optText(30),
  description: f.optText(5000),
  url: f.url(),
  logoId: f.optId(),
  sortOrder: f.optInt(0, 9999).transform((v) => v ?? 0),
  status: f.status(),
});

export async function saveOrganization(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;
  const row = id ? await db.organization.update({ where: { id }, data: d }) : await db.organization.create({ data: d });
  await audit(user, id ? "update" : "create", "organization", row.id, { name: d.name });
  updateTag("organizations");
  redirect(`/admin/lembaga?ok=${encodeURIComponent(`Lembaga “${d.name}” disimpan.`)}`);
}

export async function deleteOrganization(id: number) {
  const user = await requireUser();
  const row = await db.organization.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "organization", id, { name: row.name });
  updateTag("organizations");
  redirect(`/admin/lembaga?ok=${encodeURIComponent("Lembaga dihapus.")}`);
}
