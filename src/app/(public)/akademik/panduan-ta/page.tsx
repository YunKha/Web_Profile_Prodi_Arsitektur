import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Breadcrumb } from "@/components/layouts/breadcrumb";
import { SubNav } from "@/components/layouts/sub-nav";
import { MediaImage } from "@/components/ui/media-image";
import { Container, buttonClass } from "@/components/ui/primitives";
import { formatBytes } from "@/lib/format";
import { getDocument, getPageBlocks } from "@/lib/queries/common";
import { akademikTabs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Panduan Tugas Akhir",
  description: "Prosedur, tahapan, dan buku panduan Tugas Akhir mahasiswa Program Studi Arsitektur Universitas Tadulako.",
};

export default async function PanduanTaPage() {
  const [blocks, doc] = await Promise.all([getPageBlocks("panduan-ta"), getDocument("buku-panduan-ta")]);
  const { hero, tahapan } = blocks;
  const steps = [1, 2, 3, 4].map((n) => blocks[`tahap-${n}`]).filter(Boolean);

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
              {tahapan?.title ?? "Tahapan Tugas Akhir"}
            </h2>
            {tahapan?.body ? <p className="text-lg text-ink-soft">{tahapan.body}</p> : null}
          </div>
          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <span aria-hidden className="absolute left-6 right-6 top-6 hidden h-0.5 bg-line-warm lg:block" />
            {steps.map((s, i) => (
              <li key={i} className="relative flex flex-col gap-4">
                <span className="relative flex size-12 items-center justify-center rounded-full border-4 border-background bg-primary font-display text-lg font-black text-white shadow-[0_10px_15px_-3px_rgb(175_100_14/0.35)]">
                  {i + 1}
                </span>
                <h3 className="font-display text-xl font-bold text-ink">{s?.title}</h3>
                <p className="text-[15px] leading-7 text-ink-soft">{s?.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
