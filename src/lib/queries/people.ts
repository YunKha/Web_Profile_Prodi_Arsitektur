import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import type { Prisma } from "@/generated/prisma/client";
import { mediaSelect, paged, published } from "./common";

export const LECTURER_PAGE = 8;

const lecturerCard = {
  id: true,
  slug: true,
  fullName: true,
  frontTitle: true,
  backTitle: true,
  staffType: true,
  structuralRole: true,
  expertise: true,
  email: true,
  sintaUrl: true,
  scholarUrl: true,
  websiteUrl: true,
  photo: { select: mediaSelect },
} satisfies Prisma.LecturerSelect;

export async function listLecturers({ q = "", limit = LECTURER_PAGE, type }: { q?: string; limit?: number; type?: "dosen" | "tendik" }) {
  "use cache";
  cacheLife("hours");
  cacheTag("lecturers");
  const where: Prisma.LecturerWhereInput = {
    ...published,
    ...(type ? { staffType: type } : {}),
    ...(q
      ? { OR: [{ fullName: { contains: q } }, { expertise: { contains: q } }, { structuralRole: { contains: q } }] }
      : {}),
  };
  const [items, total] = await Promise.all([
    db.lecturer.findMany({ where, orderBy: [{ sortOrder: "asc" }, { fullName: "asc" }], take: limit, select: lecturerCard }),
    db.lecturer.count({ where }),
  ]);
  return { items, total, hasMore: total > items.length };
}

export async function getLecturer(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("lecturers");
  return db.lecturer.findFirst({
    where: { slug, ...published },
    include: {
      photo: { select: mediaSelect },
      education: { orderBy: [{ gradYear: "desc" }] },
      research: {
        where: { research: published },
        orderBy: { research: { year: "desc" } },
        take: 6,
        select: { research: { select: { slug: true, title: true, year: true } } },
      },
    },
  });
}

export async function getLecturerSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag("lecturers");
  const rows = await db.lecturer.findMany({ where: published, select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function getLecturersByIds(ids: number[]) {
  "use cache";
  cacheLife("hours");
  cacheTag("lecturers");
  if (ids.length === 0) return [];
  const rows = await db.lecturer.findMany({ where: { id: { in: ids }, ...published }, select: lecturerCard });
  return ids.map((id) => rows.find((r) => r.id === id)).filter((r) => r != null);
}

export async function listAlumni(page: number, size = 9) {
  "use cache";
  cacheLife("hours");
  cacheTag("alumni");
  const [items, total] = await Promise.all([
    db.alumnus.findMany({
      where: published,
      orderBy: [{ gradYear: "desc" }, { name: "asc" }],
      skip: (page - 1) * size,
      take: size,
      include: { photo: { select: mediaSelect } },
    }),
    db.alumnus.count({ where: published }),
  ]);
  return paged(items, total, page, size);
}
