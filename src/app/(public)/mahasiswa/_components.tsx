import { ProgramCard } from "@/components/cards";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { MediaImage } from "@/components/ui/media-image";
import { Container, Eyebrow, Paragraphs } from "@/components/ui/primitives";
import type { PageBlockData } from "@/lib/queries/common";
import { mahasiswaTabs } from "@/lib/site";

export function MahasiswaHero({ hero, fallbackTitle }: { hero?: PageBlockData; fallbackTitle: string }) {
  return (
    <>
      <PageHero title={hero?.title ?? fallbackTitle} description={hero?.body} image={hero?.image} size="lg" />
      <SubNav items={mahasiswaTabs} label="Navigasi kemahasiswaan" />
    </>
  );
}

/** Pengantar dua kolom: teks kiri, foto berbingkai dengan aksen siku kanan. */
export function IntroSplit({ block, eyebrow }: { block?: PageBlockData; eyebrow: string }) {
  if (!block) return null;
  return (
    <section className="py-20 lg:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-[466fr_564fr] lg:gap-[122px]">
        <div className="flex flex-col gap-6">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-black leading-tight text-ink sm:text-4xl">{block.title}</h2>
          <Paragraphs text={block.body} className="text-base leading-8 text-ink-soft sm:text-lg" />
        </div>
        <div className="relative p-2">
          <span aria-hidden className="absolute -bottom-2 -right-2 size-24 border-b-4 border-r-4 border-primary" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line-warm shadow-[0_25px_50px_-12px_rgb(0_0_0/0.25)]">
            <MediaImage media={block.image} sizes="(min-width: 1024px) 560px, 90vw" />
          </div>
        </div>
      </Container>
    </section>
  );
}

export function ProgramGrid({
  heading,
  programs,
}: {
  heading?: PageBlockData;
  programs: Parameters<typeof ProgramCard>[0]["item"][];
}) {
  if (!programs.length) return null;
  return (
    <section className="border-t border-line-warm bg-white py-20 lg:py-24">
      <Container className="flex flex-col gap-12">
        <div className="flex max-w-xl flex-col gap-3">
          <h2 className="font-display text-3xl font-black text-ink sm:text-4xl">{heading?.title ?? "Program"}</h2>
          {heading?.body ? <p className="text-base text-ink-soft">{heading.body}</p> : null}
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p.slug} item={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
