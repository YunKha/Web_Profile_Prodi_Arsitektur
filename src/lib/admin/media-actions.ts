"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { deleteUploadFile } from "@/lib/storage";
import type { Prisma } from "@/generated/prisma/client";

export type MediaItem = {
  id: number;
  path: string;
  mime: string;
  width: number | null;
  height: number | null;
  altText: string | null;
  originalName: string | null;
  sizeBytes: number;
  createdAt?: string;
};

const PAGE = 24;

const listSchema = z.object({
  q: z.string().trim().max(100).default(""),
  kind: z.enum(["image", "document", "all"]).default("all"),
  page: z.number().int().min(1).default(1),
});

export async function listMediaAction(input: z.input<typeof listSchema>) {
  await requireUser();
  const { q, kind, page } = listSchema.parse(input);
  const where: Prisma.MediaWhereInput = {
    ...(kind === "image" ? { mime: { startsWith: "image/" } } : kind === "document" ? { mime: "application/pdf" } : {}),
    ...(q ? { OR: [{ altText: { contains: q } }, { originalName: { contains: q } }] } : {}),
  };
  const [rows, total] = await Promise.all([
    db.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }),
    db.media.count({ where }),
  ]);
  const items: MediaItem[] = rows.map((m) => ({
    id: m.id,
    path: m.path,
    mime: m.mime,
    width: m.width,
    height: m.height,
    altText: m.altText,
    originalName: m.originalName,
    sizeBytes: m.sizeBytes,
    createdAt: m.createdAt.toISOString(),
  }));
  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE)) };
}

export async function updateMediaAltAction(id: number, altText: string) {
  const user = await requireUser();
  const value = z.string().trim().max(255).parse(altText);
  await db.media.update({ where: { id }, data: { altText: value || null } });
  await audit(user, "update", "media", id, { altText: value });
  return { ok: true };
}

/** Jumlah tempat sebuah media dipakai (relasi + gambar sisipan di teks kaya). */
async function mediaUsage(id: number) {
  const m = await db.media.findUnique({
    where: { id },
    select: {
      path: true,
      _count: {
        select: {
          pageBlocks: true,
          accreditationDocs: true,
          lecturers: true,
          facilityImages: true,
          courseDocuments: true,
          documents: true,
          programs: true,
          organizations: true,
          achievements: true,
          achievementStudents: true,
          achievementImages: true,
          alumni: true,
          communityServices: true,
          communityServiceImgs: true,
          partnerships: true,
          news: true,
          research: true,
          researchImages: true,
          researchFiles: true,
        },
      },
    },
  });
  if (!m) return null;
  const relations = Object.values(m._count).reduce((a, b) => a + b, 0);
  const needle = `/media/${m.path}`;
  const [n, r, s, p] = await Promise.all([
    db.news.count({ where: { body: { contains: needle } } }),
    db.research.count({ where: { body: { contains: needle } } }),
    db.communityService.count({ where: { body: { contains: needle } } }),
    db.program.count({ where: { body: { contains: needle } } }),
  ]);
  return { path: m.path, count: relations + n + r + s + p };
}

export async function deleteMediaAction(id: number): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser();
  const usage = await mediaUsage(id);
  if (!usage) return { ok: false, message: "Media tidak ditemukan." };
  if (usage.count > 0) return { ok: false, message: `Media masih dipakai di ${usage.count} tempat. Lepaskan dulu dari konten terkait.` };
  await db.media.delete({ where: { id } });
  await deleteUploadFile(usage.path);
  await audit(user, "delete", "media", id, { path: usage.path });
  updateTag("pages");
  return { ok: true, message: "Media dihapus." };
}
