import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { PartnershipForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Mitra" };

export default async function NewPartnershipPage() {
  await requireUser();
  const formKey = await newFormKey();
  const types = await db.partnership.findMany({ where: { partnerType: { not: null } }, distinct: ["partnerType"], select: { partnerType: true } });
  return (
    <>
      <PageHeader title="Tambah Mitra Kerja Sama" back={{ href: "/admin/kerja-sama", label: "Semua mitra" }} />
      <PartnershipForm key={formKey} types={types.map((t) => t.partnerType as string)} />
    </>
  );
}
