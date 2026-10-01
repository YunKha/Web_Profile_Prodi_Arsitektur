/**
 * Bentuk pengaturan situs (tabel site_settings, satu baris per kunci).
 * Nilai default dipakai bila baris belum ada atau ada field yang hilang.
 */

export type LinkSetting = { label: string; url: string };

export type SiteSettings = {
  contact: { address: string; email: string; phone: string; mapUrl: string };
  social: { twitter: string; instagram: string; youtube: string };
  /** Jumlah dosen dihitung dari tabel dosen; akreditasi dari akreditasi aktif. */
  stats: { foundedYear: number; studentCount: number; alumniCount: number };
  footer: { tagline: string; copyright: string; academicLinks: LinkSetting[]; serviceLinks: LinkSetting[] };
  home: {
    heroEyebrow: string;
    leaderLecturerId: number | null;
    leaderQuote: string;
    leaderTitle: string;
    managementIds: number[];
  };
  alumniStats: { value: string; label: string }[];
};

export const settingKeys = ["contact", "social", "stats", "footer", "home", "alumniStats"] as const;
export type SettingKey = (typeof settingKeys)[number];

export const defaultSettings: SiteSettings = {
  contact: {
    address:
      "Gedung Fakultas Teknik, Universitas Tadulako\nJl. Soekarno Hatta KM. 9, Tondo, Palu, Sulawesi Tengah 94148",
    email: "arsitektur@untad.ac.id",
    phone: "+62 (451) 422611 Ext. 123",
    mapUrl: "https://maps.google.com/?q=Fakultas+Teknik+Universitas+Tadulako",
  },
  social: { twitter: "", instagram: "", youtube: "" },
  stats: { foundedYear: 1998, studentCount: 450, alumniCount: 1200 },
  footer: {
    tagline:
      "Membangun generasi arsitek yang unggul, berkarakter, dan berwawasan lingkungan untuk merespon dinamika perkembangan ruang dan pemukiman.",
    copyright: "© {year} Program Studi Arsitektur Universitas Tadulako. Seluruh hak cipta dilindungi.",
    academicLinks: [
      { label: "Kurikulum Arsitektur", url: "/akademik/kurikulum" },
      { label: "Kalender Akademik", url: "#" },
      { label: "Sistem Informasi Akademik", url: "https://siakad.untad.ac.id" },
      { label: "Pedoman Tugas Akhir", url: "/akademik/panduan-ta" },
      { label: "Jurnal Ruang & Rancang", url: "#" },
    ],
    serviceLinks: [
      { label: "Studio & Laboratorium", url: "/fasilitas" },
      { label: "Perpustakaan Referensi", url: "#" },
      { label: "Himpunan Mahasiswa (HIMAART)", url: "/mahasiswa/lembaga" },
      { label: "Beasiswa", url: "#" },
      { label: "Layanan Konseling Akademik", url: "#" },
    ],
  },
  home: {
    heroEyebrow: "Jurusan Arsitektur UNTAD",
    leaderLecturerId: null,
    leaderQuote:
      "Selamat datang di Jurusan Arsitektur Universitas Tadulako. Kami berfokus pada pengembangan kreativitas dan integritas profesional untuk melahirkan arsitek yang mampu merespon dinamika global melalui pendekatan lokal yang inovatif.",
    leaderTitle: "Koordinator Program Studi",
    managementIds: [],
  },
  alumniStats: [
    { value: "92%", label: "Bekerja < 6 bulan" },
    { value: "4,2 bln", label: "Rata-rata masa tunggu" },
    { value: "68%", label: "Bekerja di bidang arsitektur" },
    { value: "1.200+", label: "Jejaring alumni" },
  ],
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Gabungkan nilai tersimpan dengan default secara dangkal per kunci. */
export function mergeSettings(rows: { key: string; value: unknown }[]): SiteSettings {
  const out = structuredClone(defaultSettings) as Record<string, unknown>;
  for (const row of rows) {
    if (!(settingKeys as readonly string[]).includes(row.key)) continue;
    const def = out[row.key];
    if (Array.isArray(def)) {
      if (Array.isArray(row.value)) out[row.key] = row.value;
    } else if (isObject(def) && isObject(row.value)) {
      out[row.key] = { ...def, ...row.value };
    }
  }
  return out as SiteSettings;
}
