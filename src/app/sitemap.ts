import type { MetadataRoute } from "next";
import { getAchievementSlugs, getNewsSlugs, getProgramSlugs, getResearchSlugs, getServiceSlugs, listFacilities } from "@/lib/queries/content";
import { getLecturerSlugs } from "@/lib/queries/people";
import { siteUrl } from "@/lib/site";

const staticPaths = [
  "/",
  "/profil",
  "/profil/akreditasi",
  "/profil/dosen-staf",
  "/fasilitas",
  "/akademik/kurikulum",
  "/akademik/rps",
  "/akademik/panduan-ta",
  "/mahasiswa/kegiatan-akademik",
  "/mahasiswa/kegiatan-nonakademik",
  "/mahasiswa/lembaga",
  "/mahasiswa/prestasi",
  "/mahasiswa/alumni",
  "/penelitian",
  "/pengabdian/dosen",
  "/pengabdian/mahasiswa",
  "/kerja-sama",
  "/berita",
  "/kebijakan-privasi",
  "/syarat-ketentuan",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, lecturers, research, services, achievements, programs, facilities] = await Promise.all([
    getNewsSlugs(),
    getLecturerSlugs(),
    getResearchSlugs(),
    getServiceSlugs(),
    getAchievementSlugs(),
    getProgramSlugs(),
    listFacilities(),
  ]);
  const url = (p: string) => new URL(p, siteUrl).toString();
  return [
    ...staticPaths.map((p) => ({ url: url(p), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...news.map((s) => ({ url: url(`/berita/${s}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...lecturers.map((s) => ({ url: url(`/profil/dosen-staf/${s}`), priority: 0.5 })),
    ...research.map((s) => ({ url: url(`/penelitian/${s}`), priority: 0.5 })),
    ...services.map((s) => ({ url: url(`/pengabdian/${s}`), priority: 0.5 })),
    ...achievements.map((s) => ({ url: url(`/mahasiswa/prestasi/${s}`), priority: 0.5 })),
    ...programs.map((s) => ({ url: url(`/mahasiswa/kegiatan/${s}`), priority: 0.4 })),
    ...facilities.map((f) => ({ url: url(`/fasilitas/${f.slug}`), priority: 0.5 })),
  ];
}
