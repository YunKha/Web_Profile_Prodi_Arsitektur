import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { GhostLink, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toGallery, toMediaItem } from "@/lib/admin/media";
import { deleteService } from "../actions";
import { ServiceForm } from "../form";
import { newFormKey, thisYear } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Pengabdian" };

export default async function EditServicePage({ params }: PageProps<"/admin/pengabdian/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const year = await thisYear();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.communityService.findUnique({
    where: { id },
    include: { cover: { select: mediaItemSelect }, images: { orderBy: { sortOrder: "asc" }, include: { media: { select: mediaItemSelect } } } },
  });
  if (!item) notFound();
  const team = Array.isArray(item.team) ? (item.team as { name: string; role?: string }[]) : [];

  return (
    <>
      <PageHeader
        title="Edit Kegiatan Pengabdian"
        back={{ href: "/admin/pengabdian", label: "Semua kegiatan" }}
        action={
          <>
            {item.status === "published" ? (
              <GhostLink href={`/pengabdian/${item.slug}`} external>
                <ExternalLink className="size-4" aria-hidden /> Lihat
              </GhostLink>
            ) : null}
            <DeleteButton action={deleteService.bind(null, item.id)} confirm={`Hapus “${item.title}”?`} />
          </>
        }
      />
      <ServiceForm
        key={formKey}
        year={year}
        item={{
          ...item,
          lat: item.lat == null ? null : Number(item.lat),
          lng: item.lng == null ? null : Number(item.lng),
          team,
          cover: toMediaItem(item.cover),
          images: toGallery(item.images),
        }}
      />
    </>
  );
}
