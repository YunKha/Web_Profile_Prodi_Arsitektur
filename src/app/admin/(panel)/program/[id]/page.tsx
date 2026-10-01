import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toMediaItem } from "@/lib/admin/media";
import { deleteProgram } from "../actions";
import { ProgramForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Program" };

export default async function EditProgramPage({ params }: PageProps<"/admin/program/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.program.findUnique({ where: { id }, include: { image: { select: mediaItemSelect } } });
  if (!item) notFound();
  return (
    <>
      <PageHeader
        title="Edit Program Kegiatan"
        back={{ href: "/admin/program", label: "Semua program" }}
        action={<DeleteButton action={deleteProgram.bind(null, item.id)} confirm={`Hapus program “${item.title}”?`} />}
      />
      <ProgramForm key={formKey} item={{ ...item, image: toMediaItem(item.image) }} />
    </>
  );
}
