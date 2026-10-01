import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toMediaItem } from "@/lib/admin/media";
import { deleteCourse } from "../actions";
import { CourseForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Mata Kuliah" };

export default async function EditCoursePage({ params }: PageProps<"/admin/mata-kuliah/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.course.findUnique({
    where: { id },
    include: { documents: { where: { type: "rps" }, take: 1, include: { media: { select: mediaItemSelect } } } },
  });
  if (!item) notFound();
  const rps = item.documents[0];

  return (
    <>
      <PageHeader
        title={`Edit ${item.code}`}
        back={{ href: "/admin/mata-kuliah", label: "Semua mata kuliah" }}
        action={<DeleteButton action={deleteCourse.bind(null, item.id)} confirm={`Hapus ${item.code} ${item.name}?`} />}
      />
      <CourseForm key={formKey} item={{ ...item, rps: toMediaItem(rps?.media), academicYear: rps?.academicYear ?? null }} />
    </>
  );
}
