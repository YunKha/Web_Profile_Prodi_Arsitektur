import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building, Users } from "lucide-react";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { Gallery } from "@/components/ui/gallery";
import { Container, EmptyState, cx } from "@/components/ui/primitives";
import { FacilityIcon } from "@/lib/facility-icons";
import { getFacilityNav, getPageBlocks } from "@/lib/queries/common";
import { listFacilities } from "@/lib/queries/content";
import { mediaUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Fasilitas Kampus",
  description: "Studio perancangan, laboratorium model, ruang kelas, ruang ujian, dan hall Program Studi Arsitektur UNTAD.",
};

export default async function FasilitasPage() {
  const [blocks, facilities, nav] = await Promise.all([getPageBlocks("fasilitas"), listFacilities(), getFacilityNav()]);
  const hero = blocks.hero;

  return (
    <>
      <PageHero size="lg" title={hero?.title ?? "Fasilitas Kampus"} description={hero?.body} image={hero?.image} />
      <SubNav items={[{ label: "Semua Fasilitas", href: "/fasilitas" }, ...nav]} label="Navigasi fasilitas" />

      <div className="py-20 lg:py-28">
        <Container className="flex flex-col gap-24 lg:gap-32">
          {facilities.length === 0 ? <EmptyState icon={<Building className="size-10" />} title="Belum ada data fasilitas" /> : null}
          {facilities.map((f, i) => (
            <section key={f.id} aria-labelledby={`fasilitas-${f.slug}`} className="grid items-start gap-10 lg:grid-cols-[368fr_760fr] lg:gap-6">
              <div className={cx("flex flex-col gap-6", i % 2 === 1 && "lg:order-2 lg:pl-6")}>
                <h2 id={`fasilitas-${f.slug}`} className="font-display text-3xl font-black leading-tight text-ink sm:text-4xl">
                  {f.name}
                </h2>
                <p className="text-base leading-7 text-ink-soft">{f.summary}</p>
                {f.features.length ? (
                  <div className="rounded-2xl border border-line-warm bg-white p-6 shadow-[var(--shadow-card)]">
                    <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.1em] text-ink">
                      <Building className="size-4 text-primary" aria-hidden />
                      Fasilitas Utama
                    </p>
                    <hr className="my-4 border-line-warm" />
                    <ul className="flex flex-col gap-3">
                      {f.features.slice(0, 5).map((ft) => (
                        <li key={ft.id} className="flex gap-3 text-[15px] leading-6 text-ink-soft">
                          <FacilityIcon name={ft.icon} className="mt-0.5 size-4 shrink-0 text-primary" />
                          {ft.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-5">
                  {f.capacity ? (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft">
                      <Users className="size-4 text-primary" aria-hidden />
                      Kapasitas {f.capacity} orang
                    </span>
                  ) : null}
                  <Link href={`/fasilitas/${f.slug}`} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.1em] text-primary hover:text-primary-500">
                    Lihat detail <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
              <div className={cx(i % 2 === 1 && "lg:order-1")}>
                <Gallery
                  aspect="aspect-video"
                  images={f.images.map((img) => ({ src: mediaUrl(img.media.path) as string, alt: img.media.altText ?? f.name, caption: img.caption }))}
                />
              </div>
            </section>
          ))}
        </Container>
      </div>
    </>
  );
}
