import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormLayout, FormSection, SelectField, StatusField, TextAreaField, TextField } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-picker";
import type { MediaItem } from "@/lib/admin/media-actions";
import { saveCourse } from "./actions";

export type CourseFormData = {
  id: number;
  code: string;
  name: string;
  semester: number;
  credits: number | null;
  description: string | null;
  sortOrder: number;
  status: string;
  rps: MediaItem | null;
  academicYear: string | null;
};

export function CourseForm({ item }: { item?: CourseFormData }) {
  return (
    <AdminForm action={saveCourse.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <FormSection title="Mata kuliah">
            <div className="grid gap-4 md:grid-cols-[160px_1fr]">
              <TextField name="code" label="Kode" required defaultValue={item?.code} placeholder="ARS101" maxLength={20} />
              <TextField name="name" label="Nama mata kuliah" required defaultValue={item?.name} maxLength={200} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <SelectField
                name="semester"
                label="Semester"
                required
                defaultValue={item?.semester ?? 1}
                options={Array.from({ length: 8 }, (_, i) => ({ value: i + 1, label: `Semester ${i + 1}` }))}
              />
              <TextField name="credits" label="SKS" type="number" defaultValue={item?.credits} />
              <TextField name="sortOrder" label="Urutan" type="number" defaultValue={item?.sortOrder ?? 0} />
            </div>
            <TextAreaField name="description" label="Deskripsi singkat" defaultValue={item?.description} rows={4} maxLength={5000} />
          </FormSection>
        }
        side={
          <>
            <FormSection title="Publikasi">
              <StatusField defaultValue={item?.status} />
              <SubmitButton className="w-full" />
            </FormSection>
            <FormSection title="Dokumen RPS">
              <MediaField name="rpsMediaId" label="File RPS (PDF)" kind="document" defaultValue={item?.rps} />
              <TextField name="academicYear" label="Tahun akademik" defaultValue={item?.academicYear} placeholder="2025/2026" />
            </FormSection>
          </>
        }
      />
    </AdminForm>
  );
}
