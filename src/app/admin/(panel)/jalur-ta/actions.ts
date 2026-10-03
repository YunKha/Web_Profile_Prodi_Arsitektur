"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { changedKeys, f, formValues, fromPrisma, fromZod, type FormState } from "@/lib/admin/form";

const steps = z
  .array(
    z.object({
      title: z.string().trim().min(1, "Judul tahap wajib diisi.").max(150, "Judul tahap maksimal 150 karakter."),
      body: z.string().trim().min(1, "Uraian tahap wajib diisi.").max(3000, "Uraian tahap maksimal 3.000 karakter."),
    }),
  )
  .min(1, "Tambahkan minimal satu tahapan.")
  .max(12, "Maksimal 12 tahapan.");

const schema = z.object({
  name: f.text(120, "Nama jalur"),
  slug: f.slug(),
  description: f.optText(3000),
  sortOrder: f.optInt(0, 9999).transform((v) => v ?? 0),
  status: f.status(),
  steps: f.json(steps),
});

export async function saveTrack(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { steps: rows, ...d } = parsed.data;
  const create = { create: rows.map((s, i) => ({ ...s, sortOrder: i + 1 })) };

  try {
    if (id) {
      const before = await db.thesisTrack.findUnique({ where: { id } });
      if (!before) return { ok: false, message: "Jalur tidak ditemukan." };
      await db.thesisTrack.update({ where: { id }, data: { ...d, steps: { deleteMany: {}, ...create } } });
      await audit(user, "update", "thesis_track", id, { name: d.name, changed: [...changedKeys(before, d), "steps"] });
    } else {
      const created = await db.thesisTrack.create({ data: { ...d, steps: create } });
      await audit(user, "create", "thesis_track", created.id, { name: d.name });
    }
  } catch (err) {
    return fromPrisma(err, "slug", "Slug");
  }

  updateTag("thesis");
  redirect(`/admin/jalur-ta?ok=${encodeURIComponent(`Jalur “${d.name}” disimpan.`)}`);
}

export async function deleteTrack(id: number) {
  const user = await requireUser();
  const row = await db.thesisTrack.delete({ where: { id } }).catch(() => null);
  if (!row) return { ok: false, message: "Jalur tidak ditemukan." };
  await audit(user, "delete", "thesis_track", id, { name: row.name });
  updateTag("thesis");
  redirect(`/admin/jalur-ta?ok=${encodeURIComponent("Jalur dihapus.")}`);
}
