import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormLayout, FormSection, StatusField, TextAreaField, TextField, TitleSlugFields } from "@/components/admin/fields";
import { GalleryField, type GalleryValue } from "@/components/admin/media-picker";
import { RepeaterField } from "@/components/admin/repeater";
import { facilityIcons } from "@/lib/facility-icons";
import { saveFacility } from "./actions";

export type FacilityFormData = {
  id: number;
  name: string;
  slug: string;
  navLabel: string | null;
  headline: string | null;
  summary: string | null;
  body: string | null;
  capacity: number | null;
  sortOrder: number;
  status: string;
  features: { icon: string | null; title: string; description: string | null }[];
  images: GalleryValue[];
};

const iconOptions = Object.entries(facilityIcons).map(([value, { label }]) => ({ value, label }));

export function FacilityForm({ item }: { item?: FacilityFormData }) {
  return (
    <AdminForm action={saveFacility.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <>
            <FormSection title="Fasilitas">
              <TitleSlugFields titleName="name" titleLabel="Nama fasilitas" defaultTitle={item?.name} defaultSlug={item?.slug} slugPrefix="/fasilitas/" maxLength={150} />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="navLabel" label="Label tab" defaultValue={item?.navLabel} placeholder="Lab Model" maxLength={60} hint="Nama pendek di menu & tab sub-navigasi." />
                <TextField name="headline" label="Judul deskripsi" defaultValue={item?.headline} maxLength={200} />
              </div>
              <TextAreaField name="summary" label="Ringkasan" defaultValue={item?.summary} rows={2} maxLength={500} hint="Tampil di hero dan halaman ringkasan fasilitas." />
              <TextAreaField name="body" label="Deskripsi" defaultValue={item?.body} rows={6} hint="Pisahkan paragraf dengan baris kosong." />
            </FormSection>
            <FormSection title="Spesifikasi & fitur">
              <RepeaterField
                name="features"
                label="Daftar fitur"
                addLabel="Tambah fitur"
                defaultValue={item?.features}
                columns={[
                  { key: "icon", label: "Ikon", type: "select", options: iconOptions, width: "170px" },
                  { key: "title", label: "Nama fitur", maxLength: 200 },
                  { key: "description", label: "Keterangan (opsional)", maxLength: 500 },
                ]}
              />
            </FormSection>
            <FormSection title="Galeri">
              <GalleryField name="images" label="Foto fasilitas" defaultValue={item?.images} hint="Foto pertama dipakai sebagai latar hero." />
            </FormSection>
          </>
        }
        side={
          <FormSection title="Publikasi">
            <StatusField defaultValue={item?.status} />
            <TextField name="capacity" label="Kapasitas (orang)" type="number" defaultValue={item?.capacity} />
            <TextField name="sortOrder" label="Urutan" type="number" defaultValue={item?.sortOrder ?? 0} hint="Urutan di menu dan tab." />
            <SubmitButton className="w-full" />
          </FormSection>
        }
      />
    </AdminForm>
  );
}
