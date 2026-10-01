import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormSection, TitleSlugFields } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-picker";
import type { MediaItem } from "@/lib/admin/media-actions";
import { saveDocument } from "./actions";

export function DocumentForm({ item }: { item?: { id: number; key: string; title: string; media: MediaItem | null } }) {
  return (
    <AdminForm action={saveDocument.bind(null, item?.id ?? null)} className="max-w-2xl">
      <FormSection title="Dokumen" description="Kunci “buku-panduan-ta” dipakai halaman Panduan TA, “dokumen-kurikulum” dipakai halaman Kurikulum.">
        <TitleSlugFields defaultTitle={item?.title} defaultSlug={item?.key} slugPrefix="kunci: " maxLength={200} />
        <MediaField name="mediaId" label="File PDF" kind="document" required defaultValue={item?.media} />
        <SubmitButton className="self-start" />
      </FormSection>
    </AdminForm>
  );
}
