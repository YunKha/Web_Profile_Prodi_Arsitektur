import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { OrganizationForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Lembaga" };

export default async function NewOrganizationPage() {
  await requireUser();
  const formKey = await newFormKey();
  return (
    <>
      <PageHeader title="Tambah Lembaga" back={{ href: "/admin/lembaga", label: "Semua lembaga" }} />
      <OrganizationForm key={formKey} />
    </>
  );
}
