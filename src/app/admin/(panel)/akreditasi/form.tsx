import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { CheckboxField, FormLayout, FormSection, TextField } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-picker";
import type { MediaItem } from "@/lib/admin/media-actions";
import { toDateInput } from "@/lib/format";
import { saveAccreditation } from "./actions";

export type AccreditationFormData = {
  id: number;
  agency: string;
  skNumber: string;
  rank: string;
  validFrom: Date;
  validTo: Date;
  isCurrent: boolean;
  docs: Partial<Record<"sertifikat" | "lkps" | "led", MediaItem | null>>;
};

export function AccreditationForm({ item }: { item?: AccreditationFormData }) {
  return (
    <AdminForm action={saveAccreditation.bind(null, item?.id ?? null)}>
      <FormLayout
        main={
          <FormSection title="Akreditasi">
            <TextField name="agency" label="Lembaga akreditasi" required defaultValue={item?.agency ?? "Badan Akreditasi Nasional Perguruan Tinggi"} maxLength={200} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField name="skNumber" label="Nomor SK" required defaultValue={item?.skNumber} maxLength={120} />
              <TextField name="rank" label="Peringkat" required defaultValue={item?.rank} placeholder="Unggul / A / Baik Sekali" maxLength={40} hint="Tampil juga di statistik Beranda & Profil." />
              <TextField name="validFrom" label="Tanggal berlaku" type="date" required defaultValue={toDateInput(item?.validFrom)} />
              <TextField name="validTo" label="Tanggal berakhir" type="date" required defaultValue={toDateInput(item?.validTo)} />
            </div>
          </FormSection>
        }
        side={
          <>
            <FormSection title="Status">
              <CheckboxField name="isCurrent" label="Akreditasi yang berlaku" hint="Ditampilkan di website. Akreditasi lain otomatis tidak berlaku." defaultChecked={item?.isCurrent ?? true} />
              <SubmitButton className="w-full" />
            </FormSection>
            <FormSection title="Dokumen">
              <MediaField name="sertifikat" label="Sertifikat" kind="document" defaultValue={item?.docs.sertifikat} />
              <MediaField name="lkps" label="Laporan LKPS" kind="document" defaultValue={item?.docs.lkps} />
              <MediaField name="led" label="Laporan LED" kind="document" defaultValue={item?.docs.led} />
            </FormSection>
          </>
        }
      />
    </AdminForm>
  );
}
