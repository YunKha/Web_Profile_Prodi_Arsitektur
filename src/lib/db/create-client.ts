import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

/**
 * Membuat PrismaClient untuk MySQL dari satu variabel lingkungan DATABASE_URL.
 * Prisma 7 memakai driver adapter, jadi koneksi dikonfigurasi di sini.
 * Dipakai oleh aplikasi (lib/db/client.ts) dan skrip seed (prisma/seed.ts).
 */
export function createPrismaClient(connectionLimit = 5) {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL belum diatur (lihat .env.example).");

  const url = new URL(raw);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit,
  });

  return new PrismaClient({ adapter });
}
