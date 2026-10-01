import type { Metadata } from "next";
import Image from "next/image";
import { Handshake } from "lucide-react";
import { PageHero } from "@/components/layouts/page-hero";
import { Container, EmptyState, cx } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";
import { getPageBlocks } from "@/lib/queries/common";
import { listPartnerships } from "@/lib/queries/content";
import { mediaUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kerja Sama",
  description: "Mitra kerja sama Program Studi Arsitektur Universitas Tadulako dari pemerintah, asosiasi profesi, dan industri.",
};

export default async function KerjaSamaPage() {
  const [blocks, partners] = await Promise.all([getPageBlocks("kerja-sama"), listPartnerships()]);
  const hero = blocks.hero;
  const groups = Array.from(new Set(partners.map((p) => p.partnerType || "Lainnya")));

  return (
    <>
      <PageHero title={hero?.title ?? "Kerja Sama"} description={hero?.body} />

      <div className="py-20 lg:py-24">
        <Container className="flex flex-col gap-20">
          {partners.length === 0 ? <EmptyState icon={<Handshake className="size-10" />} title="Belum ada data kerja sama" /> : null}

          {groups.map((g) => (
            <section key={g} className="flex flex-col gap-8" aria-labelledby={`grup-${g}`}>
              <h2 id={`grup-${g}`} className="font-display text-2xl font-black uppercase text-ink sm:text-3xl">
                Mitra {g}
              </h2>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
                {partners
                  .filter((p) => (p.partnerType || "Lainnya") === g)
                  .map((p) => {
                    const logo = mediaUrl(p.logo?.path);
                    const Card = p.url ? "a" : "div";
                    return (
                      <li key={p.id}>
                        <Card
                          {...(p.url ? { href: p.url, target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="group flex h-36 flex-col items-center justify-center gap-3 rounded-2xl border border-line-warm bg-white p-4 text-center transition hover:border-primary-200 hover:shadow-[var(--shadow-card)]"
                          title={p.scope ?? p.partnerName}
                        >
                          {logo ? (
                            <Image src={logo} alt="" width={64} height={64} className="size-16 object-contain grayscale transition group-hover:grayscale-0" />
                          ) : (
                            <Handshake className="size-8 text-primary" aria-hidden />
                          )}
                          <span className="line-clamp-2 text-xs font-bold text-ink-soft">{p.partnerName}</span>
                        </Card>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}

          {partners.length ? (
            <section className="flex flex-col gap-6" aria-labelledby="rincian">
              <h2 id="rincian" className="font-display text-2xl font-black uppercase text-ink sm:text-3xl">
                Rincian Kerja Sama
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-line-warm bg-white">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-background text-xs font-bold uppercase tracking-[0.08em] text-muted">
                    <tr>
                      <th scope="col" className="px-6 py-4">Mitra</th>
                      <th scope="col" className="px-6 py-4">Jenis</th>
                      <th scope="col" className="px-6 py-4">Ruang Lingkup</th>
                      <th scope="col" className="px-6 py-4">Periode</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {partners.map((p) => (
                      <tr key={p.id}>
                        <th scope="row" className="px-6 py-4 font-semibold text-ink">{p.partnerName}</th>
                        <td className="px-6 py-4 text-ink-soft">{p.partnerType ?? "—"}</td>
                        <td className="px-6 py-4 text-ink-soft">{p.scope ?? "—"}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-ink-soft">
                          {p.startDate ? formatDate(p.startDate) : "—"} – {p.endDate ? formatDate(p.endDate) : "sekarang"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cx("rounded-full px-3 py-1 text-xs font-bold", p.active ? "bg-[#ecfdf3] text-[#067647]" : "bg-grey-100 text-grey-500")}>
                            {p.active ? "Aktif" : "Berakhir"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </Container>
      </div>
    </>
  );
}
