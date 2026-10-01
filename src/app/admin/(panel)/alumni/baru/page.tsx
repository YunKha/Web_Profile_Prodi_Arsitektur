import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { AlumnusForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Alumni" };

export default async function NewAlumnusPage() {
  await requireUser();
  const formKey = await newFormKey();
  return (
    <>
      <PageHeader title="Tambah Alumni" back={{ href: "/admin/alumni", label: "Semua alumni" }} />
      <AlumnusForm key={formKey} />
    </>
  );
}
