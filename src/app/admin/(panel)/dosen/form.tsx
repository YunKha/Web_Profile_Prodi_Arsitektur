import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { CheckboxField, FormLayout, FormSection, SelectField, StatusField, TextAreaField, TextField, TitleSlugFields } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-picker";
import { RepeaterField } from "@/components/admin/repeater";
import type { MediaItem } from "@/lib/admin/media-actions";
import { expertiseGroups } from "@/lib/expertise";
import { saveLecturer } from "./actions";

export type LecturerFormData = {
  id: number;
  fullName: string;
  slug: string;
  frontTitle: string | null;
  backTitle: string | null;
  staffType: string;
  structuralRole: string | null;
  academicRank: string | null;
  civilRank: string | null;
  studyProgram: string | null;
  startYear: number | null;
  expertise: string | null;
  expertiseGroup: string | null;
  bio: string | null;
  photo: MediaItem | null;
  email: string | null;
  nidn: string | null;
  nuptk: string | null;
  sintaId: string | null;
  scopusId: string | null;
  orcidId: string | null;
  wosId: string | null;
  serdosNumber: string | null;
  serdosInstitution: string | null;
  sintaUrl: string | null;
  scholarUrl: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  status: string;
  education: { degree: string; major: string; institution: string; gradYear: number }[];
  certifications: { number: string; institution: string; title: string }[];
};

export function LecturerForm({ item }: { item?: LecturerFormData }) {
  return (
    <AdminForm action={saveLecturer.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <>
            <FormSection title="Identitas">
              <TitleSlugFields titleName="fullName" titleLabel="Nama lengkap (tanpa gelar)" defaultTitle={item?.fullName} defaultSlug={item?.slug} slugPrefix="/profil/dosen-staf/" maxLength={200} />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="frontTitle" label="Gelar depan" defaultValue={item?.frontTitle} placeholder="Dr. Ir." maxLength={60} />
                <TextField name="backTitle" label="Gelar belakang" defaultValue={item?.backTitle} placeholder="S.T., M.T." maxLength={80} />
                <TextField name="structuralRole" label="Jabatan struktural / peran" defaultValue={item?.structuralRole} placeholder="Ketua Program Studi" maxLength={120} />
                <SelectField
                  name="expertiseGroup"
                  label="Kelompok bidang keahlian"
                  placeholder="— Pilih kelompok keahlian —"
                  options={expertiseGroups.map((g) => ({ value: g.value, label: g.label }))}
                  defaultValue={item?.expertiseGroup}
                  hint="Dipakai untuk filter di halaman Dosen & Staf."
                />
                <TextField name="expertise" label="Rincian keahlian (opsional)" defaultValue={item?.expertise} maxLength={255} placeholder="Mis. Perancangan Kota & Perumahan" className="md:col-span-2" />
              </div>
              <TextAreaField name="bio" label="Biografi singkat" defaultValue={item?.bio} rows={4} maxLength={5000} />
            </FormSection>
            <FormSection title="Kepegawaian">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="academicRank" label="Jabatan akademik" defaultValue={item?.academicRank} placeholder="Lektor Kepala" maxLength={80} />
                <TextField name="civilRank" label="Pangkat / golongan" defaultValue={item?.civilRank} placeholder="Pembina, IV/a" maxLength={80} />
                <TextField name="studyProgram" label="Program studi" defaultValue={item?.studyProgram ?? "S1 Arsitektur"} maxLength={120} />
                <TextField name="startYear" label="Tahun mulai bekerja" type="number" defaultValue={item?.startYear} hint="Masa kerja dihitung otomatis." />
              </div>
            </FormSection>
            <FormSection title="Kontak & identitas peneliti" description="Tampilkan data hanya yang sudah disetujui yang bersangkutan.">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="email" label="Email" type="email" defaultValue={item?.email} />
                <TextField name="nidn" label="NIDN" defaultValue={item?.nidn} maxLength={30} />
                <TextField name="nuptk" label="NUPTK" defaultValue={item?.nuptk} maxLength={30} />
                <TextField name="sintaId" label="SINTA ID" defaultValue={item?.sintaId} maxLength={40} />
                <TextField name="scopusId" label="Scopus Author ID" defaultValue={item?.scopusId} maxLength={40} />
                <TextField name="orcidId" label="ORCID iD" defaultValue={item?.orcidId} placeholder="0000-0002-1234-5678" maxLength={40} />
                <TextField name="wosId" label="Web of Science ResearcherID" defaultValue={item?.wosId} placeholder="ABC-1234-2020" maxLength={40} />
                <TextField name="sintaUrl" label="URL profil SINTA" type="url" defaultValue={item?.sintaUrl} placeholder="https://sinta.kemdikbud.go.id/authors/profile/…" />
                <TextField name="scholarUrl" label="URL Google Scholar" type="url" defaultValue={item?.scholarUrl} placeholder="https://scholar.google.com/citations?user=…" />
                <TextField name="websiteUrl" label="Situs web / portofolio" type="url" defaultValue={item?.websiteUrl} />
              </div>
            </FormSection>
            <FormSection title="Sertifikasi dosen" description="Sertifikat pendidik (serdos). Satu per dosen; kosongkan bila belum ada.">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="serdosNumber" label="Nomor sertifikat" defaultValue={item?.serdosNumber} maxLength={60} />
                <TextField name="serdosInstitution" label="Institusi penerbit" defaultValue={item?.serdosInstitution} maxLength={200} placeholder="Kementerian Pendidikan Tinggi, Sains, dan Teknologi" />
              </div>
            </FormSection>
            <FormSection title="Sertifikasi profesi" description="Mis. Sertifikat Keahlian Arsitek dari IAI. Bisa lebih dari satu.">
              <RepeaterField
                name="certifications"
                label="Daftar sertifikasi"
                addLabel="Tambah sertifikasi"
                max={10}
                defaultValue={item?.certifications}
                columns={[
                  { key: "number", label: "Nomor sertifikat", maxLength: 80 },
                  { key: "institution", label: "Institusi penerbit", maxLength: 200 },
                  { key: "title", label: "Gelar / sebutan profesi", maxLength: 120, placeholder: "Ar. / Arsitek Madya" },
                ]}
              />
            </FormSection>
            <FormSection title="Riwayat pendidikan">
              <RepeaterField
                name="education"
                label="Jenjang"
                addLabel="Tambah jenjang"
                max={10}
                defaultValue={item?.education}
                columns={[
                  {
                    key: "degree",
                    label: "Jenjang",
                    type: "select",
                    width: "110px",
                    options: [
                      { value: "S3", label: "S3" },
                      { value: "S2", label: "S2" },
                      { value: "S1", label: "S1" },
                      { value: "Profesi", label: "Profesi" },
                    ],
                  },
                  { key: "major", label: "Program studi", maxLength: 150 },
                  { key: "institution", label: "Institusi", maxLength: 200 },
                  { key: "gradYear", label: "Tahun lulus", type: "number", width: "120px" },
                ]}
              />
            </FormSection>
          </>
        }
        side={
          <>
            <FormSection title="Publikasi">
              <StatusField defaultValue={item?.status} />
              <SelectField
                name="staffType"
                label="Jenis"
                defaultValue={item?.staffType ?? "dosen"}
                options={[
                  { value: "dosen", label: "Dosen" },
                  { value: "tendik", label: "Tenaga Kependidikan" },
                ]}
              />
              <CheckboxField name="isActive" label="Masih aktif" defaultChecked={item?.isActive ?? true} />
              <TextField name="sortOrder" label="Urutan tampil" type="number" defaultValue={item?.sortOrder ?? 0} hint="Angka kecil tampil lebih dulu." />
              <SubmitButton className="w-full" />
            </FormSection>
            <FormSection title="Foto">
              <MediaField name="photoId" label="Foto profil" defaultValue={item?.photo} hint="Potret 3:4, latar polos." />
            </FormSection>
          </>
        }
      />
    </AdminForm>
  );
}
