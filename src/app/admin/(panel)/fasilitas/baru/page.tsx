import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { FacilityForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Fasilitas" };

export default async function NewFacilityPage() {
  await requireUser();
  const formKey = await newFormKey();
  return (
    <>
      <PageHeader title="Tambah Fasilitas" back={{ href: "/admin/fasilitas", label: "Semua fasilitas" }} />
      <FacilityForm key={formKey} />
    </>
  );
}
