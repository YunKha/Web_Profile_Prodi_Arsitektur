import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ChevronRight, FlaskConical, Map as MapIcon, Search } from "lucide-react";
import { ResearchCard, researchAuthors } from "@/components/cards";
import { PageHero } from "@/components/layouts/page-hero";
import { ExternalLinkButton } from "@/components/ui/external-link-button";
import { MediaImage } from "@/components/ui/media-image";
import { Pagination } from "@/components/ui/pagination";
import { Badge, Container, EmptyState, LinkButton, buttonClass } from "@/components/ui/primitives";
import { getPageBlocks, pageParam, stringParam } from "@/lib/queries/common";
import { getFeaturedResearch, getResearchFilters, listPopularResearch, listResearch } from "@/lib/queries/content";
import { mediaUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Penelitian",
  description: "Penelitian dosen dan mahasiswa Program Studi Arsitektur UNTAD: arsitektur tropis, mitigasi bencana, material lokal, dan perancangan kota.",
};

export default async function PenelitianPage({ searchParams }: PageProps<"/penelitian">) {
  const [blocks, featured, popular] = await Promise.all([getPageBlocks("penelitian"), getFeaturedResearch(), listPopularResearch(4)]);
  const { hero, cta, roadmap } = blocks;
  const showRoadmap = Boolean(roadmap && (roadmap.linkUrl || roadmap.images.length || roadmap.body));

  return (
    <>
      <PageHero title={hero?.title ?? "Penelitian"} description={hero?.body} image={hero?.image} breadcrumb={[{ label: "Penelitian" }]} />

      {featured ? (
        <section id="unggulan" className="py-20 lg:py-24" aria-labelledby="unggulan-title">
          <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="relative aspect-[8/5] overflow-hidden rounded-2xl shadow-[0_25px_50px_-12px_rgb(0_0_0/0.25)]">
              <MediaImage media={featured.cover} sizes="(min-width: 1024px) 560px, 90vw" />
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <Badge tone="primary">Penelitian Unggulan</Badge>
                <span className="text-sm font-semibold text-muted">
                  {[featured.field, featured.year].filter(Boolean).join(" · ")}
                </span>
              </div>
              <h2 id="unggulan-title" className="font-display text-3xl font-black leading-tight text-ink sm:text-4xl">
                {featured.title}
              </h2>
              <p className="line-clamp-5 text-base leading-8 text-ink-soft">{featured.abstract}</p>
              <p className="text-sm font-semibold text-ink">{researchAuthors(featured)}</p>
              <div>
                <LinkButton href={`/penelitian/${featured.slug}`}>
                  Baca Penelitian Lengkap <ArrowRight className="size-4" aria-hidden />
                </LinkButton>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {showRoadmap && roadmap ? (
        <section id="roadmap" className="scroll-mt-28 border-t border-line-warm py-20 lg:py-24" aria-labelledby="roadmap-title">
          <Container className="flex flex-col gap-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex max-w-2xl flex-col gap-4">
                <p className="eyebrow flex items-center gap-2 text-primary">
                  <MapIcon className="size-4" aria-hidden /> Arah Riset
                </p>
                <h2 id="roadmap-title" className="font-display text-3xl font-black text-ink sm:text-4xl">
                  {roadmap.title ?? "Roadmap Penelitian"}
                </h2>
                {roadmap.body ? <p className="text-lg leading-8 text-ink-soft">{roadmap.body}</p> : null}
              </div>
              <ExternalLinkButton href={roadmap.linkUrl} label={roadmap.linkLabel || "Lihat Dokumen Roadmap"} variant="outline" className="self-start md:self-auto" />
            </div>
            {roadmap.images.length ? (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {roadmap.images.map((img, i) => (
                  <li key={`${img.media.id}-${i}`}>
                    <figure className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line-warm bg-white shadow-[var(--shadow-card)]">
                      <a href={mediaUrl(img.media.path) ?? "#"} target="_blank" rel="noopener noreferrer" className="relative block aspect-[4/3] overflow-hidden bg-grey-100">
                        <MediaImage media={img.media} alt={img.caption ?? img.media.altText ?? "Tema roadmap penelitian"} sizes="(min-width: 1024px) 33vw, 100vw" className="object-contain transition-transform duration-500 group-hover:scale-105" />
                        <span className="sr-only">Buka gambar ukuran penuh</span>
                      </a>
                      <figcaption className="flex items-center gap-3 border-t border-line-warm p-5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 font-display text-sm font-black text-primary">
                          {i + 1}
                        </span>
                        <span className="font-display font-bold text-ink">{img.caption ?? `Tema ${i + 1}`}</span>
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            ) : null}
          </Container>
        </section>
      ) : null}

      <section className="border-y border-line-warm bg-white py-20 lg:py-24" aria-labelledby="daftar">
        <Container>
          <Suspense fallback={<div className="h-[600px] animate-pulse rounded-2xl bg-grey-100" aria-busy="true" />}>
            <ResearchList searchParams={searchParams} />
          </Suspense>
        </Container>
      </section>

      {popular.length ? (
        <section className="py-20 lg:py-24" aria-labelledby="populer">
          <Container className="flex flex-col gap-8">
            <div className="flex items-center gap-6">
              <h2 id="populer" className="shrink-0 font-display text-2xl font-black text-ink sm:text-3xl">
                Penelitian Populer
              </h2>
              <span className="h-px flex-1 bg-line-warm" aria-hidden />
            </div>
            <ul className="divide-y divide-line-warm border-y border-line-warm">
              {popular.map((r) => (
                <li key={r.slug}>
                  <Link href={`/penelitian/${r.slug}`} className="group flex items-center justify-between gap-6 py-6">
                    <div className="flex min-w-0 flex-col gap-1">
                      <h3 className="font-display text-lg font-bold text-ink group-hover:text-primary">{r.title}</h3>
                      <p className="text-sm text-muted">
                        {researchAuthors(r)}
                        {r.field ? ` · ${r.field}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Tahun</p>
                        <p className="font-display text-lg font-black text-ink">{r.year ?? "—"}</p>
                      </div>
                      <ChevronRight className="size-5 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <section className="bg-[linear-gradient(135deg,#4f2a03,#7d4607_50%,#af640e)] py-20 text-white lg:py-24">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-3xl font-display text-3xl font-black sm:text-5xl">{cta?.title ?? "Eksplorasi Hasil Penelitian"}</h2>
          {cta?.body ? <p className="max-w-2xl text-lg text-white/85">{cta.body}</p> : null}
          <LinkButton href="/#kontak" variant="light" className="mt-2">
            Hubungi Kami untuk Kolaborasi
          </LinkButton>
        </Container>
      </section>
    </>
  );
}

async function ResearchList({ searchParams }: { searchParams: PageProps<"/penelitian">["searchParams"] }) {
  const sp = await searchParams;
  const q = stringParam(sp.q);
  const year = Number(stringParam(sp.tahun)) || 0;
  const field = stringParam(sp.bidang);
  const page = pageParam(sp.page);
  const [data, filters] = await Promise.all([listResearch({ q, year, field, page }), getResearchFilters()]);
  const select = "h-11 rounded-full border border-line-warm bg-background px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-100";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <h2 id="daftar" className="font-display text-2xl font-black text-ink sm:text-3xl">
            Daftar Penelitian
          </h2>
          <span className="h-1 w-20 bg-primary" aria-hidden />
        </div>
        <Form action="/penelitian" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <label className="relative">
            <span className="sr-only">Cari judul penelitian</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-300" aria-hidden />
            <input type="search" name="q" defaultValue={q} placeholder="Cari judul penelitian..." className={`${select} w-full pl-10 sm:w-64`} />
          </label>
          <label>
            <span className="sr-only">Tahun</span>
            <select name="tahun" defaultValue={year ? String(year) : ""} className={select}>
              <option value="">Semua Tahun</option>
              {filters.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Bidang kajian</span>
            <select name="bidang" defaultValue={field} className={select}>
              <option value="">Semua Bidang Kajian</option>
              {filters.fields.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={buttonClass("primary", "h-11 py-0")}>
            Terapkan
          </button>
        </Form>
      </div>

      {data.items.length ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((r) => (
            <ResearchCard key={r.slug} item={r} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<FlaskConical className="size-10" />} title="Penelitian tidak ditemukan" description="Coba kata kunci atau filter lain." />
      )}
      <Pagination page={data.page} pageCount={data.pageCount} basePath="/penelitian" params={{ q, tahun: year, bidang: field }} />
    </div>
  );
}
