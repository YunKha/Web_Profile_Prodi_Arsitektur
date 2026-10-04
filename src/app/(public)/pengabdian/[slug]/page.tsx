import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Building, Calendar, MapPin, Users } from "lucide-react";
import { Avatar, ServiceCard } from "@/components/cards";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { Gallery } from "@/components/ui/gallery";
import { Container, Paragraphs, Prose } from "@/components/ui/primitives";
import { ShareButtons } from "@/components/ui/share-buttons";
import { formatDate } from "@/lib/format";
import { getService, getServiceSlugs, listOtherServices } from "@/lib/queries/content";
import { mediaUrl, pengabdianTabs } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return (slugs.length ? slugs : ["__placeholder__"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/pengabdian/[slug]">): Promise<Metadata> {
  const s = await getService((await params).slug);
  if (!s) return {};
  return { title: s.title, description: s.summary ?? undefined, openGraph: s.cover ? { images: [mediaUrl(s.cover.path) as string] } : undefined };
}

type TeamMember = { name: string; role?: string };

function parseTeam(value: unknown): TeamMember[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is TeamMember => typeof v === "object" && v !== null && typeof (v as TeamMember).name === "string")
    .map((v) => ({ name: v.name, role: typeof v.role === "string" ? v.role : undefined }));
}

export default function PengabdianDetailPage({ params }: PageProps<"/pengabdian/[slug]">) {
  return (
    <Suspense fallback={<div className="h-[60vh] animate-pulse bg-grey-100" aria-busy="true" />}>
      <PengabdianDetailContent params={params} />
    </Suspense>
  );
}

async function PengabdianDetailContent({ params }: PageProps<"/pengabdian/[slug]">) {
  const s = await getService((await params).slug);
  if (!s) notFound();
  const others = await listOtherServices(s.id, s.kind, 3);
  const team = parseTeam(s.team);
  const parent = s.kind === "dosen" ? pengabdianTabs[0] : pengabdianTabs[1];
  const hasMap = s.lat != null && s.lng != null;
  const d = 0.01;
  const bbox = hasMap ? `${(s.lng as number) - d},${(s.lat as number) - d},${(s.lng as number) + d},${(s.lat as number) + d}` : "";

  return (
    <>
      <PageHero
        size="lg"
        title={s.title}
        description={s.summary}
        image={s.cover}
        breadcrumb={[{ label: "Pengabdian", href: "/pengabdian/dosen" }, { label: parent.label, href: parent.href }, { label: "Detail" }]}
      >
        <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm font-medium text-white/90">
          {s.locationName ? (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-primary-200" aria-hidden />
              {s.locationName}
            </li>
          ) : null}
          {s.publishedAt || s.year ? (
            <li className="flex items-center gap-2">
              <Calendar className="size-4 text-primary-200" aria-hidden />
              {s.publishedAt ? formatDate(s.publishedAt) : s.year}
            </li>
          ) : null}
          {s.partnerName ? (
            <li className="flex items-center gap-2">
              <Building className="size-4 text-primary-200" aria-hidden />
              {s.partnerName}
            </li>
          ) : null}
        </ul>
      </PageHero>
      <SubNav items={pengabdianTabs} label="Navigasi pengabdian" />

      <Container className="grid items-start gap-12 py-16 lg:grid-cols-[760fr_368fr] lg:py-24">
        <article className="flex min-w-0 flex-col gap-12">
          {s.body ? <Prose html={s.body} className="[&>h2:first-child]:mt-0" /> : <Paragraphs text={s.summary} className="text-lg leading-8 text-ink-soft" />}
          {s.images.length ? (
            <section className="flex flex-col gap-6">
              <h2 className="font-display text-2xl font-black text-ink">Dokumentasi Kegiatan</h2>
              <Gallery
                aspect="aspect-video"
                images={s.images.map((img) => ({ src: mediaUrl(img.media.path) as string, alt: img.media.altText ?? s.title, caption: img.caption }))}
              />
            </section>
          ) : null}
          <ShareButtons title={s.title} />
        </article>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-40">
          {team.length ? (
            <section className="rounded-2xl border border-line-warm bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
              <h2 className="flex items-center gap-3 border-b border-line-warm pb-4 font-display text-xl font-bold text-ink">
                <Users className="size-5 text-primary" aria-hidden />
                Tim Pelaksana
              </h2>
              <ul className="mt-5 flex flex-col gap-5">
                {team.map((m) => (
                  <li key={m.name} className="flex items-center gap-4">
                    <Avatar media={null} name={m.name} size={56} />
                    <div>
                      <p className="font-display font-bold leading-snug text-ink">{m.name}</p>
                      {m.role ? <p className="text-xs text-muted">{m.role}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {s.locationName || hasMap ? (
            <section className="rounded-2xl border border-line-warm bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xs font-black uppercase tracking-[0.15em] text-ink">Lokasi Kegiatan</h2>
              {s.locationName ? <p className="mt-2 text-sm text-ink-soft">{s.locationName}</p> : null}
              {hasMap ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-line-warm">
                  <iframe
                    title={`Peta lokasi ${s.locationName ?? s.title}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${s.lat},${s.lng}`}
                    className="h-52 w-full"
                    loading="lazy"
                  />
                </div>
              ) : null}
              {hasMap ? (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lng}#map=15/${s.lat}/${s.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-bold text-primary hover:underline"
                >
                  Buka peta lebih besar
                </a>
              ) : null}
            </section>
          ) : null}
        </aside>
      </Container>

      {others.length ? (
        <section className="border-t border-line-warm bg-white py-20 lg:py-24">
          <Container className="flex flex-col gap-10">
            <h2 className="font-display text-3xl font-black text-ink">Kegiatan Lainnya</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <ServiceCard key={o.slug} item={o} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
