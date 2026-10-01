import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, EditLink, Flash, NewButton, PageHeader, Pill } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { adminParams } from "@/lib/admin/media";
import { formatDate } from "@/lib/format";
import { deleteAccreditation } from "./actions";

export const metadata: Metadata = { title: "Akreditasi" };

export default async function AccreditationListPage({ searchParams }: PageProps<"/admin/akreditasi">) {
  await requireUser();
  const { ok } = adminParams(await searchParams);
  const rows = await db.accreditation.findMany({ orderBy: { validFrom: "desc" }, include: { _count: { select: { documents: true } } } });
  return (
    <>
      <PageHeader title="Akreditasi" description="Riwayat akreditasi. Yang ditandai “berlaku” tampil di website." action={<NewButton href="/admin/akreditasi/baru" label="Tambah akreditasi" />} />
      <Flash message={ok} />
      <DataTable
        rows={rows}
        columns={[
          { header: "Nomor SK", cell: (r) => <EditLink href={`/admin/akreditasi/${r.id}`}>{r.skNumber}</EditLink> },
          { header: "Peringkat", cell: (r) => r.rank },
          { header: "Masa berlaku", cell: (r) => <span className="text-xs">{formatDate(r.validFrom)} – {formatDate(r.validTo)}</span> },
          { header: "Dokumen", cell: (r) => `${r._count.documents}/3` },
          { header: "Status", cell: (r) => (r.isCurrent ? <Pill tone="primary">Berlaku</Pill> : <Pill>Arsip</Pill>) },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deleteAccreditation.bind(null, r.id)} confirm="Hapus data akreditasi ini?" /> },
        ]}
      />
    </>
  );
}
