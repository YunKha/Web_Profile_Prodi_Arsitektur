import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { Gallery } from "@/components/ui/gallery";
import { MediaImage } from "@/components/ui/media-image";
import { Container, Paragraphs } from "@/components/ui/primitives";
import { FacilityIcon } from "@/lib/facility-icons";
import { getFacilityNav } from "@/lib/queries/common";
import { getFacility, listFacilities } from "@/lib/queries/content";
import { mediaUrl } from "@/lib/site";

export async function generateStaticParams() {
  const rows = await listFacilities();
  return (rows.length ? rows.map((r) => r.slug) : ["__placeholder__"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/fasilitas/[slug]">): Promise<Metadata> {
  const f = await getFacility((await params).slug);
  if (!f) return {};
  return {
    title: f.name,
    description: f.summary ?? undefined,
    openGraph: f.images[0] ? { images: [mediaUrl(f.images[0].media.path) as string] } : undefined,
  };
}

export default async function FasilitasDetailPage({ params }: PageProps<"/fasilitas/[slug]">) {
  const { slug } = await params;
  const [f, nav] = await Promise.all([getFacility(slug), getFacilityNav()]);
  if (!f) notFound();

  const images = f.images.map((img) => ({ src: mediaUrl(img.media.path) as string, alt: img.media.altText ?? f.name, caption: img.caption }));

  return (
    <>
      <PageHero
        title={f.name}
        description={f.summary}
        image={f.images[0]?.media}
        breadcrumb={[{ label: "Fasilitas", href: "/fasilitas" }, { label: f.navLabel || f.name }]}
      />
      <SubNav items={[{ label: "Semua Fasilitas", href: "/fasilitas" }, ...nav]} label="Navigasi fasilitas" />

      <section className="py-20 lg:py-28">
        <Container className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <h2 className="font-display text-3xl font-black leading-tight text-ink sm:text-4xl">{f.headline || f.name}</h2>
              <span className="h-1.5 w-20 bg-primary" aria-hidden />
              <Paragraphs text={f.body} className="text-base leading-8 text-ink-soft sm:text-lg" />
              {f.capacity ? (
                <p className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-bold text-primary-500">
                  <Users className="size-4" aria-hidden />
                  Kapasitas {f.capacity} orang
                </p>
              ) : null}
            </div>

            {f.features.length ? (
              <div className="flex flex-col gap-6">
                <h3 className="font-display text-xl font-bold text-ink">Spesifikasi Fasilitas</h3>
                <ul className="grid gap-6 sm:grid-cols-2">
                  {f.features.map((ft) => (
                    <li key={ft.id} className="flex gap-4">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-line-warm bg-white text-primary shadow-sm">
                        <FacilityIcon name={ft.icon} className="size-6" />
                      </span>
                      <div>
                        <h4 className="font-semibold text-ink">{ft.title}</h4>
                        {ft.description ? <p className="mt-1 text-sm leading-5 text-muted">{ft.description}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-40">
            {images.length ? (
              <Gallery images={images} />
            ) : (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <MediaImage media={null} alt={f.name} />
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
