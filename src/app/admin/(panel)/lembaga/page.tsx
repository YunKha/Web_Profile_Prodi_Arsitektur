import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, EditLink, Flash, NewButton, PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { adminParams } from "@/lib/admin/media";
import { deleteOrganization } from "./actions";

export const metadata: Metadata = { title: "Lembaga" };

export default async function OrganizationListPage({ searchParams }: PageProps<"/admin/lembaga">) {
  await requireUser();
  const { ok } = adminParams(await searchParams);
  const rows = await db.organization.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageHeader title="Lembaga Kemahasiswaan" description="Organisasi dan komunitas di halaman Mahasiswa → Lembaga." action={<NewButton href="/admin/lembaga/baru" label="Tambah lembaga" />} />
      <Flash message={ok} />
      <DataTable
        rows={rows}
        columns={[
          { header: "Lembaga", cell: (r) => <EditLink href={`/admin/lembaga/${r.id}`}>{r.name}</EditLink> },
          { header: "Singkatan", cell: (r) => r.abbreviation ?? "—" },
          { header: "Urutan", cell: (r) => r.sortOrder },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deleteOrganization.bind(null, r.id)} confirm={`Hapus “${r.name}”?`} /> },
        ]}
      />
    </>
  );
}
