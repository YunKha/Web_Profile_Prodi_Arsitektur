import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Calendar,
  Eye,
  ExternalLink,
  FileText,
  FolderArchive,
  User,
} from "lucide-react";
import { Breadcrumb } from "@/components/layouts/breadcrumb";
import { MediaImage } from "@/components/ui/media-image";
import { Badge, Container, Prose } from "@/components/ui/primitives";
import { ShareButtons } from "@/components/ui/share-buttons";
import { ViewTracker } from "@/components/ui/view-tracker";
import { formatCompact, formatDate } from "@/lib/format";
import { getRepositoryArticle, getRepositorySlugs } from "@/lib/queries/repository";
import { mediaUrl, siteFullName, siteUrl } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getRepositorySlugs();
  return (slugs.length ? slugs : ["__placeholder__"]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/repository/[slug]">): Promise<Metadata> {
  const article = await getRepositoryArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.abstract ?? undefined,
    openGraph: {
      type: "article",
      publishedTime: article.createdAt.toISOString(),
      images: article.cover ? [mediaUrl(article.cover.path) as string] : undefined,
    },
  };
}

export default function RepositoryDetailPage({
  params,
}: PageProps<"/repository/[slug]">) {
  return (
    <Container className="flex flex-col gap-10 py-12 lg:py-16">
      <Suspense
        fallback={
          <div className="h-[800px] animate-pulse rounded-2xl bg-grey-100" aria-busy="true" />
        }
      >
        <RepositoryDetailContent params={params} />
      </Suspense>
    </Container>
  );
}

async function RepositoryDetailContent({
  params,
}: {
  params: PageProps<"/repository/[slug]">["params"];
}) {
  const { slug } = await params;
  const article = await getRepositoryArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.title,
    description: article.abstract ?? undefined,
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.authors ?? siteFullName,
    },
    publisher: {
      "@type": "CollegeOrUniversity",
      name: siteFullName,
      logo: {
        "@type": "ImageObject",
        url: new URL("/images/logo-untad.png", siteUrl).toString(),
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker type="repository" id={article.id} />

      <div className="flex flex-col gap-10">
        <header className="flex max-w-4xl flex-col gap-6">
          <Breadcrumb
            items={[
              { label: "Akademik", href: "/akademik/kurikulum" },
              { label: "Repositori", href: "/repository" },
              { label: article.category ?? "Detail Artikel" },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            {article.category ? (
              <Link href={`/repository?kategori=${encodeURIComponent(article.category)}`}>
                <Badge tone="brown">{article.category}</Badge>
              </Link>
            ) : null}
            {article.year ? (
              <span className="rounded-md bg-grey-100 px-3 py-1 text-xs font-bold text-ink">
                Tahun {article.year}
              </span>
            ) : null}
          </div>

          <h1 className="font-display text-3xl font-black leading-[1.2] text-ink sm:text-5xl">
            {article.title}
          </h1>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-brown">
            {article.authors ? (
              <li className="flex items-center gap-2">
                <User className="size-4 shrink-0 text-primary" aria-hidden />
                <span>Oleh: <strong className="text-ink">{article.authors}</strong></span>
              </li>
            ) : null}
            <li className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" aria-hidden />
              <time dateTime={article.createdAt.toISOString()}>{formatDate(article.createdAt)}</time>
            </li>
            <li className="flex items-center gap-2">
              <Eye className="size-4 shrink-0" aria-hidden />
              <span>{formatCompact(article.viewCount)} kali dibaca</span>
            </li>
          </ul>
        </header>

        <div className="grid items-start gap-12 lg:grid-cols-[760fr_380fr]">
          <article className="flex min-w-0 flex-col gap-10">
            {article.cover ? (
              <figure className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
                <MediaImage media={article.cover} sizes="(min-width: 1024px) 760px, 100vw" />
              </figure>
            ) : null}

            {article.abstract ? (
              <section className="flex flex-col gap-4 rounded-2xl border border-line-warm bg-white p-6 shadow-sm sm:p-8">
                <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">
                  Abstrak / Ringkasan
                </h2>
                <p className="whitespace-pre-line text-base leading-8 text-ink-soft">
                  {article.abstract}
                </p>
              </section>
            ) : null}

            {article.body ? (
              <section className="flex flex-col gap-4">
                <Prose html={article.body} />
              </section>
            ) : null}

            <footer className="border-t border-line-warm pt-8">
              <ShareButtons title={article.title} />
            </footer>
          </article>

          {/* Sisi Kanan: Daftar Tautan Google Drive */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-28">
            <section className="overflow-hidden rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
              <div className="flex items-center gap-3 border-b border-line-warm pb-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-100 text-primary">
                  <FolderArchive className="size-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">Berkas Google Drive</h2>
                  <p className="text-xs text-muted">Akses & unduh berkas lengkap</p>
                </div>
              </div>

              {article.driveLinks.length ? (
                <div className="mt-5 flex flex-col gap-3">
                  {article.driveLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 rounded-xl border border-line-warm bg-background p-4 transition hover:border-primary hover:bg-white"
                    >
                      <div className="flex items-start gap-2.5">
                        <FileText className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        <span className="text-sm font-bold text-ink">
                          {link.title || `Berkas ${idx + 1}`}
                        </span>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-primary-500"
                      >
                        Buka di Google Drive <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-muted">
                  Tautan berkas Google Drive belum ditambahkan untuk artikel ini.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}
