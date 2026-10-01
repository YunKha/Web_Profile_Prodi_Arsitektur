"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { f, formValues, fromZod, idList, type FormState } from "@/lib/admin/form";

const links = z.array(z.object({ label: z.string().trim().min(1, "Label tautan wajib diisi.").max(80), url: f.link() })).max(10);

const optionalUrl = f.url().transform((v) => v ?? "");

const schema = z.object({
  contact: z.object({
    address: f.text(500, "Alamat"),
    email: z.email("Email tidak valid."),
    phone: f.text(60, "Telepon"),
    mapUrl: optionalUrl,
  }),
  social: z.object({ twitter: optionalUrl, instagram: optionalUrl, youtube: optionalUrl }),
  stats: z.object({
    foundedYear: f.int(1900, 2100, "Tahun berdiri"),
    studentCount: f.int(0, 100000, "Jumlah mahasiswa"),
    alumniCount: f.int(0, 1000000, "Jumlah alumni"),
  }),
  footer: z.object({
    tagline: f.text(400, "Tagline"),
    copyright: f.text(200, "Teks hak cipta"),
    academicLinks: f.json(links),
    serviceLinks: f.json(links),
  }),
  home: z.object({
    heroEyebrow: f.text(80, "Label hero"),
    leaderLecturerId: f.optId(),
    leaderTitle: f.text(100, "Jabatan pimpinan"),
    leaderQuote: f.text(800, "Sambutan"),
    managementIds: f.json(idList.max(8, "Maksimal 8 orang.")),
  }),
  alumniStats: f.json(z.array(z.object({ value: z.string().trim().min(1).max(20), label: z.string().trim().min(1).max(60) })).max(4, "Maksimal 4 statistik.")),
});

/** FormData "contact.email" → { contact: { email } }. */
function nest(values: Record<string, FormDataEntryValue>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(values)) {
    const [group, field] = k.split(".");
    if (!field) {
      out[k] = v;
      continue;
    }
    const bucket = (out[group] ??= {}) as Record<string, unknown>;
    bucket[field] = v;
  }
  return out;
}

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = schema.safeParse(nest(formValues(formData)));
  if (!parsed.success) return fromZod(parsed.error);

  await db.$transaction(
    Object.entries(parsed.data).map(([key, value]) =>
      db.siteSetting.upsert({ where: { key }, update: { value: value as object }, create: { key, value: value as object } }),
    ),
  );
  await audit(user, "update", "setting", null, { keys: Object.keys(parsed.data) });
  updateTag("settings");
  refresh();
  return { ok: true, message: "Pengaturan disimpan dan langsung berlaku di website." };
}
