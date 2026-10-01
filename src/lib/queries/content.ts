import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import type { Prisma, ProgramKind, ServiceKind } from "@/generated/prisma/client";
import { mediaSelect, paged, published } from "./common";

const fileSelect = { ...mediaSelect, sizeBytes: true, originalName: true } as const;

// ───────────── Fasilitas ─────────────

export async function listFacilities() {
  "use cache";
  cacheLife("days");
  cacheTag("facilities");
  return db.facility.findMany({
    where: published,
    orderBy: { sortOrder: "asc" },
    include: {
      features: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" }, include: { media: { select: mediaSelect } } },
    },
  });
}

export async function getFacility(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag("facilities");
  return db.facility.findFirst({
    where: { slug, ...published },
    include: {
      features: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" }, include: { media: { select: mediaSelect } } },
    },
  });
}

// ───────────── Akademik ─────────────

export const COURSE_PAGE = 10;

export async function listCourses({ q = "", semester = 0, page = 1 }: { q?: string; semester?: number; page?: number }) {
  "use cache";
  cacheLife("hours");
  cacheTag("courses");
  const where: Prisma.CourseWhereInput = {
    ...published,
    ...(semester ? { semester } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { code: { contains: q } }] } : {}),
  };
  const [items, total] = await Promise.all([
    db.course.findMany({
      where,
      orderBy: [{ semester: "asc" }, { sortOrder: "asc" }, { code: "asc" }],
      skip: (page - 1) * COURSE_PAGE,
      take: COURSE_PAGE,
      include: {
        documents: { where: { type: "rps" }, orderBy: { id: "desc" }, take: 1, include: { media: { select: fileSelect } } },
      },
    }),
    db.course.count({ where }),
  ]);
  return paged(items, total, page, COURSE_PAGE);
}

export async function getCurriculumTable() {
  "use cache";
  cacheLife("hours");
  cacheTag("courses");
  return db.course.findMany({
    where: published,
    orderBy: [{ semester: "asc" }, { sortOrder: "asc" }, { code: "asc" }],
    select: { code: true, name: true, semester: true, credits: true },
  });
}

// ───────────── Kemahasiswaan ─────────────

export async function listPrograms(kind: ProgramKind) {
  "use cache";
  cacheLife("hours");
  cacheTag("programs");
  return db.program.findMany({
    where: { kind, ...published },
    orderBy: { sortOrder: "asc" },
    include: { image: { select: mediaSelect } },
  });
}

export async function getProgram(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("programs");
  return db.program.findFirst({ where: { slug, ...published }, include: { image: { select: mediaSelect } } });
}

export async function getProgramSlugs() {
  "use cache";
  cacheTag("programs");
  return (await db.program.findMany({ where: published, select: { slug: true } })).map((r) => r.slug);
}

export async function listOrganizations() {
  "use cache";
  cacheLife("hours");
  cacheTag("organizations");
  return db.organization.findMany({
    where: published,
    orderBy: { sortOrder: "asc" },
    include: { logo: { select: mediaSelect } },
  });
}

export const ACHIEVEMENT_PAGE = 9;

const achievementCard = {
  id: true,
  slug: true,
  title: true,
  studentName: true,
  achievementYear: true,
  cohortYear: true,
  level: true,
  rankLabel: true,
  category: true,
  summary: true,
  cover: { select: mediaSelect },
} satisfies Prisma.AchievementSelect;

export async function listAchievements({ page = 1, level }: { page?: number; level?: string }) {
  "use cache";
  cacheLife("hours");
  cacheTag("achievements");
  const where: Prisma.AchievementWhereInput = {
    ...published,
    ...(level === "lokal" || level === "nasional" || level === "internasional" ? { level } : {}),
  };
  const [items, total] = await Promise.all([
    db.achievement.findMany({
      where,
      orderBy: [{ achievementYear: "desc" }, { publishedAt: "desc" }],
      skip: (page - 1) * ACHIEVEMENT_PAGE,
      take: ACHIEVEMENT_PAGE,
      select: achievementCard,
    }),
    db.achievement.count({ where }),
  ]);
  return paged(items, total, page, ACHIEVEMENT_PAGE);
}

export async function listFeaturedAchievements(limit = 3) {
  "use cache";
  cacheLife("hours");
  cacheTag("achievements");
  const featured = await db.achievement.findMany({
    where: { ...published, isFeatured: true },
    orderBy: [{ achievementYear: "desc" }, { publishedAt: "desc" }],
    take: limit,
    select: achievementCard,
  });
  if (featured.length >= limit) return featured;
  const rest = await db.achievement.findMany({
    where: { ...published, id: { notIn: featured.map((a) => a.id) } },
    orderBy: [{ achievementYear: "desc" }, { publishedAt: "desc" }],
    take: limit - featured.length,
    select: achievementCard,
  });
  return [...featured, ...rest];
}

export async function getAchievement(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("achievements", "lecturers");
  return db.achievement.findFirst({
    where: { slug, ...published },
    include: {
      cover: { select: mediaSelect },
      studentPhoto: { select: mediaSelect },
      images: { orderBy: { sortOrder: "asc" }, include: { media: { select: mediaSelect } } },
      advisors: {
        include: {
          lecturer: {
            select: { slug: true, fullName: true, frontTitle: true, backTitle: true, structuralRole: true, status: true, photo: { select: mediaSelect } },
          },
        },
      },
    },
  });
}

export async function getAchievementSlugs() {
  "use cache";
  cacheTag("achievements");
  return (await db.achievement.findMany({ where: published, select: { slug: true } })).map((r) => r.slug);
}

// ───────────── Penelitian ─────────────

export const RESEARCH_PAGE = 9;

const researchCard = {
  id: true,
  slug: true,
  title: true,
  abstract: true,
  year: true,
  field: true,
  scheme: true,
  authorsText: true,
  viewCount: true,
  cover: { select: mediaSelect },
  authors: {
    orderBy: { authorOrder: "asc" },
    select: { lecturer: { select: { fullName: true, frontTitle: true, backTitle: true } } },
  },
} satisfies Prisma.ResearchSelect;

export async function listResearch({ q = "", year = 0, field = "", page = 1 }: { q?: string; year?: number; field?: string; page?: number }) {
  "use cache";
  cacheLife("hours");
  cacheTag("research");
  const where: Prisma.ResearchWhereInput = {
    ...published,
    ...(year ? { year } : {}),
    ...(field ? { field } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { abstract: { contains: q } }] } : {}),
  };
  const [items, total] = await Promise.all([
    db.research.findMany({
      where,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * RESEARCH_PAGE,
      take: RESEARCH_PAGE,
      select: researchCard,
    }),
    db.research.count({ where }),
  ]);
  return paged(items, total, page, RESEARCH_PAGE);
}

export async function getResearchFilters() {
  "use cache";
  cacheLife("hours");
  cacheTag("research");
  const [years, fields] = await Promise.all([
    db.research.findMany({ where: { ...published, year: { not: null } }, distinct: ["year"], select: { year: true }, orderBy: { year: "desc" } }),
    db.research.findMany({ where: { ...published, field: { not: null } }, distinct: ["field"], select: { field: true }, orderBy: { field: "asc" } }),
  ]);
  return { years: years.map((y) => y.year as number), fields: fields.map((f) => f.field as string) };
}

export async function getFeaturedResearch() {
  "use cache";
  cacheLife("hours");
  cacheTag("research");
  return db.research.findFirst({
    where: { ...published, isFeatured: true },
    orderBy: [{ year: "desc" }, { updatedAt: "desc" }],
    select: researchCard,
  });
}

export async function listPopularResearch(limit = 4) {
  "use cache";
  cacheLife("hours");
  cacheTag("research");
  return db.research.findMany({
    where: published,
    orderBy: [{ viewCount: "desc" }, { year: "desc" }],
    take: limit,
    select: researchCard,
  });
}

export async function getResearch(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("research", "lecturers");
  return db.research.findFirst({
    where: { slug, ...published },
    include: {
      cover: { select: mediaSelect },
      images: { orderBy: { sortOrder: "asc" }, include: { media: { select: mediaSelect } } },
      files: { orderBy: { sortOrder: "asc" }, include: { media: { select: fileSelect } } },
      authors: {
        orderBy: { authorOrder: "asc" },
        include: { lecturer: { select: { slug: true, fullName: true, frontTitle: true, backTitle: true, status: true } } },
      },
    },
  });
}

export async function listRelatedResearch(id: number, field: string | null, limit = 3) {
  "use cache";
  cacheLife("hours");
  cacheTag("research");
  const items = await db.research.findMany({
    where: { ...published, id: { not: id }, ...(field ? { field } : {}) },
    orderBy: [{ year: "desc" }],
    take: limit,
    select: researchCard,
  });
  if (items.length >= limit || !field) return items;
  const more = await db.research.findMany({
    where: { ...published, id: { notIn: [id, ...items.map((i) => i.id)] } },
    orderBy: [{ year: "desc" }],
    take: limit - items.length,
    select: researchCard,
  });
  return [...items, ...more];
}

export async function getResearchSlugs() {
  "use cache";
  cacheTag("research");
  return (await db.research.findMany({ where: published, select: { slug: true } })).map((r) => r.slug);
}

// ───────────── Pengabdian ─────────────

export const SERVICE_PAGE = 9;

const serviceCard = {
  id: true,
  slug: true,
  kind: true,
  title: true,
  summary: true,
  locationName: true,
  year: true,
  publishedAt: true,
  cover: { select: mediaSelect },
} satisfies Prisma.CommunityServiceSelect;

export async function listServices(kind: ServiceKind, page = 1) {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  const where = { kind, ...published };
  const [items, total] = await Promise.all([
    db.communityService.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { year: "desc" }],
      skip: (page - 1) * SERVICE_PAGE,
      take: SERVICE_PAGE,
      select: serviceCard,
    }),
    db.communityService.count({ where }),
  ]);
  return paged(items, total, page, SERVICE_PAGE);
}

export async function getService(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  const row = await db.communityService.findFirst({
    where: { slug, ...published },
    include: {
      cover: { select: mediaSelect },
      images: { orderBy: { sortOrder: "asc" }, include: { media: { select: mediaSelect } } },
    },
  });
  if (!row) return null;
  // Decimal tidak bisa diserialisasi; ubah ke number.
  return { ...row, lat: row.lat == null ? null : Number(row.lat), lng: row.lng == null ? null : Number(row.lng) };
}

export async function listOtherServices(id: number, kind: ServiceKind, limit = 3) {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  return db.communityService.findMany({
    where: { ...published, kind, id: { not: id } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: serviceCard,
  });
}

export async function getServiceSlugs() {
  "use cache";
  cacheTag("services");
  return (await db.communityService.findMany({ where: published, select: { slug: true } })).map((r) => r.slug);
}

// ───────────── Kerja sama ─────────────

export async function listPartnerships() {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");
  const rows = await db.partnership.findMany({
    where: published,
    orderBy: [{ sortOrder: "asc" }, { partnerName: "asc" }],
    include: { logo: { select: mediaSelect } },
  });
  const now = new Date();
  return rows.map((r) => ({ ...r, active: !r.endDate || r.endDate >= now }));
}

export async function listHomePartners() {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");
  return db.partnership.findMany({
    where: { ...published, showOnHome: true, logoId: { not: null } },
    orderBy: { sortOrder: "asc" },
    take: 10,
    include: { logo: { select: mediaSelect } },
  });
}

// ───────────── Berita ─────────────

export const NEWS_PAGE = 9;

const newsCard = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  publishedAt: true,
  viewCount: true,
  cover: { select: mediaSelect },
  category: { select: { name: true, slug: true } },
  author: { select: { name: true } },
} satisfies Prisma.NewsSelect;

/** Berita terbit: status published dan waktu terbit sudah lewat (mendukung jadwal terbit).
 * `new Date()` dipanggil di dalam scope cache; profil "minutes" membuat jadwal terbit muncul dalam ±1 menit. */
function liveNews(): Prisma.NewsWhereInput {
  return { ...published, publishedAt: { lte: new Date() } };
}

export async function listNews({ q = "", category = "", page = 1 }: { q?: string; category?: string; page?: number }) {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");
  const where: Prisma.NewsWhereInput = {
    ...liveNews(),
    ...(category ? { category: { slug: category } } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] } : {}),
  };
  const [items, total] = await Promise.all([
    db.news.findMany({ where, orderBy: { publishedAt: "desc" }, skip: (page - 1) * NEWS_PAGE, take: NEWS_PAGE, select: newsCard }),
    db.news.count({ where }),
  ]);
  return paged(items, total, page, NEWS_PAGE);
}

export async function listLatestNews(limit = 3, excludeId = 0) {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");
  return db.news.findMany({
    where: { ...liveNews(), ...(excludeId ? { id: { not: excludeId } } : {}) },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: newsCard,
  });
}

export async function getNewsCategories() {
  "use cache";
  cacheLife("days");
  cacheTag("taxonomy");
  return db.newsCategory.findMany({ orderBy: { name: "asc" } });
}

export async function getNews(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");
  return db.news.findFirst({
    where: { slug, ...liveNews() },
    include: {
      cover: { select: mediaSelect },
      category: true,
      author: { select: { name: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function getNewsSlugs() {
  "use cache";
  cacheTag("news");
  return (await db.news.findMany({ where: published, select: { slug: true } })).map((r) => r.slug);
}

/** Berita sebelum & sesudah (berdasarkan waktu terbit) untuk navigasi di detail. */
export async function getNewsNeighbors(id: number, publishedAt: Date) {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");
  const select = { slug: true, title: true, publishedAt: true } as const;
  const [prev, next] = await Promise.all([
    db.news.findFirst({ where: { ...liveNews(), id: { not: id }, publishedAt: { lt: publishedAt } }, orderBy: { publishedAt: "desc" }, select }),
    db.news.findFirst({ where: { ...liveNews(), id: { not: id }, publishedAt: { gt: publishedAt, lte: new Date() } }, orderBy: { publishedAt: "asc" }, select }),
  ]);
  return { prev, next };
}
