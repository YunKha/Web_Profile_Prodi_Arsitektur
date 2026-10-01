import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { lecturerOptions } from "@/lib/admin/options";
import { ResearchForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Penelitian" };

export default async function NewResearchPage() {
  await requireUser();
  const formKey = await newFormKey();
  const [lecturers, fields] = await Promise.all([
    lecturerOptions(),
    db.research.findMany({ where: { field: { not: null } }, distinct: ["field"], select: { field: true } }),
  ]);
  return (
    <>
      <PageHeader title="Tambah Penelitian" back={{ href: "/admin/penelitian", label: "Semua penelitian" }} />
      <ResearchForm key={formKey} lecturers={lecturers} fields={fields.map((f) => f.field as string)} />
    </>
  );
}
