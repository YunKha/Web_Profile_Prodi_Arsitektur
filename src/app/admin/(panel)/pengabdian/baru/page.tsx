import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { ServiceForm } from "../form";
import { newFormKey, thisYear } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Pengabdian" };

export default async function NewServicePage() {
  await requireUser();
  const formKey = await newFormKey();
  const year = await thisYear();
  return (
    <>
      <PageHeader title="Tambah Kegiatan Pengabdian" back={{ href: "/admin/pengabdian", label: "Semua kegiatan" }} />
      <ServiceForm key={formKey} year={year} />
    </>
  );
}
