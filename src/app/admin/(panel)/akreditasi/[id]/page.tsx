import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toMediaItem } from "@/lib/admin/media";
import { deleteAccreditation } from "../actions";
import { AccreditationForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Akreditasi" };

export default async function EditAccreditationPage({ params }: PageProps<"/admin/akreditasi/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.accreditation.findUnique({ where: { id }, include: { documents: { include: { media: { select: mediaItemSelect } } } } });
  if (!item) notFound();
  const docs = Object.fromEntries(item.documents.map((d) => [d.type, toMediaItem(d.media)]));
  return (
    <>
      <PageHeader
        title="Edit Akreditasi"
        back={{ href: "/admin/akreditasi", label: "Semua akreditasi" }}
        action={<DeleteButton action={deleteAccreditation.bind(null, item.id)} confirm="Hapus data akreditasi ini?" />}
      />
      <AccreditationForm key={formKey} item={{ ...item, docs }} />
    </>
  );
}
