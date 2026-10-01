import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toMediaItem } from "@/lib/admin/media";
import { deleteOrganization } from "../actions";
import { OrganizationForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Lembaga" };

export default async function EditOrganizationPage({ params }: PageProps<"/admin/lembaga/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.organization.findUnique({ where: { id }, include: { logo: { select: mediaItemSelect } } });
  if (!item) notFound();
  return (
    <>
      <PageHeader title="Edit Lembaga" back={{ href: "/admin/lembaga", label: "Semua lembaga" }} action={<DeleteButton action={deleteOrganization.bind(null, item.id)} confirm={`Hapus “${item.name}”?`} />} />
      <OrganizationForm key={formKey} item={{ ...item, logo: toMediaItem(item.logo) }} />
    </>
  );
}
