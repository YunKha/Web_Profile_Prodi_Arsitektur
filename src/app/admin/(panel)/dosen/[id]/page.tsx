import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { GhostLink, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toMediaItem } from "@/lib/admin/media";
import { deleteLecturer } from "../actions";
import { LecturerForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Dosen/Staf" };

export default async function EditLecturerPage({ params }: PageProps<"/admin/dosen/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.lecturer.findUnique({
    where: { id },
    include: { photo: { select: mediaItemSelect }, education: { orderBy: { gradYear: "desc" } } },
  });
  if (!item) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${item.fullName}`}
        back={{ href: "/admin/dosen", label: "Semua dosen & staf" }}
        action={
          <>
            {item.status === "published" ? (
              <GhostLink href={`/profil/dosen-staf/${item.slug}`} external>
                <ExternalLink className="size-4" aria-hidden /> Lihat
              </GhostLink>
            ) : null}
            <DeleteButton action={deleteLecturer.bind(null, item.id)} confirm={`Hapus ${item.fullName}?`} />
          </>
        }
      />
      <LecturerForm key={formKey} item={{ ...item, photo: toMediaItem(item.photo) }} />
    </>
  );
}
