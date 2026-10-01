"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { f, formValues, fromPrisma, fromZod, type FormState } from "@/lib/admin/form";
import { sanitizeRichText } from "@/lib/sanitize";

const schema = z.object({
  kind: z.enum(["akademik", "nonakademik"]),
  title: f.text(200, "Judul"),
  slug: f.slug(),
  summary: f.optText(500),
  body: z.string().max(1_000_000).default(""),
  imageId: f.optId(),
  sortOrder: f.optInt(0, 9999).transform((v) => v ?? 0),
  status: f.status(),
});

export async function saveProgram(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = { ...parsed.data, body: sanitizeRichText(parsed.data.body) || null };
  try {
    const row = id ? await db.program.update({ where: { id }, data: d }) : await db.program.create({ data: d });
    await audit(user, id ? "update" : "create", "program", row.id, { title: d.title });
  } catch (err) {
    return fromPrisma(err, "slug", "Slug");
  }
  updateTag("programs");
  redirect(`/admin/program?ok=${encodeURIComponent(`Program “${d.title}” disimpan.`)}`);
}

export async function deleteProgram(id: number) {
  const user = await requireUser();
  const row = await db.program.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Data tidak ditemukan." };
  await audit(user, "delete", "program", id, { title: row.title });
  updateTag("programs");
  redirect(`/admin/program?ok=${encodeURIComponent("Program dihapus.")}`);
}
