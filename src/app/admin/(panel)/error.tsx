"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-[#fecdca] bg-white p-8 shadow-sm">
      <span className="flex size-12 items-center justify-center rounded-xl bg-[#fef3f2] text-[#d92d20]">
        <TriangleAlert className="size-6" aria-hidden />
      </span>
      <h1 className="font-display text-xl font-bold text-ink">Terjadi kesalahan</h1>
      <p className="text-sm text-ink-soft">Data mungkin sudah dihapus atau terjadi gangguan koneksi database. Perubahan yang belum disimpan tidak tersimpan.</p>
      {error.digest ? <p className="font-mono text-xs text-muted">Kode: {error.digest}</p> : null}
      <button type="button" onClick={reset} className="h-10 rounded-xl bg-primary px-5 text-sm font-bold text-white">
        Coba lagi
      </button>
    </div>
  );
}
