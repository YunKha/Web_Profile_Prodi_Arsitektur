import Form from "next/form";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, CircleCheck, Plus, Search } from "lucide-react";
import { cx } from "@/components/ui/primitives";

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        {back ? (
          <Link prefetch={false} href={back.href} className="mb-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-muted hover:text-primary">
            <ChevronLeft className="size-3.5" aria-hidden /> {back.label}
          </Link>
        ) : null}
        <h1 className="font-display text-2xl font-black text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="text-sm text-ink-soft">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}

export function NewButton({ href, label }: { href: string; label: string }) {
  return (
    <Link prefetch={false} href={href} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-sm hover:bg-primary-500">
      <Plus className="size-4" aria-hidden /> {label}
    </Link>
  );
}

export function GhostLink({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  const cls = "inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink-soft hover:border-primary hover:text-primary";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link prefetch={false} href={href} className={cls}>
      {children}
    </Link>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold",
        published ? "bg-[#ecfdf3] text-[#067647]" : "bg-grey-100 text-grey-500",
      )}
    >
      <span className={cx("size-1.5 rounded-full", published ? "bg-[#17b26a]" : "bg-grey-300")} aria-hidden />
      {published ? "Terbit" : "Draf"}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "primary" | "warning" }) {
  const tones = { neutral: "bg-grey-100 text-grey-500", primary: "bg-primary-100 text-primary-500", warning: "bg-[#fffaeb] text-[#b54708]" };
  return <span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone])}>{children}</span>;
}

/** Pesan sukses dari redirect (?ok=...). */
export function Flash({ message }: { message?: string | string[] }) {
  const text = Array.isArray(message) ? message[0] : message;
  if (!text) return null;
  return (
    <p role="status" className="flex items-center gap-3 rounded-xl border border-[#abefc6] bg-[#ecfdf3] px-4 py-3 text-sm font-medium text-[#067647]">
      <CircleCheck className="size-4 shrink-0" aria-hidden />
      {text.slice(0, 200)}
    </p>
  );
}

/** Toolbar cari + filter status (GET). */
export function ListToolbar({
  action,
  q,
  status,
  placeholder = "Cari…",
  showStatus = true,
  children,
}: {
  action: string;
  q?: string;
  status?: string;
  placeholder?: string;
  showStatus?: boolean;
  children?: ReactNode;
}) {
  const input = "h-10 rounded-xl border border-[#d6d3d1] bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-100";
  return (
    <Form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label className="relative flex-1">
        <span className="sr-only">Cari</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey-300" aria-hidden />
        <input type="search" name="q" defaultValue={q} placeholder={placeholder} className={cx(input, "w-full pl-9")} />
      </label>
      {children}
      {showStatus ? (
        <label>
          <span className="sr-only">Status</span>
          <select name="status" defaultValue={status ?? ""} className={input}>
            <option value="">Semua status</option>
            <option value="published">Terbit</option>
            <option value="draft">Draf</option>
          </select>
        </label>
      ) : null}
      <button type="submit" className="h-10 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-primary hover:text-primary">
        Terapkan
      </button>
    </Form>
  );
}

export type Column<T> = { header: string; cell: (row: T) => ReactNode; className?: string };

export function DataTable<T extends { id: number | string }>({
  rows,
  columns,
  empty = "Belum ada data.",
}: {
  rows: T[];
  columns: Column<T>[];
  empty?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-background text-xs font-bold uppercase tracking-[0.06em] text-muted">
            <tr>
              {columns.map((c) => (
                <th key={c.header} scope="col" className={cx("px-4 py-3", c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-sm text-muted">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="transition hover:bg-background/70">
                  {columns.map((c) => (
                    <td key={c.header} className={cx("px-4 py-3 align-middle", c.className)}>
                      {c.cell(r)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminPagination({ page, pageCount, total, href }: { page: number; pageCount: number; total: number; href: (page: number) => string }) {
  return (
    <div className="flex items-center justify-between text-sm text-muted">
      <p>{total} data</p>
      {pageCount > 1 ? (
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link prefetch={false} href={href(page - 1)} className="flex size-9 items-center justify-center rounded-lg border border-line bg-white hover:border-primary" aria-label="Sebelumnya">
              <ChevronLeft className="size-4" />
            </Link>
          ) : null}
          <span>
            Halaman {page} dari {pageCount}
          </span>
          {page < pageCount ? (
            <Link prefetch={false} href={href(page + 1)} className="flex size-9 items-center justify-center rounded-lg border border-line bg-white hover:border-primary" aria-label="Berikutnya">
              <ChevronRight className="size-4" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Pembuat URL daftar admin dengan parameter yang dipertahankan. */
export function listHref(base: string, params: Record<string, string | number | undefined>) {
  return (page: number) => {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") s.set(k, String(v));
    if (page > 1) s.set("page", String(page));
    const qs = s.toString();
    return qs ? `${base}?${qs}` : base;
  };
}

export function EditLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link prefetch={false} href={href} className="font-semibold text-ink hover:text-primary">
      {children}
    </Link>
  );
}
