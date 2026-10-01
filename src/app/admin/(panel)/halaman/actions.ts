"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { f, type FormState } from "@/lib/admin/form";
import { findPage } from "@/lib/page-registry";

const missions = z.array(z.object({ title: z.string().trim().min(1, "Judul misi wajib diisi.").max(150), body: z.string().trim().min(1).max(3000) })).max(12);

export async function savePage(pageKey: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const page = findPage(pageKey);
  if (!page) return { ok: false, message: "Halaman tidak dikenal." };

  const errors: Record<string, string> = {};
  const blocks = page.blocks.map((b, i) => {
    const title = String(formData.get(`${b.key}.title`) ?? "").trim();
    const body = String(formData.get(`${b.key}.body`) ?? "").trim();
    const imageRaw = String(formData.get(`${b.key}.imageId`) ?? "");
    if (title.length > 255) errors[`${b.key}.title`] = "Maksimal 255 karakter.";
    if (body.length > 20000) errors[`${b.key}.body`] = "Maksimal 20.000 karakter.";
    return {
      blockKey: b.key,
      title: b.fields.includes("title") ? title || null : undefined,
      body: b.fields.includes("body") ? body || null : undefined,
      imageId: b.fields.includes("image") ? (imageRaw ? Number(imageRaw) : null) : undefined,
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
    for (const b of blocks) {
      const data = { title: b.title, body: b.body, imageId: b.imageId, sortOrder: b.sortOrder };
      await tx.pageBlock.upsert({
        where: { pageKey_blockKey: { pageKey, blockKey: b.blockKey } },
        update: data,
        create: { pageKey, blockKey: b.blockKey, ...data },
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
