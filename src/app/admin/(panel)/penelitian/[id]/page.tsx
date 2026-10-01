import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { GhostLink, PageHeader } from "@/components/admin/ui";
import type { MediaItem } from "@/lib/admin/media-actions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toGallery, toMediaItem } from "@/lib/admin/media";
import { lecturerOptions } from "@/lib/admin/options";
import { deleteResearch } from "../actions";
import { ResearchForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Penelitian" };

export default async function EditResearchPage({ params }: PageProps<"/admin/penelitian/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [item, lecturers, fields] = await Promise.all([
    db.research.findUnique({
      where: { id },
      include: {
        cover: { select: mediaItemSelect },
        images: { orderBy: { sortOrder: "asc" }, include: { media: { select: mediaItemSelect } } },
        files: { orderBy: { sortOrder: "asc" }, include: { media: { select: mediaItemSelect } } },
        authors: { orderBy: { authorOrder: "asc" } },
      },
    }),
    lecturerOptions(),
    db.research.findMany({ where: { field: { not: null } }, distinct: ["field"], select: { field: true } }),
  ]);
  if (!item) notFound();

  return (
    <>
      <PageHeader
        title="Edit Penelitian"
        back={{ href: "/admin/penelitian", label: "Semua penelitian" }}
        action={
          <>
            {item.status === "published" ? (
              <GhostLink href={`/penelitian/${item.slug}`} external>
                <ExternalLink className="size-4" aria-hidden /> Lihat
              </GhostLink>
            ) : null}
            <DeleteButton action={deleteResearch.bind(null, item.id)} confirm="Hapus penelitian ini?" />
          </>
        }
      />
      <ResearchForm
        key={formKey}
        lecturers={lecturers}
        fields={fields.map((f) => f.field as string)}
        item={{
          ...item,
          cover: toMediaItem(item.cover),
          images: toGallery(item.images),
          files: item.files.map((f) => ({ title: f.title, media: toMediaItem(f.media) as MediaItem })),
          authorIds: item.authors.map((a) => a.lecturerId),
        }}
      />
    </>
  );
}
