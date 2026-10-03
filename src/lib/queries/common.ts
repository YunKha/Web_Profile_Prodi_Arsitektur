import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import { mergeSettings, type SiteSettings } from "@/lib/settings";

/** Kolom media yang dibutuhkan untuk merender gambar. */
export const mediaSelect = { id: true, path: true, width: true, height: true, altText: true, mime: true } as const;

export type MediaRef = { id: number; path: string; width: number | null; height: number | null; altText: string | null; mime: string };

export const published = { status: "published" } as const;

export type Paged<T> = { items: T[]; total: number; page: number; pageCount: number };

export function paged<T>(items: T[], total: number, page: number, size: number): Paged<T> {
  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / size)) };
}

export function pageParam(v: string | string[] | undefined): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function stringParam(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 100) ?? "";
}

/** Tahun berjalan (di dalam scope cache agar aman saat prerender). */
export async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("days");
  cacheTag("settings");
  const rows = await db.siteSetting.findMany();
  return mergeSettings(rows);
}

export type PageBlockData = {
  blockKey: string;
  title: string | null;
  body: string | null;
  image: MediaRef | null;
  linkUrl: string | null;
  linkLabel: string | null;
  images: { media: MediaRef; caption: string | null }[];
  sortOrder: number;
};

/** Semua blok editorial satu halaman (beserta tautan & galerinya), diindeks per blockKey. */
export async function getPageBlocks(pageKey: string): Promise<Record<string, PageBlockData>> {
  "use cache";
  cacheLife("days");
  cacheTag("pages");
  const [rows, images] = await Promise.all([
    db.pageBlock.findMany({
      where: { pageKey },
      orderBy: { sortOrder: "asc" },
      select: { blockKey: true, title: true, body: true, linkUrl: true, linkLabel: true, sortOrder: true, image: { select: mediaSelect } },
    }),
    db.pageBlockImage.findMany({
      where: { pageKey },
      orderBy: { sortOrder: "asc" },
      select: { blockKey: true, caption: true, media: { select: mediaSelect } },
    }),
  ]);
  return Object.fromEntries(
    rows.map((r) => [
      r.blockKey,
      { ...r, images: images.filter((i) => i.blockKey === r.blockKey).map(({ media, caption }) => ({ media, caption })) },
    ]),
  );
}

/** Jalur Tugas Akhir beserta tahapannya (halaman Panduan TA). */
export async function getThesisTracks() {
  "use cache";
  cacheLife("days");
  cacheTag("thesis");
  return db.thesisTrack.findMany({
    where: published,
    orderBy: { sortOrder: "asc" },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getMissions() {
  "use cache";
  cacheLife("days");
  cacheTag("pages");
  return db.missionItem.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getFacilityNav() {
  "use cache";
  cacheLife("days");
  cacheTag("facilities");
  const rows = await db.facility.findMany({
    where: published,
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true, navLabel: true },
  });
  return rows.map((f) => ({ label: f.navLabel || f.name, href: `/fasilitas/${f.slug}` }));
}

export async function getCurrentAccreditation() {
  "use cache";
  cacheLife("days");
  cacheTag("accreditation");
  return db.accreditation.findFirst({
    where: { isCurrent: true },
    orderBy: { validFrom: "desc" },
    include: { documents: { include: { media: { select: { ...mediaSelect, sizeBytes: true, originalName: true } } } } },
  });
}

/** Statistik satu sumber (PRD D10): dosen dihitung, akreditasi dari data aktif, sisanya dari pengaturan. */
export async function getStats() {
  "use cache";
  cacheLife("hours");
  cacheTag("settings", "lecturers", "accreditation");
  const [settings, lecturerCount, staffCount, accreditation] = await Promise.all([
    getSettings(),
    db.lecturer.count({ where: { ...published, staffType: "dosen", isActive: true } }),
    db.lecturer.count({ where: { ...published, isActive: true } }),
    getCurrentAccreditation(),
  ]);
  return {
    foundedYear: settings.stats.foundedYear,
    studentCount: settings.stats.studentCount,
    alumniCount: settings.stats.alumniCount,
    lecturerCount,
    staffCount,
    accreditationRank: accreditation?.rank ?? "—",
  };
}

export async function getDocument(key: string) {
  "use cache";
  cacheLife("days");
  cacheTag("documents");
  return db.document.findUnique({
    where: { key },
    include: { media: { select: { ...mediaSelect, sizeBytes: true, originalName: true } } },
  });
}
