# Website Program Studi Arsitektur UNTAD

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 · MySQL 8

Spesifikasi produk: [docs/PRD.md](docs/PRD.md). Panduan arsitektur & konvensi kode: [AGENTS.md](AGENTS.md).

## Prasyarat

- Node.js ≥ 22.12
- MySQL 8 yang bisa diakses (mis. Laragon)

## Menjalankan secara lokal

```bash
npm install                 # juga menjalankan `prisma generate`
cp .env.example .env        # lalu isi DATABASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD (min. 12 karakter)
npm run db:migrate          # membuat database & tabel
npm run db:seed             # data contoh + akun admin awal
npm run dev                 # http://localhost:3000
```

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` / `build` / `start` | Server dev, build, dan server production |
| `npm run lint` / `typecheck` | ESLint dan `tsc --noEmit` |
| `npm run db:migrate` | Buat & terapkan migrasi dari `prisma/schema.prisma` |
| `npm run db:deploy` | Terapkan migrasi di production |
| `npm run db:seed` | Isi data awal (aman dijalankan ulang) |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | Reset database (hanya dev) |
