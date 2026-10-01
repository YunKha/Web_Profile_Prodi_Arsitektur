import type { Metadata } from "next";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormSection, TextField } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/ui";
import { PASSWORD_MIN } from "@/lib/auth/password";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { formatDateTime } from "@/lib/format";
import { changePassword, updateProfile } from "./actions";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Akun Saya" };

export default async function AccountPage() {
  const user = await requireUser();
  const formKey = await newFormKey();
  const sessions = await db.session.findMany({ where: { userId: user.id, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader title="Akun Saya" description={`${user.email} · peran ${user.role === "admin" ? "Admin" : "Editor"}`} />
      <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
        <AdminForm key={`p-${formKey}`} action={updateProfile}>
          <FormSection title="Profil">
            <TextField name="name" label="Nama tampilan" required defaultValue={user.name} maxLength={150} hint="Tampil sebagai penulis berita." />
            <SubmitButton className="self-start" />
          </FormSection>
        </AdminForm>
        <AdminForm key={`s-${formKey}`} action={changePassword}>
          <FormSection title="Ganti kata sandi">
            <TextField name="current" label="Kata sandi saat ini" type="password" required autoComplete="current-password" />
            <TextField name="next" label="Kata sandi baru" type="password" required autoComplete="new-password" hint={`Minimal ${PASSWORD_MIN} karakter. Gunakan frasa yang panjang.`} />
            <TextField name="confirm" label="Ulangi kata sandi baru" type="password" required autoComplete="new-password" />
            <SubmitButton className="self-start">Ganti kata sandi</SubmitButton>
          </FormSection>
        </AdminForm>
      </div>
      <section className="max-w-5xl rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-ink">Sesi aktif</h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between">
              <span className="truncate text-ink-soft" title={s.userAgent ?? ""}>
                {s.userAgent?.slice(0, 90) ?? "Perangkat tidak dikenal"}
              </span>
              <span className="shrink-0 text-xs text-muted">
                {s.ip} · masuk {formatDateTime(s.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
