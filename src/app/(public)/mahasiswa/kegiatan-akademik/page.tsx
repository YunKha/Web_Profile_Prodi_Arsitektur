import type { Metadata } from "next";
import { getPageBlocks } from "@/lib/queries/common";
import { listPrograms } from "@/lib/queries/content";
import { IntroSplit, MahasiswaHero, ProgramGrid } from "../_components";

export const metadata: Metadata = {
  title: "Kegiatan Akademik",
  description: "Studio perancangan, kuliah tamu, ekskursi, dan workshop BIM di Program Studi Arsitektur UNTAD.",
};

export default async function KegiatanAkademikPage() {
  const [blocks, programs] = await Promise.all([getPageBlocks("kegiatan-akademik"), listPrograms("akademik")]);
  return (
    <>
      <MahasiswaHero hero={blocks.hero} fallbackTitle="Kegiatan Akademik" />
      <IntroSplit block={blocks.intro} eyebrow="Pembelajaran Berbasis Proyek" />
      <ProgramGrid heading={blocks.program} programs={programs} />
    </>
  );
}
