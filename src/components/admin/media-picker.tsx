"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, FileText, ImagePlus, LoaderCircle, Search, Trash, Upload, X } from "lucide-react";
import { formatBytes } from "@/lib/format";
import { listMediaAction, type MediaItem } from "@/lib/admin/media-actions";
import { cx } from "@/components/ui/primitives";
import { useFieldError } from "./admin-form";
import { inputClass } from "./fields";

type Kind = "image" | "document";

export async function uploadFile(file: File, accept: Kind | "any", altText = ""): Promise<MediaItem> {
  const body = new FormData();
  body.set("file", file);
  body.set("accept", accept);
  body.set("altText", altText);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({ error: "Respons server tidak valid." }));
  if (!res.ok) throw new Error(data.error ?? "Gagal mengunggah.");
  return data as MediaItem;
}

export function MediaThumb({ item, className }: { item: MediaItem; className?: string }) {
  if (item.mime.startsWith("image/")) {
    return <Image src={`/media/${item.path}`} alt={item.altText ?? ""} fill sizes="200px" className={cx("object-cover", className)} />;
  }
  return (
    <div className={cx("flex size-full flex-col items-center justify-center gap-1 bg-primary-100 p-2 text-primary", className)}>
      <FileText className="size-7" aria-hidden />
      <span className="line-clamp-2 break-all text-center text-[10px] font-semibold text-primary-600">{item.originalName ?? "PDF"}</span>
    </div>
  );
}

/** Dialog pustaka media: pilih dari yang ada atau unggah baru. */
export function MediaDialog({
  open,
  kind,
  multiple = false,
  onClose,
  onSelect,
}: {
  open: boolean;
  kind: Kind;
  multiple?: boolean;
  onClose: () => void;
  onSelect: (items: MediaItem[]) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: MediaItem[]; pageCount: number }>({ items: [], pageCount: 1 });
  const [picked, setPicked] = useState<MediaItem[]>([]);
  const [loading, startLoading] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    startLoading(async () => {
      const res = await listMediaAction({ q, kind, page });
      setData({ items: res.items, pageCount: res.pageCount });
    });
  }, [open, q, kind, page]);

  function toggle(item: MediaItem) {
    if (!multiple) {
      onSelect([item]);
      onClose();
      return;
    }
    setPicked((prev) => (prev.some((p) => p.id === item.id) ? prev.filter((p) => p.id !== item.id) : [...prev, item]));
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    if (kind === "image" && !alt.trim() && files.length === 1) {
      setError("Isi teks alternatif (deskripsi gambar) terlebih dahulu.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const uploaded: MediaItem[] = [];
      for (const file of Array.from(files)) uploaded.push(await uploadFile(file, kind, alt));
      setAlt("");
      if (fileRef.current) fileRef.current.value = "";
      if (multiple) {
        setPicked((prev) => [...prev, ...uploaded]);
        setPage(1);
        const res = await listMediaAction({ q: "", kind, page: 1 });
        setQ("");
        setData({ items: res.items, pageCount: res.pageCount });
      } else {
        onSelect(uploaded);
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className="m-auto w-[min(960px,calc(100vw-2rem))] rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/50"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink">{kind === "image" ? "Pilih Gambar" : "Pilih Dokumen PDF"}</h2>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-ink" aria-label="Tutup">
            <X className="size-5" />
          </button>
        </header>

        <div className="flex flex-col gap-3 border-b border-line bg-background px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            {kind === "image" ? (
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-semibold text-ink">Teks alternatif untuk gambar baru</span>
                <input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={255} placeholder="Mis. Mahasiswa mempresentasikan maket di studio" className={inputClass} />
              </label>
            ) : null}
            <label
              className={cx(
                "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white hover:bg-primary-500",
                uploading && "pointer-events-none opacity-60",
              )}
            >
              {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {uploading ? "Mengunggah…" : "Unggah file baru"}
              <input
                ref={fileRef}
                type="file"
                className="sr-only"
                accept={kind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "application/pdf"}
                multiple={multiple}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          </div>
          <p className="text-xs text-muted">{kind === "image" ? "JPG, PNG, WEBP, atau GIF, maksimal 8 MB." : "PDF, maksimal 25 MB."}</p>
          {error ? <p className="text-sm font-semibold text-[#d92d20]">{error}</p> : null}
        </div>

        <div className="flex items-center gap-3 px-6 pt-4">
          <label className="relative flex-1">
            <span className="sr-only">Cari media</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey-300" aria-hidden />
            <input
              type="search"
              placeholder="Cari nama file atau teks alternatif…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className={cx(inputClass, "pl-9")}
            />
          </label>
          {loading ? <LoaderCircle className="size-5 animate-spin text-primary" aria-label="Memuat" /> : null}
        </div>

        <div className="min-h-[240px] flex-1 overflow-y-auto px-6 py-4">
          {data.items.length === 0 && !loading ? (
            <p className="py-16 text-center text-sm text-muted">Belum ada media. Unggah file baru di atas.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {data.items.map((m) => {
                const selected = picked.some((p) => p.id === m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggle(m)}
                      title={m.altText ?? m.originalName ?? ""}
                      aria-pressed={multiple ? selected : undefined}
                      className={cx(
                        "group relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-grey-100 transition",
                        selected ? "border-primary ring-4 ring-primary-100" : "border-transparent hover:border-primary-200",
                      )}
                    >
                      <MediaThumb item={m} />
                      {selected ? (
                        <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-white">
                          <Check className="size-4" />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40">
              ‹
            </button>
            <span className="text-muted">
              {page} / {data.pageCount}
            </span>
            <button type="button" disabled={page >= data.pageCount} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40">
              ›
            </button>
          </div>
          {multiple ? (
            <button
              type="button"
              disabled={picked.length === 0}
              onClick={() => {
                onSelect(picked);
                setPicked([]);
                onClose();
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-50"
            >
              Tambahkan {picked.length || ""} gambar
            </button>
          ) : null}
        </footer>
      </div>
    </dialog>
  );
}

/** Field satu media (gambar sampul, foto, dokumen PDF). Menyimpan id di input tersembunyi. */
export function MediaField({
  name,
  label,
  kind = "image",
  defaultValue,
  hint,
  required,
}: {
  name: string;
  label: string;
  kind?: Kind;
  defaultValue?: MediaItem | null;
  hint?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState<MediaItem | null>(defaultValue ?? null);
  const [open, setOpen] = useState(false);
  const error = useFieldError(name);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">
        {label}
        {required ? <span className="text-[#d92d20]"> *</span> : null}
      </span>
      <input type="hidden" name={name} value={value?.id ?? ""} />
      {value ? (
        <div className="flex flex-col gap-2 rounded-xl border border-line bg-background p-2">
          <div className={cx("relative overflow-hidden rounded-lg bg-grey-100", kind === "image" ? "aspect-video" : "h-24")}>
            <MediaThumb item={value} className={kind === "image" ? "" : "rounded-lg"} />
          </div>
          <div className="flex items-center justify-between gap-2 px-1">
            <p className="min-w-0 truncate text-xs text-muted" title={value.originalName ?? ""}>
              {value.originalName ?? value.path} · {formatBytes(value.sizeBytes)}
            </p>
            <div className="flex shrink-0 gap-1">
              <button type="button" onClick={() => setOpen(true)} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary-100">
                Ganti
              </button>
              <button type="button" onClick={() => setValue(null)} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#d92d20] hover:bg-[#fef3f2]">
                Lepas
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cx(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-background text-sm font-semibold text-ink-soft transition hover:border-primary hover:text-primary",
            kind === "image" ? "aspect-video" : "h-24",
            error ? "border-[#f04438]" : "border-[#d6d3d1]",
          )}
        >
          {kind === "image" ? <ImagePlus className="size-6" /> : <FileText className="size-6" />}
          {kind === "image" ? "Pilih atau unggah gambar" : "Pilih atau unggah PDF"}
        </button>
      )}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-xs font-semibold text-[#d92d20]">{error}</p> : null}
      <MediaDialog open={open} kind={kind} onClose={() => setOpen(false)} onSelect={(items) => setValue(items[0] ?? null)} />
    </div>
  );
}

export type GalleryValue = { media: MediaItem; caption: string | null };

/** Galeri multi-gambar dengan keterangan dan urutan (fasilitas, pengabdian, penelitian). */
export function GalleryField({ name, label, defaultValue = [], hint }: { name: string; label: string; defaultValue?: GalleryValue[]; hint?: string }) {
  const [items, setItems] = useState<GalleryValue[]>(defaultValue);
  const [open, setOpen] = useState(false);
  const error = useFieldError(name);

  function move(i: number, d: number) {
    setItems((prev) => {
      const next = [...prev];
      const j = i + d;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-100">
          <ImagePlus className="size-4" /> Tambah gambar
        </button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(items.map((it) => ({ mediaId: it.media.id, caption: it.caption || null })))} />
      {items.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-[#d6d3d1] px-4 py-8 text-center text-sm text-muted">Belum ada gambar. Gambar pertama dipakai sebagai sampul/hero.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {items.map((it, i) => (
            <li key={`${it.media.id}-${i}`} className="flex items-center gap-3 rounded-xl border border-line bg-background p-2">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-grey-100">
                <MediaThumb item={it.media} />
              </div>
              <input
                value={it.caption ?? ""}
                onChange={(e) => setItems((prev) => prev.map((p, j) => (j === i ? { ...p, caption: e.target.value } : p)))}
                placeholder="Keterangan (opsional)"
                maxLength={255}
                aria-label={`Keterangan gambar ${i + 1}`}
                className={cx(inputClass, "flex-1")}
              />
              <div className="flex shrink-0 items-center">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="flex size-8 items-center justify-center rounded-lg text-ink-soft hover:bg-white disabled:opacity-30" aria-label="Naikkan">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="flex size-8 items-center justify-center rounded-lg text-ink-soft hover:bg-white disabled:opacity-30" aria-label="Turunkan">
                  <ArrowDown className="size-4" />
                </button>
                <button type="button" onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))} className="flex size-8 items-center justify-center rounded-lg text-[#d92d20] hover:bg-[#fef3f2]" aria-label="Hapus dari galeri">
                  <Trash className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-xs font-semibold text-[#d92d20]">{error}</p> : null}
      <MediaDialog
        open={open}
        kind="image"
        multiple
        onClose={() => setOpen(false)}
        onSelect={(picked) => setItems((prev) => [...prev, ...picked.map((media) => ({ media, caption: null }))])}
      />
    </div>
  );
}
