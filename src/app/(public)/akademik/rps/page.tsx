import type { Metadata } from "next";
import Form from "next/form";
import { Suspense } from "react";
import { Download, FileText, Funnel, Search } from "lucide-react";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { Pagination } from "@/components/ui/pagination";
import { Container, EmptyState, buttonClass } from "@/components/ui/primitives";
import { getPageBlocks, pageParam, stringParam } from "@/lib/queries/common";
import { listCourses } from "@/lib/queries/content";
import { akademikTabs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rencana Pembelajaran Semester (RPS)",
  description: "Unduh RPS mata kuliah Program Studi Arsitektur Universitas Tadulako. Cari berdasarkan nama, kode, atau semester.",
};

export default async function RpsPage({ searchParams }: PageProps<"/akademik/rps">) {
  const hero = (await getPageBlocks("rps")).hero;
  return (
    <>
      <PageHero
        title={hero?.title ?? "Rencana Pembelajaran Semester"}
        description={hero?.body}
        breadcrumb={[{ label: "Akademik", href: "/akademik/kurikulum" }, { label: "RPS" }]}
      />
      <SubNav items={akademikTabs} label="Navigasi akademik" />
      <section className="py-14 lg:py-20">
        <Container>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-grey-100" aria-busy="true" />}>
            <CourseList searchParams={searchParams} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

async function CourseList({ searchParams }: { searchParams: PageProps<"/akademik/rps">["searchParams"] }) {
  const sp = await searchParams;
  const q = stringParam(sp.q);
  const semester = Math.min(Math.max(Number(stringParam(sp.semester)) || 0, 0), 8);
  const page = pageParam(sp.page);
  const data = await listCourses({ q, semester, page });

  return (
    <div className="flex flex-col gap-10">
      <Form action="/akademik/rps" className="grid gap-5 rounded-2xl border border-line-warm bg-white p-6 shadow-[var(--shadow-card)] md:grid-cols-[1fr_320px_auto] md:items-end">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">Cari Mata Kuliah</span>
          <span className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-300" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Masukkan nama atau kode mata kuliah..."
              className="h-12 w-full rounded-xl border border-line-warm bg-background pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-100"
            />
          </span>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">Filter Semester</span>
          <select
            name="semester"
            defaultValue={semester ? String(semester) : ""}
            className="h-12 w-full rounded-xl border border-line-warm bg-background px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-100"
          >
            <option value="">Semua Semester</option>
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Semester {i + 1}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={buttonClass("primary", "h-12 rounded-xl")}>
          <Funnel className="size-4" aria-hidden /> Terapkan
        </button>
      </Form>

      <p className="text-sm text-muted" aria-live="polite">
        Menampilkan {data.items.length} dari {data.total} mata kuliah
      </p>

      {data.items.length ? (
        <ul className="flex flex-col gap-4">
          {data.items.map((c) => {
            const rps = c.documents[0];
            return (
              <li key={c.id} className="flex flex-col gap-5 rounded-2xl border border-line-warm bg-white p-6 transition hover:border-primary-200 hover:shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="flex gap-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary-200 bg-primary-100 text-primary">
                    <FileText className="size-5" aria-hidden />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary-500">Semester {c.semester}</span>
                      <span className="text-xs font-bold tracking-[0.08em] text-muted">{c.code}</span>
                      {c.credits ? <span className="text-xs text-muted">· {c.credits} SKS</span> : null}
                    </div>
                    <h3 className="font-display text-xl font-bold text-ink">{c.name}</h3>
                    {c.description ? <p className="max-w-2xl text-[15px] leading-6 text-ink-soft">{c.description}</p> : null}
                  </div>
                </div>
                {rps ? (
                  <a
                    href={`/media/${rps.media.path}?download=${encodeURIComponent(`RPS-${c.code}.pdf`)}`}
                    className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-primary transition hover:bg-primary hover:text-white sm:self-center"
                  >
                    <Download className="size-3.5" aria-hidden /> Unduh RPS
                  </a>
                ) : (
                  <span className="shrink-0 text-xs font-semibold text-grey-300">RPS belum tersedia</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={<FileText className="size-10" />} title="Mata kuliah tidak ditemukan" description="Coba kata kunci lain atau pilih semester berbeda." />
      )}

      <Pagination page={data.page} pageCount={data.pageCount} basePath="/akademik/rps" params={{ q, semester }} />
    </div>
  );
}
