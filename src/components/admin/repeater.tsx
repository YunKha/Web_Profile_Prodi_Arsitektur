"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { cx } from "@/components/ui/primitives";
import { useNestedFieldError } from "./admin-form";
import { inputClass } from "./fields";

export type RepeaterColumn = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  options?: { value: string; label: string }[];
  placeholder?: string;
  width?: string;
  maxLength?: number;
};

type Row = Record<string, string>;

/**
 * Daftar baris dinamis (fitur fasilitas, riwayat pendidikan, tim, tautan footer, ...).
 * Nilainya dikirim sebagai JSON di input tersembunyi dan divalidasi ulang di server.
 */
export function RepeaterField({
  name,
  label,
  columns,
  defaultValue = [],
  addLabel = "Tambah baris",
  hint,
  max = 50,
}: {
  name: string;
  label: string;
  columns: RepeaterColumn[];
  defaultValue?: Record<string, string | number | null | undefined>[];
  addLabel?: string;
  hint?: string;
  max?: number;
}) {
  const [rows, setRows] = useState<Row[]>(() => defaultValue.map((r) => Object.fromEntries(columns.map((c) => [c.key, r[c.key] == null ? "" : String(r[c.key])]))));
  const error = useNestedFieldError(name);
  const blank = () => Object.fromEntries(columns.map((c) => [c.key, c.type === "select" ? (c.options?.[0]?.value ?? "") : ""]));

  const update = (i: number, key: string, value: string) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const move = (i: number, d: number) =>
    setRows((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <button
          type="button"
          disabled={rows.length >= max}
          onClick={() => setRows((prev) => [...prev, blank()])}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-100 disabled:opacity-40"
        >
          <Plus className="size-4" /> {addLabel}
        </button>
      </div>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(rows.filter((r) => columns.some((c) => c.type !== "select" && r[c.key]?.trim())))}
      />
      {rows.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-[#d6d3d1] px-4 py-6 text-center text-sm text-muted">Belum ada data.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <li key={i} className="flex flex-col gap-2 rounded-xl border border-line bg-background p-3 md:flex-row md:items-start">
              <span className="hidden size-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-muted md:flex">{i + 1}</span>
              <div className="grid flex-1 gap-2 md:grid-cols-[var(--cols)]" style={{ ["--cols" as string]: columns.map((c) => c.width ?? "1fr").join(" ") }}>
                {columns.map((c) => {
                  const common = {
                    "aria-label": `${c.label} baris ${i + 1}`,
                    value: row[c.key] ?? "",
                    placeholder: c.placeholder ?? c.label,
                  };
                  if (c.type === "select") {
                    return (
                      <select key={c.key} {...common} onChange={(e) => update(i, c.key, e.target.value)} className={inputClass}>
                        {c.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    );
                  }
                  if (c.type === "textarea") {
                    return <textarea key={c.key} {...common} rows={2} maxLength={c.maxLength} onChange={(e) => update(i, c.key, e.target.value)} className={cx(inputClass, "resize-y")} />;
                  }
                  return (
                    <input
                      key={c.key}
                      {...common}
                      type={c.type === "number" ? "number" : "text"}
                      maxLength={c.maxLength}
                      onChange={(e) => update(i, c.key, e.target.value)}
                      className={inputClass}
                    />
                  );
                })}
              </div>
              <div className="flex shrink-0 justify-end">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-white disabled:opacity-30" aria-label="Naikkan">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-white disabled:opacity-30" aria-label="Turunkan">
                  <ArrowDown className="size-4" />
                </button>
                <button type="button" onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))} className="flex size-9 items-center justify-center rounded-lg text-[#d92d20] hover:bg-[#fef3f2]" aria-label="Hapus baris">
                  <Trash className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-xs font-semibold text-[#d92d20]">{error}</p> : null}
    </div>
  );
}
