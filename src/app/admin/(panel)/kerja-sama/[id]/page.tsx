import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toMediaItem } from "@/lib/admin/media";
import { deletePartnership } from "../actions";
import { PartnershipForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Mitra" };

export default async function EditPartnershipPage({ params }: PageProps<"/admin/kerja-sama/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [item, types] = await Promise.all([
    db.partnership.findUnique({ where: { id }, include: { logo: { select: mediaItemSelect } } }),
    db.partnership.findMany({ where: { partnerType: { not: null } }, distinct: ["partnerType"], select: { partnerType: true } }),
  ]);
  if (!item) notFound();
  return (
    <>
      <PageHeader
        title="Edit Mitra Kerja Sama"
        back={{ href: "/admin/kerja-sama", label: "Semua mitra" }}
        action={<DeleteButton action={deletePartnership.bind(null, item.id)} confirm={`Hapus mitra “${item.partnerName}”?`} />}
      />
      <PartnershipForm key={formKey} types={types.map((t) => t.partnerType as string)} item={{ ...item, logo: toMediaItem(item.logo) }} />
    </>
  );
}
