import "server-only";
import { PrismaClient } from "../../generated/prisma/client";
import { createPrismaClient } from "./create-client";

// Satu instance per proses. Di mode dev, hot reload membuat modul dievaluasi
// ulang, jadi instance disimpan di globalThis agar koneksi tidak menumpuk.
// Kelas PrismaClient ikut disimpan: setelah `prisma generate` (skema berubah)
// kelasnya berganti, dan instance lama dibuang agar tidak memakai skema usang
// (gejalanya: "Unknown field ... for include statement" sampai server di-restart).
const globalForPrisma = globalThis as unknown as {
  prismaClient?: { client: PrismaClient; ctor: typeof PrismaClient };
};

function getClient() {
  const cached = globalForPrisma.prismaClient;
  if (cached?.ctor === PrismaClient) return cached.client;
  cached?.client.$disconnect().catch(() => {});
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prismaClient = { client, ctor: PrismaClient };
  return client;
}

export const db = getClient();
