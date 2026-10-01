import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical, HeartHandshake, Newspaper, Plus, Trophy, Users } from "lucide-react";
import { Alert } from "@/components/admin/admin-form";
import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db/client";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { actionLabel, entityLabel } from "@/lib/admin/labels";

export const metadata: Metadata = { title: "Dasbor" };

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const [user, sp] = await Promise.all([requireUser(), searchParams]);

  const count = (model: { count: (args: { where: { status: "published" | "draft" } }) => Promise<number> }) =>
    Promise.all([model.count({ where: { status: "published" } }), model.count({ where: { status: "draft" } })]);

  const [news, achievements, research, services, lecturers, recent, drafts, scheduled] = await Promise.all([
    count(db.news),
    count(db.achievement),
    count(db.research),
    count(db.communityService),
    count(db.lecturer),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true } } } }),
    db.news.findMany({ where: { status: "draft" }, orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, updatedAt: true } }),
    db.news.count({ where: { status: "published", publishedAt: { gt: new Date() } } }),
  ]);

  const cards = [
    { label: "Berita", href: "/admin/berita", icon: Newspaper, data: news, add: "/admin/berita/baru" },
    { label: "Prestasi", href: "/admin/prestasi", icon: Trophy, data: achievements, add: "/admin/prestasi/baru" },
    { label: "Penelitian", href: "/admin/penelitian", icon: FlaskConical, data: research, add: "/admin/penelitian/baru" },
    { label: "Pengabdian", href: "/admin/pengabdian", icon: HeartHandshake, data: services, add: "/admin/pengabdian/baru" },
    { label: "Dosen & Staf", href: "/admin/dosen", icon: Users, data: lecturers, add: "/admin/dosen/baru" },
  ];

  return (
    <>
      <PageHeader title={`Halo, ${user.name.split(" ")[0]}`} description="Ringkasan konten website Program Studi Arsitektur." />
      {sp.forbidden ? <Alert tone="error">Halaman tersebut hanya untuk peran Admin.</Alert> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Ringkasan konten">
        {cards.map((c) => (
          <div key={c.label} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-100 text-primary">
                <c.icon className="size-5" aria-hidden />
              </span>
              <Link href={c.add} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-primary-100 hover:text-primary" aria-label={`Tambah ${c.label}`}>
                <Plus className="size-4" />
              </Link>
            </div>
            <div>
              <p className="font-display text-3xl font-black text-ink">{c.data[0]}</p>
              <p className="text-sm font-semibold text-ink-soft">{c.label} terbit</p>
              {c.data[1] ? <p className="mt-1 text-xs text-muted">{c.data[1]} draf</p> : null}
            </div>
            <Link href={c.href} className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-primary">
              Kelola <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-ink">Draf berita terbaru</h2>
          {scheduled ? <p className="mt-1 text-xs text-muted">{scheduled} berita terjadwal terbit.</p> : null}
          {drafts.length ? (
            <ul className="mt-4 divide-y divide-line">
              {drafts.map((d) => (
                <li key={d.id}>
                  <Link href={`/admin/berita/${d.id}`} className="flex items-center justify-between gap-4 py-3 text-sm hover:text-primary">
                    <span className="font-semibold">{d.title}</span>
                    <span className="shrink-0 text-xs text-muted">{formatDateTime(d.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Tidak ada draf. Semua berita sudah terbit.</p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Aktivitas terbaru</h2>
            {user.role === "admin" ? (
              <Link href="/admin/log" className="text-xs font-bold text-primary">
                Semua log
              </Link>
            ) : null}
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {recent.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-4 text-sm">
                <span>
                  <span className="font-semibold text-ink">{r.user?.name ?? "Sistem"}</span>{" "}
                  <span className="text-ink-soft">
                    {actionLabel(r.action)} {entityLabel(r.entity)}
                    {r.entityId ? ` #${r.entityId}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted">{formatDateTime(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
