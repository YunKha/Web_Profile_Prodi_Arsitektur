import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toMediaItem } from "@/lib/admin/media";
import { deleteDocument } from "../actions";
import { DocumentForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Dokumen" };

export default async function EditDocumentPage({ params }: PageProps<"/admin/dokumen/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.document.findUnique({ where: { id }, include: { media: { select: mediaItemSelect } } });
  if (!item) notFound();
  return (
    <>
      <PageHeader
        title="Edit Dokumen"
        back={{ href: "/admin/dokumen", label: "Semua dokumen" }}
        action={<DeleteButton action={deleteDocument.bind(null, item.id)} confirm={`Hapus dokumen “${item.title}”?`} />}
      />
      <DocumentForm key={formKey} item={{ ...item, media: toMediaItem(item.media) }} />
    </>
  );
}
