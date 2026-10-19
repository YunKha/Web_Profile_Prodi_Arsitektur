import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FolderArchive } from "lucide-react";
import { RepositoryCard } from "@/components/cards";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { Pagination } from "@/components/ui/pagination";
import { SearchBox } from "@/components/ui/search-box";
import { Container, EmptyState, cx } from "@/components/ui/primitives";
import { getPageBlocks, pageParam, stringParam } from "@/lib/queries/common";
import {
  getRepositoryCategories,
  getRepositoryYears,
  listRepositoryArticles,
} from "@/lib/queries/repository";
import { akademikTabs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Repositori Artikel",
  description:
    "Kumpulan publikasi, artikel ilmiah, dan arsip karya sivitas akademika Program Studi Arsitektur UNTAD yang dapat diakses dan diunduh melalui Google Drive.",
};

export default async function RepositoryPage({
  searchParams,
}: PageProps<"/repository">) {
  const hero = (await getPageBlocks("repository")).hero;

  return (
    <>
      <PageHero
        title={hero?.title ?? "Repositori Artikel"}
        description={
          hero?.body ??
          "Kumpulan naskah karya ilmiah, artikel publikasi, dan arsip riset arsitektur. Anda dapat membaca rincian artikel dan mengakses berkas lengkap melalui tautan Google Drive."
        }
        image={hero?.image}
        breadcrumb={[{ label: "Akademik", href: "/akademik/kurikulum" }, { label: "Repository" }]}
      />
      <SubNav items={akademikTabs} label="Navigasi akademik" />

      <section className="py-16 lg:py-20">
        <Container className="flex flex-col gap-10">
          <Suspense
            fallback={
              <div className="h-[700px] animate-pulse rounded-2xl bg-grey-100" aria-busy="true" />
            }
          >
            <RepositoryList searchParams={searchParams} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

async function RepositoryList({
  searchParams,
}: {
  searchParams: PageProps<"/repository">["searchParams"];
}) {
  const sp = await searchParams;
  const q = stringParam(sp.q);
  const category = stringParam(sp.kategori);
  const yearParam = Number(sp.tahun);
  const year = Number.isInteger(yearParam) && yearParam > 1900 ? yearParam : undefined;
  const page = pageParam(sp.page);

  const [data, categories, years] = await Promise.all([
    listRepositoryArticles({ q, category, year, page, pageSize: 12 }),
    getRepositoryCategories(),
    getRepositoryYears(),
  ]);

  const filterHref = (newCat?: string, newYear?: number | "") => {
    const s = new URLSearchParams();
    const finalCat = newCat !== undefined ? newCat : category;
    const finalYear = newYear !== undefined ? newYear : year;
    if (finalCat) s.set("kategori", finalCat);
    if (finalYear) s.set("tahun", String(finalYear));
    if (q) s.set("q", q);
    const qs = s.toString();
    return `/repository${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black text-ink sm:text-3xl">Daftar Artikel & Berkas</h2>
          <p className="text-sm text-ink-soft">Ditemukan {data.total} artikel repositori</p>
        </div>
        <SearchBox
          action="/repository"
          defaultValue={q}
          placeholder="Cari judul, penulis, atau kata kunci…"
          hidden={{
            ...(category ? { kategori: category } : {}),
            ...(year ? { tahun: String(year) } : {}),
          }}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Kategori repositori" className="flex flex-wrap gap-2.5">
          <Link
            href={filterHref("", year)}
            aria-current={!category ? "true" : undefined}
            className={cx(
              "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition",
              !category
                ? "border-primary bg-primary text-white shadow-md"
                : "border-line-warm bg-white text-ink-soft hover:border-primary hover:text-primary",
            )}
          >
            Semua Kategori
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={filterHref(c, year)}
              aria-current={category === c ? "true" : undefined}
              className={cx(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition",
                category === c
                  ? "border-primary bg-primary text-white shadow-md"
                  : "border-line-warm bg-white text-ink-soft hover:border-primary hover:text-primary",
              )}
            >
              {c}
            </Link>
          ))}
        </nav>

        {years.length ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">Tahun:</span>
            <div className="flex flex-wrap gap-1.5">
              <Link
                href={filterHref(category, "")}
                className={cx(
                  "rounded-md border px-2.5 py-1 text-xs font-bold transition",
                  !year
                    ? "border-ink bg-ink text-white"
                    : "border-line-warm bg-white text-ink-soft hover:border-ink",
                )}
              >
                Semua
              </Link>
              {years.map((y) => (
                <Link
                  key={y}
                  href={filterHref(category, y)}
                  className={cx(
                    "rounded-md border px-2.5 py-1 text-xs font-bold transition",
                    year === y
                      ? "border-ink bg-ink text-white"
                      : "border-line-warm bg-white text-ink-soft hover:border-ink",
                  )}
                >
                  {y}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {data.items.length ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item) => (
            <RepositoryCard key={item.slug} article={item} headingLevel="h3" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FolderArchive className="size-10" />}
          title="Artikel repositori tidak ditemukan"
          description="Coba gunakan kata kunci pencarian lain atau pilih kategori dan tahun yang berbeda."
        />
      )}

      <Pagination
        page={data.page}
        pageCount={data.pageCount}
        basePath="/repository"
        params={{
          ...(q ? { q } : {}),
          ...(category ? { kategori: category } : {}),
          ...(year ? { tahun: String(year) } : {}),
        }}
      />
    </>
  );
}
