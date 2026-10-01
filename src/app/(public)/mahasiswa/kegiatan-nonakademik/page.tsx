import type { Metadata } from "next";
import { getPageBlocks } from "@/lib/queries/common";
import { listPrograms } from "@/lib/queries/content";
import { IntroSplit, MahasiswaHero, ProgramGrid } from "../_components";

export const metadata: Metadata = {
  title: "Kegiatan Nonakademik",
  description: "Organisasi kemahasiswaan, bakti sosial, serta festival dan event kampus mahasiswa Arsitektur UNTAD.",
};

export default async function KegiatanNonakademikPage() {
  const [blocks, programs] = await Promise.all([getPageBlocks("kegiatan-nonakademik"), listPrograms("nonakademik")]);
  return (
    <>
      <MahasiswaHero hero={blocks.hero} fallbackTitle="Kegiatan Nonakademik" />
      <IntroSplit block={blocks.intro} eyebrow="Kehidupan Kampus" />
      <ProgramGrid heading={blocks.program} programs={programs} />
    </>
  );
}
