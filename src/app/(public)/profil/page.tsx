import type { Metadata } from "next";
import { Eye, Quote } from "lucide-react";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { MediaImage } from "@/components/ui/media-image";
import { Container, Paragraphs } from "@/components/ui/primitives";
import { formatCompact } from "@/lib/format";
import { getMissions, getPageBlocks, getStats } from "@/lib/queries/common";
import { profilTabs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Profil — Visi & Misi",
  description: "Sejarah, visi, misi, dan capaian Program Studi Arsitektur Universitas Tadulako.",
};

export default async function ProfilPage() {
  const [blocks, missions, stats] = await Promise.all([getPageBlocks("profil"), getMissions(), getStats()]);
  const { hero, sejarah, visi } = blocks;
  const intro = blocks["misi-intro"];

  const statItems = [
    { value: String(stats.foundedYear), label: "Tahun Berdiri" },
    { value: `${formatCompact(stats.alumniCount)}+`, label: "Alumni" },
    { value: stats.accreditationRank, label: "Akreditasi BAN-PT" },
    { value: String(stats.staffCount), label: "Staf Pengajar" },
  ];

  return (
    <>
      <PageHero eyebrow="Tentang Kami" align="center" title={hero?.title ?? "Profil Program Studi"} image={hero?.image} />
      <SubNav items={profilTabs} label="Navigasi profil" />

      {/* Sejarah */}
      <section className="relative overflow-hidden py-20 lg:py-32" aria-labelledby="sejarah">
        <div aria-hidden className="absolute -right-16 top-16 size-64 rounded-full bg-primary-100/60 blur-3xl" />
        <Container className="relative grid items-start gap-14 lg:grid-cols-[466fr_564fr] lg:gap-[122px]">
          <div className="relative mx-auto w-full max-w-[466px] p-[9px]">
            <span aria-hidden className="absolute left-0 top-0 size-24 border-l-4 border-t-4 border-primary" />
            <span aria-hidden className="absolute bottom-0 right-0 size-24 border-b-4 border-r-4 border-primary" />
            <div className="relative aspect-square overflow-hidden rounded-sm shadow-[0_25px_50px_-12px_rgb(0_0_0/0.25)]">
              <MediaImage media={sejarah?.image} alt="Kampus Arsitektur Universitas Tadulako" sizes="(min-width: 1024px) 450px, 90vw" />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h2 id="sejarah" className="font-display text-3xl font-black text-ink sm:text-4xl">
              {sejarah?.title ?? "Sejarah"}
            </h2>
            <span className="h-1 w-16 bg-primary" aria-hidden />
            <Paragraphs text={sejarah?.body} className="text-base leading-[1.75] text-ink-soft sm:text-lg" />
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line-warm pt-8 sm:grid-cols-4">
              {statItems.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <dt className="order-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{s.label}</dt>
                  <dd className="order-1 break-words font-display text-3xl font-black text-primary xl:text-4xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* Visi & Misi */}
      <section id="visi-misi" className="scroll-mt-32 bg-white py-20 lg:py-28" aria-labelledby="visi-misi-title">
        <Container className="flex flex-col gap-14">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <h2 id="visi-misi-title" className="font-display text-3xl font-black uppercase text-ink sm:text-4xl">
              {intro?.title ?? "Visi & Misi"}
            </h2>
            <span className="h-1 w-16 bg-primary" aria-hidden />
            {intro?.body ? <p className="text-lg leading-8 text-ink-soft">{intro.body}</p> : null}
          </div>

          <div className="grid gap-8 lg:grid-cols-[466fr_662fr]">
            <article className="relative overflow-hidden rounded-2xl border border-line-warm bg-background p-8 shadow-[var(--shadow-card)] sm:p-10">
              <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-primary" />
              <Quote aria-hidden className="absolute bottom-8 right-8 size-14 text-primary-100" />
              <h3 className="flex items-center gap-3 font-display text-2xl font-black uppercase text-ink">
                <Eye className="size-5 text-primary" aria-hidden />
                Visi
              </h3>
              <p className="relative mt-6 text-xl font-medium italic leading-[1.6] text-ink sm:text-2xl">&ldquo;{visi?.body}&rdquo;</p>
            </article>

            <ol className="flex flex-col gap-6">
              {missions.map((m, i) => (
                <li key={m.id} className="flex gap-5 rounded-2xl border border-line-warm bg-white p-6 shadow-[var(--shadow-card)] transition hover:border-primary-200 sm:p-8">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 font-display text-sm font-black text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-ink">{m.title}</h3>
                    <p className="text-[15px] leading-7 text-ink-soft">{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>
    </>
  );
}
