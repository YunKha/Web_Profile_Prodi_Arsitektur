import type { Metadata } from "next";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { TextField } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { deleteTaxonomy, saveTaxonomy } from "./actions";

export const metadata: Metadata = { title: "Kategori & Label" };

type Row = { id: number; name: string; slug: string; count: number };

export default async function TaxonomyPage() {
  await requireUser();
  const [categories, tags] = await Promise.all([
    db.newsCategory.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { news: true } } } }),
    db.tag.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { news: true } } } }),
  ]);
  return (
    <>
      <PageHeader title="Kategori & Label" description="Kategori dipakai untuk filter halaman Berita; label tampil sebagai “Label terkait” di detail berita." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel kind="category" title="Kategori berita" rows={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c._count.news }))} />
        <Panel kind="tag" title="Label" rows={tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.news }))} />
      </div>
    </>
  );
}

function Panel({ kind, title, rows }: { kind: "category" | "tag"; title: string; rows: Row[] }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <AdminForm key={`new-${rows.length}`} action={saveTaxonomy.bind(null, kind, null)} className="gap-3 rounded-xl bg-background p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <TextField name="name" label="Nama baru" required maxLength={100} />
          <TextField name="slug" label="Slug (opsional)" maxLength={120} />
          <SubmitButton>Tambah</SubmitButton>
        </div>
      </AdminForm>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={`${r.id}-${r.name}-${r.slug}`} className="py-3">
            <AdminForm action={saveTaxonomy.bind(null, kind, r.id)} className="gap-2">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
                <TextField name="name" label="Nama" defaultValue={r.name} maxLength={100} />
                <TextField name="slug" label="Slug" defaultValue={r.slug} maxLength={120} hint={`${r.count} berita`} />
                <SubmitButton className="h-10 px-4">Simpan</SubmitButton>
                <DeleteButton
                  compact
                  action={deleteTaxonomy.bind(null, kind, r.id)}
                  confirm={`Hapus “${r.name}”? ${r.count} berita akan kehilangan ${kind === "category" ? "kategori" : "label"} ini.`}
                />
              </div>
            </AdminForm>
          </li>
        ))}
      </ul>
    </section>
  );
}
