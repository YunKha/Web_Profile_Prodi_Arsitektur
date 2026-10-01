import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { CheckboxField, FormLayout, FormSection, StatusField, TextAreaField, TextField } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-picker";
import type { MediaItem } from "@/lib/admin/media-actions";
import { toDateInput } from "@/lib/format";
import { savePartnership } from "./actions";

export type PartnershipFormData = {
  id: number;
  partnerName: string;
  partnerType: string | null;
  scope: string | null;
  startDate: Date | null;
  endDate: Date | null;
  url: string | null;
  logo: MediaItem | null;
  showOnHome: boolean;
  sortOrder: number;
  status: string;
};

export function PartnershipForm({ item, types }: { item?: PartnershipFormData; types: string[] }) {
  return (
    <AdminForm action={savePartnership.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <FormSection title="Mitra">
            <TextField name="partnerName" label="Nama mitra" required defaultValue={item?.partnerName} maxLength={250} />
            <div className="grid gap-4 md:grid-cols-3">
              <TextField name="partnerType" label="Kelompok" defaultValue={item?.partnerType} list="jenis-mitra" placeholder="Pemerintah / Industri…" maxLength={80} hint="Mengelompokkan logo di halaman Kerja Sama." />
              <TextField name="startDate" label="Mulai" type="date" defaultValue={toDateInput(item?.startDate)} />
              <TextField name="endDate" label="Berakhir" type="date" defaultValue={toDateInput(item?.endDate)} hint="Kosongkan bila tidak terbatas." />
            </div>
            <datalist id="jenis-mitra">
              {types.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            <TextAreaField name="scope" label="Ruang lingkup" defaultValue={item?.scope} rows={4} maxLength={5000} />
            <TextField name="url" label="Situs mitra" type="url" defaultValue={item?.url} placeholder="https://" />
          </FormSection>
        }
        side={
          <>
            <FormSection title="Publikasi">
              <StatusField defaultValue={item?.status} />
              <CheckboxField name="showOnHome" label="Tampilkan logo di Beranda" defaultChecked={item?.showOnHome} />
              <TextField name="sortOrder" label="Urutan" type="number" defaultValue={item?.sortOrder ?? 0} />
              <SubmitButton className="w-full" />
            </FormSection>
            <FormSection title="Logo">
              <MediaField name="logoId" label="Logo mitra" defaultValue={item?.logo} />
            </FormSection>
          </>
        }
      />
    </AdminForm>
  );
}
