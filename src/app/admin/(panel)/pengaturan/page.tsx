import type { Metadata } from "next";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormSection, SelectField, TextAreaField, TextField } from "@/components/admin/fields";
import { MultiSelectField } from "@/components/admin/multi-select";
import { RepeaterField } from "@/components/admin/repeater";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { lecturerOptions } from "@/lib/admin/options";
import { mergeSettings } from "@/lib/settings";
import { saveSettings } from "./actions";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Pengaturan" };

const linkColumns = [
  { key: "label", label: "Label", maxLength: 80 },
  { key: "url", label: "Tautan (/halaman atau https://…)", maxLength: 500 },
];

export default async function SettingsPage() {
  await requireAdmin();
  const formKey = await newFormKey();
  const [rows, lecturers] = await Promise.all([db.siteSetting.findMany(), lecturerOptions()]);
  const s = mergeSettings(rows);

  return (
    <>
      <PageHeader title="Pengaturan Situs" description="Kontak, media sosial, statistik, footer, dan isi Beranda. Perubahan langsung berlaku." />
      <AdminForm key={formKey} action={saveSettings} className="max-w-4xl">
        <FormSection title="Kontak" description="Tampil di footer setiap halaman.">
          <TextAreaField name="contact.address" label="Alamat" required defaultValue={s.contact.address} rows={3} />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="contact.email" label="Email" type="email" required defaultValue={s.contact.email} />
            <TextField name="contact.phone" label="Telepon" required defaultValue={s.contact.phone} />
          </div>
          <TextField name="contact.mapUrl" label="Tautan peta (Google Maps)" type="url" defaultValue={s.contact.mapUrl} />
        </FormSection>

        <FormSection title="Media sosial" description="Kosongkan bila tidak dipakai.">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="social.instagram" label="Instagram" type="url" defaultValue={s.social.instagram} placeholder="https://instagram.com/…" />
            <TextField name="social.youtube" label="YouTube" type="url" defaultValue={s.social.youtube} placeholder="https://youtube.com/@…" />
            <TextField name="social.twitter" label="Twitter / X" type="url" defaultValue={s.social.twitter} placeholder="https://x.com/…" />
          </div>
        </FormSection>

        <FormSection title="Statistik" description="Jumlah dosen dihitung otomatis dari data Dosen & Staf; peringkat akreditasi diambil dari akreditasi yang berlaku.">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="stats.foundedYear" label="Tahun berdiri" type="number" required defaultValue={s.stats.foundedYear} />
            <TextField name="stats.studentCount" label="Mahasiswa aktif" type="number" required defaultValue={s.stats.studentCount} />
            <TextField name="stats.alumniCount" label="Jumlah alumni" type="number" required defaultValue={s.stats.alumniCount} />
          </div>
        </FormSection>

        <FormSection title="Beranda — Profil Pimpinan">
          <TextField name="home.heroEyebrow" label="Label kecil di atas judul hero" required defaultValue={s.home.heroEyebrow} maxLength={80} />
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              name="home.leaderLecturerId"
              label="Pimpinan"
              placeholder="— Tidak ditampilkan —"
              options={lecturers.map((l) => ({ value: l.id, label: l.label }))}
              defaultValue={s.home.leaderLecturerId}
            />
            <TextField name="home.leaderTitle" label="Jabatan yang ditampilkan" required defaultValue={s.home.leaderTitle} maxLength={100} />
          </div>
          <TextAreaField name="home.leaderQuote" label="Kata sambutan" required defaultValue={s.home.leaderQuote} rows={4} maxLength={800} />
          <MultiSelectField name="home.managementIds" label="Jajaran pimpinan (kartu kecil, maks. 8)" ordered max={8} options={lecturers} defaultValue={s.home.managementIds} />
        </FormSection>

        <FormSection title="Statistik alumni (tracer study)" description="Empat angka di halaman Alumni.">
          <RepeaterField
            name="alumniStats"
            label="Statistik"
            max={4}
            defaultValue={s.alumniStats}
            columns={[
              { key: "value", label: "Angka", width: "140px", maxLength: 20, placeholder: "92%" },
              { key: "label", label: "Keterangan", maxLength: 60 },
            ]}
          />
        </FormSection>

        <FormSection title="Footer">
          <TextAreaField name="footer.tagline" label="Tagline" required defaultValue={s.footer.tagline} rows={3} maxLength={400} />
          <TextField name="footer.copyright" label="Teks hak cipta" required defaultValue={s.footer.copyright} maxLength={200} hint="Gunakan {year} untuk tahun berjalan." />
          <RepeaterField name="footer.academicLinks" label="Kolom “Akademik”" max={10} defaultValue={s.footer.academicLinks} columns={linkColumns} addLabel="Tambah tautan" />
          <RepeaterField name="footer.serviceLinks" label="Kolom “Fasilitas & Layanan”" max={10} defaultValue={s.footer.serviceLinks} columns={linkColumns} addLabel="Tambah tautan" />
        </FormSection>

        <div className="sticky bottom-4 flex justify-end">
          <SubmitButton className="shadow-lg">Simpan pengaturan</SubmitButton>
        </div>
      </AdminForm>
    </>
  );
}
