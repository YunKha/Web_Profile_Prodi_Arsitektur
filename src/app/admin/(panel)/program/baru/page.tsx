import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { ProgramForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Program" };

export default async function NewProgramPage() {
  await requireUser();
  const formKey = await newFormKey();
  return (
    <>
      <PageHeader title="Tambah Program Kegiatan" back={{ href: "/admin/program", label: "Semua program" }} />
      <ProgramForm key={formKey} />
    </>
  );
}
