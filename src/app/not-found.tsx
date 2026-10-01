import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { SiteFooter } from "@/components/layouts/site-footer";
import { SiteHeader } from "@/components/layouts/site-header";
import { Container, LinkButton } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Halaman tidak ditemukan", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="konten" className="relative flex flex-1 items-center overflow-hidden py-24">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[url(/images/grid-pattern.svg)] bg-cover opacity-70" />
        <Container className="flex flex-col items-center gap-6 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-100 text-primary">
            <Compass className="size-8" aria-hidden />
          </span>
          <p className="font-display text-7xl font-black text-primary sm:text-8xl">404</p>
          <h1 className="font-display text-3xl font-black text-ink sm:text-4xl">Halaman tidak ditemukan</h1>
          <p className="max-w-md text-ink-soft">Halaman yang Anda cari mungkin sudah dipindahkan, dihapus, atau alamatnya salah ketik.</p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <LinkButton href="/">Ke Beranda</LinkButton>
            <LinkButton href="/berita" variant="outline">
              Baca Berita
            </LinkButton>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
