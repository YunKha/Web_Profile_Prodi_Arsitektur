import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Search, Users } from "lucide-react";
import { LecturerCard } from "@/components/cards";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { AutoSubmitSelect } from "@/components/ui/auto-submit-select";
import { Container, EmptyState, buttonClass, cx } from "@/components/ui/primitives";
import { expertiseGroups, expertiseLabel, isExpertiseGroup } from "@/lib/expertise";
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
  const groupRaw = stringParam(sp.keahlian);
  const group = isExpertiseGroup(groupRaw) ? groupRaw : undefined;
  const shown = Math.min(Math.max(Number(stringParam(sp.tampil)) || LECTURER_PAGE, LECTURER_PAGE), 200);
  const { items, total, hasMore } = await listLecturers({
    q,
    limit: shown,
    type: type === "dosen" || type === "tendik" ? type : undefined,
    group,
  });

  const href = (params: Record<string, string | number>) => {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, jenis: type, keahlian: group ?? "", ...params })) if (v) s.set(k, String(v));
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
        <Form action="/profil/dosen-staf" role="search" className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          {type ? <input type="hidden" name="jenis" value={type} /> : null}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">Bidang keahlian</span>
            <AutoSubmitSelect
              name="keahlian"
              defaultValue={group ?? ""}
              className="h-12 rounded-full border border-line-warm bg-white px-5 text-sm text-ink shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-100 sm:w-60"
            >
              <option value="">Semua bidang keahlian</option>
              {expertiseGroups.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">Cari</span>
            <span className="relative">
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Nama atau keahlian..."
                className="h-12 w-full rounded-full border border-line-warm bg-white pl-5 pr-12 text-sm text-ink shadow-sm outline-none placeholder:text-grey-300 focus:border-primary focus:ring-4 focus:ring-primary-100 sm:w-64"
              />
              <button type="submit" className="absolute right-1.5 top-1.5 flex size-9 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-500" aria-label="Terapkan filter">
                <Search className="size-4" />
              </button>
            </span>
          </label>
        </Form>
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
          {total} orang{group ? ` · ${expertiseLabel(group)}` : ""}{q ? ` untuk “${q}”` : ""}
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
