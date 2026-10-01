"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { hashPassword, PASSWORD_MIN, verifyPassword } from "@/lib/auth/password";
import { requireUser, revokeUserSessions } from "@/lib/auth/session";
import { f, formValues, fromZod, type FormState } from "@/lib/admin/form";

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = z.object({ name: f.text(150, "Nama") }).safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  await audit(user, "update", "user", user.id, { name: parsed.data.name });
  refresh();
  return { ok: true, message: "Profil diperbarui." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Masukkan kata sandi saat ini."),
    next: z.string().min(PASSWORD_MIN, `Minimal ${PASSWORD_MIN} karakter.`).max(200),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { path: ["confirm"], message: "Konfirmasi tidak sama." })
  .refine((d) => d.next !== d.current, { path: ["next"], message: "Kata sandi baru harus berbeda." });

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const row = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(parsed.data.current, row.passwordHash))) {
    return { ok: false, message: "Kata sandi saat ini salah.", errors: { current: "Kata sandi saat ini salah." } };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.next) } });
  // Keluarkan sesi di perangkat lain; sesi ini tetap.
  await revokeUserSessions(user.id, true);
  await audit(user, "update", "user", user.id, { passwordChanged: true });
  return { ok: true, message: "Kata sandi diganti. Sesi di perangkat lain telah dikeluarkan." };
}
