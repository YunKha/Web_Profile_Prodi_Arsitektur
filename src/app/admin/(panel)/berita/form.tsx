import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormLayout, FormSection, SelectField, StatusField, TextAreaField, TextField, TitleSlugFields } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-picker";
import { MultiSelectField } from "@/components/admin/multi-select";
import { RichTextField } from "@/components/admin/rich-text";
import type { MediaItem } from "@/lib/admin/media-actions";
import { toDateTimeInput } from "@/lib/format";
import { saveNews } from "./actions";

export type NewsFormData = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover: MediaItem | null;
  coverCaption: string | null;
  categoryId: number | null;
  tagIds: number[];
  status: string;
  publishedAt: Date | null;
  eventDate: Date | null;
  eventLocation: string | null;
  eventOrganizer: string | null;
};

export function NewsForm({
  news,
  categories,
  tags,
}: {
  news?: NewsFormData;
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
}) {
  return (
    <AdminForm action={saveNews.bind(null, news?.id ?? null)}>
      <FormLayout
        main={
          <>
            <FormSection title="Konten">
              <TitleSlugFields defaultTitle={news?.title} defaultSlug={news?.slug} slugPrefix="/berita/" />
              <TextAreaField name="excerpt" label="Ringkasan" defaultValue={news?.excerpt} rows={3} maxLength={600} hint="Tampil di kartu berita dan hasil pencarian Google." />
              <RichTextField name="body" label="Isi berita" defaultValue={news?.body} required />
            </FormSection>
            <FormSection title="Informasi kegiatan (opsional)" description="Isi bila berita tentang acara. Kartu “Informasi Kegiatan” tampil di sisi kanan halaman berita.">
              <div className="grid gap-4 md:grid-cols-3">
                <TextField name="eventDate" label="Tanggal & jam" type="datetime-local" defaultValue={toDateTimeInput(news?.eventDate)} />
                <TextField name="eventLocation" label="Lokasi" defaultValue={news?.eventLocation} maxLength={200} />
                <TextField name="eventOrganizer" label="Penyelenggara" defaultValue={news?.eventOrganizer} maxLength={200} />
              </div>
            </FormSection>
          </>
        }
        side={
          <>
            <FormSection title="Publikasi">
              <StatusField defaultValue={news?.status} />
              <TextField
                name="publishedAt"
                label="Waktu terbit"
                type="datetime-local"
                defaultValue={toDateTimeInput(news?.publishedAt)}
                hint="Kosongkan untuk terbit sekarang. Isi waktu mendatang untuk menjadwalkan (WITA)."
              />
              <SubmitButton className="w-full" />
            </FormSection>
            <FormSection title="Klasifikasi">
              <SelectField name="categoryId" label="Kategori" placeholder="— Tanpa kategori —" options={categories.map((c) => ({ value: c.id, label: c.name }))} defaultValue={news?.categoryId} />
              <MultiSelectField name="tags" label="Label terkait" options={tags.map((t) => ({ id: t.id, label: t.name }))} defaultValue={news?.tagIds} />
            </FormSection>
            <FormSection title="Gambar sampul">
              <MediaField name="coverId" label="Sampul" defaultValue={news?.cover} hint="Rasio 16:10, minimal lebar 1200px." />
              <TextField name="coverCaption" label="Keterangan gambar" defaultValue={news?.coverCaption} maxLength={255} />
            </FormSection>
          </>
        }
      />
    </AdminForm>
  );
}
