"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, FilePlus, FileText, Trash } from "lucide-react";
import { formatBytes } from "@/lib/format";
import type { MediaItem } from "@/lib/admin/media-actions";
import { cx } from "@/components/ui/primitives";
import { useFieldError } from "./admin-form";
import { inputClass } from "./fields";
import { MediaDialog } from "./media-picker";

export type DocumentValue = { title: string; media: MediaItem };

/** Daftar dokumen PDF berjudul (laporan penelitian, poster, ...). */
export function DocumentListField({ name, label, defaultValue = [] }: { name: string; label: string; defaultValue?: DocumentValue[] }) {
  const [items, setItems] = useState<DocumentValue[]>(defaultValue);
  const [open, setOpen] = useState(false);
  const error = useFieldError(name);

  const move = (i: number, d: number) =>
    setItems((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-100">
          <FilePlus className="size-4" /> Tambah dokumen
        </button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(items.map((it) => ({ title: it.title, mediaId: it.media.id })))} />
      {items.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-[#d6d3d1] px-4 py-6 text-center text-sm text-muted">Belum ada dokumen.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {items.map((it, i) => (
            <li key={`${it.media.id}-${i}`} className="flex flex-col gap-2 rounded-xl border border-line bg-background p-3 sm:flex-row sm:items-center">
              <span className="flex items-center gap-2 text-xs text-muted sm:w-48">
                <FileText className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="truncate" title={it.media.originalName ?? ""}>
                  {it.media.originalName ?? "PDF"} · {formatBytes(it.media.sizeBytes)}
                </span>
              </span>
              <input
                value={it.title}
                onChange={(e) => setItems((prev) => prev.map((p, j) => (j === i ? { ...p, title: e.target.value } : p)))}
                placeholder="Judul dokumen"
                maxLength={200}
                aria-label={`Judul dokumen ${i + 1}`}
                className={cx(inputClass, "flex-1")}
              />
              <div className="flex shrink-0 justify-end">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="flex size-8 items-center justify-center rounded-lg disabled:opacity-30" aria-label="Naikkan">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="flex size-8 items-center justify-center rounded-lg disabled:opacity-30" aria-label="Turunkan">
                  <ArrowDown className="size-4" />
                </button>
                <button type="button" onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))} className="flex size-8 items-center justify-center rounded-lg text-[#d92d20]" aria-label="Hapus dokumen">
                  <Trash className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {error ? <p className="text-xs font-semibold text-[#d92d20]">{error}</p> : null}
      <MediaDialog
        open={open}
        kind="document"
        onClose={() => setOpen(false)}
        onSelect={(picked) =>
          setItems((prev) => [...prev, ...picked.map((media) => ({ media, title: (media.altText || media.originalName || "Dokumen").replace(/\.pdf$/i, "") }))])
        }
      />
    </div>
  );
}
