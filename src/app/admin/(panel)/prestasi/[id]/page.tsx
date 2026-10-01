import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { GhostLink, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toGallery, toMediaItem } from "@/lib/admin/media";
import { lecturerOptions } from "@/lib/admin/options";
import { deleteAchievement } from "../actions";
import { AchievementForm } from "../form";
import { newFormKey, thisYear } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Prestasi" };

export default async function EditAchievementPage({ params }: PageProps<"/admin/prestasi/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const year = await thisYear();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [item, lecturers] = await Promise.all([
    db.achievement.findUnique({
      where: { id },
      include: {
        cover: { select: mediaItemSelect },
        studentPhoto: { select: mediaItemSelect },
        images: { orderBy: { sortOrder: "asc" }, include: { media: { select: mediaItemSelect } } },
        advisors: true,
      },
    }),
    lecturerOptions(),
  ]);
  if (!item) notFound();

  return (
    <>
      <PageHeader
        title="Edit Prestasi"
        back={{ href: "/admin/prestasi", label: "Semua prestasi" }}
        action={
          <>
            {item.status === "published" ? (
              <GhostLink href={`/mahasiswa/prestasi/${item.slug}`} external>
                <ExternalLink className="size-4" aria-hidden /> Lihat
              </GhostLink>
            ) : null}
            <DeleteButton action={deleteAchievement.bind(null, item.id)} confirm={`Hapus prestasi “${item.title}”?`} />
          </>
        }
      />
      <AchievementForm
        key={formKey}
        lecturers={lecturers}
        year={year}
        item={{
          ...item,
          cover: toMediaItem(item.cover),
          studentPhoto: toMediaItem(item.studentPhoto),
          images: toGallery(item.images),
          advisorIds: item.advisors.map((a) => a.lecturerId),
        }}
      />
    </>
  );
}
