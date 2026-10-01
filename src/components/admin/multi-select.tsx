"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { cx } from "@/components/ui/primitives";
import { useFieldError } from "./admin-form";
import { inputClass } from "./fields";

export type Option = { id: number; label: string; sub?: string | null };

/** Pilih beberapa item (dosen pembimbing, penulis, label). Urutan pilihan dipertahankan. */
export function MultiSelectField({
  name,
  label,
  options,
  defaultValue = [],
  hint,
  ordered = false,
  max = 30,
}: {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: number[];
  hint?: string;
  ordered?: boolean;
  max?: number;
}) {
  const [selected, setSelected] = useState<number[]>(defaultValue.filter((id) => options.some((o) => o.id === id)));
  const [q, setQ] = useState("");
  const error = useFieldError(name);
  const byId = new Map(options.map((o) => [o.id, o]));
  const filtered = options.filter((o) => !selected.includes(o.id) && `${o.label} ${o.sub ?? ""}`.toLowerCase().includes(q.toLowerCase())).slice(0, 8);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(selected)} />
      {selected.length ? (
        <ul className="flex flex-wrap gap-2">
          {selected.map((id, i) => (
            <li key={id} className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-100 py-1 pl-3 pr-1 text-xs font-semibold text-primary-600">
              {ordered ? <span className="text-primary">{i + 1}.</span> : null}
              {byId.get(id)?.label}
              <button type="button" onClick={() => setSelected((s) => s.filter((x) => x !== id))} className="flex size-5 items-center justify-center rounded-full hover:bg-white" aria-label={`Hapus ${byId.get(id)?.label}`}>
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey-300" aria-hidden />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ketik untuk mencari…" className={cx(inputClass, "pl-9")} aria-label={`Cari ${label}`} />
      </div>
      {filtered.length && selected.length < max ? (
        <ul className="max-h-56 overflow-y-auto rounded-xl border border-line bg-white p-1">
          {filtered.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => {
                  setSelected((s) => [...s, o.id]);
                  setQ("");
                }}
                className="flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm hover:bg-primary-100"
              >
                <span className="font-medium text-ink">{o.label}</span>
                {o.sub ? <span className="text-xs text-muted">{o.sub}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-xs font-semibold text-[#d92d20]">{error}</p> : null}
    </div>
  );
}
