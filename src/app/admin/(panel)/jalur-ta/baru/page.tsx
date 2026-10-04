import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { newFormKey } from "@/lib/admin/request";
import { TrackForm } from "../form";

export const metadata: Metadata = { title: "Tambah Jalur TA" };

export default async function NewTrackPage() {
  await requireUser();
  const formKey = await newFormKey();
  return (
    <>
      <PageHeader title="Tambah Jalur Tugas Akhir" back={{ href: "/admin/jalur-ta", label: "Semua jalur" }} />
      <TrackForm key={formKey} />
    </>
  );
}
