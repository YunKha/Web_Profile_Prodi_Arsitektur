import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Newspaper } from "lucide-react";
import { NewsCard } from "@/components/cards";
import { Pagination } from "@/components/ui/pagination";
import { SearchBox } from "@/components/ui/search-box";
import { Container, EmptyState, cx } from "@/components/ui/primitives";
import { getPageBlocks, pageParam, stringParam } from "@/lib/queries/common";
import { getNewsCategories, listNews } from "@/lib/queries/content";

export const metadata: Metadata = {
  title: "Berita",
  description: "Berita terbaru seputar kegiatan akademik, penelitian, prestasi, dan pengabdian Program Studi Arsitektur UNTAD.",
  alternates: { types: { "application/rss+xml": "/berita/rss.xml" } },
};

export default async function BeritaPage({ searchParams }: PageProps<"/berita">) {
  const hero = (await getPageBlocks("berita")).hero;
  return (
    <section className="relative py-16 lg:py-24">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-96 bg-[url(/images/grid-pattern.svg)] bg-cover bg-top opacity-60" />
      <Container className="flex flex-col gap-12">
        <Suspense fallback={<div className="h-[700px] animate-pulse rounded-2xl bg-grey-100" aria-busy="true" />}>
          <NewsList searchParams={searchParams} title={hero?.title ?? "Berita & Informasi"} description={hero?.body} />
        </Suspense>
      </Container>
    </section>
  );
}

async function NewsList({ searchParams, title, description }: { searchParams: PageProps<"/berita">["searchParams"]; title: string; description?: string | null }) {
  const sp = await searchParams;
  const q = stringParam(sp.q);
  const category = stringParam(sp.kategori);
  const page = pageParam(sp.page);
  const [data, categories] = await Promise.all([listNews({ q, category, page }), getNewsCategories()]);
  const catHref = (slug: string) => {
    const s = new URLSearchParams();
    if (slug) s.set("kategori", slug);
    if (q) s.set("q", q);
    const qs = s.toString();
    return `/berita${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-4">
          <h1 className="font-display text-4xl font-black text-ink sm:text-6xl">{title}</h1>
          {description ? <p className="text-lg leading-8 text-ink-soft">{description}</p> : null}
        </div>
        <SearchBox action="/berita" defaultValue={q} placeholder="Cari berita..." hidden={{ kategori: category }} />
      </header>

      <nav aria-label="Kategori berita" className="flex flex-wrap gap-3">
        {[{ slug: "", name: "Semua Berita" }, ...categories].map((c) => (
          <Link
            key={c.slug}
            href={catHref(c.slug)}
            aria-current={category === c.slug ? "true" : undefined}
            className={cx(
              "rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition",
              category === c.slug ? "border-primary bg-primary text-white shadow-md" : "border-line-warm bg-white text-ink-soft hover:border-primary hover:text-primary",
            )}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {data.items.length ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((n) => (
            <NewsCard key={n.slug} news={n} headingLevel="h2" />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Newspaper className="size-10" />} title="Berita tidak ditemukan" description="Coba kata kunci lain atau pilih kategori berbeda." />
      )}
      <Pagination page={data.page} pageCount={data.pageCount} basePath="/berita" params={{ q, kategori: category }} />
    </>
  );
}
