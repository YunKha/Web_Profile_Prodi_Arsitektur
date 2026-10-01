import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { LecturerForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Dosen/Staf" };

export default async function NewLecturerPage() {
  await requireUser();
  const formKey = await newFormKey();
  return (
    <>
      <PageHeader title="Tambah Dosen/Staf" back={{ href: "/admin/dosen", label: "Semua dosen & staf" }} />
      <LecturerForm key={formKey} />
    </>
  );
}
