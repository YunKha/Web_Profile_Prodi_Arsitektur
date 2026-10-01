import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { MediaImage } from "@/components/ui/media-image";
import { Container, Eyebrow, Paragraphs, buttonClass } from "@/components/ui/primitives";
import { getDocument, getPageBlocks } from "@/lib/queries/common";
import { getCurriculumTable } from "@/lib/queries/content";
import { akademikTabs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kurikulum",
  description: "Kurikulum berbasis kompetensi dan studio perancangan Program Studi Arsitektur Universitas Tadulako.",
};

export default async function KurikulumPage() {
  const [blocks, courses, doc] = await Promise.all([getPageBlocks("kurikulum"), getCurriculumTable(), getDocument("dokumen-kurikulum")]);
  const { hero, intro } = blocks;
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits ?? 0), 0);
  const semesters = Array.from(new Set(courses.map((c) => c.semester))).sort((a, b) => a - b);

  return (
    <>
      <PageHero title={hero?.title ?? "Kurikulum"} description={hero?.body} image={hero?.image} />
      <SubNav items={akademikTabs} label="Navigasi akademik" />

      <section className="py-20 lg:py-28">
        <Container className="grid items-center gap-14 lg:grid-cols-[466fr_662fr] lg:gap-6">
          <div className="flex flex-col gap-6">
            <Eyebrow>Struktur Pembelajaran</Eyebrow>
            <h2 className="font-display text-3xl font-black leading-tight text-ink sm:text-4xl">{intro?.title}</h2>
            <Paragraphs text={intro?.body} className="text-base leading-8 text-ink-soft sm:text-lg" />
            <div className="flex flex-wrap gap-4 pt-2">
              {doc ? (
                <a href={`/media/${doc.media.path}?download=${encodeURIComponent(doc.media.originalName ?? "kurikulum.pdf")}`} className={buttonClass("primary")}>
                  <Download className="size-4" aria-hidden /> Unduh Dokumen Kurikulum
                </a>
              ) : null}
              <Link href="/akademik/rps" className={buttonClass("outline")}>
                Lihat RPS <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="relative lg:pl-16">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line-warm shadow-[0_25px_50px_-12px_rgb(0_0_0/0.2)]">
              <MediaImage media={intro?.image} alt="Diagram arsitektur" sizes="(min-width: 1024px) 600px, 90vw" />
              <div className="absolute bottom-5 left-5 rounded-xl border border-white/40 bg-white/70 px-5 py-3 backdrop-blur-md">
                <p className="eyebrow text-[10px] text-ink-soft">Total Beban Studi</p>
                <p className="font-display text-2xl font-black text-ink">{totalCredits} SKS</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {courses.length ? (
        <section className="border-t border-line-warm bg-white py-20 lg:py-24" aria-labelledby="struktur">
          <Container className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <h2 id="struktur" className="font-display text-3xl font-black uppercase text-ink">Struktur Mata Kuliah</h2>
              <p className="text-ink-soft">Sebaran mata kuliah per semester. Unduh RPS tiap mata kuliah di halaman RPS.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {semesters.map((sem) => {
                const list = courses.filter((c) => c.semester === sem);
                return (
                  <section key={sem} className="flex flex-col rounded-2xl border border-line-warm bg-background p-6">
                    <header className="flex items-baseline justify-between border-b border-line-warm pb-3">
                      <h3 className="font-display text-lg font-black text-ink">Semester {sem}</h3>
                      <span className="text-xs font-bold text-primary">{list.reduce((s, c) => s + (c.credits ?? 0), 0)} SKS</span>
                    </header>
                    <ul className="flex flex-col gap-3 pt-4">
                      {list.map((c) => (
                        <li key={c.code} className="flex items-start justify-between gap-3 text-sm">
                          <span>
                            <span className="block text-[11px] font-bold tracking-[0.08em] text-muted">{c.code}</span>
                            <span className="font-medium text-ink">{c.name}</span>
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-ink-soft">{c.credits ?? "-"} sks</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
