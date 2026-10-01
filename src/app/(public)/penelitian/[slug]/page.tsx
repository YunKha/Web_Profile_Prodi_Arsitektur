import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Eye, MapPin, User } from "lucide-react";
import { DocumentLink, ResearchCard, researchAuthors } from "@/components/cards";
import { PageHero } from "@/components/layouts/page-hero";
import { MediaImage } from "@/components/ui/media-image";
import { Container, Paragraphs, Prose, cx } from "@/components/ui/primitives";
import { ShareButtons } from "@/components/ui/share-buttons";
import { ViewTracker } from "@/components/ui/view-tracker";
import { formatCompact } from "@/lib/format";
import { getResearch, getResearchSlugs, listRelatedResearch } from "@/lib/queries/content";
import { mediaUrl } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getResearchSlugs();
  return (slugs.length ? slugs : ["__placeholder__"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/penelitian/[slug]">): Promise<Metadata> {
  const r = await getResearch((await params).slug);
  if (!r) return {};
  return {
    title: r.title,
    description: r.abstract?.slice(0, 160),
    openGraph: { type: "article", images: r.cover ? [mediaUrl(r.cover.path) as string] : undefined },
  };
}

export default async function PenelitianDetailPage({ params }: PageProps<"/penelitian/[slug]">) {
  const r = await getResearch((await params).slug);
  if (!r) notFound();
  const related = await listRelatedResearch(r.id, r.field, 3);
  const authors = researchAuthors(r);

  const info = [
    { label: "Penulis Utama", value: authors },
    { label: "Tahun Pelaksanaan", value: r.year ? String(r.year) : null },
    { label: "Skema", value: r.scheme },
    { label: "Lokasi Studi", value: r.locationName },
  ].filter((i) => i.value);

  return (
    <>
      <ViewTracker type="research" id={r.id} />
      <PageHero size="lg" title={r.title} image={r.cover} breadcrumb={[{ label: "Penelitian", href: "/penelitian" }, { label: r.field ?? "Detail" }]}>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm font-medium text-white/90">
          <li className="flex items-center gap-2">
            <User className="size-4 text-primary-200" aria-hidden />
            {authors}
          </li>
          {r.year ? (
            <li className="flex items-center gap-2">
              <Calendar className="size-4 text-primary-200" aria-hidden />
              {r.year}
            </li>
          ) : null}
          {r.locationName ? (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-primary-200" aria-hidden />
              {r.locationName}
            </li>
          ) : null}
          <li className="flex items-center gap-2">
            <Eye className="size-4 text-primary-200" aria-hidden />
            {formatCompact(r.viewCount)} kali dilihat
          </li>
        </ul>
      </PageHero>

      <Container className="grid items-start gap-12 py-16 lg:grid-cols-[331fr_741fr] lg:gap-20 lg:py-24">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-28">
          <section className="rounded-2xl border border-line-warm bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="border-b border-line-warm pb-4 font-display text-xl font-bold text-ink">Informasi Penelitian</h2>
            <dl className="mt-5 flex flex-col gap-5">
              {info.map((i) => (
                <div key={i.label}>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{i.label}</dt>
                  <dd className="mt-1 font-semibold text-ink">{i.value}</dd>
                </div>
              ))}
              {r.field ? (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Bidang Kajian</dt>
                  <dd className="mt-1.5">
                    <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-500">{r.field}</span>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Status</dt>
                <dd className="mt-1 flex items-center gap-2 font-semibold text-ink">
                  <span className={cx("size-2 rounded-full", r.progress === "selesai" ? "bg-[#17b26a]" : "bg-primary-300")} aria-hidden />
                  {r.progress === "selesai" ? "Selesai" : "Sedang Berlangsung"}
                </dd>
              </div>
            </dl>
            {r.authors.length ? (
              <div className="mt-6 border-t border-line-warm pt-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Tim Dosen</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {r.authors
                    .filter((a) => a.lecturer.status === "published")
                    .map((a) => (
                      <li key={a.lecturer.slug}>
                        <Link href={`/profil/dosen-staf/${a.lecturer.slug}`} className="text-sm font-semibold text-primary hover:underline">
                          {[a.lecturer.frontTitle, a.lecturer.fullName].filter(Boolean).join(" ")}
                          {a.lecturer.backTitle ? `, ${a.lecturer.backTitle}` : ""}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </section>
          <section className="rounded-2xl border border-line-warm bg-white p-6">
            <ShareButtons title={r.title} label="Bagikan Penelitian" />
          </section>
        </aside>

        <article className="flex min-w-0 flex-col gap-14">
          {r.abstract ? (
            <section className="flex flex-col gap-5">
              <h2 className="font-display text-3xl font-black text-ink">Abstrak</h2>
              <Paragraphs text={r.abstract} className="text-lg leading-8 text-ink-soft" />
            </section>
          ) : null}

          {r.body ? (
            <>
              <hr className="border-line-warm" />
              <Prose html={r.body} className="[&>h2:first-child]:mt-0" />
            </>
          ) : null}

          {r.images.length ? (
            <section className="flex flex-col gap-6">
              <h2 className="font-display text-3xl font-black text-ink">Dokumentasi Kegiatan</h2>
              <div className="grid gap-4 sm:grid-cols-[2fr_1fr] sm:grid-rows-2">
                {r.images.slice(0, 3).map((img, i) => (
                  <figure key={img.id} className={cx("relative overflow-hidden rounded-2xl", i === 0 ? "aspect-[3/2] sm:row-span-2 sm:aspect-auto" : "aspect-[3/2]")}>
                    <MediaImage media={img.media} sizes={i === 0 ? "(min-width: 1024px) 500px, 90vw" : "(min-width: 1024px) 240px, 90vw"} />
                    {img.caption ? (
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8 text-xs font-semibold text-white">
                        {img.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          {r.files.length || r.externalUrl ? (
            <section className="flex flex-col gap-6">
              <h2 className="font-display text-3xl font-black text-ink">Dokumen Publikasi</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {r.files.map((f) => (
                  <DocumentLink key={f.id} title={f.title} media={f.media} />
                ))}
              </div>
              {r.externalUrl ? (
                <a href={r.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                  Lihat publikasi di jurnal <ArrowRight className="size-4" aria-hidden />
                </a>
              ) : null}
            </section>
          ) : null}
        </article>
      </Container>

      {related.length ? (
        <section className="border-t border-line-warm bg-white py-20 lg:py-24" aria-labelledby="terkait">
          <Container className="flex flex-col gap-10">
            <div className="flex items-end justify-between gap-6">
              <h2 id="terkait" className="font-display text-3xl font-black text-ink">
                Penelitian Terkait
              </h2>
              <Link href="/penelitian" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                Lihat semua <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {related.map((x) => (
                <ResearchCard key={x.slug} item={x} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
