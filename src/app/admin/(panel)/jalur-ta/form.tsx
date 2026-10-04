import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormLayout, FormSection, StatusField, TextAreaField, TextField, TitleSlugFields } from "@/components/admin/fields";
import { RepeaterField } from "@/components/admin/repeater";
import { saveTrack } from "./actions";

export type TrackFormData = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  status: string;
  steps: { title: string; body: string }[];
};

export function TrackForm({ item }: { item?: TrackFormData }) {
  return (
    <AdminForm action={saveTrack.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <>
            <FormSection title="Jalur">
              <TitleSlugFields titleName="name" titleLabel="Nama jalur" defaultTitle={item?.name} defaultSlug={item?.slug} slugPrefix="kunci: " maxLength={120} />
              <TextAreaField
                name="description"
                label="Penjelasan singkat"
                defaultValue={item?.description}
                rows={3}
                maxLength={3000}
                hint="Tampil di atas tahapan saat tab jalur ini dipilih (mis. siapa yang cocok, luaran yang diharapkan)."
              />
            </FormSection>
            <FormSection title="Tahapan" description="Urutan di sini menjadi nomor tahap di website. Gunakan tombol panah untuk mengubah urutan.">
              <RepeaterField
                name="steps"
                label="Daftar tahapan"
                addLabel="Tambah tahap"
                max={12}
                defaultValue={item?.steps ?? [{ title: "", body: "" }]}
                columns={[
                  { key: "title", label: "Nama tahap", width: "240px", maxLength: 150 },
                  { key: "body", label: "Uraian", type: "textarea", maxLength: 3000 },
                ]}
              />
            </FormSection>
          </>
        }
        side={
          <FormSection title="Publikasi">
            <StatusField defaultValue={item?.status ?? "published"} />
            <TextField name="sortOrder" label="Urutan tab" type="number" defaultValue={item?.sortOrder ?? 0} hint="Angka kecil tampil lebih dulu." />
            <SubmitButton className="w-full" />
          </FormSection>
        }
      />
    </AdminForm>
  );
}
