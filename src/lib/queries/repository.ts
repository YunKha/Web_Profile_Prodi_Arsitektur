import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import { mediaSelect, paged, published, type MediaRef, type Paged } from "./common";

export type RepositoryDriveLink = { title: string; url: string };

export type RepositoryArticleSummary = {
  id: number;
  slug: string;
  title: string;
  authors: string | null;
  year: number | null;
  category: string | null;
  abstract: string | null;
  driveLinks: RepositoryDriveLink[];
  cover: MediaRef | null;
  viewCount: number;
  createdAt: Date;
};

export type RepositoryArticleDetail = RepositoryArticleSummary & {
  body: string | null;
  updatedAt: Date;
};

function parseDriveLinks(raw: unknown): RepositoryDriveLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is { title: string; url: string } =>
        typeof item === "object" && item !== null && typeof item.title === "string" && typeof item.url === "string",
    )
    .map((item) => ({
      title: item.title.trim(),
      url: item.url.trim(),
    }));
}

export async function listRepositoryArticles({
  q = "",
  category = "",
  year,
  page = 1,
  pageSize = 12,
}: {
  q?: string;
  category?: string;
  year?: number;
  page?: number;
  pageSize?: number;
} = {}): Promise<Paged<RepositoryArticleSummary>> {
  "use cache";
  cacheLife("days");
  cacheTag("repository");

  const where = {
    ...published,
    ...(category ? { category } : {}),
    ...(year ? { year } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { authors: { contains: q } },
            { abstract: { contains: q } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.repositoryArticle.findMany({
      where,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        authors: true,
        year: true,
        category: true,
        abstract: true,
        driveLinks: true,
        viewCount: true,
        createdAt: true,
        cover: { select: mediaSelect },
      },
    }),
    db.repositoryArticle.count({ where }),
  ]);

  const items: RepositoryArticleSummary[] = rows.map((r) => ({
    ...r,
    driveLinks: parseDriveLinks(r.driveLinks),
  }));

  return paged(items, total, page, pageSize);
}

export async function getRepositoryArticle(slug: string): Promise<RepositoryArticleDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag("repository");

  const row = await db.repositoryArticle.findUnique({
    where: { slug, ...published },
    select: {
      id: true,
      slug: true,
      title: true,
      authors: true,
      year: true,
      category: true,
      abstract: true,
      body: true,
      driveLinks: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      cover: { select: mediaSelect },
    },
  });

  if (!row) return null;

  return {
    ...row,
    driveLinks: parseDriveLinks(row.driveLinks),
  };
}

export async function getRepositoryCategories(): Promise<string[]> {
  "use cache";
  cacheLife("days");
  cacheTag("repository");

  const rows = await db.repositoryArticle.findMany({
    where: { ...published, category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return rows.map((r) => r.category).filter((c): c is string => Boolean(c && c.trim()));
}

export async function getRepositoryYears(): Promise<number[]> {
  "use cache";
  cacheLife("days");
  cacheTag("repository");

  const rows = await db.repositoryArticle.findMany({
    where: { ...published, year: { not: null } },
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });

  return rows.map((r) => r.year).filter((y): y is number => typeof y === "number");
}

export async function getRepositorySlugs(): Promise<string[]> {
  "use cache";
  cacheLife("days");
  cacheTag("repository");

  const rows = await db.repositoryArticle.findMany({
    where: published,
    select: { slug: true },
  });

  return rows.map((r) => r.slug);
}
