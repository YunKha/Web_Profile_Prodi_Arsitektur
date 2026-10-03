import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, Calendar, Download, FileText, Globe, GraduationCap, Mail, MapPin, Trophy, User } from "lucide-react";
import type { MediaRef } from "@/lib/queries/common";
import { formatBytes, formatCompact, formatShortDate, initials, lecturerDisplayName, truncate } from "@/lib/format";
import { expertiseLabel } from "@/lib/expertise";
import { mediaUrl } from "@/lib/site";
import { MediaImage } from "@/components/ui/media-image";
import { Badge, cx } from "@/components/ui/primitives";

const cardBase = "group flex flex-col overflow-hidden rounded-xl border border-line-warm bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgb(175_100_14/0.25)]";

// ───────────── Berita ─────────────

export type NewsCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
  viewCount: number;
  cover: MediaRef | null;
  category: { name: string; slug: string } | null;
  author: { name: string } | null;
};

export function NewsCard({ news, headingLevel = "h3" }: { news: NewsCardData; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const author = news.author?.name ?? "Admin Warta";
  return (
    <article className={cx(cardBase, "relative")}>
      <Link href={`/berita/${news.slug}`} className="relative block h-60 overflow-hidden" tabIndex={-1} aria-hidden>
        <MediaImage media={news.cover} sizes="(min-width: 1024px) 33vw, 100vw" className="transition-transform duration-500 group-hover:scale-105" />
        {news.category ? <Badge className="absolute left-5 top-5">{news.category.name}</Badge> : null}
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.05em] text-brown">
          <span className="flex items-center gap-1.5">
            <Image src="/images/icons/meta-date.svg" alt="" width={18} height={20} className="h-4 w-auto" />
            <time dateTime={news.publishedAt?.toISOString()}>{formatShortDate(news.publishedAt)}</time>
          </span>
          <span className="size-1 rounded-full bg-line-warm" aria-hidden />
          <span className="flex items-center gap-1.5">
            <Image src="/images/icons/meta-views.svg" alt="" width={22} height={15} className="h-3 w-auto" />
            {formatCompact(news.viewCount)}
            <span className="sr-only">kali dilihat</span>
          </span>
        </div>
        <Heading className="font-display text-2xl font-bold leading-[1.375] text-ink">
          <Link href={`/berita/${news.slug}`} className="line-clamp-2 hover:text-primary after:absolute after:inset-0">
            {news.title}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-sm leading-[1.625] text-muted">{news.excerpt}</p>
        <div className="mt-auto flex items-center gap-3 border-t border-line-warm pt-6">
          <span className="flex size-10 items-center justify-center rounded-full bg-brown text-xs font-black text-white" aria-hidden>
            {initials(author)}
          </span>
          <div>
            <p className="text-xs font-bold text-ink">{author}</p>
            <p className="text-xs font-bold uppercase text-muted">Redaksi Jurusan</p>
          </div>
        </div>
      </div>
    </article>
  );
}

// ───────────── Prestasi ─────────────

export type AchievementCardData = {
  slug: string;
  title: string;
  studentName: string;
  achievementYear: number;
  level: string;
  rankLabel: string | null;
  category: string | null;
  summary: string | null;
  cover: MediaRef | null;
};

export const levelLabel: Record<string, string> = { lokal: "Tingkat Lokal", nasional: "Tingkat Nasional", internasional: "Tingkat Internasional" };

export function AchievementCard({ item }: { item: AchievementCardData }) {
  return (
    <article className={cx(cardBase, "relative")}>
      <Link href={`/mahasiswa/prestasi/${item.slug}`} className="relative block aspect-[3/2] overflow-hidden border-b border-line-warm" tabIndex={-1} aria-hidden>
        <MediaImage media={item.cover} sizes="(min-width: 1024px) 33vw, 100vw" className="transition-transform duration-500 group-hover:scale-105" />
        {item.rankLabel ? <Badge tone="dark" className="absolute right-5 top-5 rounded-md">{item.rankLabel}</Badge> : null}
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5 md:p-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-primary">
          <Trophy className="size-3.5" aria-hidden />
          {levelLabel[item.level] ?? item.level}
        </p>
        <h3 className="font-display text-2xl font-bold leading-snug text-ink">
          <Link href={`/mahasiswa/prestasi/${item.slug}`} className="line-clamp-2 hover:text-primary after:absolute after:inset-0">
            {item.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between border-t border-line-warm pt-4 text-sm">
          <span className="font-semibold text-ink-soft">{item.studentName}</span>
          <span className="text-xs font-bold text-muted">{item.achievementYear}</span>
        </div>
      </div>
    </article>
  );
}

/** Kartu galeri foto tinggi bergradien amber (Beranda: "Galeri Karya & Prestasi"). */
export function ShowcaseCard({ item, highlight = false }: { item: AchievementCardData; highlight?: boolean }) {
  return (
    <Link
      href={`/mahasiswa/prestasi/${item.slug}`}
      className={cx(
        "group relative block aspect-[4/5] overflow-hidden rounded-xl",
        highlight && "border-2 border-[rgb(217_164_65/0.3)] shadow-[0_25px_50px_-12px_rgb(0_0_0/0.4)]",
      )}
    >
      <MediaImage media={item.cover} sizes="(min-width: 1024px) 33vw, 100vw" className="transition-transform duration-700 group-hover:scale-105" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,#af640e_0%,rgb(175_100_14/0.3)_30%,rgb(175_100_14/0)_100%)] opacity-80" />
      {item.rankLabel ? (
        <span className="absolute right-8 top-8 rounded bg-secondary px-5 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-white shadow-lg">
          {item.rankLabel}
        </span>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8 sm:p-10">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/95">{item.category ?? levelLabel[item.level]}</p>
        <h3 className="font-display text-2xl font-bold leading-[1.25] text-white">{item.title}</h3>
        <span className="h-1 w-12 bg-primary" aria-hidden />
        <p className="pt-2 text-xs font-medium text-white">
          {item.studentName} ({item.achievementYear})
        </p>
      </div>
    </Link>
  );
}

// ───────────── Penelitian ─────────────

export type ResearchCardData = {
  slug: string;
  title: string;
  abstract: string | null;
  year: number | null;
  field: string | null;
  scheme: string | null;
  authorsText: string | null;
  cover: MediaRef | null;
  authors: { lecturer: { fullName: string; frontTitle: string | null; backTitle: string | null } }[];
};

export function researchAuthors(r: Pick<ResearchCardData, "authorsText" | "authors">): string {
  if (r.authorsText) return r.authorsText;
  return r.authors.map((a) => lecturerDisplayName(a.lecturer)).join(", ") || "Tim Peneliti Arsitektur UNTAD";
}

export function ResearchCard({ item }: { item: ResearchCardData }) {
  return (
    <article className={cardBase}>
      <Link href={`/penelitian/${item.slug}`} className="relative block aspect-video overflow-hidden" tabIndex={-1} aria-hidden>
        <MediaImage media={item.cover} sizes="(min-width: 1024px) 33vw, 100vw" className="transition-transform duration-500 group-hover:scale-105" />
        {item.field ? <Badge className="absolute left-4 top-4">{item.field}</Badge> : null}
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.08em] text-brown">
          <span className="line-clamp-1">{item.scheme ?? "Penelitian"}</span>
          {item.year ? <span className="rounded-full bg-primary-100 px-3 py-1 text-primary-500">{item.year}</span> : null}
        </div>
        <h3 className="font-display text-lg font-bold leading-snug text-ink">
          <Link href={`/penelitian/${item.slug}`} className="line-clamp-2 hover:text-primary">
            {item.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm leading-6 text-muted">{item.abstract}</p>
        <div className="mt-auto flex flex-col gap-3 border-t border-line-warm pt-4">
          <p className="line-clamp-1 text-sm font-semibold text-ink-soft">{researchAuthors(item)}</p>
          <Link href={`/penelitian/${item.slug}`} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-primary">
            Baca selengkapnya <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ───────────── Pengabdian ─────────────

export type ServiceCardData = {
  slug: string;
  title: string;
  summary: string | null;
  locationName: string | null;
  year: number | null;
  publishedAt: Date | null;
  cover: MediaRef | null;
};

export function ServiceCard({ item }: { item: ServiceCardData }) {
  return (
    <article className={cardBase}>
      <Link href={`/pengabdian/${item.slug}`} className="relative block aspect-[3/2] overflow-hidden border-b border-line-warm" tabIndex={-1} aria-hidden>
        <MediaImage media={item.cover} sizes="(min-width: 1024px) 33vw, 100vw" className="transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-brown">
          {item.locationName ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden />
              {item.locationName}
            </span>
          ) : null}
          {item.year ? (
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" aria-hidden />
              {item.year}
            </span>
          ) : null}
        </p>
        <h3 className="font-display text-2xl font-bold leading-snug text-ink">
          <Link href={`/pengabdian/${item.slug}`} className="line-clamp-2 hover:text-primary">
            {item.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm leading-6 text-muted">{item.summary}</p>
        <Link href={`/pengabdian/${item.slug}`} className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs font-bold uppercase tracking-[0.1em] text-primary">
          Lihat detail kegiatan <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

// ───────────── Program kegiatan ─────────────

export function ProgramCard({ item }: { item: { slug: string; title: string; summary: string | null; body: string | null; image: MediaRef | null } }) {
  return (
    <article className={cardBase}>
      <div className="relative aspect-[3/2] overflow-hidden">
        <MediaImage media={item.image} sizes="(min-width: 1024px) 33vw, 100vw" className="transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h3 className="font-display text-2xl font-bold leading-tight text-ink">{item.title}</h3>
        <p className="text-[15px] leading-7 text-ink-soft">{item.summary}</p>
        {item.body ? (
          <Link href={`/mahasiswa/kegiatan/${item.slug}`} className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold text-primary">
            Selengkapnya <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

// ───────────── Dosen ─────────────

export type LecturerCardData = {
  slug: string;
  fullName: string;
  frontTitle: string | null;
  backTitle: string | null;
  structuralRole: string | null;
  expertise: string | null;
  expertiseGroup?: string | null;
  email: string | null;
  sintaUrl: string | null;
  scholarUrl: string | null;
  websiteUrl: string | null;
  photo: MediaRef | null;
};

export function LecturerCard({ item }: { item: LecturerCardData }) {
  const name = lecturerDisplayName(item);
  const iconLink = "flex size-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-primary-100 hover:text-primary";
  return (
    <article className={cardBase}>
      <Link href={`/profil/dosen-staf/${item.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-grey-100" tabIndex={-1} aria-hidden>
        <MediaImage media={item.photo} alt={name} sizes="(min-width: 1024px) 25vw, 50vw" className="transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-6">
        {item.structuralRole ? <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">{item.structuralRole}</p> : null}
        <h3 className="font-display text-lg font-bold leading-snug text-ink">
          <Link href={`/profil/dosen-staf/${item.slug}`} className="hover:text-primary">
            {name}
          </Link>
        </h3>
        {item.expertiseGroup ? (
          <p className="w-fit rounded-full bg-primary-100 px-3 py-1 text-[11px] font-bold text-primary-500">{expertiseLabel(item.expertiseGroup)}</p>
        ) : null}
        {item.expertise ? <p className="text-sm leading-6 text-muted">{item.expertise}</p> : null}
        <div className="mt-auto flex items-center gap-1 border-t border-line-warm pt-3">
          {item.email ? (
            <a href={`mailto:${item.email}`} className={iconLink} aria-label={`Email ${name}`}>
              <Mail className="size-4" />
            </a>
          ) : null}
          {item.scholarUrl ? (
            <a href={item.scholarUrl} target="_blank" rel="noopener noreferrer" className={iconLink} aria-label={`Google Scholar ${name}`}>
              <GraduationCap className="size-4" />
            </a>
          ) : null}
          {item.sintaUrl ? (
            <a href={item.sintaUrl} target="_blank" rel="noopener noreferrer" className={iconLink} aria-label={`SINTA ${name}`}>
              <Award className="size-4" />
            </a>
          ) : null}
          {item.websiteUrl ? (
            <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className={iconLink} aria-label={`Situs web ${name}`}>
              <Globe className="size-4" />
            </a>
          ) : null}
          <Link href={`/profil/dosen-staf/${item.slug}`} className="ml-auto inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-primary">
            Profil <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Avatar bulat kecil dengan fallback inisial. */
export function Avatar({ media, name, size = 64 }: { media: MediaRef | null | undefined; name: string; size?: number }) {
  const src = mediaUrl(media?.path);
  return src ? (
    <Image src={src} alt={name} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-brown font-black text-white"
      style={{ width: size, height: size, fontSize: size / 3.2 }}
      aria-hidden
    >
      {initials(name) || <User className="size-1/2" />}
    </span>
  );
}

// ───────────── Dokumen ─────────────

export function DocumentLink({
  title,
  media,
  subtitle,
}: {
  title: string;
  media: { path: string; sizeBytes: number; originalName: string | null } | null;
  subtitle?: string;
}) {
  if (!media) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-dashed border-line-warm bg-white p-5 text-sm text-muted">
        <FileText className="size-6 text-grey-300" aria-hidden />
        {title} — belum tersedia
      </div>
    );
  }
  const href = `/media/${media.path}`;
  const filename = media.originalName ?? `${title}.pdf`;
  return (
    <a
      href={`${href}?download=${encodeURIComponent(filename)}`}
      className="group flex items-center gap-4 rounded-xl border border-line-warm bg-white p-5 transition hover:border-primary hover:shadow-[var(--shadow-card)]"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary">
        <FileText className="size-6" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink group-hover:text-primary">{title}</span>
        <span className="block text-xs text-muted">{subtitle ?? `PDF · ${formatBytes(media.sizeBytes)}`}</span>
      </span>
      <Download className="size-5 shrink-0 text-ink-soft group-hover:text-primary" aria-hidden />
    </a>
  );
}

export function excerptOf(text: string | null | undefined, max = 160) {
  return truncate(text, max);
}
