import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { DocumentListField, type DocumentValue } from "@/components/admin/document-list";
import { CheckboxField, FormLayout, FormSection, SelectField, StatusField, TextAreaField, TextField, TitleSlugFields } from "@/components/admin/fields";
import { GalleryField, MediaField, type GalleryValue } from "@/components/admin/media-picker";
import { MultiSelectField, type Option } from "@/components/admin/multi-select";
import { RichTextField } from "@/components/admin/rich-text";
import type { MediaItem } from "@/lib/admin/media-actions";
import { saveResearch } from "./actions";

export type ResearchFormData = {
  id: number;
  title: string;
  slug: string;
  abstract: string | null;
  body: string | null;
  year: number | null;
  scheme: string | null;
  field: string | null;
  locationName: string | null;
  progress: string;
  authorsText: string | null;
  authorIds: number[];
  externalUrl: string | null;
  cover: MediaItem | null;
  images: GalleryValue[];
  files: DocumentValue[];
  isFeatured: boolean;
  status: string;
};

export function ResearchForm({ item, lecturers, fields }: { item?: ResearchFormData; lecturers: Option[]; fields: string[] }) {
  return (
    <AdminForm action={saveResearch.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <>
            <FormSection title="Penelitian">
              <TitleSlugFields defaultTitle={item?.title} defaultSlug={item?.slug} slugPrefix="/penelitian/" maxLength={400} />
              <TextAreaField name="abstract" label="Abstrak" defaultValue={item?.abstract} rows={6} hint="Pisahkan paragraf dengan baris kosong." />
              <RichTextField
                name="body"
                label="Isi penelitian"
                defaultValue={item?.body}
                hint="Latar belakang, metodologi, temuan. Gunakan “Judul bagian” untuk setiap bab."
              />
            </FormSection>
            <FormSection title="Tim peneliti">
              <MultiSelectField name="authors" label="Dosen peneliti (urut sesuai pilihan)" ordered options={lecturers} defaultValue={item?.authorIds} />
              <TextField
                name="authorsText"
                label="Nama penulis untuk ditampilkan"
                defaultValue={item?.authorsText}
                maxLength={400}
                hint="Opsional. Isi bila ada penulis luar/mahasiswa; jika kosong dipakai nama dosen di atas."
              />
            </FormSection>
            <FormSection title="Dokumentasi & publikasi">
              <GalleryField name="images" label="Foto dokumentasi" defaultValue={item?.images} />
              <DocumentListField name="files" label="Dokumen publikasi (PDF)" defaultValue={item?.files} />
              <TextField name="externalUrl" label="Tautan jurnal/publikasi" type="url" defaultValue={item?.externalUrl} placeholder="https://" />
            </FormSection>
          </>
        }
        side={
          <>
            <FormSection title="Publikasi">
              <StatusField defaultValue={item?.status} />
              <CheckboxField name="isFeatured" label="Penelitian unggulan" hint="Tampil besar di atas halaman Penelitian (hanya satu)." defaultChecked={item?.isFeatured} />
              <SubmitButton className="w-full" />
            </FormSection>
            <FormSection title="Informasi">
              <TextField name="year" label="Tahun" type="number" defaultValue={item?.year} />
              <TextField name="scheme" label="Skema / pendanaan" defaultValue={item?.scheme} maxLength={150} />
              <Field label="Bidang kajian" fields={fields} defaultValue={item?.field} />
              <TextField name="locationName" label="Lokasi studi" defaultValue={item?.locationName} maxLength={200} />
              <SelectField
                name="progress"
                label="Status penelitian"
                defaultValue={item?.progress ?? "selesai"}
                options={[
                  { value: "berlangsung", label: "Sedang berlangsung" },
                  { value: "selesai", label: "Selesai" },
                ]}
              />
            </FormSection>
            <FormSection title="Gambar sampul">
              <MediaField name="coverId" label="Sampul" defaultValue={item?.cover} />
            </FormSection>
          </>
        }
      />
    </AdminForm>
  );
}

/** Teks bebas dengan saran dari bidang yang sudah ada agar penamaan konsisten. */
function Field({ label, fields, defaultValue }: { label: string; fields: string[]; defaultValue?: string | null }) {
  return (
    <>
      <TextField name="field" label={label} defaultValue={defaultValue} maxLength={120} list="bidang-kajian" hint="Dipakai untuk filter di halaman publik." />
      <datalist id="bidang-kajian">
        {fields.map((f) => (
          <option key={f} value={f} />
        ))}
      </datalist>
    </>
  );
}
