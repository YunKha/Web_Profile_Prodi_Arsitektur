import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { newFormKey } from "@/lib/admin/request";
import { deleteTrack } from "../actions";
import { TrackForm } from "../form";

export const metadata: Metadata = { title: "Edit Jalur TA" };

export default async function EditTrackPage({ params }: PageProps<"/admin/jalur-ta/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.thesisTrack.findUnique({ where: { id }, include: { steps: { orderBy: { sortOrder: "asc" } } } });
  if (!item) notFound();
  return (
    <>
      <PageHeader
        title={`Edit ${item.name}`}
        back={{ href: "/admin/jalur-ta", label: "Semua jalur" }}
        action={<DeleteButton action={deleteTrack.bind(null, item.id)} confirm={`Hapus jalur “${item.name}” beserta tahapannya?`} />}
      />
      <TrackForm key={formKey} item={{ ...item, steps: item.steps.map(({ title, body }) => ({ title, body })) }} />
    </>
  );
}
