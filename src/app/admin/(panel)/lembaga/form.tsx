import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormLayout, FormSection, StatusField, TextAreaField, TextField } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-picker";
import type { MediaItem } from "@/lib/admin/media-actions";
import { saveOrganization } from "./actions";

export type OrganizationFormData = {
  id: number;
  name: string;
  abbreviation: string | null;
  description: string | null;
  url: string | null;
  logo: MediaItem | null;
  sortOrder: number;
  status: string;
};

export function OrganizationForm({ item }: { item?: OrganizationFormData }) {
  return (
    <AdminForm action={saveOrganization.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <FormSection title="Lembaga">
            <div className="grid gap-4 md:grid-cols-[1fr_160px]">
              <TextField name="name" label="Nama lembaga" required defaultValue={item?.name} maxLength={200} />
              <TextField name="abbreviation" label="Singkatan" defaultValue={item?.abbreviation} maxLength={30} />
            </div>
            <TextAreaField name="description" label="Deskripsi" defaultValue={item?.description} rows={5} maxLength={5000} />
            <TextField name="url" label="Tautan (Instagram/situs)" type="url" defaultValue={item?.url} placeholder="https://" />
          </FormSection>
        }
        side={
          <>
            <FormSection title="Publikasi">
              <StatusField defaultValue={item?.status ?? "published"} />
              <TextField name="sortOrder" label="Urutan" type="number" defaultValue={item?.sortOrder ?? 0} />
              <SubmitButton className="w-full" />
            </FormSection>
            <FormSection title="Logo">
              <MediaField name="logoId" label="Logo" defaultValue={item?.logo} hint="Persegi, latar transparan/putih." />
            </FormSection>
          </>
        }
      />
    </AdminForm>
  );
}
