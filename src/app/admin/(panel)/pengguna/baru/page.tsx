import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { UserForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Pengguna" };

export default async function NewUserPage() {
  await requireAdmin();
  const formKey = await newFormKey();
  return (
    <>
      <PageHeader title="Tambah Pengguna" back={{ href: "/admin/pengguna", label: "Semua pengguna" }} />
      <UserForm key={formKey} />
    </>
  );
}
