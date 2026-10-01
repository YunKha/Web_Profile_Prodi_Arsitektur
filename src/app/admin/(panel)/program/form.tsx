import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormLayout, FormSection, SelectField, StatusField, TextAreaField, TextField, TitleSlugFields } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-picker";
import { RichTextField } from "@/components/admin/rich-text";
import type { MediaItem } from "@/lib/admin/media-actions";
import { saveProgram } from "./actions";

export type ProgramFormData = {
  id: number;
  kind: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  image: MediaItem | null;
  sortOrder: number;
  status: string;
};

export function ProgramForm({ item }: { item?: ProgramFormData }) {
  return (
    <AdminForm action={saveProgram.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <FormSection title="Program">
            <TitleSlugFields defaultTitle={item?.title} defaultSlug={item?.slug} slugPrefix="/mahasiswa/kegiatan/" maxLength={200} />
            <TextAreaField name="summary" label="Ringkasan kartu" defaultValue={item?.summary} rows={3} maxLength={500} />
            <RichTextField name="body" label="Uraian lengkap (opsional)" defaultValue={item?.body} hint="Bila diisi, kartu menampilkan tautan “Selengkapnya”." />
          </FormSection>
        }
        side={
          <>
            <FormSection title="Publikasi">
              <SelectField
                name="kind"
                label="Halaman"
                defaultValue={item?.kind ?? "akademik"}
                options={[
                  { value: "akademik", label: "Kegiatan Akademik" },
                  { value: "nonakademik", label: "Kegiatan Nonakademik" },
                ]}
              />
              <StatusField defaultValue={item?.status} />
              <TextField name="sortOrder" label="Urutan" type="number" defaultValue={item?.sortOrder ?? 0} />
              <SubmitButton className="w-full" />
            </FormSection>
            <FormSection title="Gambar">
              <MediaField name="imageId" label="Gambar kartu" defaultValue={item?.image} />
            </FormSection>
          </>
        }
      />
    </AdminForm>
  );
}
