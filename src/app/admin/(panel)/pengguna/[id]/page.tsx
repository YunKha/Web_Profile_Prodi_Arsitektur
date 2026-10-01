import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { UserForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Pengguna" };

export default async function EditUserPage({ params }: PageProps<"/admin/pengguna/[id]">) {
  await requireAdmin();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, isActive: true } });
  if (!item) notFound();
  return (
    <>
      <PageHeader title={`Edit ${item.name}`} back={{ href: "/admin/pengguna", label: "Semua pengguna" }} />
      <UserForm key={formKey} item={item} />
    </>
  );
}
