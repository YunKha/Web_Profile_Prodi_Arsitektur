import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { CheckboxField, FormLayout, FormSection, SelectField, StatusField, TextAreaField, TextField, TitleSlugFields } from "@/components/admin/fields";
import { GalleryField, MediaField, type GalleryValue } from "@/components/admin/media-picker";
import { MultiSelectField, type Option } from "@/components/admin/multi-select";
import type { MediaItem } from "@/lib/admin/media-actions";
import { toDateInput } from "@/lib/format";
import { saveAchievement } from "./actions";

export type AchievementFormData = {
  id: number;
  title: string;
  slug: string;
  studentName: string;
  nim: string | null;
  cohortYear: number | null;
  achievementYear: number;
  level: string;
  rankLabel: string | null;
  category: string | null;
  organizer: string | null;
  eventLocation: string | null;
  eventDate: Date | null;
  workTitle: string | null;
  summary: string | null;
  competitionInfo: string | null;
  concept: string | null;
  cover: MediaItem | null;
  studentPhoto: MediaItem | null;
  images: GalleryValue[];
  advisorIds: number[];
  isFeatured: boolean;
  status: string;
};

export function AchievementForm({ item, lecturers, year }: { item?: AchievementFormData; lecturers: Option[]; year: number }) {
  return (
    <AdminForm action={saveAchievement.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <>
            <FormSection title="Prestasi">
              <TitleSlugFields defaultTitle={item?.title} defaultSlug={item?.slug} slugPrefix="/mahasiswa/prestasi/" maxLength={255} />
              <div className="grid gap-4 md:grid-cols-3">
                <TextField name="rankLabel" label="Peringkat" defaultValue={item?.rankLabel} placeholder="Juara 1, Finalis…" maxLength={60} />
                <SelectField
                  name="level"
                  label="Tingkat"
                  required
                  defaultValue={item?.level ?? "nasional"}
                  options={[
                    { value: "lokal", label: "Lokal" },
                    { value: "nasional", label: "Nasional" },
                    { value: "internasional", label: "Internasional" },
                  ]}
                />
                <TextField name="category" label="Kategori" defaultValue={item?.category} placeholder="Sayembara, Karya Studio…" maxLength={100} />
              </div>
              <TextAreaField name="summary" label="Ringkasan" defaultValue={item?.summary} rows={3} maxLength={500} hint="Tampil di bawah nama mahasiswa pada halaman detail." />
            </FormSection>
            <FormSection title="Mahasiswa">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="studentName" label="Nama mahasiswa / tim" required defaultValue={item?.studentName} maxLength={200} />
                <TextField name="nim" label="NIM" defaultValue={item?.nim} maxLength={30} hint="Tampilkan hanya dengan persetujuan mahasiswa." />
                <TextField name="cohortYear" label="Angkatan" type="number" defaultValue={item?.cohortYear} />
                <TextField name="achievementYear" label="Tahun prestasi" type="number" required defaultValue={item?.achievementYear ?? year} />
              </div>
            </FormSection>
            <FormSection title="Kompetisi">
              <div className="grid gap-4 md:grid-cols-3">
                <TextField name="organizer" label="Penyelenggara" defaultValue={item?.organizer} maxLength={200} />
                <TextField name="eventLocation" label="Lokasi" defaultValue={item?.eventLocation} maxLength={200} />
                <TextField name="eventDate" label="Tanggal" type="date" defaultValue={toDateInput(item?.eventDate)} />
              </div>
              <TextAreaField name="competitionInfo" label="Tentang kompetisi" defaultValue={item?.competitionInfo} rows={6} hint="Pisahkan paragraf dengan baris kosong." />
              <MultiSelectField name="advisors" label="Dosen pembimbing" options={lecturers} defaultValue={item?.advisorIds} />
            </FormSection>
            <FormSection title="Karya yang dilombakan">
              <TextField name="workTitle" label="Judul karya" defaultValue={item?.workTitle} maxLength={200} />
              <TextAreaField name="concept" label="Konsep desain" defaultValue={item?.concept} rows={5} />
              <GalleryField name="images" label="Gambar karya" defaultValue={item?.images} />
            </FormSection>
          </>
        }
        side={
          <>
            <FormSection title="Publikasi">
              <StatusField defaultValue={item?.status} />
              <CheckboxField name="isFeatured" label="Tampilkan di Beranda" hint="Masuk “Galeri Karya & Prestasi” (3 terbaru)." defaultChecked={item?.isFeatured} />
              <SubmitButton className="w-full" />
            </FormSection>
            <FormSection title="Gambar">
              <MediaField name="coverId" label="Gambar sampul" defaultValue={item?.cover} hint="Dipakai di kartu dan hero detail." />
              <MediaField name="studentPhotoId" label="Foto mahasiswa" defaultValue={item?.studentPhoto} hint="Opsional, potret 3:4." />
            </FormSection>
          </>
        }
      />
    </AdminForm>
  );
}
