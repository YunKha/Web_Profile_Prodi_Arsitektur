import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormLayout, FormSection, StatusField, TextAreaField, TextField, TitleSlugFields } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-picker";
import { RepeaterField } from "@/components/admin/repeater";
import { RichTextField } from "@/components/admin/rich-text";
import type { MediaItem } from "@/lib/admin/media-actions";
import { saveRepositoryArticle } from "./actions";

export type RepositoryArticleFormData = {
  id: number;
  title: string;
  slug: string;
  authors: string | null;
  year: number | null;
  category: string | null;
  abstract: string | null;
  body: string | null;
  driveLinks?: { title: string; url: string }[] | null;
  cover: MediaItem | null;
  status: string;
};

export function RepositoryArticleForm({
  article,
  categoryOptions = [],
}: {
  article?: RepositoryArticleFormData;
  categoryOptions?: string[];
}) {
  return (
    <AdminForm action={saveRepositoryArticle.bind(null, article?.id ?? null)}>
      <FormLayout
        main={
          <>
            <FormSection title="Identitas Artikel">
              <TitleSlugFields
                defaultTitle={article?.title}
                defaultSlug={article?.slug}
                slugPrefix="/repository/"
                maxLength={400}
              />
              <TextField
                name="authors"
                label="Penulis / Pengarang"
                defaultValue={article?.authors}
                maxLength={300}
                placeholder="Contoh: Dr. Ir. Fulan, M.T., Mahasiswa A, Mahasiswa B"
                hint="Pisahkan nama penulis dengan koma bila lebih dari satu."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  name="year"
                  label="Tahun"
                  type="number"
                  defaultValue={article?.year}
                  placeholder="Contoh: 2026"
                  hint="Tahun penulisan atau publikasi."
                />
                <div>
                  <TextField
                    name="category"
                    label="Kategori"
                    defaultValue={article?.category}
                    maxLength={100}
                    list="category-suggestions"
                    placeholder="Contoh: Jurnal Ilmiah, Prosiding, Tugas Akhir"
                    hint="Pilih saran atau ketik kategori baru."
                  />
                  {categoryOptions.length ? (
                    <datalist id="category-suggestions">
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  ) : null}
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Tautan Berkas Google Drive"
              description="Anda dapat menambahkan banyak tautan Google Drive untuk berkas dokumen, naskah PDF lengkap, lampiran gambar desain, maupun dataset pendukung."
            >
              <RepeaterField
                name="driveLinks"
                label="Daftar Tautan Berkas Google Drive"
                addLabel="Tambah Link Google Drive"
                hint="Pastikan izin akses Google Drive sudah disetel ke 'Siapa saja yang memiliki tautan' (Anyone with the link can view)."
                columns={[
                  {
                    key: "title",
                    label: "Judul / Keterangan Berkas",
                    placeholder: "Contoh: Naskah Lengkap PDF, Lampiran Gambar CAD, Dataset",
                    width: "1.2fr",
                  },
                  {
                    key: "url",
                    label: "URL Google Drive",
                    placeholder: "https://drive.google.com/file/d/.../view",
                    width: "1.8fr",
                  },
                ]}
                defaultValue={article?.driveLinks ?? []}
              />
            </FormSection>

            <FormSection title="Abstrak & Ulasan">
              <TextAreaField
                name="abstract"
                label="Abstrak / Ringkasan Eksekutif"
                defaultValue={article?.abstract}
                rows={5}
                hint="Tampil di kartu repositori dan ringkasan awal artikel."
              />
              <RichTextField
                name="body"
                label="Ulasan Lengkap / Catatan Tambahan (Opsional)"
                defaultValue={article?.body}
                hint="Informasi latar belakang, metodologi, atau penjelasan mendalam bila diperlukan."
              />
            </FormSection>
          </>
        }
        side={
          <>
            <FormSection title="Publikasi">
              <StatusField defaultValue={article?.status} />
              <SubmitButton className="w-full" />
            </FormSection>

            <FormSection title="Gambar Sampul (Opsional)">
              <MediaField
                name="coverId"
                label="Sampul / Thumbnail"
                defaultValue={article?.cover}
                hint="Rasio 16:9 atau 4:3. Jika dikosongkan, kartu akan menampilkan ikon dokumen."
              />
            </FormSection>
          </>
        }
      />
    </AdminForm>
  );
}
