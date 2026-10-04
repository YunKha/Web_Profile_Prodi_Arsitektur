/**
 * Daftar blok teks editorial per halaman (tabel page_blocks). Editor "Halaman"
 * di admin dibangun dari daftar ini, sehingga admin hanya melihat field yang
 * benar-benar dipakai halaman publik.
 */

/** "link" = URL + label tombol; "gallery" = beberapa gambar berketerangan. */
export type BlockField = "title" | "body" | "image" | "link" | "gallery";

export type BlockDef = { key: string; label: string; fields: BlockField[]; hint?: string };

export type PageDef = { key: string; label: string; path: string; blocks: BlockDef[] };

const hero = (fields: BlockField[] = ["title", "body", "image"]): BlockDef => ({
  key: "hero",
  label: "Hero (judul & latar)",
  fields,
  hint: "Judul besar di bagian atas halaman, paragraf pembuka, dan foto latar.",
});

export const pageRegistry: PageDef[] = [
  {
    key: "beranda",
    label: "Beranda",
    path: "/",
    blocks: [
      hero(),
      { key: "cta", label: "Ajakan Visi & Masa Depan", fields: ["title", "body", "image"], hint: "Seksi foto besar sebelum daftar mitra." },
    ],
  },
  {
    key: "profil",
    label: "Profil — Visi & Misi",
    path: "/profil",
    blocks: [
      hero(["title", "image"]),
      { key: "sejarah", label: "Sejarah", fields: ["title", "body", "image"], hint: "Pisahkan paragraf dengan baris kosong." },
      {
        key: "struktur",
        label: "Struktur Organisasi",
        fields: ["title", "body", "image"],
        hint: "Bagan struktur organisasi prodi, tampil setelah Sejarah. Unggah gambar (PNG/JPG) resolusi tinggi agar teks terbaca.",
      },
      { key: "visi", label: "Visi", fields: ["body"] },
      { key: "misi-intro", label: "Pengantar Visi & Misi", fields: ["title", "body"] },
    ],
  },
  {
    key: "akreditasi",
    label: "Profil — Akreditasi",
    path: "/profil/akreditasi",
    blocks: [hero(), { key: "intro", label: "Pengantar", fields: ["title", "body"] }],
  },
  {
    key: "dosen-staf",
    label: "Profil — Dosen & Staf",
    path: "/profil/dosen-staf",
    blocks: [hero(["title", "body"]), { key: "intro", label: "Pengantar daftar", fields: ["title", "body"] }],
  },
  { key: "fasilitas", label: "Fasilitas — Ringkasan", path: "/fasilitas", blocks: [hero()] },
  {
    key: "kurikulum",
    label: "Akademik — Kurikulum",
    path: "/akademik/kurikulum",
    blocks: [hero(), { key: "intro", label: "Narasi kurikulum", fields: ["title", "body", "image"] }],
  },
  { key: "rps", label: "Akademik — RPS", path: "/akademik/rps", blocks: [hero(["title", "body"])] },
  {
    key: "panduan-ta",
    label: "Akademik — Panduan TA",
    path: "/akademik/panduan-ta",
    blocks: [
      hero(),
      {
        key: "tahapan",
        label: "Judul seksi jalur & tahapan",
        fields: ["title", "body"],
        hint: "Jalur Tugas Akhir dan tahapannya diatur di menu Jalur Tugas Akhir.",
      },
      {
        key: "repositori",
        label: "Repositori judul Tugas Akhir",
        fields: ["title", "body", "link"],
        hint: "Tautan Google Drive berisi daftar judul TA yang sudah dipakai, agar judul baru tidak sama.",
      },
    ],
  },
  {
    key: "kegiatan-akademik",
    label: "Mahasiswa — Kegiatan Akademik",
    path: "/mahasiswa/kegiatan-akademik",
    blocks: [
      hero(),
      { key: "intro", label: "Pengantar (2 kolom)", fields: ["title", "body", "image"] },
      { key: "program", label: "Judul daftar program", fields: ["title", "body"] },
    ],
  },
  {
    key: "kegiatan-nonakademik",
    label: "Mahasiswa — Kegiatan Nonakademik",
    path: "/mahasiswa/kegiatan-nonakademik",
    blocks: [
      hero(),
      { key: "intro", label: "Pengantar (2 kolom)", fields: ["title", "body", "image"] },
      { key: "program", label: "Judul daftar program", fields: ["title", "body"] },
    ],
  },
  {
    key: "lembaga",
    label: "Mahasiswa — Lembaga",
    path: "/mahasiswa/lembaga",
    blocks: [hero(), { key: "intro", label: "Pengantar (2 kolom)", fields: ["title", "body", "image"] }],
  },
  { key: "prestasi", label: "Mahasiswa — Prestasi", path: "/mahasiswa/prestasi", blocks: [hero(["title", "body"])] },
  {
    key: "alumni",
    label: "Mahasiswa — Alumni",
    path: "/mahasiswa/alumni",
    blocks: [
      hero(),
      {
        key: "tracer",
        label: "Tracer study",
        fields: ["title", "body", "link"],
        hint: "Angka statistik diatur di Pengaturan → Statistik Alumni. Tautan mengarah ke Google Drive bukti tracer study.",
      },
    ],
  },
  {
    key: "penelitian",
    label: "Penelitian",
    path: "/penelitian",
    blocks: [
      hero(),
      {
        key: "roadmap",
        label: "Roadmap penelitian",
        fields: ["title", "body", "link", "gallery"],
        hint: "Tautan Google Drive dokumen roadmap, dan satu gambar per tema roadmap (isi keterangan dengan nama tema).",
      },
      { key: "cta", label: "Ajakan di akhir halaman", fields: ["title", "body"] },
    ],
  },
  {
    key: "pengabdian-dosen",
    label: "Pengabdian — Dosen",
    path: "/pengabdian/dosen",
    blocks: [hero(), { key: "intro", label: "Pengantar", fields: ["title", "body", "image"] }],
  },
  {
    key: "pengabdian-mahasiswa",
    label: "Pengabdian — Mahasiswa",
    path: "/pengabdian/mahasiswa",
    blocks: [hero(), { key: "intro", label: "Pengantar", fields: ["title", "body", "image"] }],
  },
  { key: "kerja-sama", label: "Kerja Sama", path: "/kerja-sama", blocks: [hero(["title", "body"])] },
  { key: "berita", label: "Berita", path: "/berita", blocks: [hero(["title", "body"])] },
  {
    key: "kebijakan-privasi",
    label: "Kebijakan Privasi",
    path: "/kebijakan-privasi",
    blocks: [{ key: "content", label: "Isi halaman", fields: ["title", "body"], hint: "Pisahkan paragraf dengan baris kosong." }],
  },
  {
    key: "syarat-ketentuan",
    label: "Syarat & Ketentuan",
    path: "/syarat-ketentuan",
    blocks: [{ key: "content", label: "Isi halaman", fields: ["title", "body"], hint: "Pisahkan paragraf dengan baris kosong." }],
  },
];

export function findPage(key: string) {
  return pageRegistry.find((p) => p.key === key);
}
