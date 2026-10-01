const actions: Record<string, string> = {
  create: "menambah",
  update: "mengubah",
  delete: "menghapus",
  login: "masuk",
  logout: "keluar",
  upload: "mengunggah",
  publish: "menerbitkan",
};

const entities: Record<string, string> = {
  news: "berita",
  news_category: "kategori berita",
  tag: "label",
  achievement: "prestasi",
  research: "penelitian",
  community_service: "pengabdian",
  lecturer: "dosen",
  accreditation: "akreditasi",
  facility: "fasilitas",
  course: "mata kuliah",
  document: "dokumen",
  program: "program kegiatan",
  organization: "lembaga",
  alumnus: "alumni",
  partnership: "kerja sama",
  page_block: "halaman",
  mission: "misi",
  media: "media",
  setting: "pengaturan",
  user: "pengguna",
};

export function actionLabel(a: string) {
  return actions[a] ?? a;
}

export function entityLabel(e: string) {
  return entities[e] ?? e;
}

export const entityOptions = Object.entries(entities).map(([value, label]) => ({ value, label }));
