import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { fromDateTimeInput } from "@/lib/format";

/** Hasil Server Action formulir admin. */
export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> } | null;

export function fromZod(err: z.ZodError): FormState {
  const errors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    errors[key] ??= issue.message;
  }
  return { ok: false, message: "Periksa kembali isian yang ditandai.", errors };
}

/** Ubah galat unik Prisma (P2002) menjadi pesan field; galat lain dilempar ulang. */
export function fromPrisma(err: unknown, field = "slug", label = "Nilai ini"): FormState {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return { ok: false, message: `${label} sudah dipakai data lain.`, errors: { [field]: `${label} sudah dipakai.` } };
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
    return { ok: false, message: "Data masih dipakai oleh data lain sehingga tidak bisa diubah/dihapus." };
  }
  throw err;
}

export function formValues(fd: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(fd.entries());
}

// ───────────── Skema field ─────────────

const blank = (v: unknown) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

export const f = {
  text: (max: number, label = "Field ini") =>
    z.string({ error: `${label} wajib diisi.` }).trim().min(1, `${label} wajib diisi.`).max(max, `Maksimal ${max} karakter.`),

  optText: (max: number) =>
    z
      .string()
      .trim()
      .max(max, `Maksimal ${max} karakter.`)
      .optional()
      .transform((v) => (v ? v : null)),

  slug: () =>
    z
      .string({ error: "Slug wajib diisi." })
      .trim()
      .toLowerCase()
      .min(1, "Slug wajib diisi.")
      .max(180, "Maksimal 180 karakter.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Hanya huruf kecil, angka, dan tanda hubung."),

  url: () =>
    z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : null))
      .refine((v) => v === null || /^https?:\/\/\S+$/i.test(v), "Masukkan URL lengkap diawali http:// atau https://"),

  link: () =>
    z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || v === "#" || v.startsWith("/") || /^https?:\/\/\S+$/i.test(v), "Gunakan path internal (/...) atau URL http(s)."),

  email: () =>
    z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v.toLowerCase() : null))
      .refine((v) => v === null || z.email().safeParse(v).success, "Format email tidak valid."),

  int: (min: number, max: number, label = "Angka") =>
    z.preprocess(
      (v) => (blank(v) ? undefined : Number(v)),
      z.number({ error: `${label} wajib diisi.` }).int("Harus bilangan bulat.").min(min, `Minimal ${min}.`).max(max, `Maksimal ${max}.`),
    ),

  optInt: (min: number, max: number) =>
    z.preprocess(
      (v) => (blank(v) ? null : Number(v)),
      z.number().int("Harus bilangan bulat.").min(min, `Minimal ${min}.`).max(max, `Maksimal ${max}.`).nullable(),
    ),

  optNumber: (min: number, max: number) =>
    z.preprocess((v) => (blank(v) ? null : Number(v)), z.number("Harus angka.").min(min, `Minimal ${min}.`).max(max, `Maksimal ${max}.`).nullable()),

  optId: () => z.preprocess((v) => (blank(v) ? null : Number(v)), z.number().int().positive().nullable()),

  bool: () => z.preprocess((v) => v === "on" || v === "true" || v === "1", z.boolean()),

  /** <input type="date"> → Date (tengah malam UTC) atau null. */
  optDate: () =>
    z.preprocess((v) => (blank(v) ? null : new Date(`${v}T00:00:00Z`)), z.date("Tanggal tidak valid.").nullable()),

  date: (label = "Tanggal") => z.preprocess((v) => (blank(v) ? undefined : new Date(`${v}T00:00:00Z`)), z.date({ error: `${label} wajib diisi.` })),

  /** <input type="datetime-local"> (WITA) → Date atau null. */
  optDateTime: () => z.preprocess((v) => (blank(v) ? null : fromDateTimeInput(String(v))), z.date("Tanggal tidak valid.").nullable()),

  status: () => z.enum(["draft", "published"], { error: "Pilih status." }),

  /** Field tersembunyi berisi JSON dari komponen klien (repeater, galeri, multi-select). */
  json: <T extends z.ZodType>(schema: T) =>
    z.preprocess((v) => {
      if (blank(v)) return [];
      try {
        return JSON.parse(String(v));
      } catch {
        return undefined;
      }
    }, schema),
};

export const galleryItems = z.array(z.object({ mediaId: z.number().int().positive(), caption: z.string().trim().max(255).nullable().optional() })).max(40);
export const idList = z.array(z.number().int().positive()).max(100);

/** Daftar nama field yang berubah, untuk audit log. */
export function changedKeys(before: Record<string, unknown> | null, after: Record<string, unknown>): string[] {
  if (!before) return Object.keys(after);
  return Object.keys(after).filter((k) => {
    const a = before[k];
    const b = after[k];
    if (a instanceof Date || b instanceof Date) return String(a ? new Date(a as Date).getTime() : a) !== String(b ? new Date(b as Date).getTime() : b);
    return JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);
  });
}
