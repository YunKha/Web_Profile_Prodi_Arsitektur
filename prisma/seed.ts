/**
 * Seed data awal. Jalankan: `npm run db:seed`.
 *
 * Isi diambil dari contoh teks pada desain Figma "Abala" dan masih berupa data
 * CONTOH (mis. dosen, nomor SK) yang harus diganti dengan data asli lewat admin.
 *
 * Aman dijalankan ulang:
 *  - baris dengan kunci alami (slug/kode/key) di-upsert,
 *  - tabel tanpa kunci alami hanya diisi bila masih kosong,
 *  - password admin yang sudah ada tidak ditimpa.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/db/create-client";

const db = createPrismaClient(2);

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL dan SEED_ADMIN_PASSWORD wajib diisi di .env.");
  }
  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD minimal 12 karakter.");
  }
  await db.user.upsert({
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

async function seedSettings() {
  const settings: Record<string, object> = {
    contact: {
      address:
        "Gedung Fakultas Teknik, Universitas Tadulako\nJl. Soekarno Hatta KM. 9, Tondo, Palu, Sulawesi Tengah 94148",
      email: "arsitektur@untad.ac.id",
      phone: "+62 (451) 422611 Ext. 123",
    },
    social: { twitter: "", instagram: "", youtube: "" },
    stats: { foundedYear: 1998, alumniCount: 1200, lecturerCount: 45 },
    footer: {
      tagline:
        "Membangun generasi arsitek yang unggul, berkarakter, dan berwawasan lingkungan untuk merespon dinamika perkembangan ruang dan pemukiman.",
      copyright:
        "© 2025 Program Studi Arsitektur Universitas Tadulako. Seluruh hak cipta dilindungi.",
    },
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
}

async function seedPageBlocks() {
  const blocks = [
    {
      pageKey: "profil",
      blockKey: "sejarah",
      title: "Jejak Langkah Arsitektur UNTAD",
      body:
        "Program Studi Arsitektur Universitas Tadulako didirikan dengan semangat untuk merespons kebutuhan mendesak akan tenaga ahli perancang bangunan dan lingkungan binaan di wilayah Sulawesi Tengah. Sejak awal berdirinya, kami berkomitmen untuk mengintegrasikan prinsip-prinsip arsitektur tropis nusantara dengan inovasi teknologi modern.\n\nPerjalanan panjang kami diwarnai dengan dedikasi untuk mencetak arsitek-arsitek yang tidak hanya piawai dalam merancang bentuk, tetapi juga memiliki kepekaan sosial dan lingkungan. Kurikulum yang terus beradaptasi dengan perkembangan zaman memastikan lulusan kami siap menghadapi tantangan global sekaligus tetap berpijak pada nilai-nilai kearifan lokal.",
    },
    {
      pageKey: "profil",
      blockKey: "visi",
      title: "Visi",
      body:
        "Menjadi Program Studi Arsitektur yang unggul dalam merancang lingkungan binaan berbasis arsitektur tropis dan kearifan lokal berstandar internasional pada tahun 2030.",
    },
    {
      pageKey: "kegiatan-akademik",
      blockKey: "intro",
      title: "Merancang Masa Depan Melalui Praktik Akademik",
      body:
        "Kegiatan akademik di Program Studi Arsitektur UNTAD tidak hanya terbatas pada teori di dalam kelas. Kami menekankan pembelajaran berbasis proyek (Project-Based Learning) yang diwujudkan melalui Studio Perancangan Arsitektur (SPA).",
    },
    {
      pageKey: "kegiatan-nonakademik",
      blockKey: "intro",
      title: "Mengembangkan Kepemimpinan dan Kreativitas Mahasiswa",
      body:
        "UNTAD Arsitektur menyadari bahwa menjadi seorang arsitek yang unggul membutuhkan lebih dari sekadar pengetahuan teknis. Kami mendorong mahasiswa untuk aktif dalam berbagai organisasi kemahasiswaan, kegiatan bakti sosial, serta aktivitas olahraga dan kesenian.",
    },
    ...[
      ["Pengajuan Judul", "Mahasiswa mengajukan proposal pra-desain beserta usulan dosen pembimbing kepada komisi Tugas Akhir."],
      ["Seminar Proposal", "Presentasi konsep awal dan landasan teori di hadapan dosen penguji untuk mendapatkan persetujuan desain."],
      ["Proses Studio & Asistensi", "Pengembangan desain secara komprehensif melalui bimbingan rutin minimal 8 kali pertemuan dengan dosen pembimbing."],
      ["Sidang Akhir", "Evaluasi akhir karya desain arsitektur di hadapan dewan penguji sebagai syarat kelulusan program sarjana."],
    ].map(([title, body], i) => ({
      pageKey: "panduan-ta",
      blockKey: `tahap-${i + 1}`,
      title,
      body,
      sortOrder: i + 1,
    })),
  ];
  for (const b of blocks) {
    await db.pageBlock.upsert({
      where: { pageKey_blockKey: { pageKey: b.pageKey, blockKey: b.blockKey } },
      update: {},
      create: b,
    });
  }

  if ((await db.missionItem.count()) === 0) {
    await db.missionItem.createMany({
      data: [
        { title: "Pendidikan", body: "Menyelenggarakan pendidikan arsitektur yang berkualitas, inovatif, dan relevan dengan kebutuhan masyarakat serta perkembangan teknologi dengan pendekatan studio-based learning.", sortOrder: 1 },
        { title: "Penelitian", body: "Mengembangkan penelitian terapan di bidang arsitektur tropis, perumahan permukiman, dan perancangan kota yang berkontribusi pada pengembangan ilmu pengetahuan dan solusi masalah lingkungan binaan.", sortOrder: 2 },
        { title: "Pengabdian", body: "Melaksanakan pengabdian kepada masyarakat melalui penerapan ilmu arsitektur untuk meningkatkan kualitas ruang hidup dan kesejahteraan masyarakat.", sortOrder: 3 },
      ],
    });
  }
}

async function seedAccreditation() {
  if ((await db.accreditation.count()) > 0) return;
  await db.accreditation.create({
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

async function seedFacilities() {
  const facilities = [
    {
      slug: "lab-perancangan",
      name: "Laboratorium Perancangan",
      summary: "Ruang studio utama untuk eksplorasi desain komprehensif.",
      body: "Ruang studio utama untuk eksplorasi desain komprehensif. Dilengkapi dengan meja gambar teknis berukuran A0 dan pencahayaan khusus drafting untuk mendukung presisi mahasiswa dalam menghasilkan cetak biru dan sketsa arsitektur.",
      capacity: 40,
      features: [
        ["Meja Gambar Teknis (Drafting Table)", "40 meja gambar ukuran A0", "ruler"],
        ["Lampu Drafting Individual", null, "lamp"],
        ["Papan Presentasi Magnetik (Pin-up Board)", null, "layout"],
        ["Locker Penyimpanan Maket", null, "archive"],
      ],
    },
    {
      slug: "lab-model",
      name: "Lab Model & Material",
      summary: "Fasilitas fabrikasi mutakhir untuk pembuatan maket.",
      body: "Fasilitas fabrikasi mutakhir yang menggabungkan teknik pembuatan maket tradisional dengan teknologi digital terkini. Ruang ini dirancang untuk mewujudkan konsep 2D menjadi representasi spasial 3D yang presisi.",
      capacity: null,
      features: [
        ["Mesin Laser Cutting Presisi Tinggi", null, "scissors"],
        ["3D Printer (Resin & FDM)", null, "box"],
        ["Workshop Kayu Dasar (Basic Woodworking)", null, "hammer"],
        ["Meja Potong Skala Besar", null, "table"],
      ],
    },
    {
      slug: "ruang-kelas",
      name: "Ruang Kelas Modern",
      summary: "Lingkungan belajar yang nyaman dan mendukung proses pembelajaran arsitektur secara interaktif.",
      body: "Ruang kelas dirancang untuk menunjang kegiatan pembelajaran teori dengan fasilitas multimedia modern, pencahayaan yang baik, dan tata ruang yang mendukung diskusi aktif antara dosen dan mahasiswa.",
      capacity: 40,
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
      summary: "Fasilitas ujian representatif dan kondusif.",
      body: "Ruang ujian Jurusan Arsitektur dirancang khusus untuk memberikan lingkungan yang optimal bagi mahasiswa dalam melaksanakan evaluasi akademik, terutama ujian perancangan yang membutuhkan konsentrasi tinggi dan ruang kerja yang memadai.",
      capacity: 40,
      features: [
        ["Kapasitas 40 Mahasiswa", "Jarak antar meja diatur sesuai standar ujian.", "user"],
        ["Meja Gambar Individual", "Meja berukuran besar khusus untuk kertas A0/A1.", "presentation"],
        ["Pengawasan CCTV 24 Jam", "Pemantauan menyeluruh seluruh sudut ruangan.", "video"],
        ["Pendingin Ruangan (AC)", "Suhu ruangan terjaga sejuk untuk kenyamanan.", "cloud"],
      ],
    },
    {
      slug: "hall",
      name: "Hall Program Studi Arsitektur",
      summary: "Ruang untuk seminar, workshop, dan pameran karya arsitektur.",
      body: "Hall digunakan untuk berbagai kegiatan akademik dan nonakademik seperti seminar, workshop, dan pameran karya arsitektur.",
      capacity: null,
      features: [] as (string | null)[][],
    },
  ];

  for (const [i, f] of facilities.entries()) {
    const { features, ...data } = f;
    const row = await db.facility.upsert({
      where: { slug: f.slug },
      update: {},
      create: { ...data, sortOrder: i + 1, status: "published" },
    });
    if ((await db.facilityFeature.count({ where: { facilityId: row.id } })) === 0 && features.length) {
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
  }
}

async function seedLecturers() {
  const lecturers = [
    { slug: "budi-santoso", fullName: "Budi Santoso", frontTitle: "Prof. Dr. Ir.", backTitle: "MSA", structuralRole: "Ketua Program Studi", expertise: "Perancangan Kota & Perumahan", email: "b.santoso@untad.ac.id", academicRank: "Guru Besar", civilRank: "Pembina Utama, IV/e", studyProgram: "S1 Arsitektur", startYear: 1998, nidn: "0011223344", sintaId: "6012345", scopusId: "5719000000", orcidId: "0000-0002-1234-5678" },
    { slug: "anita-wijayanti", fullName: "Anita Wijayanti", frontTitle: "Dr.", backTitle: "ST., MT", structuralRole: "Dosen Tetap", expertise: "Sejarah & Teori Arsitektur" },
    { slug: "hendra-gunawan", fullName: "Hendra Gunawan", frontTitle: "Ir.", backTitle: "M.Arch", structuralRole: "Kepala Studio Perancangan", expertise: "Teknologi Bangunan & Struktur" },
    { slug: "siti-aminah", fullName: "Siti Aminah", frontTitle: null, backTitle: "ST., M.Sc", structuralRole: "Dosen Muda", expertise: "Arsitektur Lanskap & Ekologi Lingkungan" },
  ];
  for (const [i, l] of lecturers.entries()) {
    await db.lecturer.upsert({
      where: { slug: l.slug },
      update: {},
      create: { ...l, sortOrder: i + 1, status: "published" },
    });
  }

  const budi = await db.lecturer.findUniqueOrThrow({ where: { slug: "budi-santoso" } });
  if ((await db.lecturerEducation.count({ where: { lecturerId: budi.id } })) === 0) {
    await db.lecturerEducation.createMany({
      data: [
        { lecturerId: budi.id, degree: "S3", major: "Ilmu Arsitektur", institution: "Universitas Gadjah Mada", gradYear: 2020 },
        { lecturerId: budi.id, degree: "S2", major: "Arsitektur", institution: "Institut Teknologi Bandung", gradYear: 2014 },
        { lecturerId: budi.id, degree: "S1", major: "Arsitektur", institution: "Universitas Tadulako", gradYear: 2010 },
      ],
    });
  }
}

async function seedCourses() {
  const courses = [
    { code: "ARS101", name: "Pengantar Arsitektur", semester: 1, description: "Pemahaman dasar mengenai ruang, bentuk, dan fungsi dalam konteks desain arsitektur fundamental." },
    { code: "ARS302", name: "Struktur dan Konstruksi I", semester: 3, description: "Sistem struktur dasar bangunan rendah, material konstruksi, dan metode pelaksanaannya." },
    { code: "ARS501", name: "Studio Perancangan Arsitektur III", semester: 5, description: "Perancangan bangunan publik bentang lebar dengan pendekatan struktur sebagai elemen estetika." },
  ];
  for (const [i, c] of courses.entries()) {
    await db.course.upsert({
      where: { code: c.code },
      update: {},
      create: { ...c, sortOrder: i + 1, status: "published" },
    });
  }
}

async function seedPrograms() {
  const programs = [
    { kind: "akademik", slug: "studio-perancangan-arsitektur", title: "Studio Perancangan Arsitektur (SPA)", summary: "Mata kuliah inti yang berjenjang dari dasar hingga tugas akhir, melatih mahasiswa memecahkan masalah spasial dan struktural secara komprehensif." },
    { kind: "akademik", slug: "kuliah-tamu-ekskursi", title: "Kuliah Tamu & Ekskursi", summary: "Mengundang praktisi arsitek profesional untuk berbagi pengalaman industri terkini, serta kunjungan lapangan ke proyek pembangunan." },
    { kind: "akademik", slug: "workshop-bim-komputasi", title: "Workshop BIM & Komputasi", summary: "Pelatihan intensif penguasaan perangkat lunak pemodelan 3D dan Building Information Modeling (BIM) untuk kesiapan dunia kerja." },
    { kind: "nonakademik", slug: "himaart", title: "HIMAART", summary: "Himpunan Mahasiswa Arsitektur mewadahi aspirasi dan memfasilitasi pengembangan minat bakat mahasiswa dalam lingkup akademik maupun non-akademik." },
    { kind: "nonakademik", slug: "bakti-sosial", title: "Bakti Sosial", summary: "Program pengabdian masyarakat berkelanjutan untuk mengaplikasikan ilmu arsitektur demi meningkatkan kualitas hidup masyarakat sekitar." },
    { kind: "nonakademik", slug: "festival-event-kampus", title: "Festival & Event Kampus", summary: "Pameran karya, seminar nasional, dan pekan kreativitas tahunan yang menjadi wadah selebrasi dan ekspresi seni mahasiswa arsitektur." },
  ] as const;
  for (const [i, p] of programs.entries()) {
    await db.program.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, sortOrder: i + 1, status: "published" },
    });
  }
}

async function seedTaxonomy() {
  const categories = [
    ["Penelitian & Jurnal", "penelitian-jurnal"],
    ["Prestasi", "prestasi"],
    ["Akademik", "akademik"],
    ["Pengabdian", "pengabdian"],
  ];
  for (const [name, slug] of categories) {
    await db.newsCategory.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
  const tags = [
    ["berprestasi", "berprestasi"],
    ["akademik", "akademik"],
    ["non akademik", "non-akademik"],
    ["pengabdian", "pengabdian"],
  ];
  for (const [name, slug] of tags) {
    await db.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
}

async function main() {
  await seedAdmin();
  await seedSettings();
  await seedPageBlocks();
  await seedAccreditation();
  await seedFacilities();
  await seedLecturers();
  await seedCourses();
  await seedPrograms();
  await seedTaxonomy();
  console.log("Seed selesai.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
