import type { Metadata } from "next";
import { Suspense } from "react";
import { Quote } from "lucide-react";
import { Avatar } from "@/components/cards";
import { Pagination } from "@/components/ui/pagination";
import { Container, EmptyState } from "@/components/ui/primitives";
import { getPageBlocks, getSettings, pageParam } from "@/lib/queries/common";
import { listAlumni } from "@/lib/queries/people";
import { MahasiswaHero } from "../_components";

export const metadata: Metadata = {
  title: "Alumni",
  description: "Tracer study dan cerita alumni Program Studi Arsitektur Universitas Tadulako.",
};

export default async function AlumniPage({ searchParams }: PageProps<"/mahasiswa/alumni">) {
  const [blocks, settings] = await Promise.all([getPageBlocks("alumni"), getSettings()]);
  const { hero, tracer } = blocks;

  return (
    <>
      <MahasiswaHero hero={hero} fallbackTitle="Alumni" />

      <section className="py-20 lg:py-24" aria-labelledby="tracer">
        <Container className="flex flex-col gap-12">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 id="tracer" className="font-display text-3xl font-black text-ink sm:text-4xl">
              {tracer?.title ?? "Tracer Study"}
            </h2>
            {tracer?.body ? <p className="text-lg text-ink-soft">{tracer.body}</p> : null}
          </div>
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {settings.alumniStats.map((s) => (
              <div key={s.label} className="flex flex-col gap-3 rounded-2xl border border-line-warm bg-white p-8 shadow-[var(--shadow-card)]">
                <span className="h-1 w-10 bg-primary" aria-hidden />
                <dd className="font-display text-5xl font-black text-ink">{s.value}</dd>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="border-t border-line-warm bg-white py-20 lg:py-24" aria-labelledby="cerita">
        <Container className="flex flex-col gap-12">
          <h2 id="cerita" className="font-display text-3xl font-black uppercase text-ink sm:text-4xl">
            Cerita Alumni
          </h2>
          <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-grey-100" aria-busy="true" />}>
            <AlumniList searchParams={searchParams} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

async function AlumniList({ searchParams }: { searchParams: PageProps<"/mahasiswa/alumni">["searchParams"] }) {
  const page = pageParam((await searchParams).page);
  const data = await listAlumni(page);
  if (!data.items.length) return <EmptyState title="Belum ada cerita alumni" />;
  return (
    <>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.items.map((a) => (
          <li key={a.id} className="relative flex flex-col gap-6 rounded-2xl border border-line-warm bg-background p-8">
            <Quote className="absolute right-6 top-6 size-10 text-primary-100" aria-hidden />
            {a.testimonial ? <p className="relative text-[15px] italic leading-7 text-ink-soft">&ldquo;{a.testimonial}&rdquo;</p> : null}
            <div className="mt-auto flex items-center gap-4 border-t border-line-warm pt-5">
              <Avatar media={a.photo} name={a.name} size={56} />
              <div>
                <p className="font-display font-bold text-ink">{a.name}</p>
                <p className="text-xs text-muted">
                  {[a.jobTitle, a.company].filter(Boolean).join(" · ")}
                  {a.gradYear ? ` · Lulus ${a.gradYear}` : ""}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Pagination page={data.page} pageCount={data.pageCount} basePath="/mahasiswa/alumni" />
    </>
  );
}
