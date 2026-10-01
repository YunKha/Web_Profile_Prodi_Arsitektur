const TZ = "Asia/Makassar"; // WITA — Palu, Sulawesi Tengah

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
const shortDateFmt = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: TZ });
const dateTimeFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});
const timeFmt = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

type DateInput = Date | string | null | undefined;

function toDate(d: DateInput): Date | null {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "15 Agustus 2025" */
export function formatDate(d: DateInput): string {
  const date = toDate(d);
  return date ? dateFmt.format(date) : "";
}

/** "15 AGU 2025" — format kartu berita di desain. */
export function formatShortDate(d: DateInput): string {
  const date = toDate(d);
  return date ? shortDateFmt.format(date).replace(".", "").toUpperCase() : "";
}

export function formatDateTime(d: DateInput): string {
  const date = toDate(d);
  return date ? dateTimeFmt.format(date) : "";
}

export function formatTime(d: DateInput): string {
  const date = toDate(d);
  return date ? `${timeFmt.format(date)} WITA` : "";
}

/** 1200 → "1.2K" */
export function formatCompact(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 10 ? Math.round(k) : Math.round(k * 10) / 10}K`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Nilai untuk <input type="date">. */
export function toDateInput(d: DateInput): string {
  const date = toDate(d);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
}

/** Nilai untuk <input type="datetime-local"> dalam zona WITA. */
export function toDateTimeInput(d: DateInput): string {
  const date = toDate(d);
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Membaca nilai datetime-local (dianggap WITA, UTC+8) menjadi Date. */
export function fromDateTimeInput(value: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value}:00+08:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function initials(name: string): string {
  return name
    .replace(/^(prof|dr|ir|drs)\.?\s+/gi, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function lecturerDisplayName(l: { fullName: string; frontTitle?: string | null; backTitle?: string | null }): string {
  return [l.frontTitle, l.fullName].filter(Boolean).join(" ") + (l.backTitle ? `, ${l.backTitle}` : "");
}

/** Potong teks polos ke panjang tertentu tanpa memotong kata. */
export function truncate(text: string | null | undefined, max: number): string {
  if (!text) return "";
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : max)}…`;
}

export function stripHtml(html: string | null | undefined): string {
  return (html ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
