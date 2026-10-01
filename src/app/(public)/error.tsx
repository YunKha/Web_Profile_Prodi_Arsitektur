"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Container, LinkButton, buttonClass } from "@/components/ui/primitives";

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="py-24">
      <Container className="flex flex-col items-center gap-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-100 text-primary">
          <TriangleAlert className="size-8" aria-hidden />
        </span>
        <h1 className="font-display text-3xl font-black text-ink sm:text-4xl">Terjadi kendala saat memuat halaman</h1>
        <p className="max-w-md text-ink-soft">Silakan coba lagi beberapa saat. Bila masalah berlanjut, hubungi admin program studi.</p>
        {error.digest ? <p className="text-xs text-muted">Kode: {error.digest}</p> : null}
        <div className="flex flex-wrap justify-center gap-4">
          <button type="button" onClick={reset} className={buttonClass("primary")}>
            Coba lagi
          </button>
          <LinkButton href="/" variant="outline">
            Ke Beranda
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
