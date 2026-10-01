import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toMediaItem } from "@/lib/admin/media";
import { deleteAlumnus } from "../actions";
import { AlumnusForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Alumni" };

export default async function EditAlumnusPage({ params }: PageProps<"/admin/alumni/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.alumnus.findUnique({ where: { id }, include: { photo: { select: mediaItemSelect } } });
  if (!item) notFound();
  return (
    <>
      <PageHeader title="Edit Alumni" back={{ href: "/admin/alumni", label: "Semua alumni" }} action={<DeleteButton action={deleteAlumnus.bind(null, item.id)} confirm={`Hapus data ${item.name}?`} />} />
      <AlumnusForm key={formKey} item={{ ...item, photo: toMediaItem(item.photo) }} />
    </>
  );
}
