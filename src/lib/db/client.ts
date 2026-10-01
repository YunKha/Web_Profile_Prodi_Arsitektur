import "server-only";
import { createPrismaClient } from "./create-client";

// Satu instance per proses. Di mode dev, hot reload membuat modul dievaluasi
// ulang, jadi instance disimpan di globalThis agar koneksi tidak menumpuk.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
