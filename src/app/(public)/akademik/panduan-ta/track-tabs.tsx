"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "@/components/ui/primitives";

export type TrackData = {
  slug: string;
  name: string;
  description: string | null;
  steps: { id: number; title: string; body: string }[];
};

/** Tab jalur Tugas Akhir; setiap jalur menampilkan timeline tahapannya sendiri. */
export function TrackTabs({ tracks }: { tracks: TrackData[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const track = tracks[Math.min(active, tracks.length - 1)];

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    let next = active;
    if (e.key in keys) next = (active + keys[e.key] + tracks.length) % tracks.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tracks.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  if (!track) return null;

  return (
    <div className="flex flex-col gap-12">
      <div role="tablist" aria-label="Jalur Tugas Akhir" onKeyDown={onKeyDown} className="mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-line-warm bg-white p-2 sm:flex-row">
        {tracks.map((t, i) => (
          <button
            key={t.slug}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cx(
              "flex-1 rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] transition",
              i === active ? "bg-primary text-white shadow-[0_10px_15px_-3px_rgb(175_100_14/0.3)]" : "text-ink-soft hover:bg-background hover:text-primary",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${active}`} className="flex flex-col gap-12">
        {track.description ? <p className="mx-auto max-w-3xl text-center text-lg leading-8 text-ink-soft">{track.description}</p> : null}
        {track.steps.length ? (
          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] lg:gap-8">
            <span aria-hidden className="absolute left-6 right-6 top-6 hidden h-0.5 bg-line-warm lg:block" />
            {track.steps.map((s, i) => (
              <li key={s.id} className="relative flex flex-col gap-4">
                <span className="relative flex size-12 items-center justify-center rounded-full border-4 border-background bg-primary font-display text-lg font-black text-white shadow-[0_10px_15px_-3px_rgb(175_100_14/0.35)]">
                  {i + 1}
                </span>
                <h3 className="font-display text-xl font-bold text-ink">{s.title}</h3>
                <p className="whitespace-pre-line text-[15px] leading-7 text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-center text-sm text-muted">Tahapan jalur ini belum diisi.</p>
        )}
      </div>
    </div>
  );
}
