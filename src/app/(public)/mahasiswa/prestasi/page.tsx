import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Trophy } from "lucide-react";
import { AchievementCard } from "@/components/cards";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { Pagination } from "@/components/ui/pagination";
import { Container, EmptyState, cx } from "@/components/ui/primitives";
import { getPageBlocks, pageParam, stringParam } from "@/lib/queries/common";
import { listAchievements } from "@/lib/queries/content";
import { mahasiswaTabs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Prestasi Mahasiswa",
  description: "Prestasi mahasiswa Arsitektur Universitas Tadulako di kompetisi tingkat lokal, nasional, dan internasional.",
};

const levels = [
  { key: "", label: "Semua Tingkat" },
  { key: "internasional", label: "Internasional" },
  { key: "nasional", label: "Nasional" },
  { key: "lokal", label: "Lokal" },
];

export default async function PrestasiPage({ searchParams }: PageProps<"/mahasiswa/prestasi">) {
  const hero = (await getPageBlocks("prestasi")).hero;
  return (
    <>
      <PageHero title={hero?.title ?? "Prestasi Mahasiswa"} description={hero?.body} />
      <SubNav items={mahasiswaTabs} label="Navigasi kemahasiswaan" />
      <section className="py-16 lg:py-24">
        <Container>
          <Suspense fallback={<div className="h-[480px] animate-pulse rounded-2xl bg-grey-100" aria-busy="true" />}>
            <AchievementList searchParams={searchParams} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

async function AchievementList({ searchParams }: { searchParams: PageProps<"/mahasiswa/prestasi">["searchParams"] }) {
  const sp = await searchParams;
  const level = stringParam(sp.tingkat);
  const page = pageParam(sp.page);
  const data = await listAchievements({ page, level });

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 border-b border-line-warm pb-6 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-2xl font-black text-ink sm:text-3xl">Prestasi Unggulan</h2>
        <nav aria-label="Filter tingkat" className="flex flex-wrap gap-2">
          {levels.map((l) => (
            <Link
              key={l.key}
              href={l.key ? `/mahasiswa/prestasi?tingkat=${l.key}` : "/mahasiswa/prestasi"}
              aria-current={level === l.key ? "true" : undefined}
              className={cx(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition",
                level === l.key ? "border-primary bg-primary text-white" : "border-line-warm bg-white text-ink-soft hover:border-primary hover:text-primary",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      {data.items.length ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((a) => (
            <AchievementCard key={a.slug} item={a} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Trophy className="size-10" />} title="Belum ada prestasi" />
      )}
      <Pagination page={data.page} pageCount={data.pageCount} basePath="/mahasiswa/prestasi" params={{ tingkat: level }} />
    </div>
  );
}
