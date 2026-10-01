import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, EditLink, Flash, NewButton, PageHeader, Pill, StatusBadge } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { adminParams } from "@/lib/admin/media";
import { deleteProgram } from "./actions";

export const metadata: Metadata = { title: "Program Kegiatan" };

export default async function ProgramListPage({ searchParams }: PageProps<"/admin/program">) {
  await requireUser();
  const { ok } = adminParams(await searchParams);
  const rows = await db.program.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }] });
  return (
    <>
      <PageHeader title="Program Kegiatan" description="Kartu program di halaman Kegiatan Akademik dan Nonakademik." action={<NewButton href="/admin/program/baru" label="Tambah program" />} />
      <Flash message={ok} />
      <DataTable
        rows={rows}
        columns={[
          { header: "Program", cell: (r) => <EditLink href={`/admin/program/${r.id}`}>{r.title}</EditLink> },
          { header: "Halaman", cell: (r) => <Pill tone={r.kind === "akademik" ? "primary" : "neutral"}>{r.kind === "akademik" ? "Akademik" : "Nonakademik"}</Pill> },
          { header: "Urutan", cell: (r) => r.sortOrder },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deleteProgram.bind(null, r.id)} confirm={`Hapus program “${r.title}”?`} /> },
        ]}
      />
    </>
  );
}
