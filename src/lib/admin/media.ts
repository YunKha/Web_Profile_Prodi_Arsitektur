import type { MediaItem } from "./media-actions";

/** Kolom media untuk pemilih media di formulir admin. */
export const mediaItemSelect = {
  id: true,
  path: true,
  mime: true,
  width: true,
  height: true,
  altText: true,
  originalName: true,
  sizeBytes: true,
} as const;

export function toMediaItem(m: MediaItem | null | undefined): MediaItem | null {
  if (!m) return null;
  const { id, path, mime, width, height, altText, originalName, sizeBytes } = m;
  return { id, path, mime, width, height, altText, originalName, sizeBytes };
}

export function toGallery(rows: { caption: string | null; media: MediaItem }[]) {
  return rows.map((r) => ({ media: toMediaItem(r.media) as MediaItem, caption: r.caption }));
}

export function adminParams(sp: Record<string, string | string[] | undefined>) {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const status = one(sp.status);
  return {
    q: one(sp.q).slice(0, 100),
    status: status === "draft" || status === "published" ? status : "",
    page,
    ok: one(sp.ok),
    one,
  } as const;
}

export const ADMIN_PAGE = 20;
