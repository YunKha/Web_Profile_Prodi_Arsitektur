import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { MediaLibrary } from "./media-library";

export const metadata: Metadata = { title: "Pustaka Media" };

export default async function MediaPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Pustaka Media" description="Semua gambar dan dokumen yang diunggah. File yang masih dipakai konten tidak bisa dihapus." />
      <MediaLibrary />
    </>
  );
}
