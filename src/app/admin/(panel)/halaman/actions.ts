"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { f, galleryItems, type FormState } from "@/lib/admin/form";
import { findPage } from "@/lib/page-registry";

const missions = z.array(z.object({ title: z.string().trim().min(1, "Judul misi wajib diisi.").max(150), body: z.string().trim().min(1).max(3000) })).max(12);

export async function savePage(pageKey: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const page = findPage(pageKey);
  if (!page) return { ok: false, message: "Halaman tidak dikenal." };

  const errors: Record<string, string> = {};
  const galleries = new Map<string, z.infer<typeof galleryItems>>();

  const blocks = page.blocks.map((b, i) => {
    const title = String(formData.get(`${b.key}.title`) ?? "").trim();
    const body = String(formData.get(`${b.key}.body`) ?? "").trim();
    const imageRaw = String(formData.get(`${b.key}.imageId`) ?? "");
    const linkUrl = String(formData.get(`${b.key}.linkUrl`) ?? "").trim();
    const linkLabel = String(formData.get(`${b.key}.linkLabel`) ?? "").trim();
    if (title.length > 255) errors[`${b.key}.title`] = "Maksimal 255 karakter.";
    if (body.length > 20000) errors[`${b.key}.body`] = "Maksimal 20.000 karakter.";
    if (b.fields.includes("link")) {
      if (linkUrl && !/^https?:\/\/\S+$/i.test(linkUrl)) errors[`${b.key}.linkUrl`] = "Masukkan URL lengkap diawali https://";
      if (linkUrl.length > 500) errors[`${b.key}.linkUrl`] = "Maksimal 500 karakter.";
      if (linkLabel.length > 100) errors[`${b.key}.linkLabel`] = "Maksimal 100 karakter.";
    }
    if (b.fields.includes("gallery")) {
      const parsed = f.json(galleryItems).safeParse(formData.get(`${b.key}.images`));
      if (parsed.success) galleries.set(b.key, parsed.data);
      else errors[`${b.key}.images`] = "Daftar gambar tidak valid.";
    }
    return {
      blockKey: b.key,
      title: b.fields.includes("title") ? title || null : undefined,
      body: b.fields.includes("body") ? body || null : undefined,
      imageId: b.fields.includes("image") ? (imageRaw ? Number(imageRaw) : null) : undefined,
      linkUrl: b.fields.includes("link") ? linkUrl || null : undefined,
      linkLabel: b.fields.includes("link") ? linkLabel || null : undefined,
      sortOrder: i,
    };
  });

  let missionRows: z.infer<typeof missions> | null = null;
  if (pageKey === "profil") {
    const parsed = f.json(missions).safeParse(formData.get("missions"));
    if (!parsed.success) errors.missions = parsed.error.issues[0]?.message ?? "Daftar misi tidak valid.";
    else missionRows = parsed.data;
  }
  if (Object.keys(errors).length) return { ok: false, message: "Periksa kembali isian yang ditandai.", errors };

  await db.$transaction(async (tx) => {
    for (const { blockKey, ...data } of blocks) {
      await tx.pageBlock.upsert({
        where: { pageKey_blockKey: { pageKey, blockKey } },
        update: data,
        create: { pageKey, blockKey, ...data },
      });
    }
    for (const [blockKey, items] of galleries) {
      await tx.pageBlockImage.deleteMany({ where: { pageKey, blockKey } });
      await tx.pageBlockImage.createMany({
        data: items.map((img, i) => ({ pageKey, blockKey, mediaId: img.mediaId, caption: img.caption ?? null, sortOrder: i + 1 })),
      });
    }
    if (missionRows) {
      await tx.missionItem.deleteMany({});
      await tx.missionItem.createMany({ data: missionRows.map((m, i) => ({ ...m, sortOrder: i + 1 })) });
    }
  });

  await audit(user, "update", "page_block", pageKey, { blocks: blocks.map((b) => b.blockKey) });
  updateTag("pages");
  redirect(`/admin/halaman?ok=${encodeURIComponent(`Halaman “${page.label}” disimpan.`)}`);
}
