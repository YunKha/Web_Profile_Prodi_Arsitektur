import type { Metadata } from "next";
import { Download, FolderSearch } from "lucide-react";
import { Breadcrumb } from "@/components/layouts/breadcrumb";
import { SubNav } from "@/components/layouts/sub-nav";
import { ExternalLinkButton } from "@/components/ui/external-link-button";
import { MediaImage } from "@/components/ui/media-image";
import { Container, buttonClass } from "@/components/ui/primitives";
import { formatBytes } from "@/lib/format";
import { getDocument, getPageBlocks, getThesisTracks } from "@/lib/queries/common";
import { akademikTabs } from "@/lib/site";
import { TrackTabs } from "./track-tabs";

export const metadata: Metadata = {
  title: "Panduan Tugas Akhir",
  description: "Prosedur, tahapan, dan buku panduan Tugas Akhir mahasiswa Program Studi Arsitektur Universitas Tadulako.",
};

export default async function PanduanTaPage() {
  const [blocks, doc, tracks] = await Promise.all([getPageBlocks("panduan-ta"), getDocument("buku-panduan-ta"), getThesisTracks()]);
  const { hero, tahapan, repositori } = blocks;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line-warm bg-background">
        <div aria-hidden className="absolute inset-0 bg-[url(/images/grid-pattern.svg)] bg-cover opacity-60" />
        <Container className="relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col gap-6">
            <Breadcrumb items={[{ label: "Akademik", href: "/akademik/kurikulum" }, { label: "Panduan TA" }]} />
            <h1 className="font-display text-4xl font-black leading-[1.05] text-ink sm:text-5xl lg:text-6xl">{hero?.title ?? "Panduan Tugas Akhir"}</h1>
            <p className="text-lg leading-8 text-ink-soft">{hero?.body}</p>
            {doc ? (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href={`/media/${doc.media.path}?download=${encodeURIComponent(doc.media.originalName ?? "panduan-ta.pdf")}`} className={buttonClass("primary")}>
                  <Download className="size-4" aria-hidden /> Unduh Buku Panduan
                </a>
                <span className="text-xs text-muted">PDF · {formatBytes(doc.media.sizeBytes)}</span>
              </div>
            ) : null}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line-warm p-1 shadow-[0_25px_50px_-12px_rgb(0_0_0/0.25)]">
            <div className="relative size-full overflow-hidden rounded-xl">
              <MediaImage media={hero?.image} preload sizes="(min-width: 1024px) 560px, 90vw" />
            </div>
          </div>
        </Container>
      </section>
      <SubNav items={akademikTabs} label="Navigasi akademik" />

      <section className="py-20 lg:py-28" aria-labelledby="tahapan">
        <Container className="flex flex-col gap-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <h2 id="tahapan" className="font-display text-3xl font-black uppercase text-ink sm:text-4xl">
              {tahapan?.title ?? "Jalur & Tahapan Tugas Akhir"}
            </h2>
            {tahapan?.body ? <p className="text-lg text-ink-soft">{tahapan.body}</p> : null}
          </div>
          <TrackTabs
            tracks={tracks.map((t) => ({ slug: t.slug, name: t.name, description: t.description, steps: t.steps.map(({ id, title, body }) => ({ id, title, body })) }))}
          />
        </Container>
      </section>

      {repositori && (repositori.linkUrl || repositori.body) ? (
        <section className="pb-20 lg:pb-28" aria-labelledby="repositori">
          <Container>
            <div className="flex flex-col gap-6 rounded-3xl border border-primary-200 bg-primary-100 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-5">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                  <FolderSearch className="size-7" aria-hidden />
                </span>
                <div className="flex flex-col gap-2">
                  <h2 id="repositori" className="font-display text-2xl font-black text-ink">
                    {repositori.title ?? "Repositori Judul Tugas Akhir"}
                  </h2>
                  {repositori.body ? <p className="max-w-2xl text-[15px] leading-7 text-ink-soft">{repositori.body}</p> : null}
                </div>
              </div>
              <ExternalLinkButton href={repositori.linkUrl} label={repositori.linkLabel || "Buka Repositori"} className="shrink-0 self-start md:self-auto" />
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
