import type { Metadata } from "next";
import { ServiceListPage } from "../_list";

export const metadata: Metadata = {
  title: "Pengabdian Mahasiswa",
  description: "Program pengabdian masyarakat mahasiswa Arsitektur UNTAD: desain partisipatif untuk lingkungan binaan lokal.",
};

export default function PengabdianMahasiswaPage({ searchParams }: PageProps<"/pengabdian/mahasiswa">) {
  return <ServiceListPage kind="mahasiswa" searchParams={searchParams} />;
}
