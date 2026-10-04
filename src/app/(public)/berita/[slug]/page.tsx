import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Building, Calendar, Clock, Eye, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/layouts/breadcrumb";
import { MediaImage } from "@/components/ui/media-image";
import { Badge, Container, Prose } from "@/components/ui/primitives";
import { ShareButtons } from "@/components/ui/share-buttons";
import { ViewTracker } from "@/components/ui/view-tracker";
import { formatCompact, formatDate, formatShortDate, formatTime } from "@/lib/format";
import { getNews, getNewsNeighbors, getNewsSlugs, listLatestNews } from "@/lib/queries/content";
import { mediaUrl, siteFullName, siteUrl } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getNewsSlugs();
  return (slugs.length ? slugs : ["__placeholder__"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/berita/[slug]">): Promise<Metadata> {
  const n = await getNews((await params).slug);
  if (!n) return {};
  return {
    title: n.title,
    description: n.excerpt ?? undefined,
    openGraph: {
      type: "article",
      publishedTime: n.publishedAt?.toISOString(),
      images: n.cover ? [mediaUrl(n.cover.path) as string] : undefined,
    },
  };
}

export default function BeritaDetailPage({ params }: PageProps<"/berita/[slug]">) {
  return (
    <Container className="flex flex-col gap-10 py-12 lg:py-16">
      <Suspense fallback={<div className="h-[800px] animate-pulse rounded-2xl bg-grey-100" aria-busy="true" />}>
        <BeritaDetailContent params={params} />
      </Suspense>
    </Container>
  );
}

async function BeritaDetailContent({ params }: PageProps<"/berita/[slug]">) {
  const n = await getNews((await params).slug);
  if (!n) notFound();
  const [others, neighbors] = await Promise.all([listLatestNews(3, n.id), n.publishedAt ? getNewsNeighbors(n.id, n.publishedAt) : null]);
  const hasEvent = Boolean(n.eventDate || n.eventLocation || n.eventOrganizer);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: n.title,
    description: n.excerpt ?? undefined,
    datePublished: n.publishedAt?.toISOString(),
    dateModified: n.updatedAt.toISOString(),
    image: n.cover ? [new URL(mediaUrl(n.cover.path) as string, siteUrl).toString()] : undefined,
    author: { "@type": "Organization", name: n.author?.name ?? siteFullName },
    publisher: { "@type": "CollegeOrUniversity", name: siteFullName, logo: { "@type": "ImageObject", url: new URL("/images/logo-untad.png", siteUrl).toString() } },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ViewTracker type="news" id={n.id} />
      <div className="flex flex-col gap-10">
        <header className="flex max-w-4xl flex-col gap-6">
          <Breadcrumb items={[{ label: "Berita", href: "/berita" }, { label: n.category?.name ?? "Detail" }]} />
          {n.category ? (
            <Link href={`/berita?kategori=${n.category.slug}`} className="w-fit">
              <Badge>{n.category.name}</Badge>
            </Link>
          ) : null}
          <h1 className="font-display text-3xl font-black leading-[1.15] text-ink sm:text-5xl">{n.title}</h1>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-brown">
            <li className="flex items-center gap-2">
              <Calendar className="size-4" aria-hidden />
              <time dateTime={n.publishedAt?.toISOString()}>{formatDate(n.publishedAt)}</time>
            </li>
            <li className="flex items-center gap-2">
              <Eye className="size-4" aria-hidden />
              {formatCompact(n.viewCount)} kali dibaca
            </li>
            <li>Oleh {n.author?.name ?? "Redaksi Jurusan"}</li>
          </ul>
        </header>

        <div className="grid items-start gap-12 lg:grid-cols-[760fr_368fr] lg:gap-12">
          <article className="flex min-w-0 flex-col gap-10">
            {n.cover ? (
              <figure className="flex flex-col gap-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <MediaImage media={n.cover} preload sizes="(min-width: 1024px) 760px, 100vw" />
                </div>
                {n.coverCaption ? <figcaption className="text-xs italic text-muted">{n.coverCaption}</figcaption> : null}
              </figure>
            ) : null}
            {n.excerpt ? <p className="text-xl font-medium leading-8 text-ink">{n.excerpt}</p> : null}
            <Prose html={n.body} />

            <footer className="flex flex-col gap-8 border-t border-line-warm pt-8 sm:flex-row sm:items-center sm:justify-between">
              <ShareButtons title={n.title} />
              {neighbors ? (
                <nav aria-label="Berita sebelum dan sesudah" className="grid grid-cols-2 gap-3 sm:w-[400px]">
                  {neighbors.prev ? (
                    <Link href={`/berita/${neighbors.prev.slug}`} className="group flex flex-col gap-1 rounded-xl border border-line-warm bg-white p-3 hover:border-primary">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                        <ArrowLeft className="size-3" aria-hidden /> Sebelumnya
                      </span>
                      <span className="line-clamp-2 text-xs font-semibold text-ink group-hover:text-primary">{neighbors.prev.title}</span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {neighbors.next ? (
                    <Link href={`/berita/${neighbors.next.slug}`} className="group flex flex-col items-end gap-1 rounded-xl border border-line-warm bg-white p-3 text-right hover:border-primary">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                        Berikutnya <ArrowRight className="size-3" aria-hidden />
                      </span>
                      <span className="line-clamp-2 text-xs font-semibold text-ink group-hover:text-primary">{neighbors.next.title}</span>
                    </Link>
                  ) : null}
                </nav>
              ) : null}
            </footer>
          </article>

          <aside className="flex flex-col gap-10 lg:sticky lg:top-28">
            {hasEvent ? (
              <section className="relative overflow-hidden rounded-2xl border border-line-warm bg-white p-8 shadow-[var(--shadow-card)]">
                <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-primary" />
                <h2 className="border-b border-line-warm pb-4 font-display text-xl font-bold text-ink">Informasi Kegiatan</h2>
                <dl className="mt-5 flex flex-col gap-5">
                  {n.eventDate ? (
                    <div className="flex gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line-warm bg-primary-100 text-primary">
                        <Calendar className="size-4" aria-hidden />
                      </span>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Tanggal</dt>
                        <dd className="font-semibold text-ink">{formatDate(n.eventDate)}</dd>
                        <dd className="flex items-center gap-1 text-xs text-muted">
                          <Clock className="size-3" aria-hidden /> {formatTime(n.eventDate)}
                        </dd>
                      </div>
                    </div>
                  ) : null}
                  {n.eventLocation ? (
                    <div className="flex gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line-warm bg-primary-100 text-primary">
                        <MapPin className="size-4" aria-hidden />
                      </span>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Lokasi</dt>
                        <dd className="font-semibold text-ink">{n.eventLocation}</dd>
                      </div>
                    </div>
                  ) : null}
                  {n.eventOrganizer ? (
                    <div className="flex gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line-warm bg-primary-100 text-primary">
                        <Building className="size-4" aria-hidden />
                      </span>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Penyelenggara</dt>
                        <dd className="font-semibold text-ink">{n.eventOrganizer}</dd>
                      </div>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}

            {others.length ? (
              <section className="flex flex-col gap-5">
                <h2 className="font-display text-2xl font-black text-ink">Berita Lainnya</h2>
                <ul className="flex flex-col gap-4">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <Link href={`/berita/${o.slug}`} className="group flex flex-col gap-2 rounded-2xl border border-line-warm bg-white p-6 transition hover:border-primary-200 hover:shadow-[var(--shadow-card)]">
                        <span className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.05em] text-brown">
                          {o.category ? <span>{o.category.name}</span> : null}
                          <span>{formatShortDate(o.publishedAt)}</span>
                        </span>
                        <span className="font-display text-lg font-bold leading-snug text-ink group-hover:text-primary">{o.title}</span>
                        <span className="line-clamp-2 text-sm text-muted">{o.excerpt}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {n.tags.length ? (
              <section className="flex flex-col gap-4">
                <h2 className="text-xs font-black uppercase tracking-[0.15em] text-ink">Label Terkait</h2>
                <ul className="flex flex-wrap gap-2">
                  {n.tags.map(({ tag }) => (
                    <li key={tag.id} className="rounded-full border border-line-warm bg-white px-4 py-1.5 text-xs font-semibold text-ink-soft">
                      {tag.name}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
