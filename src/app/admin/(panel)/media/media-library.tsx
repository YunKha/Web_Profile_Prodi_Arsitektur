"use client";

import { useEffect, useState, useTransition } from "react";
import { Copy, LoaderCircle, Search, Trash, Upload } from "lucide-react";
import { MediaThumb, uploadFile } from "@/components/admin/media-picker";
import { inputClass } from "@/components/admin/fields";
import { cx } from "@/components/ui/primitives";
import { formatBytes, formatDateTime } from "@/lib/format";
import { deleteMediaAction, listMediaAction, updateMediaAltAction, type MediaItem } from "@/lib/admin/media-actions";

type Kind = "all" | "image" | "document";

export function MediaLibrary() {
  const [kind, setKind] = useState<Kind>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: MediaItem[]; total: number; pageCount: number }>({ items: [], total: 0, pageCount: 1 });
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [loading, startLoading] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [reload, setReload] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    startLoading(async () => {
      const res = await listMediaAction({ q, kind, page });
      setData(res);
    });
  }, [q, kind, page, reload]);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setMessage(null);
    let done = 0;
    const failed: string[] = [];
    for (const file of list) {
      setBusy(`Mengunggah ${done + 1}/${list.length}: ${file.name}`);
      try {
        await uploadFile(file, "any");
        done++;
      } catch (e) {
        failed.push(`${file.name}: ${e instanceof Error ? e.message : "gagal"}`);
      }
    }
    setBusy(null);
    setMessage(failed.length ? { tone: "err", text: failed.join(" · ") } : { tone: "ok", text: `${done} file diunggah. Lengkapi teks alternatif gambar bila perlu.` });
    setPage(1);
    setReload((r) => r + 1);
  }

  return (
    <div
      className="flex flex-col gap-5"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        upload(e.dataTransfer.files);
      }}
    >
      <label
        className={cx(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white px-6 py-8 text-center transition",
          dragging ? "border-primary bg-primary-100" : "border-[#d6d3d1] hover:border-primary",
        )}
      >
        {busy ? <LoaderCircle className="size-7 animate-spin text-primary" /> : <Upload className="size-7 text-primary" />}
        <span className="text-sm font-semibold text-ink">{busy ?? "Seret file ke sini atau klik untuk memilih"}</span>
        <span className="text-xs text-muted">Gambar JPG/PNG/WEBP/GIF maks. 8 MB · PDF maks. 25 MB</span>
        <input
          type="file"
          multiple
          className="sr-only"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          disabled={Boolean(busy)}
          onChange={(e) => {
            if (e.target.files) upload(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {message ? (
        <p role="status" className={cx("rounded-xl border px-4 py-3 text-sm font-medium", message.tone === "ok" ? "border-[#abefc6] bg-[#ecfdf3] text-[#067647]" : "border-[#fecdca] bg-[#fef3f2] text-[#b42318]")}>
          {message.text}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Cari</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey-300" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama file atau teks alternatif…"
            className={cx(inputClass, "pl-9")}
          />
        </label>
        <div className="flex gap-1 rounded-xl border border-line bg-white p-1" role="group" aria-label="Jenis file">
          {(
            [
              ["all", "Semua"],
              ["image", "Gambar"],
              ["document", "PDF"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => {
                setKind(k);
                setPage(1);
              }}
              className={cx("rounded-lg px-4 py-1.5 text-sm font-semibold", kind === k ? "bg-primary text-white" : "text-ink-soft hover:bg-background")}
            >
              {l}
            </button>
          ))}
        </div>
        {loading ? <LoaderCircle className="size-5 animate-spin text-primary" aria-label="Memuat" /> : null}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {data.items.length === 0 && !loading ? (
            <p className="rounded-2xl border border-line bg-white py-16 text-center text-sm text-muted">Tidak ada media.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6">
              {data.items.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(m)}
                    aria-pressed={selected?.id === m.id}
                    className={cx(
                      "relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-grey-100",
                      selected?.id === m.id ? "border-primary ring-4 ring-primary-100" : "border-transparent hover:border-primary-200",
                    )}
                    title={m.originalName ?? ""}
                  >
                    <MediaThumb item={m} />
                    {m.mime.startsWith("image/") && !m.altText ? (
                      <span className="absolute bottom-1 left-1 rounded bg-[#b54708] px-1.5 py-0.5 text-[10px] font-bold text-white">alt kosong</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between text-sm text-muted">
            <span>{data.total} file</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40">
                ‹
              </button>
              <span>
                {page} / {data.pageCount}
              </span>
              <button type="button" disabled={page >= data.pageCount} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40">
                ›
              </button>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-line bg-white p-5 shadow-sm lg:sticky lg:top-24">
          {selected ? (
            <MediaDetail
              key={selected.id}
              item={selected}
              onSaved={(alt) => {
                setSelected({ ...selected, altText: alt });
                setReload((r) => r + 1);
              }}
              onDeleted={(text) => {
                setSelected(null);
                setMessage({ tone: "ok", text });
                setReload((r) => r + 1);
              }}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted">Pilih file untuk melihat detail.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function MediaDetail({ item, onSaved, onDeleted }: { item: MediaItem; onSaved: (alt: string) => void; onDeleted: (message: string) => void }) {
  const [alt, setAlt] = useState(item.altText ?? "");
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const url = `/media/${item.path}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-grey-100">
        <MediaThumb item={item} className={item.mime.startsWith("image/") ? "object-contain" : ""} />
      </div>
      <dl className="grid grid-cols-[90px_1fr] gap-y-1.5 text-xs">
        <dt className="text-muted">Nama</dt>
        <dd className="break-all font-medium text-ink">{item.originalName ?? "—"}</dd>
        <dt className="text-muted">Ukuran</dt>
        <dd className="text-ink">
          {formatBytes(item.sizeBytes)}
          {item.width ? ` · ${item.width}×${item.height}px` : ""}
        </dd>
        {item.createdAt ? (
          <>
            <dt className="text-muted">Diunggah</dt>
            <dd className="text-ink">{formatDateTime(item.createdAt)}</dd>
          </>
        ) : null}
      </dl>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
          setNote("URL disalin.");
        }}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink-soft hover:border-primary hover:text-primary"
      >
        <Copy className="size-3.5" /> Salin URL
      </button>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink">Teks alternatif / judul</span>
        <textarea value={alt} onChange={(e) => setAlt(e.target.value)} rows={3} maxLength={255} className={cx(inputClass, "resize-y")} />
      </label>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await updateMediaAltAction(item.id, alt);
            setNote("Teks alternatif disimpan.");
            onSaved(alt);
          })
        }
        className="inline-flex h-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Simpan"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Hapus file ini secara permanen?")) return;
          start(async () => {
            const res = await deleteMediaAction(item.id);
            if (res.ok) onDeleted(res.message);
            else setNote(res.message);
          });
        }}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#fecdca] text-sm font-semibold text-[#d92d20] hover:bg-[#fef3f2]"
      >
        <Trash className="size-4" /> Hapus file
      </button>
      {note ? (
        <p role="status" className="text-xs font-semibold text-ink-soft">
          {note}
        </p>
      ) : null}
    </div>
  );
}
