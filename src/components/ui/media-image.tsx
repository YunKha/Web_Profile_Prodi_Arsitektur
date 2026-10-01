import Image from "next/image";
import { mediaUrl } from "@/lib/site";
import type { MediaRef } from "@/lib/queries/common";
import { cx } from "./primitives";

type Props = {
  media: Pick<MediaRef, "path" | "width" | "height" | "altText"> | null | undefined;
  alt?: string;
  sizes?: string;
  className?: string;
  preload?: boolean;
  /** Isi penuh kontainer (kontainer wajib `relative` dan berukuran). */
  fill?: boolean;
};

/**
 * Gambar dari pustaka media lewat next/image. Bila media kosong, tampilkan
 * placeholder berpola agar tata letak tidak rusak.
 */
export function MediaImage({ media, alt, sizes = "100vw", className, preload, fill = true }: Props) {
  const src = mediaUrl(media?.path);
  const altText = alt ?? media?.altText ?? "";

  if (!src) {
    return (
      <div
        role="img"
        aria-label={altText || "Gambar belum tersedia"}
        className={cx(
          "bg-[linear-gradient(135deg,var(--primary-100),var(--grey-100))] bg-cover",
          fill ? "absolute inset-0" : "aspect-video w-full",
          className,
        )}
        style={{ backgroundImage: "url(/images/grid-pattern.svg), linear-gradient(135deg, var(--primary-100), var(--grey-100))" }}
      />
    );
  }

  if (fill || !media?.width || !media?.height) {
    return <Image src={src} alt={altText} fill sizes={sizes} preload={preload} className={cx("object-cover", className)} />;
  }
  return (
    <Image
      src={src}
      alt={altText}
      width={media.width}
      height={media.height}
      sizes={sizes}
      preload={preload}
      className={className}
    />
  );
}
