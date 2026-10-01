import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormLayout, FormSection, SelectField, StatusField, TextAreaField, TextField, TitleSlugFields } from "@/components/admin/fields";
import { GalleryField, MediaField, type GalleryValue } from "@/components/admin/media-picker";
import { RepeaterField } from "@/components/admin/repeater";
import { RichTextField } from "@/components/admin/rich-text";
import type { MediaItem } from "@/lib/admin/media-actions";
import { saveService } from "./actions";

export type ServiceFormData = {
  id: number;
  kind: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  locationName: string | null;
  lat: number | null;
  lng: number | null;
  year: number | null;
  partnerName: string | null;
  team: { name: string; role?: string }[];
  cover: MediaItem | null;
  images: GalleryValue[];
  status: string;
};

export function ServiceForm({ item, year }: { item?: ServiceFormData; year: number }) {
  return (
    <AdminForm action={saveService.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <>
            <FormSection title="Kegiatan">
              <TitleSlugFields defaultTitle={item?.title} defaultSlug={item?.slug} slugPrefix="/pengabdian/" />
              <TextAreaField name="summary" label="Ringkasan" defaultValue={item?.summary} rows={3} maxLength={500} />
              <RichTextField
                name="body"
                label="Uraian kegiatan"
                defaultValue={item?.body}
                hint="Disarankan memakai judul bagian: Latar Belakang, Tujuan, Metode Pelaksanaan, Hasil & Dampak."
              />
            </FormSection>
            <FormSection title="Tim pelaksana">
              <RepeaterField
                name="team"
                label="Anggota tim"
                addLabel="Tambah anggota"
                defaultValue={item?.team}
                columns={[
                  { key: "name", label: "Nama", maxLength: 150 },
                  { key: "role", label: "Peran", placeholder: "Ketua Tim, Anggota Dosen, Mahasiswa…", maxLength: 100 },
                ]}
              />
            </FormSection>
            <FormSection title="Dokumentasi">
              <GalleryField name="images" label="Foto kegiatan" defaultValue={item?.images} />
            </FormSection>
          </>
        }
        side={
          <>
            <FormSection title="Publikasi">
              <SelectField
                name="kind"
                label="Jenis"
                required
                defaultValue={item?.kind ?? "dosen"}
                options={[
                  { value: "dosen", label: "Pengabdian Dosen" },
                  { value: "mahasiswa", label: "Pengabdian Mahasiswa" },
                ]}
              />
              <StatusField defaultValue={item?.status} />
              <SubmitButton className="w-full" />
            </FormSection>
            <FormSection title="Lokasi & waktu" description="Koordinat dipakai untuk peta. Ambil dari Google Maps: klik kanan titik → salin koordinat.">
              <TextField name="locationName" label="Nama lokasi" defaultValue={item?.locationName} maxLength={200} />
              <div className="grid grid-cols-2 gap-3">
                <TextField name="lat" label="Lintang" type="text" defaultValue={item?.lat} placeholder="-0.8917" />
                <TextField name="lng" label="Bujur" type="text" defaultValue={item?.lng} placeholder="119.8707" />
              </div>
              <TextField name="year" label="Tahun" type="number" defaultValue={item?.year ?? year} />
              <TextField name="partnerName" label="Mitra" defaultValue={item?.partnerName} maxLength={200} />
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
