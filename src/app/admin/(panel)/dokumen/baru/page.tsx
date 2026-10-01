import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { DocumentForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Dokumen" };

export default async function NewDocumentPage() {
  await requireUser();
  const formKey = await newFormKey();
  return (
    <>
      <PageHeader title="Tambah Dokumen" back={{ href: "/admin/dokumen", label: "Semua dokumen" }} />
      <DocumentForm key={formKey} />
    </>
  );
}
