import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="grid min-h-screen flex-1 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-primary-700 lg:block">
        <div aria-hidden className="absolute inset-0 bg-[url(/media/seed/hero-architecture.png)] bg-cover bg-center opacity-60" />
        <div aria-hidden className="absolute inset-0 bg-black/50" />
        <div className="relative flex h-full flex-col justify-end gap-4 p-14 text-white">
          <p className="eyebrow text-primary-200">Panel Admin</p>
          <h1 className="max-w-md font-display text-5xl font-black leading-[1.05]">Kelola konten website Arsitektur UNTAD</h1>
          <p className="max-w-md text-grey-100">Berita, dosen, prestasi, penelitian, dokumen akademik, dan halaman — semua dari satu tempat.</p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-3">
            <Image src="/images/logo-untad.png" alt="" width={40} height={40} className="size-10 object-contain" />
            <span className="font-display text-xl font-bold text-ink">ARSITEKTUR UNTAD</span>
          </Link>
          <h2 className="font-display text-3xl font-black text-ink">Masuk</h2>
          <p className="mb-8 mt-2 text-sm text-ink-soft">Gunakan akun admin atau editor yang diberikan program studi.</p>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-grey-100" />}>
            <LoginGate searchParams={searchParams} />
          </Suspense>
          <p className="mt-8 text-center text-xs text-muted">
            <Link href="/" className="hover:text-primary">
              ← Kembali ke website
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

async function LoginGate({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const [user, sp] = await Promise.all([getSessionUser(), searchParams]);
  if (user) redirect("/admin");
  const next = typeof sp.next === "string" ? sp.next : undefined;
  return <LoginForm next={next} />;
}
