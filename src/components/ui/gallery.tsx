"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "./primitives";

export type GalleryImage = { src: string; alt: string; caption?: string | null };

/** Slider gambar dengan tombol, indikator, dan strip thumbnail (desain Fasilitas). */
export function Gallery({ images, aspect = "aspect-[4/3]", sizes = "(min-width: 1024px) 60vw, 100vw" }: { images: GalleryImage[]; aspect?: string; sizes?: string }) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return null;
  const current = images[Math.min(index, images.length - 1)];
  const go = (d: number) => setIndex((i) => (i + d + images.length) % images.length);

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cx("group relative overflow-hidden rounded-2xl border border-line-warm bg-grey-100 p-1.5 shadow-[0_25px_50px_-12px_rgb(0_0_0/0.18)]", aspect)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        <div className="relative size-full overflow-hidden rounded-xl">
          <Image key={current.src} src={current.src} alt={current.alt} fill sizes={sizes} className="object-cover" />
          {current.caption ? (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-5 pt-12">
              <p className="eyebrow text-[11px] text-white">{current.caption}</p>
            </div>
          ) : null}
        </div>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Gambar sebelumnya"
              className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Gambar berikutnya"
              className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-4 right-6 flex gap-2" aria-hidden>
              {images.map((img, i) => (
                <span key={img.src} className={cx("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-white" : "w-1.5 bg-white/60")} />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="grid grid-cols-4 gap-3" aria-label="Pilih gambar">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Tampilkan gambar ${i + 1}${img.caption ? `: ${img.caption}` : ""}`}
                aria-pressed={i === index}
                className={cx(
                  "relative block aspect-[3/2] w-full overflow-hidden rounded-lg border-2 transition",
                  i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={img.src} alt="" fill sizes="160px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
