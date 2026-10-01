/** Konstanta situs yang aman dipakai di server maupun client. */

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteName = "Arsitektur UNTAD";
export const siteFullName = "Program Studi Arsitektur Universitas Tadulako";

export type NavLink = { label: string; href: string };
export type NavItem = NavLink & { children?: NavLink[]; match: string };

export const profilTabs: NavLink[] = [
  { label: "Visi & Misi", href: "/profil" },
  { label: "Akreditasi", href: "/profil/akreditasi" },
  { label: "Dosen & Staf", href: "/profil/dosen-staf" },
];

export const akademikTabs: NavLink[] = [
  { label: "Kurikulum", href: "/akademik/kurikulum" },
  { label: "RPS", href: "/akademik/rps" },
  { label: "Panduan Tugas Akhir", href: "/akademik/panduan-ta" },
];

export const mahasiswaTabs: NavLink[] = [
  { label: "Kegiatan Akademik", href: "/mahasiswa/kegiatan-akademik" },
  { label: "Kegiatan Nonakademik", href: "/mahasiswa/kegiatan-nonakademik" },
  { label: "Lembaga", href: "/mahasiswa/lembaga" },
  { label: "Prestasi Mahasiswa", href: "/mahasiswa/prestasi" },
  { label: "Alumni", href: "/mahasiswa/alumni" },
];

export const pengabdianTabs: NavLink[] = [
  { label: "Pengabdian Dosen", href: "/pengabdian/dosen" },
  { label: "Pengabdian Mahasiswa", href: "/pengabdian/mahasiswa" },
];

/** Menu utama. Anak menu Fasilitas diisi dari database. */
export function buildMainNav(facilities: NavLink[]): NavItem[] {
  return [
    { label: "Profile", href: "/profil", match: "/profil", children: profilTabs },
    {
      label: "Fasilitas",
      href: "/fasilitas",
      match: "/fasilitas",
      children: [{ label: "Semua Fasilitas", href: "/fasilitas" }, ...facilities],
    },
    { label: "Akademik", href: "/akademik/kurikulum", match: "/akademik", children: akademikTabs },
    { label: "Mahasiswa", href: "/mahasiswa/kegiatan-akademik", match: "/mahasiswa", children: mahasiswaTabs },
    { label: "Penelitian", href: "/penelitian", match: "/penelitian" },
    { label: "Pengabdian", href: "/pengabdian/dosen", match: "/pengabdian", children: pengabdianTabs },
    { label: "Kerja Sama", href: "/kerja-sama", match: "/kerja-sama" },
    { label: "Berita", href: "/berita", match: "/berita" },
  ];
}

export function mediaUrl(path: string | null | undefined): string | null {
  return path ? `/media/${path}` : null;
}
