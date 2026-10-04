import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormSection, TextAreaField, TextField } from "@/components/admin/fields";
import { GalleryField, MediaField } from "@/components/admin/media-picker";
import { RepeaterField } from "@/components/admin/repeater";
import { GhostLink, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toGallery, toMediaItem } from "@/lib/admin/media";
import { findPage } from "@/lib/page-registry";
import { savePage } from "../actions";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Halaman" };

export default async function EditPageBlocks({ params }: PageProps<"/admin/halaman/[halaman]">) {
  await requireUser();
  const formKey = await newFormKey();
  const page = findPage((await params).halaman);
  if (!page) notFound();
  const [rows, images, missions] = await Promise.all([
    db.pageBlock.findMany({ where: { pageKey: page.key }, include: { image: { select: mediaItemSelect } } }),
    db.pageBlockImage.findMany({ where: { pageKey: page.key }, orderBy: { sortOrder: "asc" }, include: { media: { select: mediaItemSelect } } }),
    page.key === "profil" ? db.missionItem.findMany({ orderBy: { sortOrder: "asc" } }) : Promise.resolve([]),
  ]);
  const byKey = new Map(rows.map((r) => [r.blockKey, r]));

  return (
    <>
      <PageHeader
        title={page.label}
        description={<span className="font-mono text-xs">{page.path}</span>}
        back={{ href: "/admin/halaman", label: "Semua halaman" }}
        action={
          <GhostLink href={page.path} external>
            <ExternalLink className="size-4" aria-hidden /> Lihat halaman
          </GhostLink>
        }
      />
      <AdminForm key={formKey} action={savePage.bind(null, page.key)} className="max-w-4xl">
        {page.blocks.map((b) => {
          const row = byKey.get(b.key);
          return (
            <FormSection key={b.key} title={b.label} description={b.hint}>
              <div className={b.fields.includes("image") ? "grid gap-5 md:grid-cols-[1fr_260px]" : "flex flex-col gap-5"}>
                <div className="flex flex-col gap-4">
                  {b.fields.includes("title") ? <TextField name={`${b.key}.title`} label="Judul" defaultValue={row?.title} maxLength={255} /> : null}
                  {b.fields.includes("body") ? <TextAreaField name={`${b.key}.body`} label="Teks" defaultValue={row?.body} rows={b.key === "sejarah" || b.key === "content" ? 10 : 4} /> : null}
                </div>
                {b.fields.includes("image") ? <MediaField name={`${b.key}.imageId`} label="Gambar" defaultValue={toMediaItem(row?.image)} /> : null}
              </div>
              {b.fields.includes("link") ? (
                <div className="grid gap-4 md:grid-cols-[1fr_240px]">
                  <TextField name={`${b.key}.linkUrl`} label="Tautan (Google Drive / URL)" type="url" defaultValue={row?.linkUrl} placeholder="https://drive.google.com/…" hint="Kosongkan untuk menyembunyikan tombol." />
                  <TextField name={`${b.key}.linkLabel`} label="Teks tombol" defaultValue={row?.linkLabel} maxLength={100} placeholder="Buka di Google Drive" />
                </div>
              ) : null}
              {b.fields.includes("gallery") ? (
                <GalleryField
                  name={`${b.key}.images`}
                  label="Gambar"
                  defaultValue={toGallery(images.filter((i) => i.blockKey === b.key))}
                  hint="Isi keterangan tiap gambar (mis. nama tema). Urutan bisa diatur dengan tombol panah."
                />
              ) : null}
            </FormSection>
          );
        })}
        {page.key === "profil" ? (
          <FormSection title="Misi" description="Daftar misi bernomor di bagian Visi & Misi.">
            <RepeaterField
              name="missions"
              label="Butir misi"
              addLabel="Tambah misi"
              max={12}
              defaultValue={missions}
              columns={[
                { key: "title", label: "Judul", width: "200px", maxLength: 150 },
                { key: "body", label: "Uraian", type: "textarea", maxLength: 3000 },
              ]}
            />
          </FormSection>
        ) : null}
        <div className="sticky bottom-4 flex justify-end">
          <SubmitButton className="shadow-lg">Simpan halaman</SubmitButton>
        </div>
      </AdminForm>
    </>
  );
}
