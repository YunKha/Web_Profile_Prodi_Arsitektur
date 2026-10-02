/**
 * Seed data awal. Jalankan: `npm run db:seed`.
 *
 * Isi diambil dari contoh teks pada desain Figma "Abala" dan masih berupa data
 * CONTOH (mis. dosen, nomor SK, mitra) yang harus diganti dengan data asli lewat admin.
 * Foto contoh ada di prisma/seed-assets/ dan disalin ke folder unggahan (storage/uploads/seed).
 *
 * Aman dijalankan ulang:
 *  - baris dengan kunci alami (slug/kode/key/path) di-upsert tanpa menimpa isi yang sudah diedit,
 *  - tabel tanpa kunci alami hanya diisi bila masih kosong,
 *  - password admin yang sudah ada tidak ditimpa.
 */
import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { imageSize } from "image-size";
import { createPrismaClient } from "../src/lib/db/create-client";

const db = createPrismaClient(2);

const ASSETS = path.join(process.cwd(), "prisma", "seed-assets");
const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "storage", "uploads"),
);

// ───────────────────────── Media ─────────────────────────

const mediaCache = new Map<string, number>();

async function storeFile(rel: string, buf: Buffer) {
  await mkdir(path.dirname(path.join(UPLOAD_DIR, rel)), { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, rel), buf);
}

/** Salin foto contoh ke folder unggahan dan buat baris media (sekali). */
async function image(file: string, altText: string): Promise<number> {
  const rel = `seed/${file}`;
  const cached = mediaCache.get(rel);
  if (cached) return cached;
  let row = await db.media.findUnique({ where: { path: rel } });
  if (!row) {
    const buf = await readFile(path.join(ASSETS, file));
    await storeFile(rel, buf);
    const dim = imageSize(buf);
    row = await db.media.create({
      data: {
        path: rel,
        mime: buf[0] === 0xff ? "image/jpeg" : "image/png",
        sizeBytes: buf.length,
        width: dim.width ?? null,
        height: dim.height ?? null,
        altText,
        originalName: file,
      },
    });
  }
  mediaCache.set(rel, row.id);
  return row.id;
}

/** PDF satu halaman berisi judul, sebagai dokumen contoh yang bisa diunduh. */
function makePdf(title: string, subtitle: string): Buffer {
  const esc = (s: string) =>
    s.replace(/[\\()]/g, (c) => `\\${c}`).replace(/[^\x20-\x7e]/g, "-");
  const content = `BT /F1 22 Tf 72 760 Td (${esc(title)}) Tj ET\nBT /F1 12 Tf 72 730 Td (${esc(subtitle)}) Tj ET\nBT /F1 10 Tf 72 700 Td (Dokumen contoh - ganti lewat panel admin.) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets
    .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
    .join("");
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

async function pdf(
  name: string,
  title: string,
  subtitle = "Program Studi Arsitektur Universitas Tadulako",
): Promise<number> {
  const rel = `seed/${name}.pdf`;
  const cached = mediaCache.get(rel);
  if (cached) return cached;
  let row = await db.media.findUnique({ where: { path: rel } });
  if (!row) {
    const buf = makePdf(title, subtitle);
    await storeFile(rel, buf);
    row = await db.media.create({
      data: {
        path: rel,
        mime: "application/pdf",
        sizeBytes: buf.length,
        originalName: `${name}.pdf`,
        altText: title,
      },
    });
  }
  mediaCache.set(rel, row.id);
  return row.id;
}

const IMG = {
  hero: () =>
    image("hero-architecture.png", "Fasad bangunan arsitektur modern"),
  cta: () => image("cta-model.jpg", "Maket rumah tradisional di studio"),
  news1: () =>
    image("news-1.png", "Mahasiswa mempresentasikan maket di ruang studio"),
  news2: () => image("news-2.png", "Rumah adat dengan latar gunung"),
  news3: () => image("news-3.png", "Detail material kayu lengkung"),
  karya1: () => image("karya-1.png", "Potret mahasiswa arsitektur"),
  karya2: () => image("karya-2.png", "Potret mahasiswa arsitektur berkacamata"),
  juara: () => image("juara-1.png", "Potret mahasiswi juara kompetisi"),
  staff: (n: 1 | 2 | 3 | 4) =>
    image(`staff-${n}.jpg`, "Foto pimpinan program studi"),
  partner: (n: number) => image(`partner-${n}.jpg`, "Logo mitra"),
};

// ───────────────────────── Akun & pengaturan ─────────────────────────

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL dan SEED_ADMIN_PASSWORD wajib diisi di .env.",
    );
  }
  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD minimal 8 karakter.");
  }
  return db.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Administrator",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    },
  });
}

async function upsertSetting(key: string, value: object) {
  await db.siteSetting.upsert({
    where: { key },
    update: {},
    create: { key, value },
  });
}

async function seedSettings(leaderId: number, managementIds: number[]) {
  await upsertSetting("contact", {
    address:
      "Gedung Fakultas Teknik, Universitas Tadulako\nJl. Soekarno Hatta KM. 9, Tondo, Palu, Sulawesi Tengah 94148",
    email: "arsitektur@untad.ac.id",
    phone: "+62 (451) 422611 Ext. 123",
    mapUrl: "https://maps.google.com/?q=Fakultas+Teknik+Universitas+Tadulako",
  });
  await upsertSetting("social", { twitter: "", instagram: "", youtube: "" });
  await upsertSetting("stats", {
    foundedYear: 1998,
    studentCount: 450,
    alumniCount: 1200,
  });
  await upsertSetting("footer", {
    tagline:
      "Membangun generasi arsitek yang unggul, berkarakter, dan berwawasan lingkungan untuk merespon dinamika perkembangan ruang dan pemukiman.",
    copyright:
      "© {year} Program Studi Arsitektur Universitas Tadulako. Seluruh hak cipta dilindungi.",
  });
  await upsertSetting("home", {
    heroEyebrow: "Jurusan Arsitektur UNTAD",
    leaderLecturerId: leaderId,
    leaderQuote:
      "Selamat datang di Jurusan Arsitektur Universitas Tadulako. Kami berfokus pada pengembangan kreativitas dan integritas profesional untuk melahirkan arsitek yang mampu merespon dinamika global melalui pendekatan lokal yang inovatif.",
    leaderTitle: "Koordinator Program Studi",
    managementIds,
  });
}

// ───────────────────────── Blok halaman ─────────────────────────

type BlockSeed = {
  pageKey: string;
  blockKey: string;
  title?: string;
  body?: string;
  image?: () => Promise<number>;
  sortOrder?: number;
};

async function seedBlocks(blocks: BlockSeed[]) {
  for (const b of blocks) {
    const where = {
      pageKey_blockKey: { pageKey: b.pageKey, blockKey: b.blockKey },
    };
    const existing = await db.pageBlock.findUnique({ where });
    const imageId = b.image ? await b.image() : null;
    if (!existing) {
      await db.pageBlock.create({
        data: {
          pageKey: b.pageKey,
          blockKey: b.blockKey,
          title: b.title ?? null,
          body: b.body ?? null,
          imageId,
          sortOrder: b.sortOrder ?? 0,
        },
      });
    } else if (imageId && !existing.imageId) {
      await db.pageBlock.update({ where, data: { imageId } });
    }
  }
}

async function seedPageBlocks() {
  await seedBlocks([
    {
      pageKey: "beranda",
      blockKey: "hero",
      title: "Membangun Generasi Arsitek yang Kreatif & Berkelanjutan",
      body: "Bergabunglah bersama kami menciptakan desain arsitektur masa depan yang responsif terhadap lingkungan dan kearifan lokal.",
      image: IMG.hero,
    },
    {
      pageKey: "beranda",
      blockKey: "cta",
      title: "Membangun Solusi Digital untuk Masa Depan yang Terhubung.",
      body: "Kami berkomitmen mencetak profesional Arsitektur yang inovatif, adaptif, dan mampu menghadirkan solusi desain yang relevan bagi masyarakat dan industri di era digital.",
      image: IMG.cta,
    },
    {
      pageKey: "profil",
      blockKey: "hero",
      title: "Profil Program Studi Arsitektur",
      image: IMG.hero,
    },
    {
      pageKey: "profil",
      blockKey: "sejarah",
      title: "Jejak Langkah Arsitektur UNTAD",
      body: "Program Studi Arsitektur Universitas Tadulako didirikan dengan semangat untuk merespons kebutuhan mendesak akan tenaga ahli perancang bangunan dan lingkungan binaan di wilayah Sulawesi Tengah. Sejak awal berdirinya, kami berkomitmen untuk mengintegrasikan prinsip-prinsip arsitektur tropis nusantara dengan inovasi teknologi modern.\n\nPerjalanan panjang kami diwarnai dengan dedikasi untuk mencetak arsitek-arsitek yang tidak hanya piawai dalam merancang bentuk, tetapi juga memiliki kepekaan sosial dan lingkungan. Kurikulum yang terus beradaptasi dengan perkembangan zaman memastikan lulusan kami siap menghadapi tantangan global sekaligus tetap berpijak pada nilai-nilai kearifan lokal.",
      image: IMG.news2,
    },
    {
      pageKey: "profil",
      blockKey: "visi",
      title: "Visi",
      body: "Menjadi Program Studi Arsitektur yang unggul dalam merancang lingkungan binaan berbasis arsitektur tropis dan kearifan lokal berstandar internasional pada tahun 2030.",
    },
    {
      pageKey: "profil",
      blockKey: "misi-intro",
      title: "Visi & Misi",
      body: "Arah dan komitmen kami dalam menyelenggarakan tridharma perguruan tinggi di bidang arsitektur.",
    },
    {
      pageKey: "akreditasi",
      blockKey: "hero",
      title: "Akreditasi Program Studi",
      body: "Bukti komitmen kami terhadap mutu pendidikan arsitektur.",
      image: IMG.hero,
    },
    {
      pageKey: "akreditasi",
      blockKey: "intro",
      title: "Pengakuan & Akreditasi",
      body: "Program Studi Arsitektur Universitas Tadulako terus berkomitmen untuk menyelenggarakan pendidikan tinggi berkualitas. Status akreditasi kami mencerminkan standar akademik, fasilitas, dan kompetensi lulusan yang diakui secara nasional.",
    },
    {
      pageKey: "dosen-staf",
      blockKey: "hero",
      title: "Dosen & Staf",
      body: "Tenaga pengajar dan kependidikan yang berdedikasi membimbing generasi arsitek masa depan.",
    },
    {
      pageKey: "dosen-staf",
      blockKey: "intro",
      title: "Tim Pengajar Kami",
      body: "Kenali para dosen dan staf Program Studi Arsitektur beserta bidang keahliannya.",
    },
    {
      pageKey: "fasilitas",
      blockKey: "hero",
      title: "Fasilitas Kampus",
      body: "Ruang belajar, studio, dan laboratorium yang mendukung proses kreatif mahasiswa arsitektur.",
      image: IMG.news1,
    },
    {
      pageKey: "kurikulum",
      blockKey: "hero",
      title: "Kurikulum",
      body: "Struktur pembelajaran yang memadukan teori, teknologi, dan studio perancangan.",
      image: IMG.news3,
    },
    {
      pageKey: "kurikulum",
      blockKey: "intro",
      title: "Kurikulum Berbasis Kompetensi & Desain",
      body: "Program Studi Arsitektur Universitas Tadulako menerapkan kurikulum yang dirancang untuk merespons dinamika perkembangan arsitektur global, urbanisasi, dan teknologi bangunan. Pendekatan kami menitikberatkan pada pembelajaran berbasis proyek (Project-Based Learning) dengan Studio Perancangan sebagai inti proses belajar.\n\nLulusan kami dipersiapkan untuk memiliki kepekaan terhadap konteks lokal—khususnya arsitektur vernakular dan mitigasi bencana di wilayah tropis—serta kemampuan teknis bertaraf internasional.",
      image: IMG.cta,
    },
    {
      pageKey: "rps",
      blockKey: "hero",
      title: "Rencana Pembelajaran Semester",
      body: "Unduh RPS setiap mata kuliah Program Studi Arsitektur. Cari berdasarkan nama atau kode, atau saring per semester.",
    },
    {
      pageKey: "panduan-ta",
      blockKey: "hero",
      title: "Panduan Tugas Akhir Mahasiswa",
      body: "Informasi lengkap, prosedur, dan dokumen pendukung yang diperlukan mahasiswa Program Studi Arsitektur dalam menyelesaikan Tugas Akhir (TA) dengan standar akademik tertinggi.",
      image: IMG.news1,
    },
    {
      pageKey: "panduan-ta",
      blockKey: "tahapan",
      title: "Tahapan Tugas Akhir",
      body: "Empat tahapan utama yang dilalui mahasiswa dari pengajuan judul hingga sidang akhir.",
    },
    ...[
      [
        "Pengajuan Judul",
        "Mahasiswa mengajukan proposal pra-desain beserta usulan dosen pembimbing kepada komisi Tugas Akhir.",
      ],
      [
        "Seminar Proposal",
        "Presentasi konsep awal dan landasan teori di hadapan dosen penguji untuk mendapatkan persetujuan desain.",
      ],
      [
        "Proses Studio & Asistensi",
        "Pengembangan desain secara komprehensif melalui bimbingan rutin minimal 8 kali pertemuan dengan dosen pembimbing.",
      ],
      [
        "Sidang Akhir",
        "Evaluasi akhir karya desain arsitektur di hadapan dewan penguji sebagai syarat kelulusan program sarjana.",
      ],
    ].map(([title, body], i) => ({
      pageKey: "panduan-ta",
      blockKey: `tahap-${i + 1}`,
      title,
      body,
      sortOrder: i + 1,
    })),
    {
      pageKey: "kegiatan-akademik",
      blockKey: "hero",
      title: "Kegiatan Akademik",
      body: "Pembelajaran berbasis proyek, kuliah tamu, dan pelatihan yang membentuk arsitek berdaya saing.",
      image: IMG.news1,
    },
    {
      pageKey: "kegiatan-akademik",
      blockKey: "intro",
      title: "Merancang Masa Depan Melalui Praktik Akademik",
      body: "Kegiatan akademik di Program Studi Arsitektur UNTAD tidak hanya terbatas pada teori di dalam kelas. Kami menekankan pembelajaran berbasis proyek (Project-Based Learning) yang diwujudkan melalui Studio Perancangan Arsitektur (SPA).\n\nMahasiswa didorong untuk terus bereksperimen, memahami konteks lokal, dan mengaplikasikan teknologi desain terkini untuk merespons tantangan arsitektur kontemporer.",
      image: IMG.cta,
    },
    {
      pageKey: "kegiatan-akademik",
      blockKey: "program",
      title: "Program Unggulan",
      body: "Kegiatan akademik utama yang membentuk kompetensi mahasiswa.",
    },
    {
      pageKey: "kegiatan-nonakademik",
      blockKey: "hero",
      title: "Kegiatan Nonakademik",
      body: "Organisasi, bakti sosial, dan festival kampus untuk mengasah kepemimpinan dan kreativitas.",
      image: IMG.news2,
    },
    {
      pageKey: "kegiatan-nonakademik",
      blockKey: "intro",
      title: "Mengembangkan Kepemimpinan dan Kreativitas Mahasiswa",
      body: "UNTAD Arsitektur menyadari bahwa menjadi seorang arsitek yang unggul membutuhkan lebih dari sekadar pengetahuan teknis. Kami mendorong mahasiswa untuk aktif dalam berbagai organisasi kemahasiswaan, kegiatan bakti sosial, serta aktivitas olahraga dan kesenian.\n\nMelalui keterlibatan ini, mahasiswa belajar untuk berkolaborasi dalam tim multidisiplin, mengasah jiwa kepemimpinan, dan mengembangkan kepekaan sosial terhadap lingkungan sekitar—keterampilan esensial bagi calon pemimpin masa depan di bidang rancang bangun.",
      image: IMG.news1,
    },
    {
      pageKey: "kegiatan-nonakademik",
      blockKey: "program",
      title: "Program Kemahasiswaan",
      body: "Wadah pengembangan minat, bakat, dan kepedulian sosial mahasiswa.",
    },
    {
      pageKey: "lembaga",
      blockKey: "hero",
      title: "Lembaga",
      body: "Organisasi dan komunitas mahasiswa yang menjadi ruang tumbuh di luar kelas.",
      image: IMG.hero,
    },
    {
      pageKey: "lembaga",
      blockKey: "intro",
      title: "Ruang Tumbuh Bersama di Luar Studio",
      body: "Lembaga kemahasiswaan di Program Studi Arsitektur UNTAD menjadi wadah bagi mahasiswa untuk berorganisasi, berkompetisi, dan berkarya bersama. Melalui lembaga, mahasiswa ditantang untuk berpikir kritis, merespons isu-isu urban kontemporer, dan mempresentasikan gagasan di hadapan publik.\n\nSetiap lembaga didampingi dosen pembina agar kegiatan tetap selaras dengan tujuan akademik program studi.",
      image: IMG.news1,
    },
    {
      pageKey: "prestasi",
      blockKey: "hero",
      title: "Prestasi Mahasiswa",
      body: "Capaian mahasiswa Arsitektur UNTAD di berbagai kompetisi tingkat lokal, nasional, dan internasional.",
    },
    {
      pageKey: "alumni",
      blockKey: "hero",
      title: "Alumni",
      body: "Jejaring lulusan yang berkarya sebagai arsitek, perencana, akademisi, dan wirausahawan.",
      image: IMG.hero,
    },
    {
      pageKey: "alumni",
      blockKey: "tracer",
      title: "Tracer Study Lulusan",
      body: "Ringkasan hasil penelusuran lulusan Program Studi Arsitektur Universitas Tadulako.",
    },
    {
      pageKey: "penelitian",
      blockKey: "hero",
      title: "Penelitian",
      body: "Riset dosen dan mahasiswa tentang arsitektur tropis, kebencanaan, material lokal, dan perancangan kota.",
      image: IMG.news2,
    },
    {
      pageKey: "penelitian",
      blockKey: "cta",
      title: "Eksplorasi Hasil Penelitian Program Studi Arsitektur",
      body: "Temukan publikasi dan laporan penelitian dosen serta mahasiswa, atau hubungi kami untuk kolaborasi riset.",
    },
    {
      pageKey: "pengabdian-dosen",
      blockKey: "hero",
      title: "Pengabdian Kepada Masyarakat",
      body: "Penerapan ilmu arsitektur untuk meningkatkan kualitas ruang hidup masyarakat.",
      image: IMG.news2,
    },
    {
      pageKey: "pengabdian-dosen",
      blockKey: "intro",
      title: "Pengabdian Dosen",
      body: "Dosen Program Studi Arsitektur Universitas Tadulako secara aktif menerapkan pengetahuan dan keahlian mereka untuk memecahkan masalah nyata di masyarakat. Melalui program pendampingan, perencanaan kawasan, hingga edukasi mitigasi bencana, dedikasi ini merupakan wujud tridharma perguruan tinggi yang berkelanjutan.",
      image: IMG.cta,
    },
    {
      pageKey: "pengabdian-mahasiswa",
      blockKey: "hero",
      title: "Membangun Bersama Masyarakat",
      body: "Program pengabdian mahasiswa Arsitektur UNTAD mengaplikasikan teori akademis ke dalam solusi desain praktis untuk meningkatkan kualitas lingkungan binaan lokal.",
      image: IMG.news1,
    },
    {
      pageKey: "pengabdian-mahasiswa",
      blockKey: "intro",
      title: "Pengabdian Mahasiswa",
      body: "Mahasiswa Arsitektur UNTAD secara aktif terlibat dalam berbagai proyek pengabdian masyarakat yang berfokus pada perbaikan infrastruktur desa, desain fasilitas umum, dan pendampingan teknis pembangunan.\n\nPendekatan kami mengutamakan desain partisipatif, di mana masyarakat lokal dilibatkan sebagai subjek utama dalam proses perencanaan, memastikan bahwa setiap intervensi arsitektural bersifat berkelanjutan dan memiliki dampak jangka panjang yang positif.",
      image: IMG.news2,
    },
    {
      pageKey: "kerja-sama",
      blockKey: "hero",
      title: "Kerja Sama & Kemitraan",
      body: "Kolaborasi strategis dengan pemerintah, asosiasi profesi, dan industri untuk memperkuat pendidikan, riset, dan pengabdian.",
    },
    {
      pageKey: "berita",
      blockKey: "hero",
      title: "Berita & Informasi",
      body: "Update terbaru seputar kegiatan akademik, penelitian, penghargaan, dan informasi penting lainnya dari Program Studi Arsitektur UNTAD.",
    },
    {
      pageKey: "kebijakan-privasi",
      blockKey: "content",
      title: "Kebijakan Privasi",
      body: "Website ini dikelola oleh Program Studi Arsitektur Universitas Tadulako. Kami tidak meminta pengunjung membuat akun dan tidak mengumpulkan data pribadi pengunjung selain data teknis anonim (mis. jumlah tayangan halaman).\n\nData dosen dan mahasiswa yang ditampilkan (nama, email institusi, NIDN, NIM) dipublikasikan atas persetujuan yang bersangkutan untuk keperluan informasi akademik.\n\nPertanyaan atau permintaan penghapusan data dapat dikirim ke alamat email program studi yang tercantum di bagian Hubungi Kami.",
    },
    {
      pageKey: "syarat-ketentuan",
      blockKey: "content",
      title: "Syarat & Ketentuan",
      body: "Seluruh konten pada website ini disediakan untuk keperluan informasi. Dokumen akademik (RPS, kurikulum, panduan) dapat diunduh dan digunakan untuk keperluan pembelajaran.\n\nPenggunaan ulang foto dan karya mahasiswa untuk keperluan komersial memerlukan izin tertulis dari Program Studi Arsitektur Universitas Tadulako.",
    },
  ]);

  if ((await db.missionItem.count()) === 0) {
    await db.missionItem.createMany({
      data: [
        {
          title: "Pendidikan",
          body: "Menyelenggarakan pendidikan arsitektur yang berkualitas, inovatif, dan relevan dengan kebutuhan masyarakat serta perkembangan teknologi dengan pendekatan studio-based learning.",
          sortOrder: 1,
        },
        {
          title: "Penelitian",
          body: "Mengembangkan penelitian terapan di bidang arsitektur tropis, perumahan permukiman, dan perancangan kota yang berkontribusi pada pengembangan ilmu pengetahuan dan solusi masalah lingkungan binaan.",
          sortOrder: 2,
        },
        {
          title: "Pengabdian",
          body: "Melaksanakan pengabdian kepada masyarakat melalui penerapan ilmu arsitektur untuk meningkatkan kualitas ruang hidup dan kesejahteraan masyarakat.",
          sortOrder: 3,
        },
      ],
    });
  }
}

// ───────────────────────── Profil ─────────────────────────

async function seedAccreditation() {
  let acc = await db.accreditation.findFirst({ where: { isCurrent: true } });
  if (!acc) {
    acc = await db.accreditation.create({
      data: {
        agency: "Badan Akreditasi Nasional Perguruan Tinggi",
        skNumber: "1234/SK/BAN-PT/Akred/S/VIII/2023", // contoh dari Figma
        rank: "Unggul",
        validFrom: new Date("2023-08-15"),
        validTo: new Date("2028-08-15"),
        isCurrent: true,
      },
    });
  }
  const docs = [
    ["sertifikat", "sertifikat-akreditasi", "Sertifikat Akreditasi"],
    ["lkps", "laporan-lkps", "Laporan Kinerja Program Studi (LKPS)"],
    ["led", "laporan-led", "Laporan Evaluasi Diri (LED)"],
  ] as const;
  for (const [type, file, title] of docs) {
    const mediaId = await pdf(file, title);
    await db.accreditationDocument.upsert({
      where: { accreditationId_type: { accreditationId: acc.id, type } },
      update: {},
      create: { accreditationId: acc.id, type, mediaId },
    });
  }
}

async function seedLecturers() {
  const lecturers = [
    {
      slug: "budi-santoso",
      fullName: "Budi Santoso",
      frontTitle: "Prof. Dr. Ir.",
      backTitle: "MSA",
      structuralRole: "Ketua Program Studi",
      expertise: "Perancangan Kota & Perumahan",
      email: "b.santoso@untad.ac.id",
      academicRank: "Guru Besar",
      civilRank: "Pembina Utama, IV/e",
      studyProgram: "S1 Arsitektur",
      startYear: 1998,
      nidn: "0011223344",
      nuptk: "1234567890123456",
      sintaId: "6012345",
      scopusId: "5719000000",
      orcidId: "0000-0002-1234-5678",
      sintaUrl: "https://sinta.kemdikbud.go.id",
      scholarUrl: "https://scholar.google.com",
      photo: () => IMG.staff(1),
    },
    {
      slug: "anita-wijayanti",
      fullName: "Anita Wijayanti",
      frontTitle: "Dr.",
      backTitle: "ST., MT",
      structuralRole: "Dosen Tetap",
      expertise: "Sejarah & Teori Arsitektur",
      email: "anita.w@untad.ac.id",
      academicRank: "Lektor Kepala",
      studyProgram: "S1 Arsitektur",
      startYear: 2008,
      scholarUrl: "https://scholar.google.com",
      photo: () => IMG.juara(),
    },
    {
      slug: "hendra-gunawan",
      fullName: "Hendra Gunawan",
      frontTitle: "Ir.",
      backTitle: "M.Arch",
      structuralRole: "Kepala Studio Perancangan",
      expertise: "Teknologi Bangunan & Struktur",
      email: "hendra.g@untad.ac.id",
      academicRank: "Lektor",
      studyProgram: "S1 Arsitektur",
      startYear: 2012,
      websiteUrl: "https://untad.ac.id",
      photo: () => IMG.karya2(),
    },
    {
      slug: "siti-aminah",
      fullName: "Siti Aminah",
      frontTitle: null,
      backTitle: "ST., M.Sc",
      structuralRole: "Dosen Muda",
      expertise: "Arsitektur Lanskap & Ekologi Lingkungan",
      email: "siti.aminah@untad.ac.id",
      academicRank: "Asisten Ahli",
      studyProgram: "S1 Arsitektur",
      startYear: 2019,
      photo: () => IMG.staff(3),
    },
    {
      slug: "sarah-wijaya",
      fullName: "Sarah Wijaya",
      frontTitle: "Dr. Arch.",
      backTitle: "M.T.",
      structuralRole: "Koordinator Program Studi",
      expertise: "Arsitektur Tropis & Perancangan Berkelanjutan",
      email: "sarah.wijaya@untad.ac.id",
      academicRank: "Lektor Kepala",
      studyProgram: "S1 Arsitektur",
      startYear: 2005,
      photo: () => IMG.karya1(),
    },
    {
      slug: "akhmad-fauzi",
      fullName: "Akhmad Fauzi",
      frontTitle: "Ir.",
      backTitle: "M.T.",
      structuralRole: "Sekretaris Jurusan",
      expertise: "Manajemen Konstruksi",
      email: "akhmad.fauzi@untad.ac.id",
      academicRank: "Lektor",
      studyProgram: "S1 Arsitektur",
      startYear: 2007,
      photo: () => IMG.staff(1),
    },
    {
      slug: "herianto",
      fullName: "Herianto",
      frontTitle: null,
      backTitle: "S.T., M.Sc.",
      structuralRole: "Koord. Kemahasiswaan",
      expertise: "Arsitektur Perilaku",
      email: "herianto@untad.ac.id",
      academicRank: "Lektor",
      studyProgram: "S1 Arsitektur",
      startYear: 2010,
      photo: () => IMG.staff(2),
    },
    {
      slug: "maya-sari",
      fullName: "Maya Sari",
      frontTitle: null,
      backTitle: "S.T., M.Ars.",
      structuralRole: "Ka. Lab Studio",
      expertise: "Desain Interior & Pencahayaan",
      email: "maya.sari@untad.ac.id",
      academicRank: "Asisten Ahli",
      studyProgram: "S1 Arsitektur",
      startYear: 2015,
      photo: () => IMG.staff(3),
    },
    {
      slug: "yusuf-anshori",
      fullName: "Yusuf Anshori",
      frontTitle: null,
      backTitle: "M.T.",
      structuralRole: "Koord. Kerja Sama",
      expertise: "Perencanaan Wilayah & Kota",
      email: "yusuf.anshori@untad.ac.id",
      academicRank: "Lektor",
      studyProgram: "S1 Arsitektur",
      startYear: 2011,
      photo: () => IMG.staff(4),
    },
  ];
  const ids: Record<string, number> = {};
  for (const [i, { photo, ...l }] of lecturers.entries()) {
    const photoId = await photo();
    const row = await db.lecturer.upsert({
      where: { slug: l.slug },
      update: {},
      create: { ...l, photoId, sortOrder: i + 1, status: "published" },
    });
    if (!row.photoId)
      await db.lecturer.update({ where: { id: row.id }, data: { photoId } });
    ids[l.slug] = row.id;
  }

  if (
    (await db.lecturerEducation.count({
      where: { lecturerId: ids["budi-santoso"] },
    })) === 0
  ) {
    await db.lecturerEducation.createMany({
      data: [
        {
          lecturerId: ids["budi-santoso"],
          degree: "S3",
          major: "Ilmu Arsitektur",
          institution: "Universitas Gadjah Mada",
          gradYear: 2020,
        },
        {
          lecturerId: ids["budi-santoso"],
          degree: "S2",
          major: "Arsitektur",
          institution: "Institut Teknologi Bandung",
          gradYear: 2014,
        },
        {
          lecturerId: ids["budi-santoso"],
          degree: "S1",
          major: "Arsitektur",
          institution: "Universitas Tadulako",
          gradYear: 2010,
        },
      ],
    });
  }
  return ids;
}

// ───────────────────────── Fasilitas ─────────────────────────

async function seedFacilities() {
  const facilities = [
    {
      slug: "lab-perancangan",
      name: "Laboratorium Perancangan",
      navLabel: "Lab Perancangan",
      headline: "Studio Eksplorasi Desain",
      summary: "Ruang studio utama untuk eksplorasi desain komprehensif.",
      body: "Ruang studio utama untuk eksplorasi desain komprehensif. Dilengkapi dengan meja gambar teknis berukuran A0 dan pencahayaan khusus drafting untuk mendukung presisi mahasiswa dalam menghasilkan cetak biru dan sketsa arsitektur.",
      capacity: 40,
      images: [IMG.news1, IMG.cta, IMG.news3],
      features: [
        [
          "Meja Gambar Teknis (Drafting Table)",
          "40 meja gambar ukuran A0",
          "ruler",
        ],
        ["Lampu Drafting Individual", null, "lamp"],
        ["Papan Presentasi Magnetik (Pin-up Board)", null, "layout"],
        ["Locker Penyimpanan Maket", null, "archive"],
      ],
    },
    {
      slug: "lab-model",
      name: "Lab Bentuk & Model",
      navLabel: "Lab Model",
      headline: "Mewujudkan Konsep Ruang",
      summary:
        "Fasilitas fabrikasi mutakhir untuk pembuatan maket dan eksplorasi bentuk.",
      body: "Laboratorium ini digunakan untuk kegiatan pembuatan maket, eksplorasi bentuk arsitektur, serta simulasi desain tiga dimensi. Mahasiswa dapat mengembangkan konsep ruang menjadi representasi fisik yang presisi.\n\nDilengkapi dengan peralatan manual dan digital mutakhir, Lab Model menjembatani celah antara gambar kerja teknis dan realitas spasial, memastikan setiap desain telah teruji secara proporsi dan skala.",
      capacity: 30,
      images: [IMG.cta, IMG.news3, IMG.news1],
      features: [
        ["Mesin Laser Cutting Presisi Tinggi", null, "scissors"],
        ["3D Printer (Resin & FDM)", null, "box"],
        ["Workshop Kayu Dasar (Basic Woodworking)", null, "hammer"],
        ["Meja Potong Skala Besar", null, "table"],
      ],
    },
    {
      slug: "ruang-kelas",
      name: "Ruang Kelas",
      navLabel: "Ruang Kelas",
      headline: "Ruang Kelas Modern",
      summary:
        "Lingkungan belajar yang nyaman dan mendukung proses pembelajaran arsitektur secara interaktif.",
      body: "Ruang kelas dirancang untuk menunjang kegiatan pembelajaran teori dengan fasilitas multimedia modern, pencahayaan yang baik, dan tata ruang yang mendukung diskusi aktif antara dosen dan mahasiswa.",
      capacity: 40,
      images: [IMG.hero, IMG.news1],
      features: [
        ["Smart TV / Projector", null, "monitor"],
        ["Whiteboard Interaktif", null, "pen-square"],
        ["Sistem Audio", null, "speaker"],
        ["AC", null, "snowflake"],
        ["WiFi Berkecepatan Tinggi", null, "wifi"],
        ["Kursi dan Meja Ergonomis", null, "armchair"],
      ],
    },
    {
      slug: "ruang-ujian",
      name: "Ruang Ujian",
      navLabel: "Ruang Ujian",
      headline: "Fasilitas Ujian Representatif & Kondusif",
      summary:
        "Ruang ujian untuk evaluasi akademik dengan suasana kondusif dan terorganisir.",
      body: "Ruang ujian Jurusan Arsitektur dirancang khusus untuk memberikan lingkungan yang optimal bagi mahasiswa dalam melaksanakan evaluasi akademik, terutama ujian perancangan yang membutuhkan konsentrasi tinggi dan ruang kerja yang memadai.\n\nFasilitas ini dikelola secara ketat selama masa ujian untuk memastikan integritas akademik dan memberikan ketenangan maksimal bagi peserta ujian.",
      capacity: 40,
      images: [IMG.news1, IMG.hero],
      features: [
        [
          "Kapasitas 40 Mahasiswa",
          "Jarak antar meja diatur sesuai standar ujian.",
          "user",
        ],
        [
          "Meja Gambar Individual",
          "Meja berukuran besar khusus untuk kertas A0/A1.",
          "presentation",
        ],
        [
          "Pengawasan CCTV 24 Jam",
          "Pemantauan menyeluruh seluruh sudut ruangan.",
          "video",
        ],
        [
          "Pendingin Ruangan (AC)",
          "Suhu ruangan terjaga sejuk untuk kenyamanan.",
          "cloud",
        ],
      ],
    },
    {
      slug: "hall",
      name: "Hall",
      navLabel: "Hall",
      headline: "Hall Program Studi Arsitektur",
      summary:
        "Ruang serbaguna untuk seminar, workshop, dan pameran karya arsitektur.",
      body: "Hall digunakan untuk berbagai kegiatan akademik dan nonakademik seperti seminar, workshop, pameran karya mahasiswa, kuliah umum, serta kegiatan organisasi mahasiswa. Ruang ini dirancang dengan fleksibilitas spasial untuk mengakomodasi berbagai konfigurasi acara.",
      capacity: 150,
      images: [IMG.hero, IMG.news2, IMG.cta],
      features: [
        ["Kapasitas 150 Orang", null, "users"],
        ["Panggung & Sistem Tata Suara", null, "speaker"],
        ["Panel Pameran Modular", null, "layout"],
        ["Proyektor & Layar Besar", null, "monitor"],
        ["Pencahayaan Pameran", null, "lamp"],
        ["Akses Difabel", null, "check"],
      ],
    },
  ];

  for (const [i, f] of facilities.entries()) {
    const { features, images, ...data } = f;
    const row = await db.facility.upsert({
      where: { slug: f.slug },
      update: {},
      create: { ...data, sortOrder: i + 1, status: "published" },
    });
    if (!row.navLabel || !row.headline) {
      await db.facility.update({
        where: { id: row.id },
        data: {
          navLabel: row.navLabel ?? data.navLabel,
          headline: row.headline ?? data.headline,
        },
      });
    }
    if (
      (await db.facilityFeature.count({ where: { facilityId: row.id } })) ===
        0 &&
      features.length
    ) {
      await db.facilityFeature.createMany({
        data: features.map(([title, description, icon], j) => ({
          facilityId: row.id,
          title: title as string,
          description,
          icon,
          sortOrder: j + 1,
        })),
      });
    }
    if (
      (await db.facilityImage.count({ where: { facilityId: row.id } })) === 0
    ) {
      for (const [j, img] of images.entries()) {
        await db.facilityImage.create({
          data: {
            facilityId: row.id,
            mediaId: await img(),
            sortOrder: j + 1,
            caption: j === 0 ? f.name : null,
          },
        });
      }
    }
  }
}

// ───────────────────────── Akademik ─────────────────────────

async function seedCourses() {
  const courses: [string, string, number, number, string][] = [
    [
      "ARS101",
      "Pengantar Arsitektur",
      1,
      2,
      "Pemahaman dasar mengenai ruang, bentuk, dan fungsi dalam konteks desain arsitektur fundamental.",
    ],
    [
      "ARS102",
      "Menggambar Arsitektur",
      1,
      3,
      "Teknik dasar gambar tangan, proyeksi, dan perspektif untuk komunikasi gagasan desain.",
    ],
    [
      "ARS201",
      "Studio Perancangan Arsitektur I",
      2,
      4,
      "Perancangan bangunan sederhana bermassa tunggal dengan penekanan pada ruang dan tapak.",
    ],
    [
      "ARS202",
      "Sejarah & Teori Arsitektur",
      2,
      2,
      "Perkembangan arsitektur dunia dan nusantara serta teori-teori yang melatarbelakanginya.",
    ],
    [
      "ARS302",
      "Struktur dan Konstruksi I",
      3,
      3,
      "Sistem struktur dasar bangunan rendah, material konstruksi, dan metode pelaksanaannya.",
    ],
    [
      "ARS303",
      "Arsitektur Tropis",
      3,
      2,
      "Prinsip desain bangunan yang responsif terhadap iklim tropis lembab.",
    ],
    [
      "ARS401",
      "Studio Perancangan Arsitektur II",
      4,
      4,
      "Perancangan bangunan bermassa majemuk dengan fungsi hunian dan komersial.",
    ],
    [
      "ARS402",
      "Building Information Modeling",
      4,
      2,
      "Pemodelan informasi bangunan untuk koordinasi desain dan dokumentasi.",
    ],
    [
      "ARS501",
      "Studio Perancangan Arsitektur III",
      5,
      4,
      "Perancangan bangunan publik bentang lebar dengan pendekatan struktur sebagai elemen estetika.",
    ],
    [
      "ARS502",
      "Arsitektur Vernakular Sulawesi",
      5,
      2,
      "Kajian arsitektur tradisional Sulawesi Tengah dan relevansinya bagi desain kontemporer.",
    ],
    [
      "ARS601",
      "Perancangan Kota",
      6,
      3,
      "Teori dan praktik perancangan kawasan perkotaan yang berkelanjutan.",
    ],
    [
      "ARS602",
      "Mitigasi Bencana dalam Arsitektur",
      6,
      2,
      "Strategi perancangan bangunan dan kawasan tanggap gempa, tsunami, dan likuefaksi.",
    ],
    [
      "ARS701",
      "Kerja Praktik",
      7,
      2,
      "Pengalaman kerja langsung di konsultan atau kontraktor bidang arsitektur.",
    ],
    [
      "ARS801",
      "Tugas Akhir",
      8,
      6,
      "Karya perancangan arsitektur komprehensif sebagai syarat kelulusan program sarjana.",
    ],
  ];
  for (const [
    i,
    [code, name, semester, credits, description],
  ] of courses.entries()) {
    const row = await db.course.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name,
        semester,
        credits,
        description,
        sortOrder: i + 1,
        status: "published",
      },
    });
    if (
      (await db.courseDocument.count({
        where: { courseId: row.id, type: "rps" },
      })) === 0
    ) {
      await db.courseDocument.create({
        data: {
          courseId: row.id,
          type: "rps",
          academicYear: "2025/2026",
          mediaId: await pdf(
            `rps-${code.toLowerCase()}`,
            `RPS ${code} ${name}`,
          ),
        },
      });
    }
  }

  const documents = [
    ["buku-panduan-ta", "Buku Panduan Tugas Akhir", "buku-panduan-ta"],
    [
      "dokumen-kurikulum",
      "Dokumen Kurikulum Program Studi Arsitektur",
      "dokumen-kurikulum",
    ],
  ] as const;
  for (const [key, title, file] of documents) {
    await db.document.upsert({
      where: { key },
      update: {},
      create: { key, title, mediaId: await pdf(file, title) },
    });
  }
}

// ───────────────────────── Kemahasiswaan ─────────────────────────

async function seedPrograms() {
  const programs = [
    {
      kind: "akademik",
      slug: "studio-perancangan-arsitektur",
      title: "Studio Perancangan Arsitektur (SPA)",
      summary:
        "Mata kuliah inti yang berjenjang dari dasar hingga tugas akhir, melatih mahasiswa memecahkan masalah spasial dan struktural secara komprehensif.",
      image: IMG.news1,
    },
    {
      kind: "akademik",
      slug: "kuliah-tamu-ekskursi",
      title: "Kuliah Tamu & Ekskursi",
      summary:
        "Mengundang praktisi arsitek profesional untuk berbagi pengalaman industri terkini, serta kunjungan lapangan ke proyek pembangunan.",
      image: IMG.hero,
    },
    {
      kind: "akademik",
      slug: "workshop-bim-komputasi",
      title: "Workshop BIM & Komputasi",
      summary:
        "Pelatihan intensif penguasaan perangkat lunak pemodelan 3D dan Building Information Modeling (BIM) untuk kesiapan dunia kerja.",
      image: IMG.news3,
    },
    {
      kind: "nonakademik",
      slug: "himaart",
      title: "HIMAART",
      summary:
        "Himpunan Mahasiswa Arsitektur mewadahi aspirasi dan memfasilitasi pengembangan minat bakat mahasiswa dalam lingkup akademik maupun non-akademik.",
      image: IMG.news1,
    },
    {
      kind: "nonakademik",
      slug: "bakti-sosial",
      title: "Bakti Sosial",
      summary:
        "Program pengabdian masyarakat berkelanjutan untuk mengaplikasikan ilmu arsitektur demi meningkatkan kualitas hidup masyarakat sekitar.",
      image: IMG.news2,
    },
    {
      kind: "nonakademik",
      slug: "festival-event-kampus",
      title: "Festival & Event Kampus",
      summary:
        "Pameran karya, seminar nasional, dan pekan kreativitas tahunan yang menjadi wadah selebrasi dan ekspresi seni mahasiswa arsitektur.",
      image: IMG.cta,
    },
  ] as const;
  for (const [i, { image: img, ...p }] of programs.entries()) {
    const imageId = await img();
    const row = await db.program.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, imageId, sortOrder: i + 1, status: "published" },
    });
    if (!row.imageId)
      await db.program.update({ where: { id: row.id }, data: { imageId } });
  }
}

async function seedOrganizations() {
  if ((await db.organization.count()) > 0) return;
  const orgs = [
    [
      "Himpunan Mahasiswa Arsitektur",
      "HIMAART",
      "Organisasi kemahasiswaan tingkat program studi yang mewadahi aspirasi, minat, dan bakat seluruh mahasiswa arsitektur.",
    ],
    [
      "Studio Visi",
      "SV",
      "Kelompok studi desain yang aktif mengikuti sayembara arsitektur tingkat nasional dengan pendampingan dosen.",
    ],
    [
      "Komunitas Sketsa Arsitektur",
      "KSA",
      "Komunitas penggiat sketsa dan urban sketching untuk mendokumentasikan arsitektur kota Palu.",
    ],
  ];
  for (const [i, [name, abbreviation, description]] of orgs.entries()) {
    await db.organization.create({
      data: {
        name,
        abbreviation,
        description,
        sortOrder: i + 1,
        logoId: await IMG.partner(i + 1),
      },
    });
  }
}

async function seedAchievements(lecturerIds: Record<string, number>) {
  const items = [
    {
      slug: "national-architecture-design-competition-2025",
      title: "Juara 1 National Architecture Design Competition 2025",
      studentName: "Andi Pratama",
      nim: "F221 21 001",
      cohortYear: 2021,
      achievementYear: 2025,
      level: "nasional",
      rankLabel: "Juara 1",
      category: "Kompetisi Nasional",
      organizer: "Ikatan Arsitek Indonesia (IAI)",
      eventLocation: "Jakarta Design Center",
      eventDate: new Date("2025-07-20"),
      workTitle: "Bale Bambu",
      isFeatured: true,
      summary:
        "Andi Pratama berhasil mengukir prestasi gemilang dengan meraih Juara 1 pada National Architecture Design Competition 2025. Karyanya yang visioner memadukan prinsip arsitektur vernakular Nusantara dengan teknologi bangunan hijau modern.",
      competitionInfo:
        "National Architecture Design Competition 2025 adalah ajang bergengsi yang diselenggarakan oleh Ikatan Arsitek Indonesia (IAI) bekerja sama dengan kementerian terkait, menantang mahasiswa arsitektur di seluruh Indonesia untuk mendesain solusi hunian komunal yang tanggap terhadap perubahan iklim.\n\nProses seleksi berlangsung ketat selama 3 bulan, melibatkan lebih dari 500 peserta dari berbagai universitas terkemuka. Tantangan utama kompetisi ini adalah merancang prototipe bangunan yang tidak hanya estetis, tetapi juga harus terbukti menurunkan jejak karbon hingga 40% dibandingkan bangunan konvensional.\n\nPenjurian tahap akhir dilakukan secara langsung di Jakarta Design Center, di hadapan panel ahli yang terdiri dari praktisi arsitek senior, akademisi, dan pakar lingkungan.",
      concept:
        'Desain "Bale Bambu" berangkat dari keresahan akan hilangnya identitas arsitektur lokal di tengah masifnya pembangunan urban. Dengan menggunakan sistem struktur modular bambu yang dipadukan dengan sambungan baja ringan, paviliun ini menawarkan ruang publik yang fleksibel. Orientasi bangunan dirancang mengikuti arah angin dominan untuk memaksimalkan ventilasi silang alami.',
      cover: IMG.juara,
      studentPhoto: IMG.karya2,
      images: [IMG.cta, IMG.news3],
      advisors: ["budi-santoso"],
    },
    {
      slug: "pusat-kebudayaan-kaili-modern",
      title: "Pusat Kebudayaan Kaili Modern",
      studentName: "Dian Pratama",
      cohortYear: 2021,
      achievementYear: 2025,
      level: "nasional",
      rankLabel: "Finalis",
      category: "Karya Studio 4",
      organizer: "Sayembara Nasional Arsitektur",
      isFeatured: true,
      summary:
        "Finalis Sayembara Nasional dengan rancangan pusat kebudayaan yang mengangkat tipologi rumah adat Kaili.",
      cover: IMG.karya2,
      images: [],
      advisors: ["hendra-gunawan"],
    },
    {
      slug: "road-safety-innovation-competition-2025",
      title: "Road Safety Innovation Competition 2025",
      studentName: "Tim GEN-Z Arsitektur",
      cohortYear: 2022,
      achievementYear: 2025,
      level: "nasional",
      rankLabel: "Juara 1",
      category: "Kompetisi Nasional",
      organizer: "Kementerian Perhubungan",
      workTitle: "Desain Halte Integrasi",
      isFeatured: true,
      summary:
        "Desain halte integrasi yang aman dan inklusif untuk koridor transportasi publik perkotaan.",
      cover: IMG.juara,
      images: [],
      advisors: ["siti-aminah"],
    },
    {
      slug: "apartemen-tropis-terintegrasi",
      title: "Apartemen Tropis Terintegrasi",
      studentName: "Ahmad Faisal",
      cohortYear: 2020,
      achievementYear: 2024,
      level: "lokal",
      rankLabel: "Wisudawan Terbaik",
      category: "Tugas Akhir",
      isFeatured: true,
      summary:
        "Tugas akhir terbaik dengan konsep hunian vertikal yang responsif terhadap iklim tropis.",
      cover: IMG.karya1,
      images: [],
      advisors: ["sarah-wijaya"],
    },
    {
      slug: "juara-1-sayembara-desain-fasad-kampus-merdeka",
      title: "Juara 1 Sayembara Desain Fasad Kampus Merdeka",
      studentName: "Rizky Ramadhan",
      cohortYear: 2022,
      achievementYear: 2024,
      level: "nasional",
      rankLabel: "Juara 1",
      category: "Sayembara",
      summary:
        "Rancangan fasad kampus yang mengintegrasikan kisi-kisi kayu dan secondary skin hemat energi.",
      cover: IMG.news1,
      images: [],
      advisors: [],
    },
    {
      slug: "best-sustainable-design-award-asian-architecture-biennale",
      title: "Best Sustainable Design Award - Asian Architecture Biennale",
      studentName: "Nadia Putri",
      cohortYear: 2021,
      achievementYear: 2024,
      level: "internasional",
      rankLabel: "Best Design",
      category: "Kompetisi Internasional",
      summary:
        "Penghargaan desain berkelanjutan terbaik pada ajang arsitektur tingkat Asia.",
      cover: IMG.news3,
      images: [],
      advisors: [],
    },
  ] as const;

  for (const it of items) {
    const { cover, studentPhoto, images, advisors, ...data } =
      it as typeof it & { studentPhoto?: () => Promise<number> };
    const existing = await db.achievement.findUnique({
      where: { slug: data.slug },
    });
    if (existing) continue;
    const row = await db.achievement.create({
      data: {
        ...data,
        coverId: await cover(),
        studentPhotoId: studentPhoto ? await studentPhoto() : null,
        status: "published",
        publishedAt: new Date(`${data.achievementYear}-08-01`),
      },
    });
    for (const [i, img] of images.entries()) {
      await db.achievementImage.create({
        data: {
          achievementId: row.id,
          mediaId: await img(),
          sortOrder: i + 1,
          caption: i === 0 ? "Perspective Render" : "Site Plan",
        },
      });
    }
    for (const slug of advisors) {
      await db.achievementAdvisor.create({
        data: { achievementId: row.id, lecturerId: lecturerIds[slug] },
      });
    }
  }
}

async function seedAlumni() {
  if ((await db.alumnus.count()) > 0) return;
  const alumni = [
    [
      "Rahmat Hidayat",
      2015,
      "Principal Architect",
      "Studio Lino Arsitek",
      "Studio di Arsitektur UNTAD membentuk cara saya berpikir: selalu mulai dari konteks dan manusia yang akan menghuni ruang.",
    ],
    [
      "Nur Aisyah",
      2017,
      "Perencana Kota",
      "Bappeda Kota Palu",
      "Pengalaman pengabdian pascabencana saat kuliah sangat relevan dengan pekerjaan saya merencanakan kota yang tangguh.",
    ],
    [
      "Fadli Mahmud",
      2019,
      "BIM Coordinator",
      "Konsultan Konstruksi Nasional",
      "Workshop BIM di kampus menjadi bekal utama saya masuk dunia kerja konstruksi.",
    ],
  ] as const;
  for (const [
    i,
    [name, gradYear, jobTitle, company, testimonial],
  ] of alumni.entries()) {
    await db.alumnus.create({
      data: {
        name,
        gradYear,
        jobTitle,
        company,
        testimonial,
        status: "published",
        photoId: await IMG.staff(((i % 4) + 1) as 1 | 2 | 3 | 4),
      },
    });
  }
}

// ───────────────────────── Penelitian & pengabdian ─────────────────────────

async function seedResearch(lecturerIds: Record<string, number>) {
  const items = [
    {
      slug: "strategi-pasif-bangunan-tradisional-kaili",
      title:
        "Strategi Pasif pada Bangunan Tradisional Kaili sebagai Model Adaptasi Perubahan Iklim",
      abstract:
        "Penelitian ini mengeksplorasi bagaimana arsitektur vernakular suku Kaili menerapkan prinsip pendinginan alami yang efisien. Melalui simulasi Computational Fluid Dynamics (CFD), tim peneliti membedah aliran udara pada struktur Souraja untuk diintegrasikan dalam standar perancangan bangunan modern di Sulawesi Tengah.",
      body: "<h2>Latar Belakang &amp; Metodologi</h2><h3>Konteks Permasalahan</h3><p>Urbanisasi yang cepat di kawasan tropis seringkali mengabaikan konteks iklim lokal, menghasilkan bangunan yang sangat bergantung pada sistem tata udara mekanis (HVAC). Hal ini tidak hanya membebani jaringan energi tetapi juga berkontribusi pada emisi gas rumah kaca. Bangunan tradisional Kaili, Souraja, menawarkan pelajaran berharga tentang kenyamanan termal tanpa energi.</p><blockquote><p>Arsitektur vernakular bukan romantisme masa lalu, melainkan laboratorium adaptasi iklim yang telah teruji ratusan tahun.</p><p>— Dr. Arsitek Gunawan</p></blockquote><h3>Metodologi Pengumpulan Data</h3><p>Pendekatan metode campuran (mixed-methods) digunakan dalam penelitian ini. Data kuantitatif dikumpulkan menggunakan sensor suhu dan kelembaban (datalogger) yang dipasang di berbagai titik di dalam dan luar bangunan sampel selama periode kemarau dan penghujan.</p><ul><li>Pengukuran mikroklimat selama 6 bulan di 4 bangunan sampel.</li><li>Simulasi CFD untuk memetakan pola aliran udara.</li><li>Wawancara mendalam dengan tetua adat dan tukang tradisional.</li></ul>",
      year: 2023,
      scheme: "Hibah Penelitian Dasar",
      field: "Arsitektur Tropis",
      locationName: "Palu, Sulawesi Tengah",
      progress: "selesai",
      authorsText: "Dr. Arsitek Gunawan, M.T.",
      isFeatured: true,
      cover: IMG.news2,
      images: [IMG.news2, IMG.cta, IMG.news3],
      authors: ["hendra-gunawan"],
      files: [
        ["Laporan Akhir Penelitian", "laporan-akhir-penelitian"],
        ["Poster Penelitian", "poster-penelitian"],
      ],
    },
    {
      slug: "revitalisasi-kawasan-pesisir-teluk-palu",
      title: "Revitalisasi Kawasan Pesisir Teluk Palu Pasca Bencana",
      abstract:
        "Analisis spasial mengenai integrasi ruang terbuka hijau sebagai sabuk pengaman tsunami pada zona kerentanan tinggi di sepanjang pesisir Teluk Palu.",
      year: 2024,
      scheme: "Hibah Penelitian Terapan",
      field: "Mitigasi Bencana",
      locationName: "Teluk Palu",
      progress: "berlangsung",
      authorsText: "Dr. Arsitek Gunawan, M.T.",
      cover: IMG.hero,
      images: [],
      authors: ["yusuf-anshori"],
      files: [],
    },
    {
      slug: "material-komposit-serat-alam-panel-akustik",
      title: "Efisiensi Material Komposit Serat Alam untuk Panel Akustik",
      abstract:
        "Pengembangan material panel penyerap suara menggunakan limbah pertanian lokal di Sulawesi Tengah untuk aplikasi interior bangunan publik.",
      year: 2024,
      scheme: "Penelitian Unggulan Fakultas",
      field: "Material Bangunan",
      authorsText: "Ir. Siti Nurbaya, Ph.D.",
      cover: IMG.news3,
      images: [],
      authors: ["siti-aminah"],
      files: [],
    },
    {
      slug: "pencahayaan-alami-ruang-kelas-kenyamanan-visual",
      title:
        "Pola Pencahayaan Alami pada Ruang Kelas Berbasis Kenyamanan Visual",
      abstract:
        "Studi komparatif sistem shading pada fasad gedung perkuliahan terhadap tingkat kelelahan mata mahasiswa selama proses pembelajaran.",
      year: 2023,
      scheme: "Penelitian Dosen Pemula",
      field: "Arsitektur Tropis",
      authorsText: "Budi Wijaya, S.T., M.Sc.",
      cover: IMG.news1,
      images: [],
      authors: ["maya-sari"],
      files: [],
    },
  ] as const;

  for (const it of items) {
    if (await db.research.findUnique({ where: { slug: it.slug } })) continue;
    const { cover, images, authors, files, ...data } = it;
    const row = await db.research.create({
      data: { ...data, coverId: await cover(), status: "published" },
    });
    for (const [i, img] of images.entries()) {
      await db.researchImage.create({
        data: {
          researchId: row.id,
          mediaId: await img(),
          sortOrder: i + 1,
          caption: i === 0 ? "Survei lapangan" : null,
        },
      });
    }
    for (const [i, slug] of authors.entries()) {
      await db.researchAuthor.create({
        data: {
          researchId: row.id,
          lecturerId: lecturerIds[slug],
          authorOrder: i + 1,
        },
      });
    }
    for (const [i, [title, file]] of files.entries()) {
      await db.researchFile.create({
        data: {
          researchId: row.id,
          title,
          mediaId: await pdf(file, title),
          sortOrder: i + 1,
        },
      });
    }
  }
}

async function seedServices() {
  const detailBody =
    "<h2>Latar Belakang</h2><p>Pasca gempa bumi yang melanda wilayah Sulawesi Tengah, kebutuhan akan hunian yang aman dan tangguh terhadap guncangan seismik menjadi prioritas utama. Program Studi Arsitektur Universitas Tadulako menginisiasi program pengabdian ini sebagai bentuk tanggung jawab akademis dan kepedulian sosial untuk membantu masyarakat membangun kembali hunian mereka.</p><h2>Tujuan Kegiatan</h2><ul><li><strong>Edukasi teknis</strong> — memberikan pemahaman prinsip dasar bangunan tahan gempa kepada warga dan tukang lokal.</li><li><strong>Pendampingan desain</strong> — menyusun prototipe rumah sederhana berbahan lokal yang memenuhi standar keamanan.</li><li><strong>Penguatan kapasitas</strong> — membentuk kelompok swadaya tukang desa yang tersertifikasi.</li></ul><h2>Metode Pelaksanaan</h2><p>Pendekatan yang digunakan adalah Participatory Design, di mana tim akademisi bekerja berdampingan dengan warga desa. Proses dimulai dari pemetaan sosial, FGD (Focus Group Discussion) untuk menyerap aspirasi warga terkait kebutuhan ruang, dilanjutkan dengan workshop teknis konstruksi sambungan kayu dan pembangunan rumah contoh.</p><h2>Hasil &amp; Dampak</h2><p>Program ini telah berhasil memfasilitasi terbangunnya 3 unit rumah contoh yang kini difungsikan sebagai balai warga sementara. Selain itu, terbentuk kelompok swadaya tukang desa yang kini memiliki sertifikasi dasar konstruksi tahan gempa dari mitra asosiasi profesi.</p>";
  const items = [
    {
      kind: "dosen",
      slug: "pendampingan-desain-rumah-tahan-gempa",
      title: "Pendampingan Desain Rumah Tahan Gempa",
      summary:
        "Edukasi dan pendampingan teknis bagi warga dalam merancang struktur hunian sederhana yang tanggap terhadap gempa.",
      locationName: "Desa Pombewe, Sigi",
      lat: -1.0306,
      lng: 119.9612,
      year: 2024,
      partnerName: "Pemerintah Kabupaten Sigi",
      body: detailBody,
      cover: IMG.cta,
      images: [IMG.cta, IMG.news1, IMG.news2],
      team: [
        { name: "Prof. Dr. Ir. Budi Santoso, MSA", role: "Ketua Tim" },
        { name: "Siti Aminah, ST., M.Sc", role: "Anggota Dosen" },
        { name: "Andi Pratama", role: "Mahasiswa" },
      ],
    },
    {
      kind: "dosen",
      slug: "penataan-lanskap-kawasan-pesisir",
      title: "Penataan Lanskap Kawasan Pesisir",
      summary:
        "Kolaborasi dengan pemerintah daerah untuk menata ulang ruang publik di area pesisir guna meningkatkan kualitas hidup warga.",
      locationName: "Pantai Talise, Palu",
      lat: -0.8796,
      lng: 119.8724,
      year: 2024,
      cover: IMG.hero,
      images: [],
      team: [],
    },
    {
      kind: "dosen",
      slug: "konservasi-arsitektur-vernakular",
      title: "Konservasi Arsitektur Vernakular",
      summary:
        "Program dokumentasi dan upaya pelestarian bangunan-bangunan tradisional yang memiliki nilai sejarah dan budaya.",
      locationName: "Donggala",
      year: 2023,
      cover: IMG.news2,
      images: [],
      team: [],
    },
    {
      kind: "mahasiswa",
      slug: "revitalisasi-ruang-terbuka-hijau",
      title: "Revitalisasi Ruang Terbuka Hijau",
      summary:
        "Perancangan dan pembangunan fasilitas ruang publik untuk kegiatan sosial warga pesisir.",
      locationName: "Kelurahan Lere, Palu",
      year: 2025,
      cover: IMG.news1,
      images: [],
      team: [],
    },
    {
      kind: "mahasiswa",
      slug: "desain-perpustakaan-mini",
      title: "Desain Perpustakaan Mini",
      summary:
        "Optimalisasi ruang kelas tidak terpakai menjadi perpustakaan dengan interior modular berbahan lokal.",
      locationName: "SDN 2 Tondo",
      year: 2024,
      cover: IMG.news3,
      images: [],
      team: [],
    },
    {
      kind: "mahasiswa",
      slug: "masterplan-sanitasi-komunal",
      title: "Masterplan Sanitasi Komunal",
      summary:
        "Penyusunan dokumen rancangan dan pendampingan teknis pembangunan fasilitas MCK terpadu.",
      locationName: "Desa Loli, Donggala",
      year: 2024,
      cover: IMG.cta,
      images: [],
      team: [],
    },
  ] as const;

  for (const [i, it] of items.entries()) {
    if (await db.communityService.findUnique({ where: { slug: it.slug } }))
      continue;
    const { cover, images, team, ...data } = it as typeof it & {
      body?: string;
    };
    const row = await db.communityService.create({
      data: {
        ...data,
        team: team.length ? (team as unknown as object[]) : undefined,
        coverId: await cover(),
        status: "published",
        publishedAt: new Date(Date.UTC(it.year, 6, 1 + i)),
      },
    });
    for (const [j, img] of images.entries()) {
      await db.communityServiceImage.create({
        data: { serviceId: row.id, mediaId: await img(), sortOrder: j + 1 },
      });
    }
  }
}

async function seedPartnerships() {
  if ((await db.partnership.count()) > 0) return;
  const partners: [string, string, string][] = [
    [
      "Kementerian PUPR",
      "Pemerintah",
      "Penelitian dan pengembangan perumahan tahan bencana.",
    ],
    ["BAPPENAS", "Pemerintah", "Kajian perencanaan pembangunan wilayah."],
    [
      "Kemendikbudristek",
      "Pemerintah",
      "Program Merdeka Belajar Kampus Merdeka.",
    ],
    [
      "Pemerintah Provinsi Sulawesi Tengah",
      "Pemerintah",
      "Penataan kawasan dan rehabilitasi pascabencana.",
    ],
    [
      "Pemerintah Kota Palu",
      "Pemerintah",
      "Perancangan ruang publik dan revitalisasi pesisir.",
    ],
    [
      "Ikatan Arsitek Indonesia (IAI)",
      "Asosiasi Profesi",
      "Sertifikasi, kuliah tamu, dan magang profesional.",
    ],
    ["PLN", "Industri", "Kajian efisiensi energi pada bangunan."],
  ];
  for (const [i, [partnerName, partnerType, scope]] of partners.entries()) {
    await db.partnership.create({
      data: {
        partnerName,
        partnerType,
        scope,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2027-12-31"),
        logoId: await IMG.partner(i + 1),
        showOnHome: true,
        sortOrder: i + 1,
        status: "published",
      },
    });
  }
}

// ───────────────────────── Berita ─────────────────────────

async function seedTaxonomy() {
  const categories = [
    ["Berita", "berita"],
    ["Prestasi", "prestasi"],
    ["Akademik", "akademik"],
    ["Penelitian & Jurnal", "penelitian-jurnal"],
    ["Pengabdian", "pengabdian"],
  ];
  for (const [name, slug] of categories) {
    await db.newsCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
  const tags = [
    ["berprestasi", "berprestasi"],
    ["akademik", "akademik"],
    ["non akademik", "non-akademik"],
    ["pengabdian", "pengabdian"],
  ];
  for (const [name, slug] of tags) {
    await db.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
}

async function seedNews(authorId: number) {
  const cat = async (slug: string) =>
    (await db.newsCategory.findUniqueOrThrow({ where: { slug } })).id;
  const tag = async (slug: string) =>
    (await db.tag.findUniqueOrThrow({ where: { slug } })).id;

  const prestasiBody =
    '<p>Prestasi membanggakan kembali diraih oleh mahasiswa Program Studi Arsitektur Universitas Tadulako (UNTAD). Tim mahasiswa yang tergabung dalam "Studio Visi" berhasil meraih Juara 1 dalam Sayembara Desain Pusat Kebudayaan Ibu Kota Nusantara (IKN) tingkat nasional yang diselenggarakan oleh Ikatan Arsitek Indonesia.</p><p>Karya desain yang mengusung tema "Nusantara Merajut Ruang" ini berhasil mengalahkan ratusan peserta dari berbagai perguruan tinggi terkemuka di Indonesia. Desain ini dipuji oleh dewan juri karena kemampuannya mengintegrasikan nilai-nilai lokal dengan pendekatan arsitektur parametrik modern.</p><h3>Pendekatan Desain dan Inovasi</h3><p>Keberhasilan tim ini tidak lepas dari metodologi riset desain yang mendalam. Mereka memfokuskan pada tiga pilar utama keberlanjutan yang menjadi syarat wajib pembangunan di kawasan IKN.</p><ul><li><strong>Efisiensi Material:</strong> penggunaan bambu laminasi dan kayu bersertifikat sebagai struktur utama.</li><li><strong>Sistem Sirkulasi Udara Pasif:</strong> bentuk atap yang memaksimalkan efek cerobong untuk pendinginan alami.</li><li><strong>Fleksibilitas Ruang:</strong> partisi modular yang memungkinkan ruang berubah fungsi sesuai kebutuhan acara.</li></ul><blockquote><p>Prestasi ini membuktikan bahwa mahasiswa kita mampu bersaing di tingkat nasional dengan gagasan yang berakar pada kearifan lokal.</p><p>— Dr. Ir. Budi Santoso, M.Arch., Ketua Program Studi Arsitektur</p></blockquote><p>Penyerahan penghargaan akan dilakukan langsung oleh Menteri Pekerjaan Umum dan Perumahan Rakyat (PUPR) pada pameran puncak desain IKN bulan depan di Jakarta. Karya ini nantinya akan dipamerkan dalam eksibisi permanen di kampus UNTAD sebagai inspirasi bagi angkatan berikutnya.</p>';

  const items = [
    {
      slug: "workshop-desain-berkelanjutan-kearifan-lokal-sulawesi",
      title: "Workshop Desain Berkelanjutan Berbasis Kearifan Lokal Sulawesi",
      excerpt:
        "Jurusan Arsitektur UNTAD menyelenggarakan workshop internasional yang menghadirkan ahli struktur bambu untuk mengeksplorasi potensi material lokal.",
      category: "berita",
      tags: ["akademik"],
      cover: IMG.news1,
      publishedAt: "2025-08-15T09:00:00+08:00",
      viewCount: 1200,
      eventDate: "2025-08-15T09:00:00+08:00",
      eventLocation: "Hall Program Studi Arsitektur",
      eventOrganizer: "Program Studi Arsitektur UNTAD",
    },
    {
      slug: "mahasiswa-arsitektur-untad-raih-juara-1-sayembara-nasional",
      title: "Mahasiswa Arsitektur UNTAD Raih Juara 1 Sayembara Nasional",
      excerpt:
        "Tim mahasiswa angkatan 2022 berhasil memenangkan kompetisi perancangan ruang publik kreatif tingkat nasional dengan konsep Nusantara Merajut Ruang.",
      category: "prestasi",
      tags: ["berprestasi", "non-akademik"],
      cover: IMG.news2,
      publishedAt: "2025-08-10T10:00:00+08:00",
      viewCount: 942,
      body: prestasiBody,
      coverCaption:
        "Tim Studio Visi mempresentasikan karya di hadapan dewan juri.",
    },
    {
      slug: "modernisasi-fasilitas-laboratorium-arsitektur-digital",
      title: "Modernisasi Fasilitas Laboratorium Arsitektur Digital",
      excerpt:
        "Penyediaan perangkat VR, AR, dan 3D Printing terbaru untuk mendukung proses kreatif perancangan digital mahasiswa tingkat akhir.",
      category: "akademik",
      tags: ["akademik"],
      cover: IMG.news3,
      publishedAt: "2025-08-05T08:00:00+08:00",
      viewCount: 1100,
    },
    {
      slug: "kuliah-tamu-pendekatan-parametrik-dalam-arsitektur",
      title: "Kuliah Tamu: Pendekatan Parametrik dalam Arsitektur",
      excerpt:
        "Menghadirkan praktisi arsitek terkemuka untuk membahas integrasi desain komputasional dengan respons iklim tropis.",
      category: "akademik",
      tags: ["akademik"],
      cover: IMG.cta,
      publishedAt: "2025-07-28T13:00:00+08:00",
      viewCount: 410,
    },
    {
      slug: "publikasi-internasional-struktur-vernakular-tahan-gempa",
      title: "Publikasi Internasional: Struktur Vernakular Tahan Gempa",
      excerpt:
        "Dosen Arsitektur UNTAD berhasil mempublikasikan hasil riset mengenai adaptasi struktur tradisional Kaili terhadap gempa.",
      category: "penelitian-jurnal",
      tags: ["akademik"],
      cover: IMG.news2,
      publishedAt: "2025-07-20T10:00:00+08:00",
      viewCount: 655,
    },
    {
      slug: "pameran-karya-akhir-semester-ganjil-2024",
      title: "Pameran Karya Akhir Semester Ganjil 2024",
      excerpt:
        "Pameran terbuka yang menampilkan portofolio terbaik mahasiswa dari berbagai studio perancangan.",
      category: "berita",
      tags: ["non-akademik"],
      cover: IMG.news1,
      publishedAt: "2025-01-18T09:00:00+08:00",
      viewCount: 380,
    },
    {
      slug: "pelaksanaan-sidang-tugas-akhir-periode-ganjil-2024",
      title: "Pelaksanaan Sidang Tugas Akhir Periode Ganjil 2024",
      excerpt:
        "Informasi lengkap mengenai jadwal dan persyaratan administrasi bagi mahasiswa yang akan mengikuti sidang tugas akhir.",
      category: "akademik",
      tags: ["akademik"],
      cover: IMG.hero,
      publishedAt: "2025-01-10T08:00:00+08:00",
      viewCount: 520,
    },
    {
      slug: "hibah-riset-internasional-material-bambu",
      title: "Hibah Riset Internasional untuk Pengembangan Material Bambu",
      excerpt:
        "Tim dosen Arsitektur UNTAD berhasil memenangkan dana hibah riset internasional untuk pengembangan material bambu rekayasa.",
      category: "penelitian-jurnal",
      tags: ["berprestasi"],
      cover: IMG.news3,
      publishedAt: "2024-12-02T10:00:00+08:00",
      viewCount: 300,
    },
    {
      slug: "peresmian-studio-desain-digital-baru-gedung-c",
      title: "Peresmian Studio Desain Digital Baru di Gedung C",
      excerpt:
        "Fasilitas baru yang dilengkapi dengan puluhan workstation berkinerja tinggi untuk mendukung perancangan digital.",
      category: "berita",
      tags: ["akademik"],
      cover: IMG.news1,
      publishedAt: "2024-11-20T10:00:00+08:00",
      viewCount: 270,
    },
    {
      slug: "bakti-sosial-penataan-ruang-publik-desa-pombewe",
      title: "Bakti Sosial: Penataan Ruang Publik Desa Pombewe",
      excerpt:
        "Mahasiswa dan dosen bersama warga menata balai desa dan taman bermain anak pascabencana.",
      category: "pengabdian",
      tags: ["pengabdian"],
      cover: IMG.cta,
      publishedAt: "2024-10-12T09:00:00+08:00",
      viewCount: 210,
    },
  ];

  for (const it of items) {
    if (await db.news.findUnique({ where: { slug: it.slug } })) continue;
    const body =
      it.body ??
      `<p>${it.excerpt}</p><p>Kegiatan ini merupakan bagian dari komitmen Program Studi Arsitektur Universitas Tadulako untuk terus menghadirkan pengalaman belajar yang relevan dan berdampak bagi mahasiswa serta masyarakat.</p>`;
    await db.news.create({
      data: {
        slug: it.slug,
        title: it.title,
        excerpt: it.excerpt,
        body,
        coverId: await it.cover(),
        coverCaption: it.coverCaption ?? null,
        categoryId: await cat(it.category),
        authorId,
        status: "published",
        publishedAt: new Date(it.publishedAt),
        viewCount: it.viewCount,
        eventDate: it.eventDate ? new Date(it.eventDate) : null,
        eventLocation: it.eventLocation ?? null,
        eventOrganizer: it.eventOrganizer ?? null,
        tags: {
          create: await Promise.all(
            it.tags.map(async (t) => ({ tagId: await tag(t) })),
          ),
        },
      },
    });
  }
}

async function main() {
  const admin = await seedAdmin();
  await seedPageBlocks();
  await seedAccreditation();
  const lecturerIds = await seedLecturers();
  await seedSettings(
    lecturerIds["sarah-wijaya"],
    ["akhmad-fauzi", "herianto", "maya-sari", "yusuf-anshori"].map(
      (s) => lecturerIds[s],
    ),
  );
  await seedFacilities();
  await seedCourses();
  await seedPrograms();
  await seedOrganizations();
  await seedAchievements(lecturerIds);
  await seedAlumni();
  await seedResearch(lecturerIds);
  await seedServices();
  await seedPartnerships();
  await seedTaxonomy();
  await seedNews(admin.id);
  console.log("Seed selesai.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
