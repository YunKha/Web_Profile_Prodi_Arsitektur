import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { GhostLink, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toGallery } from "@/lib/admin/media";
import { deleteFacility } from "../actions";
import { FacilityForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Fasilitas" };

export default async function EditFacilityPage({ params }: PageProps<"/admin/fasilitas/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.facility.findUnique({
    where: { id },
    include: {
      features: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" }, include: { media: { select: mediaItemSelect } } },
    },
  });
  if (!item) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${item.name}`}
        back={{ href: "/admin/fasilitas", label: "Semua fasilitas" }}
        action={
          <>
            {item.status === "published" ? (
              <GhostLink href={`/fasilitas/${item.slug}`} external>
                <ExternalLink className="size-4" aria-hidden /> Lihat
              </GhostLink>
            ) : null}
            <DeleteButton action={deleteFacility.bind(null, item.id)} confirm={`Hapus fasilitas “${item.name}”?`} />
          </>
        }
      />
      <FacilityForm key={formKey} item={{ ...item, images: toGallery(item.images) }} />
    </>
  );
}
