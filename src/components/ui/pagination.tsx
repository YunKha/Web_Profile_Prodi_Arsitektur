import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "./primitives";

type Props = {
  page: number;
  pageCount: number;
  basePath: string;
  /** Parameter query lain yang dipertahankan (q, kategori, semester, ...). */
  params?: Record<string, string | number | undefined>;
};

function hrefFor(basePath: string, params: Props["params"], page: number) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v !== undefined && v !== "" && v !== 0) sp.set(k, String(v));
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageList(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pageCount, basePath, params }: Props) {
  if (pageCount <= 1) return null;
  const btn = "flex size-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors";
  return (
    <nav aria-label="Navigasi halaman" className="flex justify-center">
      <ul className="flex items-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(basePath, params, page - 1)} className={cx(btn, "border-line-warm bg-white text-ink hover:border-primary hover:text-primary")} aria-label="Halaman sebelumnya">
              <ChevronLeft className="size-4" />
            </Link>
          ) : (
            <span className={cx(btn, "border-line text-grey-300")} aria-hidden>
              <ChevronLeft className="size-4" />
            </span>
          )}
        </li>
        {pageList(page, pageCount).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={hrefFor(basePath, params, p)}
                aria-current={p === page ? "page" : undefined}
                className={cx(btn, p === page ? "border-primary bg-primary text-white" : "border-line-warm bg-white text-ink hover:border-primary hover:text-primary")}
              >
                {p}
              </Link>
            </li>
          ),
        )}
        <li>
          {page < pageCount ? (
            <Link href={hrefFor(basePath, params, page + 1)} className={cx(btn, "border-line-warm bg-white text-ink hover:border-primary hover:text-primary")} aria-label="Halaman berikutnya">
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span className={cx(btn, "border-line text-grey-300")} aria-hidden>
              <ChevronRight className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
