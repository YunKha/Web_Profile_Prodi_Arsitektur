import type { Metadata } from "next";
import { ServiceListPage } from "../_list";

export const metadata: Metadata = {
  title: "Pengabdian Dosen",
  description: "Kegiatan pengabdian kepada masyarakat oleh dosen Program Studi Arsitektur Universitas Tadulako.",
};

export default function PengabdianDosenPage({ searchParams }: PageProps<"/pengabdian/dosen">) {
  return <ServiceListPage kind="dosen" searchParams={searchParams} />;
}
