# Website Program Studi Arsitektur UNTAD

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 · MySQL 8

Situs profil prodi berbasis desain Figma "Abala" + panel admin untuk mengelola seluruh konten.
Spesifikasi produk: [docs/PRD.md](docs/PRD.md). Panduan arsitektur & konvensi kode: [AGENTS.md](AGENTS.md).

## Prasyarat

- Node.js ≥ 22.12
- MySQL 8 yang bisa diakses (mis. Laragon)

## Menjalankan secara lokal

```bash
npm install                 # juga menjalankan `prisma generate`
cp .env.example .env        # isi DATABASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD (min. 12 karakter)
npm run db:migrate          # membuat database & tabel
npm run db:seed             # data contoh dari Figma + akun admin awal
npm run dev                 # http://localhost:3000  ·  panel admin: http://localhost:3000/admin
```

Seed menyalin foto contoh dari `prisma/seed-assets/` ke `storage/uploads/seed/` dan membuat PDF contoh
(RPS, sertifikat akreditasi, buku panduan TA) agar semua tombol unduh bisa dicoba. **Semua isi seed adalah
data contoh** (nama dosen, nomor SK, mitra) dan harus diganti dengan data asli lewat panel admin.

## Panel admin (`/admin`)

| Menu | Isi |
|---|---|
| Dasbor | Ringkasan konten, draf berita, aktivitas terbaru |
| Berita, Kategori & Label | Editor teks kaya, sampul, jadwal terbit, info acara, label terkait |
| Prestasi, Penelitian, Pengabdian | Detail lengkap, galeri, dokumen PDF, dosen pembimbing/peneliti, peta lokasi |
| Dosen & Staf, Akreditasi, Fasilitas, Mata Kuliah & RPS, Dokumen | Data profil dan dokumen akademik |
| Program Kegiatan, Lembaga, Alumni, Kerja Sama | Konten kemahasiswaan dan mitra |
| Halaman | Judul hero, teks pengantar, foto latar setiap halaman; daftar misi |
| Pustaka Media | Unggah (seret-lepas), teks alternatif, hapus file yang tidak dipakai |
| Pengaturan *(Admin)* | Kontak, media sosial, statistik, footer, profil pimpinan di Beranda, tracer study |
| Pengguna, Log Aktivitas *(Admin)* | Kelola akun Admin/Editor, jejak audit siapa mengubah apa |

- **Peran:** *Admin* mengelola semua termasuk pengaturan & pengguna; *Editor* mengelola konten.
- **Draf/Terbit:** konten draf tidak tampil di website. Berita bisa dijadwalkan (isi waktu terbit di masa depan).
- **Cache:** halaman publik di-prerender dan di-cache; setiap simpan di admin langsung memperbarui halaman terkait.
- **Keamanan:** sesi di database (cookie httpOnly, token di-hash), bcrypt, pembatasan percobaan login
  (5/email & 20/IP per 15 menit), validasi Zod di setiap Server Action, sanitasi HTML, validasi tipe file dari isi
  (magic bytes), header keamanan, audit log.

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` / `build` / `start` | Server dev, build, dan server production |
| `npm run lint` / `typecheck` | ESLint dan `tsc --noEmit` |
| `npm run test:e2e` | Uji alur kritis dengan Playwright (memakai Microsoft Edge terpasang; butuh DB ber-seed) |
| `npm run db:migrate` | Buat & terapkan migrasi dari `prisma/schema.prisma` |
| `npm run db:deploy` | Terapkan migrasi di production |
| `npm run db:seed` | Isi data awal (aman dijalankan ulang, tidak menimpa hasil edit) |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | Reset database (hanya dev) |

Playwright memakai `channel: "msedge"`. Di mesin tanpa Edge, jalankan `npx playwright install chromium` lalu
`E2E_CHANNEL= npm run test:e2e`.

## Deploy (ringkas)

1. Siapkan MySQL 8 dan isi `.env` production (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `UPLOAD_DIR`).
2. `npm ci && npm run db:deploy && npm run build && npm run start` (build membutuhkan akses ke database karena
   halaman publik di-prerender dari data).
3. Arahkan `UPLOAD_DIR` ke volume persisten dan **cadangkan bersama database** — file unggahan tidak disimpan di git.
4. Jalankan di belakang reverse proxy HTTPS (cookie sesi memakai flag `secure` di production).
