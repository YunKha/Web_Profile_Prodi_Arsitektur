import type { ReactNode } from "react";
import type { MediaRef } from "@/lib/queries/common";
import { MediaImage } from "@/components/ui/media-image";
import { Container, cx } from "@/components/ui/primitives";
import { Breadcrumb, type Crumb } from "./breadcrumb";

type Props = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  breadcrumb?: Crumb[];
  /** Gambar latar; tanpa gambar dipakai latar terang berpola grid. */
  image?: MediaRef | null;
  /** Paksa gaya gelap walau tanpa gambar (gradien cokelat). */
  dark?: boolean;
  size?: "md" | "lg";
  align?: "left" | "center";
  children?: ReactNode;
};

/**
 * Hero halaman: foto arsitektur dengan gradien amber dari bawah (seperti
 * Beranda), atau latar terang dengan pola grid untuk halaman daftar/dokumen.
 */
export function PageHero({ title, description, eyebrow, breadcrumb, image, dark, size = "md", align = "left", children }: Props) {
  const isDark = Boolean(image) || dark;
  const center = align === "center";

  return (
    <section
      className={cx(
        "relative isolate overflow-hidden",
        isDark ? "bg-primary-700 text-white" : "border-b border-line-warm bg-background text-ink",
        size === "lg" ? "min-h-[480px] lg:min-h-[614px]" : "min-h-[320px] lg:min-h-[400px]",
        "flex items-end",
      )}
    >
      {isDark ? (
        <>
          {image ? <MediaImage media={image} preload sizes="100vw" className="-z-20" /> : null}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-black/50"
          />
        </>
      ) : (
        <div aria-hidden className="absolute inset-0 -z-10 bg-[url(/images/grid-pattern.svg)] bg-cover bg-top opacity-70" />
      )}

      <Container className={cx("flex flex-col gap-5 py-16 lg:py-20", center && "items-center text-center")}>
        {breadcrumb ? <Breadcrumb items={breadcrumb} light={isDark} /> : null}
        {eyebrow ? (
          <p className={cx("eyebrow flex items-center gap-3", isDark ? "text-primary-200" : "text-primary")}>
            <span className={cx("h-0.5 w-8", isDark ? "bg-primary-200" : "bg-primary")} aria-hidden />
            {eyebrow}
            {center ? <span className={cx("h-0.5 w-8", isDark ? "bg-primary-200" : "bg-primary")} aria-hidden /> : null}
          </p>
        ) : null}
        <h1
          className={cx(
            "max-w-4xl font-display font-black leading-[1.05] tracking-[-0.02em]",
            size === "lg" ? "text-4xl sm:text-5xl lg:text-7xl" : "text-4xl sm:text-5xl lg:text-6xl",
            !isDark && "text-ink",
          )}
        >
          {title}
        </h1>
        {description ? (
          <div className={cx("max-w-2xl text-base font-medium leading-7 sm:text-lg sm:leading-8", isDark ? "text-grey-100" : "text-ink-soft")}>
            {description}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
