"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { hashPassword, PASSWORD_MIN } from "@/lib/auth/password";
import { requireAdmin, revokeUserSessions } from "@/lib/auth/session";
import { f, formValues, fromPrisma, fromZod, type FormState } from "@/lib/admin/form";

const schema = z.object({
  name: f.text(150, "Nama"),
  email: z.email("Email tidak valid.").transform((v) => v.toLowerCase()),
  role: z.enum(["admin", "editor"]),
  isActive: f.bool(),
  password: z.string().max(200).optional().default(""),
});

async function otherActiveAdmins(excludeId: number) {
  return db.user.count({ where: { role: "admin", isActive: true, id: { not: excludeId } } });
}

export async function saveUser(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { password, ...d } = parsed.data;

  if (!id && password.length < PASSWORD_MIN) return { ok: false, errors: { password: `Kata sandi minimal ${PASSWORD_MIN} karakter.` }, message: "Kata sandi terlalu pendek." };
  if (id && password && password.length < PASSWORD_MIN) return { ok: false, errors: { password: `Kata sandi minimal ${PASSWORD_MIN} karakter.` }, message: "Kata sandi terlalu pendek." };

  if (id === me.id && (d.role !== "admin" || !d.isActive)) {
    return { ok: false, message: "Anda tidak bisa menurunkan peran atau menonaktifkan akun sendiri." };
  }
  if (id && (d.role !== "admin" || !d.isActive)) {
    const current = await db.user.findUnique({ where: { id } });
    if (current?.role === "admin" && current.isActive && (await otherActiveAdmins(id)) === 0) {
      return { ok: false, message: "Harus ada minimal satu Admin aktif." };
    }
  }

  try {
    if (id) {
      await db.user.update({ where: { id }, data: { ...d, ...(password ? { passwordHash: await hashPassword(password) } : {}) } });
      // Sesi dicabut bila dinonaktifkan atau sandinya direset.
      if (!d.isActive || password) await revokeUserSessions(id);
      await audit(me, "update", "user", id, { email: d.email, role: d.role, active: d.isActive, passwordReset: Boolean(password) });
    } else {
      const created = await db.user.create({ data: { ...d, passwordHash: await hashPassword(password) } });
      await audit(me, "create", "user", created.id, { email: d.email, role: d.role });
    }
  } catch (err) {
    return fromPrisma(err, "email", "Email");
  }
  redirect(`/admin/pengguna?ok=${encodeURIComponent(`Akun ${d.email} disimpan.`)}`);
}

export async function deleteUser(id: number) {
  const me = await requireAdmin();
  if (id === me.id) return { ok: false, message: "Tidak bisa menghapus akun sendiri." };
  const target = await db.user.findUnique({ where: { id } });
  if (!target) return { ok: false, message: "Pengguna tidak ditemukan." };
  if (target.role === "admin" && (await otherActiveAdmins(id)) === 0) return { ok: false, message: "Harus ada minimal satu Admin aktif." };
  await db.user.delete({ where: { id } });
  await audit(me, "delete", "user", id, { email: target.email });
  redirect(`/admin/pengguna?ok=${encodeURIComponent("Pengguna dihapus.")}`);
}
