import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Users } from "lucide-react";
import { LecturerCard } from "@/components/cards";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { SearchBox } from "@/components/ui/search-box";
import { Container, EmptyState, buttonClass, cx } from "@/components/ui/primitives";
import { getPageBlocks, stringParam } from "@/lib/queries/common";
import { LECTURER_PAGE, listLecturers } from "@/lib/queries/people";
import { profilTabs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dosen & Staf",
  description: "Daftar dosen dan tenaga kependidikan Program Studi Arsitektur Universitas Tadulako beserta bidang keahliannya.",
};

const filters = [
  { key: "", label: "Semua" },
  { key: "dosen", label: "Dosen" },
  { key: "tendik", label: "Tenaga Kependidikan" },
] as const;

export default async function DosenStafPage({ searchParams }: PageProps<"/profil/dosen-staf">) {
  const blocks = await getPageBlocks("dosen-staf");
  const { hero, intro } = blocks;
  return (
    <>
      <PageHero title={hero?.title ?? "Dosen & Staf"} description={hero?.body} />
      <SubNav items={profilTabs} label="Navigasi profil" />
      <section className="py-16 lg:py-24">
        <Container className="flex flex-col gap-10">
          <Suspense fallback={<GridSkeleton />}>
            <LecturerList searchParams={searchParams} title={intro?.title} description={intro?.body} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

async function LecturerList({
  searchParams,
  title,
  description,
}: {
  searchParams: PageProps<"/profil/dosen-staf">["searchParams"];
  title?: string | null;
  description?: string | null;
}) {
  const sp = await searchParams;
  const q = stringParam(sp.q);
  const type = stringParam(sp.jenis);
  const shown = Math.min(Math.max(Number(stringParam(sp.tampil)) || LECTURER_PAGE, LECTURER_PAGE), 200);
  const { items, total, hasMore } = await listLecturers({
    q,
    limit: shown,
    type: type === "dosen" || type === "tendik" ? type : undefined,
  });

  const href = (params: Record<string, string | number>) => {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, jenis: type, ...params })) if (v) s.set(k, String(v));
    const qs = s.toString();
    return `/profil/dosen-staf${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="font-display text-3xl font-black text-ink sm:text-4xl">{title ?? "Tim Pengajar Kami"}</h2>
          {description ? <p className="text-base leading-7 text-ink-soft">{description}</p> : null}
        </div>
        <SearchBox action="/profil/dosen-staf" defaultValue={q} placeholder="Cari nama atau keahlian..." hidden={{ jenis: type }} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={href({ jenis: f.key, tampil: "" })}
            aria-current={type === f.key ? "true" : undefined}
            className={cx(
              "rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.1em] transition",
              type === f.key ? "border-primary bg-primary text-white" : "border-line-warm bg-white text-ink-soft hover:border-primary hover:text-primary",
            )}
          >
            {f.label}
          </Link>
        ))}
        <p className="ml-auto text-sm text-muted" aria-live="polite">
          {total} orang{q ? ` untuk “${q}”` : ""}
        </p>
      </div>

      {items.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((l) => (
            <LecturerCard key={l.slug} item={l} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Users className="size-10" />} title="Tidak ada hasil" description="Coba kata kunci lain atau hapus filter." />
      )}

      {hasMore ? (
        <div className="flex justify-center pt-4">
          <Link href={href({ tampil: shown + LECTURER_PAGE })} scroll={false} className={buttonClass("outline")}>
            Muat lebih banyak
          </Link>
        </div>
      ) : null}
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Memuat">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="h-[520px] animate-pulse rounded-2xl bg-grey-100" />
      ))}
    </div>
  );
}
