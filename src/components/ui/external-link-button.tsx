import { ExternalLink } from "lucide-react";
import { buttonClass } from "./primitives";

/** Tombol ke tautan luar (mis. folder Google Drive) yang dibuka di tab baru. */
export function ExternalLinkButton({
  href,
  label,
  variant = "primary",
  className,
}: {
  href: string | null | undefined;
  label: string;
  variant?: "primary" | "outline" | "light";
  className?: string;
}) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass(variant, className)}>
      {label}
      <ExternalLink className="size-4" aria-hidden />
      <span className="sr-only">(membuka tab baru)</span>
    </a>
  );
}
