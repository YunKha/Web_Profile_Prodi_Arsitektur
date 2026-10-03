import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Flash, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { adminParams } from "@/lib/admin/media";
import { formatDateTime } from "@/lib/format";
import { pageRegistry } from "@/lib/page-registry";

export const metadata: Metadata = { title: "Halaman" };

export default async function PagesIndex({ searchParams }: PageProps<"/admin/halaman">) {
  await requireUser();
  const { ok } = adminParams(await searchParams);
  const logs = await db.auditLog.findMany({
    where: { entity: "page_block" },
    orderBy: { createdAt: "desc" },
    distinct: ["entityId"],
    select: { entityId: true, createdAt: true, user: { select: { name: true } } },
  });
  const last = new Map(logs.map((l) => [l.entityId, l]));

  return (
    <>
      <PageHeader title="Halaman" description="Teks editorial tiap halaman: judul hero, paragraf pengantar, dan foto latar." />
      <Flash message={ok} />
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pageRegistry.map((p) => {
          const l = last.get(p.key);
          return (
            <li key={p.key} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-bold text-ink">{p.label}</h2>
                  <p className="font-mono text-xs text-muted">{p.path}</p>
                </div>
                <a href={p.path} target="_blank" rel="noopener noreferrer" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-primary" aria-label={`Buka ${p.label}`}>
                  <ExternalLink className="size-4" />
                </a>
              </div>
              <p className="text-xs text-ink-soft">{p.blocks.map((b) => b.label).join(" · ")}</p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-[11px] text-muted">{l ? `Diubah ${formatDateTime(l.createdAt)} oleh ${l.user?.name ?? "—"}` : "Belum pernah diubah"}</span>
                <Link prefetch={false} href={`/admin/halaman/${p.key}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                  Edit <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
