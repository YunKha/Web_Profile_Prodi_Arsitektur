"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { f, formValues, fromPrisma, fromZod, type FormState } from "@/lib/admin/form";

const schema = z.object({
  key: f.slug(),
  title: f.text(200, "Judul"),
  mediaId: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number({ error: "Pilih file PDF." }).int().positive()),
});

export async function saveDocument(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse({ ...formValues(formData), key: formData.get("slug") });
  if (!parsed.success) {
    const state = fromZod(parsed.error);
    if (state?.errors?.key) state.errors.slug = state.errors.key;
    return state;
  }
  const d = parsed.data;
  try {
    const row = id ? await db.document.update({ where: { id }, data: d }) : await db.document.create({ data: d });
    await audit(user, id ? "update" : "create", "document", row.id, { key: d.key });
  } catch (err) {
    return fromPrisma(err, "slug", "Kunci");
  }
  updateTag("documents");
  redirect(`/admin/dokumen?ok=${encodeURIComponent(`Dokumen “${d.title}” disimpan.`)}`);
}

export async function deleteDocument(id: number) {
  const user = await requireUser();
  const row = await db.document.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "document", id, { key: row.key });
  updateTag("documents");
  redirect(`/admin/dokumen?ok=${encodeURIComponent("Dokumen dihapus.")}`);
}
