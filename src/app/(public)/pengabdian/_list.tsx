import { Suspense } from "react";
import { HeartHandshake } from "lucide-react";
import { ServiceCard } from "@/components/cards";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { MediaImage } from "@/components/ui/media-image";
import { Pagination } from "@/components/ui/pagination";
import { Container, EmptyState, Paragraphs } from "@/components/ui/primitives";
import type { ServiceKind } from "@/generated/prisma/client";
import { getPageBlocks, pageParam } from "@/lib/queries/common";
import { listServices } from "@/lib/queries/content";
import { pengabdianTabs } from "@/lib/site";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function ServiceListPage({ kind, searchParams }: { kind: ServiceKind; searchParams: SP }) {
  const blocks = await getPageBlocks(kind === "dosen" ? "pengabdian-dosen" : "pengabdian-mahasiswa");
  const { hero, intro } = blocks;
  const basePath = `/pengabdian/${kind}`;

  return (
    <>
      <PageHero
        size="lg"
        align="center"
        eyebrow="Tridharma Perguruan Tinggi"
        title={hero?.title ?? "Pengabdian Kepada Masyarakat"}
        description={hero?.body}
        image={hero?.image}
      />
      <SubNav items={pengabdianTabs} label="Navigasi pengabdian" />

      {intro ? (
        <section className="py-20 lg:py-28">
          <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-6">
            <div className="flex flex-col gap-6 lg:pr-16">
              <span className="h-1 w-16 bg-primary" aria-hidden />
              <h2 className="font-display text-3xl font-black text-ink sm:text-4xl">{intro.title}</h2>
              <Paragraphs text={intro.body} className="text-base leading-8 text-ink-soft sm:text-lg" />
            </div>
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-line-warm p-2 shadow-[0_25px_50px_-12px_rgb(0_0_0/0.2)]">
              <div className="relative size-full overflow-hidden rounded-xl">
                <MediaImage media={intro.image} sizes="(min-width: 1024px) 560px, 90vw" />
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-line-warm bg-white py-20 lg:py-24" aria-labelledby="kegiatan">
        <Container className="flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <h2 id="kegiatan" className="font-display text-3xl font-black text-ink sm:text-4xl">
              {kind === "dosen" ? "Kegiatan Pengabdian Dosen" : "Program & Proyek Mahasiswa"}
            </h2>
            <p className="text-ink-soft">Dokumentasi kegiatan pengabdian kepada masyarakat terbaru.</p>
          </div>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-grey-100" aria-busy="true" />}>
            <ServiceGrid kind={kind} searchParams={searchParams} basePath={basePath} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

async function ServiceGrid({ kind, searchParams, basePath }: { kind: ServiceKind; searchParams: SP; basePath: string }) {
  const page = pageParam((await searchParams).page);
  const data = await listServices(kind, page);
  if (!data.items.length) return <EmptyState icon={<HeartHandshake className="size-10" />} title="Belum ada kegiatan pengabdian" />;
  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {data.items.map((s) => (
          <ServiceCard key={s.slug} item={s} />
        ))}
      </div>
      <Pagination page={data.page} pageCount={data.pageCount} basePath={basePath} />
    </>
  );
}
