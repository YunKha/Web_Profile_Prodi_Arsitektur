# PRD — Website Program Studi Arsitektur UNTAD

| | |
|---|---|
| **Versi** | 0.2 (ORM diputuskan: Prisma 7; fondasi proyek dibuat) |
| **Tanggal** | 1 Oktober 2026 |
| **Sumber desain** | Figma "Abala" (`KzPGOu0h5lJZ91oJeHo7P1`), 1 page, ±35 frame desktop 1280 px |
| **Stack** | Next.js 16 (App Router, backend + SSR), React 19 + TypeScript, MySQL |
| **Status** | Perlu ditinjau tim sebelum dikunci |

> **Catatan metode analisis.** Frame yang diperiksa visual penuh: Profil (Visi & Misi), Akreditasi, Dosen & Staf, Detail Dosen, Fasilitas Kampus, Ruang Kelas, Ruang Ujian, RPS, Panduan TA, Kegiatan Akademik, Kegiatan Nonakademik, dan TopNavBar. Frame lain (Berita, Detail Berita, Kerja Sama, Alumni, Lembaga, Prestasi, Detail Prestasi, Kurikulum, Hall, 3 halaman Pengabdian, Penelitian) dianalisis dari **nama layer teks saja** karena kuota Figma MCP (paket Starter) habis. Bagian yang bersumber dari sini ditandai ⚠️ dan perlu diverifikasi terhadap desain sebelum pengerjaan.

---

## 1. Ringkasan

Website resmi Program Studi Arsitektur Universitas Tadulako (UNTAD): etalase informasi publik untuk calon mahasiswa, mahasiswa, dosen, mitra, dan akreditor. Seluruh konten (dosen, berita, prestasi, RPS, penelitian, dst.) harus bisa dikelola staf prodi lewat **panel admin**, tanpa mengubah kode.

### Tujuan
1. Menyajikan identitas, akreditasi, SDM, fasilitas, dan capaian prodi secara kredibel dan mudah dicari.
2. Menyediakan dokumen akademik yang sering dicari mahasiswa (RPS, kurikulum, panduan TA) di satu tempat.
3. Memberi staf prodi CMS sederhana agar konten selalu mutakhir.
4. Meningkatkan keterlihatan di mesin pencari (SEO) untuk kata kunci "arsitektur untad", nama dosen, dan berita prodi.

### Bukan tujuan (v1)
- Portal akademik/SIAKAD (KRS, nilai, login mahasiswa). Tautan "Sistem Informasi Akademik" di footer cukup mengarah ke sistem eksternal.
- Pendaftaran mahasiswa baru online.
- Multi-bahasa (hanya Bahasa Indonesia; struktur data disiapkan agar bisa ditambah).
- Aplikasi mobile native.

## 2. Model website

**Jenis: website profil institusi akademik berbasis konten (content-driven), dengan CMS admin.**

| Aspek | Keputusan |
|---|---|
| Pola | Situs informasi satu arah: pengunjung membaca, mencari, dan mengunduh. Tanpa akun publik. |
| Isi | 3 jenis halaman: **(a)** statis-editorial (Visi & Misi, Akreditasi, Panduan TA), **(b)** daftar + filter/pencarian + paginasi (Dosen, RPS, Penelitian, Berita, Prestasi, Alumni, Pengabdian), **(c)** halaman detail (Dosen, Berita, Prestasi, Pengabdian). |
| Template berulang | Hero + sub-navigasi tab (Profil, Fasilitas, Mahasiswa, Akademik), kartu program 3 kolom, galeri dengan thumbnail, timeline/stepper, daftar dokumen dengan tombol unduh. |
| Pengguna terautentikasi | Hanya internal: **Admin** dan **Editor**. |
| Rendering | Server Components + `use cache` per entitas, di-invalidate lewat `updateTag` saat admin menyimpan. Halaman publik hampir seluruhnya prerender. |
| Arsitektur | **Satu proyek Next.js** (frontend + backend). Mutasi lewat Server Actions; Route Handler hanya untuk unggah file dan endpoint publik bila perlu. Tidak ada backend terpisah. |

### Persona
| Persona | Kebutuhan utama |
|---|---|
| Calon mahasiswa & orang tua | Akreditasi, fasilitas, prestasi, kurikulum, kontak |
| Mahasiswa aktif | RPS, panduan TA, kegiatan, prestasi, berita |
| Dosen & peneliti | Profil publik (SINTA/Scopus/ORCID), publikasi penelitian & pengabdian |
| Mitra & alumni | Kerja sama, jaringan alumni |
| Admin/Editor prodi | Input konten cepat, unggah dokumen, draft → terbit |

## 3. Peta situs (dari Figma)

Navigasi utama (TopNavBar, 8 item, item aktif bergaris bawah oranye): **Profile · Fasilitas · Akademik · Mahasiswa · Penelitian · Pengabdian · Kerja Sama · Berita**.

| Menu | Halaman | Frame Figma | Rute usulan |
|---|---|---|---|
| — | Beranda | ⚠️ **tidak ada frame**, hanya komponen "Hero Section" | `/` |
| Profile | Visi & Misi (+ statistik, sejarah) | halaman profile | `/profil` |
| | Akreditasi | halaman akreditasi | `/profil/akreditasi` |
| | Dosen & Staf (grid, cari, "Muat lebih banyak") | Halaman Dosen & Staf | `/profil/dosen-staf` |
| | Detail Dosen | halaman Detail Dosen | `/profil/dosen-staf/[slug]` |
| Fasilitas | Lab Perancangan, Lab Model, Ruang Kelas, Ruang Ujian, Hall (tab) | Fasilitas Kampus, Ruang Kelas, Ruang Ujian, Hall | `/fasilitas/[slug]` |
| Akademik | Kurikulum ⚠️ | halaman Kurikulum | `/akademik/kurikulum` |
| | RPS (cari + filter semester + unduh PDF) | halaman RPS | `/akademik/rps` |
| | Panduan TA (unduh buku + 4 tahapan) | hamalan Panduan TA | `/akademik/panduan-ta` |
| Mahasiswa | Kegiatan Akademik | halaman Kegiatan Akademik | `/mahasiswa/kegiatan-akademik` |
| | Kegiatan Nonakademik | halaman Kegiatan Nonakademik | `/mahasiswa/kegiatan-nonakademik` |
| | Lembaga ⚠️ | halaman Lembaga | `/mahasiswa/lembaga` |
| | Prestasi Mahasiswa ⚠️ + Detail ⚠️ | Prestasi Mahasiswa, Detail Prestasi | `/mahasiswa/prestasi`, `/mahasiswa/prestasi/[slug]` |
| | Alumni ⚠️ | halaman Alumni | `/mahasiswa/alumni` |
| Penelitian | Daftar penelitian (cari) ⚠️ | Halaman Penelitian | `/penelitian` |
| Pengabdian | Pengabdian Mahasiswa ⚠️, Pengabdian Dosen ⚠️, Detail ⚠️ | 3 frame | `/pengabdian/mahasiswa`, `/pengabdian/dosen`, `/pengabdian/[slug]` |
| Kerja Sama | Kerja Sama ⚠️ | halaman kerja sama | `/kerja-sama` |
| Berita | Daftar ⚠️ + Detail ⚠️ (label terkait, berita lainnya) | halaman berita, Detail Berita | `/berita`, `/berita/[slug]` |
| — | Admin | **tidak ada di Figma** | `/admin/*` |

**Komponen global:** TopNavBar, Sub-Navigation (Tabs), Hero Section, Footer (4 kolom: identitas + sosial, Akademik, Fasilitas & Layanan, Hubungi Kami; baris hak cipta + Kebijakan Privasi + Syarat & Ketentuan), breadcrumb.

**Tautan footer tanpa halaman di Figma** (diperlakukan sebagai tautan yang bisa diatur admin, internal atau eksternal): Kalender Akademik, Sistem Informasi Akademik, Jurnal Ruang & Rancang, Studio & Laboratorium, Perpustakaan Referensi, HIMAART, Beasiswa, Layanan Konseling Akademik, Kebijakan Privasi, Syarat & Ketentuan.

## 4. Desain & UI

Diambil dari screenshot (nilai hex bersifat **perkiraan**; ambil nilai pasti dengan `get_variable_defs` pada frame "ColorPalette" `122:3606` setelah kuota Figma MCP pulih).

- **Warna:** aksen oranye-amber (~`#D4903F`) untuk tab aktif, garis bawah, ikon, CTA; cokelat tua (~`#5A3210`) untuk judul dan tombol utama; latar off-white hangat (~`#F7F5F2`), kartu putih, footer sedikit lebih terang.
- **Tipografi:** judul sans geometris (tampak DM Sans), isi Inter, label kecil huruf kapital dengan letter-spacing lebar.
- **Layout:** lebar 1280 px, gutter ±64 px, hero penuh dengan overlay warna, kartu bergaris halus dan bayangan ringan, ikon garis (Lucide-style).
- **Gaya:** hangat, arsitektural, banyak foto bangunan/studio. Aksen siku (corner bracket) pada foto di Profil dan Kegiatan.

### Temuan pada desain (perlu keputusan desainer)
| # | Temuan | Dampak |
|---|---|---|
| D1 | **Tidak ada desain mobile/tablet.** Semua frame 1280 px. | Wajib dibuat sebelum implementasi responsif. Tanpa itu, tim menebak. |
| D2 | **Beranda belum didesain.** Hanya ada komponen Hero. | Halaman paling penting belum ada. |
| D3 | RPS dan Panduan TA memakai **font serif**; halaman lain sans. | Tampak seperti font fallback; seragamkan. |
| D4 | Ruang Ujian memakai **gambar placeholder**; Ruang Kelas **tanpa hero**, berbeda dari Ruang Ujian. | Template Fasilitas tidak konsisten. |
| D5 | Label tab Fasilitas beda antar frame ("Lab Model" vs "Lab Model & Material", "Hall" vs "Hall / Ruang Pameran"). | Tetapkan satu nama. |
| D6 | Frame Fasilitas Kampus: judul "Lab teori dan sejarah" tetapi isi tentang fabrikasi/laser cutting/3D printer. | Salah salin konten. |
| D7 | Warna aksen oranye di atas latar terang pada teks kecil kemungkinan **gagal kontras WCAG AA** (4,5:1). | Gelapkan untuk teks; oranye untuk dekorasi saja. |
| D8 | Teks rusak di Detail Dosen ("PRä GRAM", "Gã Lã NGAN", "ä RCID ID"), typo "KURKULUM", nama layer "hamalan". | Perbaiki di Figma. |
| D9 | Nama Kaprodi berbeda: "Prof. Dr. Ir. Budi Santoso, MSA" (Dosen) vs "Dr. Ir. Budi Santoso, M.Arch." (Berita). | Konten dummy; pastikan data asli. |
| D10 | Statistik di Profil (1998, 1.2K+ alumni, akreditasi A, 45 staf) berupa angka tetap, dan peringkat akreditasi tampil di dua halaman. | Jadikan satu sumber data (dihitung dari tabel atau diatur admin) agar tidak saling bertentangan. |

## 5. Kebutuhan fungsional

Prioritas: **P0** wajib rilis pertama, **P1** sebaiknya ada, **P2** setelah rilis.

### 5.1 Situs publik

| ID | Kebutuhan | Prio |
|---|---|---|
| FR-01 | Navigasi utama sticky 8 item dengan penanda halaman aktif; menu hamburger di mobile | P0 |
| FR-02 | Sub-navigasi tab per seksi (Profile: Visi & Misi / Akreditasi / Dosen & Staf; Fasilitas: 5 ruang; Mahasiswa: 5 halaman; Akademik: Kurikulum / RPS / Panduan TA) | P0 |
| FR-03 | Breadcrumb pada halaman detail dan RPS | P0 |
| FR-04 | **Profil:** sejarah, foto, 4 angka statistik, visi, 3 misi (Pendidikan, Penelitian, Pengabdian) dari data | P0 |
| FR-05 | **Akreditasi:** lembaga, no. SK, peringkat, tanggal berlaku/berakhir, unduh Sertifikat, LKPS, LED | P0 |
| FR-06 | **Dosen & Staf:** grid kartu (foto, jabatan struktural, nama+gelar, bidang keahlian, ikon email/SINTA/Scholar/web), cari nama/keahlian, "Muat lebih banyak" | P0 |
| FR-07 | **Detail Dosen:** foto, status Aktif, jabatan akademik, pangkat/golongan, program studi, masa kerja, identitas (email, NIDN, NUPTK, SINTA/Scopus/ORCID ID), tautan eksternal, riwayat pendidikan S1–S3 | P0 |
| FR-08 | **Fasilitas:** halaman per ruang dengan deskripsi, kapasitas, daftar fitur/spesifikasi berikon, galeri multi-foto dengan thumbnail dan caption | P0 |
| FR-09 | **RPS:** daftar mata kuliah (kode, semester, deskripsi), cari nama/kode, filter semester, paginasi, unduh PDF | P0 |
| FR-10 | **Panduan TA:** tombol unduh buku panduan dan 4 tahapan (Pengajuan Judul, Seminar Proposal, Studio & Asistensi, Sidang Akhir) | P0 |
| FR-11 | **Kurikulum** ⚠️: narasi kurikulum + tautan ke RPS/dokumen kurikulum | P0 |
| FR-12 | **Kegiatan Akademik / Nonakademik:** intro, foto, kartu program (Studio Perancangan, Kuliah Tamu, Workshop BIM; HIMAART, Bakti Sosial, Festival) dengan "Selengkapnya" | P0 |
| FR-13 | **Lembaga** ⚠️ | P1 |
| FR-14 | **Prestasi:** daftar + detail (nama, NIM, angkatan, tahun, narasi, info kompetisi, dosen pembimbing, konsep desain, prestasi lain) ⚠️ | P0 |
| FR-15 | **Alumni** ⚠️: daftar alumni/profil/testimoni | P1 |
| FR-16 | **Penelitian** ⚠️: daftar (judul, abstrak, penulis), cari judul, penelitian unggulan di atas | P0 |
| FR-17 | **Pengabdian:** daftar dosen & mahasiswa, detail dengan narasi, lokasi kegiatan, galeri ⚠️ | P0 |
| FR-18 | **Kerja Sama** ⚠️: daftar mitra, jenis, ruang lingkup, periode | P1 |
| FR-19 | **Berita:** daftar + kategori + cari; detail dengan gambar, isi, kutipan, label terkait, "Berita Lainnya" | P0 |
| FR-20 | Beranda: hero, ringkasan prodi, statistik, berita terbaru, prestasi, CTA (menunggu desain D2) | P0 |
| FR-21 | Footer dan info kontak dari pengaturan situs (bukan hard-code) | P0 |
| FR-22 | Halaman 404, error, dan loading skeleton | P0 |
| FR-23 | Pencarian global lintas berita/dosen/penelitian | P2 |
| FR-24 | Formulir kontak dengan penyimpanan pesan | P2 |

### 5.2 Panel admin (tidak ada di Figma, diusulkan)

| ID | Kebutuhan | Prio |
|---|---|---|
| AD-01 | Login email + kata sandi, sesi aman, logout; peran **Admin** (semua + kelola pengguna) dan **Editor** (konten) | P0 |
| AD-02 | CRUD untuk setiap entitas di §6 dengan validasi, daftar bertabel, cari, filter status | P0 |
| AD-03 | Status **Draf / Terbit**, jadwal terbit untuk berita | P0 / P1 |
| AD-04 | Editor teks kaya untuk berita dan narasi, dengan sanitasi HTML | P0 |
| AD-05 | Pustaka media: unggah gambar/PDF, alt text, pratinjau, hapus bila tak dipakai | P0 |
| AD-06 | Atur urutan tampil (drag & drop atau angka) untuk dosen, galeri, kartu program | P1 |
| AD-07 | Pengaturan situs: kontak, sosial media, statistik beranda, tautan footer | P0 |
| AD-08 | Audit log siapa mengubah apa | P1 |
| AD-09 | Impor massal RPS dan dosen dari CSV | P2 |

## 6. Model data (MySQL)

Konvensi: `id` INT auto-increment (bukan BIGINT, agar aman diserialisasi antara Server dan Client Component; cukup untuk skala situs prodi), `slug` unik untuk entitas berhalaman publik, `created_at`/`updated_at`, `status` ENUM('draft','published') + `published_at` untuk konten editorial. Charset `utf8mb4`.

```
users            id, name, email*, password_hash, role{admin,editor}, is_active, last_login_at
media            id, path, mime, size_bytes, width, height, alt_text, uploaded_by→users
site_settings    key*, value(JSON)           -- kontak, sosial, statistik, footer links
page_blocks      id, page_key, block_key, title, body, image_id→media, sort_order
                 -- teks editorial: sejarah, visi, intro kegiatan, tahapan TA, dll.
mission_items    id, title, body, sort_order  -- 3 misi Profil

accreditations   id, agency, sk_number, rank, valid_from, valid_to, is_current
accreditation_documents  id, accreditation_id→, type{sertifikat,lkps,led}, media_id→

lecturers        id, slug*, full_name, front_title, back_title, staff_type{dosen,tendik},
                 structural_role, academic_rank, civil_rank, study_program, start_year,
                 expertise, photo_id→media, email, nidn, nuptk, sinta_id, scopus_id,
                 orcid_id, sinta_url, scholar_url, website_url, is_active, sort_order, status
lecturer_education  id, lecturer_id→, degree{S1,S2,S3}, major, institution, grad_year

facilities       id, slug*, name, summary, body, capacity, sort_order, status
facility_features  id, facility_id→, icon, title, description, sort_order
facility_images    id, facility_id→, media_id→, caption, sort_order

courses          id, code*, name, semester(1-8), description, credits, sort_order, status
course_documents id, course_id→, type{rps,kurikulum}, media_id→, academic_year
documents        id, key*, title, media_id→   -- buku panduan TA, dokumen umum

programs         id, kind{akademik,nonakademik}, slug*, title, summary, body,
                 image_id→media, sort_order, status        -- kartu program unggulan
organizations    id, name, abbreviation, description, logo_id→media, sort_order  -- Lembaga ⚠️
achievements     id, slug*, title, student_name, nim, cohort_year, achievement_year,
                 level{lokal,nasional,internasional}, category, summary, body,
                 competition_info, concept, cover_id→media, status, published_at
achievement_advisors  achievement_id→, lecturer_id→
alumni           id, name, grad_year, job_title, company, testimonial, photo_id→media, status ⚠️

research         id, slug*, title, abstract, year, scheme, external_url, status
research_authors research_id→, lecturer_id→, author_order
community_services  id, slug*, kind{dosen,mahasiswa}, title, summary, body, location_name,
                 lat, lng, year, cover_id→media, status, published_at
community_service_images  id, service_id→, media_id→, caption, sort_order
partnerships     id, partner_name, partner_type, scope, start_date, end_date,
                 logo_id→media, url, status ⚠️

news             id, slug*, title, excerpt, body, cover_id→media, category_id→,
                 author_id→users, status, published_at
news_categories  id, name, slug*
tags             id, name, slug*
news_tags        news_id→, tag_id→           -- "Label terkait" (berprestasi, akademik, ...)

audit_logs       id, user_id→, action, entity, entity_id, diff(JSON), created_at
```

Indeks penting: `slug` (unik), `(status, published_at)` untuk daftar, `FULLTEXT` pada `news(title, excerpt)`, `lecturers(full_name, expertise)`, `courses(code, name)`, `research(title)` untuk fitur cari. Pertimbangkan ngram parser untuk Bahasa Indonesia, atau `LIKE` untuk skala kecil.

Data turunan: "masa kerja" dosen dihitung dari `start_year`, jangan disimpan. Statistik beranda (alumni, jumlah staf) bisa dihitung dari tabel atau diatur manual di `site_settings`.

## 7. Arsitektur teknis

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 16 App Router, React 19, **TypeScript strict** | Sesuai kebutuhan tim; satu proyek untuk UI dan backend |
| Styling | Tailwind CSS v4 (sudah terpasang), token dari Figma di `globals.css` | Konsisten dengan repo |
| Database | MySQL 8 | Kebutuhan tim |
| ORM | **Prisma 7.10** + driver adapter `@prisma/adapter-mariadb` (**diputuskan**) | Skema tertipe, migrasi terkelola. Skema sudah ada di `prisma/schema.prisma`. |
| Validasi | Zod di setiap Server Action dan Route Handler | Input admin & unggahan |
| Auth | Auth.js (credentials) atau sesi sendiri dengan cookie httpOnly; hash **argon2/bcrypt**; `src/proxy.ts` melindungi `/admin` | Next 16 memakai `proxy`, bukan `middleware` |
| Cache | `'use cache'` + `cacheLife` + `cacheTag`; `updateTag` saat admin menyimpan | Halaman publik cepat, konten tetap segar |
| File | Unggah via Route Handler ke disk/volume atau penyimpanan S3-compatible; PDF dan gambar divalidasi mime + ukuran; gambar lewat `next/image` | Dokumen RPS, sertifikat, foto |
| Rich text | Tiptap atau serupa, simpan HTML tersanitasi (DOMPurify) | Berita |
| Deploy | Belum ditentukan (lihat §11) | |

### Struktur folder (menyesuaikan [AGENTS.md](../AGENTS.md))
```
src/
  app/
    (public)/            layout publik: TopNavBar + Footer
      page.tsx, profil/, fasilitas/, akademik/, mahasiswa/, penelitian/,
      pengabdian/, kerja-sama/, berita/
    (admin)/admin/       layout admin + halaman CRUD
    api/upload/route.ts
    not-found.tsx, error.tsx
  components/ui/         Button, Card, Tabs, Breadcrumb, Pagination, SearchInput, Gallery, Stepper
  components/layouts/    TopNavBar, SubNav, Hero, Footer
  lib/db/                client Prisma, query per entitas (dengan 'use cache')
  lib/auth/, lib/validation/, lib/storage/
  hooks/
prisma/schema.prisma, prisma/seed.ts
```

### Perubahan pada repo (status)
- ✅ **Selesai:** migrasi ke TypeScript strict, alias `@/*`, Prisma 7 + skema 30 tabel, migrasi `init`, seed contoh, `.env.example`, dokumen AGENTS/CLAUDE/Copilot/Cursor diperbarui.
- ⏳ **Belum:** semua halaman dan komponen UI, autentikasi, unggah file, panel admin.

Catatan awal (sebelum dikerjakan):
- Repo masih **JavaScript** dan [AGENTS.md](../AGENTS.md), [CLAUDE.md](../CLAUDE.md), [copilot-instructions.md](../.github/copilot-instructions.md) menyatakan "bukan TypeScript". Perlu migrasi: ubah `.js` → `.tsx`, ganti `jsconfig.json` dengan `tsconfig.json` (sudah ada), dan **perbarui ketiga dokumen itu**.
- Tambah dependensi: `prisma`/`@prisma/client`, `zod`, library auth, library rich text, `lucide-react`.
- Nama paket `abala` di `package.json` sesuai nama file Figma; ganti jika perlu.

## 8. Kebutuhan non-fungsional

| Area | Target |
|---|---|
| Performa | LCP < 2,5 s, CLS < 0,1, INP < 200 ms pada 4G (Lighthouse mobile ≥ 90). Gambar dioptimalkan, font self-hosted via `next/font`. |
| SEO | Metadata per halaman, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD (`CollegeOrUniversity`, `Person` untuk dosen, `NewsArticle`), URL slug yang stabil. |
| Aksesibilitas | WCAG 2.1 AA: kontras (lihat D7), fokus keyboard, alt text wajib di admin, landmark semantik. |
| Responsif | Mobile-first, breakpoint ±640/1024/1280. Perlu desain mobile (D1). |
| Keamanan | OWASP Top 10: Server Action selalu cek sesi dan peran; rate-limit login; CSRF bawaan Server Actions; sanitasi HTML; validasi unggahan (tipe, ukuran, nama acak); header keamanan; rahasia di env tanpa prefiks `NEXT_PUBLIC_`. |
| Privasi | Data dosen yang tampil (email, NIDN) hanya yang disetujui; NIM mahasiswa pada prestasi perlu persetujuan. Halaman Kebijakan Privasi. |
| Keandalan | Backup MySQL harian, migrasi terkontrol, halaman error ramah. |
| Observabilitas | Log error server, analitik privasi-ramah (Plausible/Umami) atau GA. |
| Browser | 2 versi terakhir Chrome, Edge, Firefox, Safari. |
| Kualitas | ESLint, `tsc --noEmit`, Playwright untuk alur kritis, CI pada tiap PR. |

## 9. Rencana fase (estimasi kasar, belum mempertimbangkan ukuran tim)

| Fase | Isi | Keluaran |
|---|---|---|
| 0. Fondasi | Migrasi TS, Prisma + MySQL, seed, CI, token desain, komponen dasar | Repo siap, DB lokal jalan |
| 1. Kerangka & halaman statis | Layout, TopNavBar, Footer, Profil, Akreditasi, Panduan TA, Kegiatan | Halaman statis dengan data dari DB |
| 2. Halaman dinamis | Dosen (+detail), Fasilitas, RPS/Kurikulum, Penelitian, Pengabdian, Prestasi, Alumni, Kerja Sama, Berita | Semua rute publik |
| 3. Panel admin | Auth, CRUD semua entitas, media, pengaturan, audit | CMS siap pakai |
| 4. Hardening & rilis | SEO, a11y, performa, keamanan, UAT, migrasi konten nyata | Go-live |

Ketergantungan: Fase 1 menunggu desain mobile (D1); Beranda (D2) menunggu desainer.

## 10. Metrik keberhasilan

- 100 % halaman pada §3 terbit dan sesuai desain (QA visual).
- Lighthouse mobile: Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 95.
- Editor dapat menerbitkan berita baru < 5 menit tanpa bantuan developer.
- Konten RPS seluruh mata kuliah tersedia untuk diunduh saat rilis.
- Pencarian "arsitektur untad" menampilkan situs di halaman pertama dalam 3 bulan setelah rilis.

## 11. Pertanyaan terbuka

1. **Desain mobile dan Beranda** kapan tersedia? (D1, D2)
2. **Hosting & domain:** server UNTAD, VPS, atau PaaS? Subdomain `arsitektur.untad.ac.id`? MySQL dikelola siapa?
3. Siapa pemilik konten dan jumlah editor? Apakah perlu alur persetujuan (editor → admin) sebelum terbit?
4. Konten nyata tersedia untuk migrasi (dosen, RPS, berita lama)? Dari mana (situs lama, Excel)?
5. Frame yang belum diperiksa visual (⚠️): apakah Kerja Sama, Alumni, Lembaga punya komponen khusus (filter, peta, logo mitra)?
6. Apakah Penelitian perlu halaman detail dan integrasi SINTA/Google Scholar otomatis?
7. ~~ORM~~ → **Prisma (diputuskan)**. Auth: Auth.js atau sesi sendiri? (tabel `users` sudah ada; tabel sesi menunggu keputusan ini)
8. Apakah perlu bahasa Inggris untuk calon mahasiswa internasional atau akreditasi internasional?
9. Kebijakan tampil NIM mahasiswa dan data kontak dosen di publik.
10. Gelar dan penulisan nama resmi: "Arsitektur UNTAD" vs "Program Studi Arsitektur Universitas Tadulako" (header memakai singkatan, footer nama lengkap).
