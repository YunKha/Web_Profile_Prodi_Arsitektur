import type { Metadata } from "next";
import { ArrowUpRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { Container, EmptyState } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";
import { getCurrentAccreditation, getPageBlocks } from "@/lib/queries/common";
import { profilTabs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Akreditasi",
  description: "Status akreditasi BAN-PT Program Studi Arsitektur Universitas Tadulako beserta sertifikat, LKPS, dan LED.",
};

const docLabels = { sertifikat: "Unduh Sertifikat Akreditasi", lkps: "Unduh Laporan LKPS", led: "Unduh Laporan LED" } as const;

export default async function AkreditasiPage() {
  const [blocks, acc] = await Promise.all([getPageBlocks("akreditasi"), getCurrentAccreditation()]);
  const { hero, intro } = blocks;
  const docs = (["sertifikat", "lkps", "led"] as const).map((type) => ({ type, doc: acc?.documents.find((d) => d.type === type) }));

  return (
    <>
      <PageHero eyebrow="Profil Program Studi" title={hero?.title ?? "Akreditasi"} description={hero?.body} image={hero?.image}>
        <span className="h-1 w-24 bg-primary-200" aria-hidden />
      </PageHero>
      <SubNav items={profilTabs} label="Navigasi profil" />

      <section className="py-20 lg:py-28">
        <Container>
          {acc ? (
            <div className="grid items-start gap-12 lg:grid-cols-[466fr_662fr] lg:gap-6">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <h2 className="font-display text-3xl font-black text-ink sm:text-4xl">{intro?.title ?? "Pengakuan & Akreditasi"}</h2>
                  <p className="text-lg leading-8 text-ink-soft">{intro?.body}</p>
                </div>
                <div className="rounded-r-2xl border-l-4 border-primary bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
                  <h3 className="font-display text-2xl font-bold text-ink">Status Akreditasi</h3>
                  <p className="mt-4 inline-flex rounded-full border border-primary-200 bg-primary-100 px-5 py-2 font-display text-lg font-black text-primary-500">
                    {acc.rank}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-ink-soft">
                    Berlaku sejak {formatDate(acc.validFrom)} hingga {formatDate(acc.validTo)}.
                  </p>
                </div>
              </div>

              <article className="relative overflow-hidden rounded-3xl border border-line-warm bg-white p-8 shadow-[0_25px_50px_-12px_rgb(0_0_0/0.15)] sm:p-12 lg:ml-12">
                <div aria-hidden className="absolute -right-24 -top-24 size-64 rounded-full bg-primary-100/70" />
                <div className="relative flex flex-col gap-8">
                  <header className="flex items-start justify-between gap-6 border-b border-line-warm pb-6">
                    <div>
                      <p className="eyebrow text-[11px] text-muted">Lembaga Akreditasi</p>
                      <h3 className="mt-2 font-display text-2xl font-black leading-tight text-ink sm:text-3xl">{acc.agency}</h3>
                    </div>
                    <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-primary-200 bg-primary-100 text-primary">
                      <ShieldCheck className="size-7" aria-hidden />
                    </span>
                  </header>
                  <dl className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                    {[
                      ["Nomor SK", acc.skNumber],
                      ["Peringkat", acc.rank],
                      ["Tanggal Berlaku", formatDate(acc.validFrom)],
                      ["Tanggal Berakhir", formatDate(acc.validTo)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{label}</dt>
                        <dd className="mt-1.5 break-words text-base font-semibold text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <ul className="flex flex-col gap-4 border-t border-line-warm pt-6">
                    {docs.map(({ type, doc }) =>
                      doc ? (
                        <li key={type}>
                          <a
                            href={`/media/${doc.media.path}?download=${encodeURIComponent(doc.media.originalName ?? `${type}.pdf`)}`}
                            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-primary hover:text-primary-500"
                          >
                            {docLabels[type]}
                            <ArrowUpRight className="size-4" aria-hidden />
                          </a>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </div>
              </article>
            </div>
          ) : (
            <EmptyState icon={<BadgeCheck className="size-10" />} title="Data akreditasi belum tersedia" />
          )}
        </Container>
      </section>
    </>
  );
}
