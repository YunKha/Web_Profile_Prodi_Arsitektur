import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { lecturerOptions } from "@/lib/admin/options";
import { AchievementForm } from "../form";
import { newFormKey, thisYear } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tambah Prestasi" };

export default async function NewAchievementPage() {
  await requireUser();
  const formKey = await newFormKey();
  const year = await thisYear();
  const lecturers = await lecturerOptions();
  return (
    <>
      <PageHeader title="Tambah Prestasi" back={{ href: "/admin/prestasi", label: "Semua prestasi" }} />
      <AchievementForm key={formKey} lecturers={lecturers} year={year} />
    </>
  );
}
