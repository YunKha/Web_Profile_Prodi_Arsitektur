import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, EditLink, Flash, NewButton, PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { adminParams } from "@/lib/admin/media";
import { deleteFacility } from "./actions";

export const metadata: Metadata = { title: "Fasilitas" };

export default async function FacilityListPage({ searchParams }: PageProps<"/admin/fasilitas">) {
  await requireUser();
  const { ok } = adminParams(await searchParams);
  const rows = await db.facility.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { images: true, features: true } } } });

  return (
    <>
      <PageHeader title="Fasilitas" description="Ruang dan laboratorium yang tampil di menu Fasilitas." action={<NewButton href="/admin/fasilitas/baru" label="Tambah fasilitas" />} />
      <Flash message={ok} />
      <DataTable
        rows={rows}
        columns={[
          { header: "Urutan", cell: (r) => r.sortOrder, className: "w-20" },
          {
            header: "Fasilitas",
            cell: (r) => (
              <div className="flex flex-col">
                <EditLink href={`/admin/fasilitas/${r.id}`}>{r.name}</EditLink>
                <span className="text-xs text-muted">Tab: {r.navLabel ?? r.name}</span>
              </div>
            ),
          },
          { header: "Kapasitas", cell: (r) => r.capacity ?? "—" },
          { header: "Isi", cell: (r) => <span className="text-xs text-ink-soft">{r._count.features} fitur · {r._count.images} foto</span> },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deleteFacility.bind(null, r.id)} confirm={`Hapus fasilitas “${r.name}”?`} /> },
        ]}
      />
    </>
  );
}
