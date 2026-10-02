import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Lebar konten desain: 1280px dengan gutter 64px di desktop. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-16", className)}>{children}</div>;
}

type ButtonVariant = "primary" | "outline" | "light" | "ghostLight" | "dark";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white shadow-[0_10px_15px_-3px_rgb(0_0_0/0.2),0_4px_6px_-4px_rgb(0_0_0/0.2)] hover:bg-primary-500",
  outline: "border border-primary bg-white text-primary shadow-[0_4px_4px_0_rgb(0_0_0/0.08)] hover:bg-primary hover:text-white",
  light: "bg-background text-ink shadow-[0_25px_50px_-12px_rgb(0_0_0/0.3)] hover:bg-white",
  ghostLight: "border-2 border-white/40 text-white hover:border-white hover:bg-white/10",
  dark: "bg-ink text-white hover:bg-primary-600",
};

const baseButton =
  "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[13px] font-bold uppercase tracking-[0.1em] transition-colors disabled:opacity-50";

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cx(baseButton, buttonStyles[variant], className);
}

export function LinkButton({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link {...props} className={buttonClass(variant, className)} />;
}

/** Judul seksi: Hanken Grotesk Black, kapital (Beranda: "WARTA ARSITEKTUR"). */
export function SectionHeading({
  title,
  description,
  align = "left",
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cx("flex max-w-2xl flex-col gap-4", align === "center" && "items-center")}>
        <h2 className="font-display text-3xl font-black uppercase tracking-[-0.025em] text-ink sm:text-4xl">{title}</h2>
        {description ? <p className="text-base leading-7 text-ink-soft sm:text-lg sm:leading-[1.65]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Label bergaris kecil di atas judul (mis. "TENTANG KAMI" dengan garis 32px). */
export function Eyebrow({ children, light = false, center = false }: { children: ReactNode; light?: boolean; center?: boolean }) {
  return (
    <div className={cx("flex items-center gap-3", center && "justify-center")}>
      <span className={cx("h-0.5 w-8", light ? "bg-primary-200" : "bg-primary")} aria-hidden />
      <span className={cx("eyebrow", light ? "text-primary-200" : "text-primary")}>{children}</span>
      {center ? <span className={cx("h-0.5 w-8", light ? "bg-primary-200" : "bg-primary")} aria-hidden /> : null}
    </div>
  );
}

export function Badge({ children, tone = "brown", className }: { children: ReactNode; tone?: "brown" | "primary" | "soft" | "dark"; className?: string }) {
  const tones = {
    brown: "bg-brown/90 text-white backdrop-blur-[6px]",
    primary: "bg-primary text-white",
    soft: "bg-primary-100 text-primary-500",
    dark: "bg-secondary text-white",
  };
  return (
    <span className={cx("inline-flex items-center rounded-md px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em]", tones[tone], className)}>
      {children}
    </span>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-warm bg-white px-6 py-16 text-center">
      {icon ? <div className="text-primary">{icon}</div> : null}
      <p className="font-display text-xl font-bold text-ink">{title}</p>
      {description ? <p className="max-w-md text-sm leading-6 text-muted">{description}</p> : null}
    </div>
  );
}

/** Isi HTML tersanitasi (disanitasi saat disimpan di admin). */
export function Prose({ html, className }: { html: string | null | undefined; className?: string }) {
  if (!html) return null;
  return <div className={cx("prose-content", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Teks polos multi-paragraf (dipisah baris kosong). */
export function Paragraphs({ text, className }: { text: string | null | undefined; className?: string }) {
  const parts = (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={cx("flex flex-col gap-5", className)}>
      {parts.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}
