import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormLayout, FormSection, StatusField, TextAreaField, TextField } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-picker";
import type { MediaItem } from "@/lib/admin/media-actions";
import { saveAlumnus } from "./actions";

export type AlumnusFormData = {
  id: number;
  name: string;
  gradYear: number | null;
  jobTitle: string | null;
  company: string | null;
  testimonial: string | null;
  photo: MediaItem | null;
  status: string;
};

export function AlumnusForm({ item }: { item?: AlumnusFormData }) {
  return (
    <AdminForm action={saveAlumnus.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <FormSection title="Alumni">
            <div className="grid gap-4 md:grid-cols-[1fr_160px]">
              <TextField name="name" label="Nama" required defaultValue={item?.name} maxLength={200} />
              <TextField name="gradYear" label="Tahun lulus" type="number" defaultValue={item?.gradYear} />
              <TextField name="jobTitle" label="Pekerjaan / jabatan" defaultValue={item?.jobTitle} maxLength={150} />
              <TextField name="company" label="Instansi / perusahaan" defaultValue={item?.company} maxLength={200} />
            </div>
            <TextAreaField name="testimonial" label="Testimoni" defaultValue={item?.testimonial} rows={5} maxLength={3000} />
          </FormSection>
        }
        side={
          <>
            <FormSection title="Publikasi">
              <StatusField defaultValue={item?.status} />
              <SubmitButton className="w-full" />
            </FormSection>
            <FormSection title="Foto">
              <MediaField name="photoId" label="Foto" defaultValue={item?.photo} />
            </FormSection>
          </>
        }
      />
    </AdminForm>
  );
}
