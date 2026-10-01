import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { CourseForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Mata Kuliah" };

export default async function NewCoursePage() {
  await requireUser();
  const formKey = await newFormKey();
  return (
    <>
      <PageHeader title="Tambah Mata Kuliah" back={{ href: "/admin/mata-kuliah", label: "Semua mata kuliah" }} />
      <CourseForm key={formKey} />
    </>
  );
}
