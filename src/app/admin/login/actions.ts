"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { verifyPassword } from "@/lib/auth/password";
import { clientIp, createSession } from "@/lib/auth/session";
import type { FormState } from "@/lib/admin/form";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 20;

const schema = z.object({
  email: z.email("Masukkan email yang valid.").transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Masukkan kata sandi.").max(200),
  next: z.string().optional(),
});

function safeNext(next: string | undefined) {
  return next && next.startsWith("/admin") && !next.startsWith("//") && !next.startsWith("/admin/login") ? next : "/admin";
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Isian tidak valid." };
  }
  const { email, password, next } = parsed.data;
  const ip = await clientIp();
  const since = new Date(Date.now() - WINDOW_MS);

  const [byEmail, byIp] = await Promise.all([
    db.loginAttempt.count({ where: { email, success: false, createdAt: { gte: since } } }),
    db.loginAttempt.count({ where: { ip, success: false, createdAt: { gte: since } } }),
  ]);
  if (byEmail >= MAX_PER_EMAIL || byIp >= MAX_PER_IP) {
    return { ok: false, message: "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit." };
  }

  const user = await db.user.findUnique({ where: { email } });
  const valid = await verifyPassword(password, user?.passwordHash);
  if (!user || !valid || !user.isActive) {
    await db.loginAttempt.create({ data: { email, ip, success: false } });
    return { ok: false, message: user && valid && !user.isActive ? "Akun ini dinonaktifkan. Hubungi admin." : "Email atau kata sandi salah." };
  }

  await db.loginAttempt.create({ data: { email, ip, success: true } });
  await db.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } });
  await createSession(user.id);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await audit({ id: user.id, name: user.name, email: user.email, role: user.role }, "login", "user", user.id);

  redirect(safeNext(next));
}

