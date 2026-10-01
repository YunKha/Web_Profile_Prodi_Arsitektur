import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-white p-8 shadow-sm">
      <h1 className="font-display text-xl font-bold text-ink">Data tidak ditemukan</h1>
      <p className="text-sm text-ink-soft">Data mungkin sudah dihapus atau alamatnya salah.</p>
      <Link href="/admin" className="text-sm font-bold text-primary">
        ← Kembali ke dasbor
      </Link>
    </div>
  );
}
