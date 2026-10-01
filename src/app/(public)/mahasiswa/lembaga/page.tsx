import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Users } from "lucide-react";
import { Container, EmptyState } from "@/components/ui/primitives";
import { getPageBlocks } from "@/lib/queries/common";
import { listOrganizations } from "@/lib/queries/content";
import { mediaUrl } from "@/lib/site";
import { IntroSplit, MahasiswaHero } from "../_components";

export const metadata: Metadata = {
  title: "Lembaga Kemahasiswaan",
  description: "Organisasi dan komunitas mahasiswa Program Studi Arsitektur Universitas Tadulako.",
};

export default async function LembagaPage() {
  const [blocks, orgs] = await Promise.all([getPageBlocks("lembaga"), listOrganizations()]);
  return (
    <>
      <MahasiswaHero hero={blocks.hero} fallbackTitle="Lembaga" />
      <IntroSplit block={blocks.intro} eyebrow="Organisasi Mahasiswa" />
      <section className="border-t border-line-warm bg-white py-20 lg:py-24" aria-labelledby="daftar-lembaga">
        <Container className="flex flex-col gap-12">
          <h2 id="daftar-lembaga" className="font-display text-3xl font-black uppercase text-ink sm:text-4xl">
            Daftar Lembaga
          </h2>
          {orgs.length ? (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {orgs.map((o) => {
                const logo = mediaUrl(o.logo?.path);
                return (
                  <li key={o.id} className="flex flex-col gap-5 rounded-2xl border border-line-warm bg-background p-8 transition hover:border-primary-200 hover:bg-white hover:shadow-[var(--shadow-card)]">
                    <div className="flex items-center gap-4">
                      {logo ? (
                        <Image src={logo} alt={`Logo ${o.name}`} width={56} height={56} className="size-14 rounded-xl border border-line-warm bg-white object-contain p-1" />
                      ) : (
                        <span className="flex size-14 items-center justify-center rounded-xl bg-primary-100 text-primary">
                          <Users className="size-6" aria-hidden />
                        </span>
                      )}
                      <div>
                        {o.abbreviation ? <p className="text-xs font-black uppercase tracking-[0.15em] text-primary">{o.abbreviation}</p> : null}
                        <h3 className="font-display text-lg font-bold leading-snug text-ink">{o.name}</h3>
                      </div>
                    </div>
                    {o.description ? <p className="text-[15px] leading-7 text-ink-soft">{o.description}</p> : null}
                    {o.url ? (
                      <a href={o.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                        Kunjungi <ArrowUpRight className="size-4" aria-hidden />
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={<Users className="size-10" />} title="Belum ada lembaga terdaftar" />
          )}
        </Container>
      </section>
    </>
  );
}
