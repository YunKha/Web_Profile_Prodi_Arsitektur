import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { CheckboxField, FormSection, SelectField, TextField } from "@/components/admin/fields";
import { PASSWORD_MIN } from "@/lib/auth/password";
import { saveUser } from "./actions";

export function UserForm({ item }: { item?: { id: number; name: string; email: string; role: string; isActive: boolean } }) {
  return (
    <AdminForm action={saveUser.bind(null, item?.id ?? null)} className="max-w-2xl">
      <FormSection title="Akun">
        <TextField name="name" label="Nama" required defaultValue={item?.name} maxLength={150} />
        <TextField name="email" label="Email" type="email" required defaultValue={item?.email} autoComplete="off" />
        <SelectField
          name="role"
          label="Peran"
          defaultValue={item?.role ?? "editor"}
          options={[
            { value: "editor", label: "Editor — mengelola konten" },
            { value: "admin", label: "Admin — konten, pengaturan, pengguna, log" },
          ]}
        />
        <CheckboxField name="isActive" label="Akun aktif" hint="Akun nonaktif tidak bisa masuk; sesi yang sedang berjalan dicabut." defaultChecked={item?.isActive ?? true} />
        <TextField
          name="password"
          label={item ? "Reset kata sandi" : "Kata sandi"}
          type="password"
          required={!item}
          autoComplete="new-password"
          hint={item ? `Kosongkan bila tidak diubah. Minimal ${PASSWORD_MIN} karakter.` : `Minimal ${PASSWORD_MIN} karakter. Sampaikan ke pengguna secara aman.`}
        />
        <SubmitButton className="self-start" />
      </FormSection>
    </AdminForm>
  );
}
