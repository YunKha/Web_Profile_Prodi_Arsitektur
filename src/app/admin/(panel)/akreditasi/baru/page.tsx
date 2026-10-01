import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { AccreditationForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Akreditasi" };

export default async function NewAccreditationPage() {
  await requireUser();
  const formKey = await newFormKey();
  return (
    <>
      <PageHeader title="Tambah Akreditasi" back={{ href: "/admin/akreditasi", label: "Semua akreditasi" }} />
      <AccreditationForm key={formKey} />
    </>
  );
}
