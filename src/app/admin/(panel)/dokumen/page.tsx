import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, EditLink, Flash, NewButton, PageHeader, Pill } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { adminParams } from "@/lib/admin/media";
import { formatBytes } from "@/lib/format";
import { deleteDocument } from "./actions";

export const metadata: Metadata = { title: "Dokumen" };

const usedBy: Record<string, string> = { "buku-panduan-ta": "Panduan TA", "dokumen-kurikulum": "Kurikulum" };

export default async function DocumentListPage({ searchParams }: PageProps<"/admin/dokumen">) {
  await requireUser();
  const { ok } = adminParams(await searchParams);
  const rows = await db.document.findMany({ orderBy: { key: "asc" }, include: { media: { select: { path: true, sizeBytes: true } } } });

  return (
    <>
      <PageHeader
        title="Dokumen"
        description="Dokumen umum yang bisa diunduh (buku panduan, dokumen kurikulum, dll.). Salin tautan unduhan untuk dipakai di menu footer."
        action={<NewButton href="/admin/dokumen/baru" label="Tambah dokumen" />}
      />
      <Flash message={ok} />
      <DataTable
        rows={rows}
        columns={[
          { header: "Judul", cell: (r) => <EditLink href={`/admin/dokumen/${r.id}`}>{r.title}</EditLink> },
          { header: "Kunci", cell: (r) => <span className="font-mono text-xs">{r.key}</span> },
          { header: "Dipakai di", cell: (r) => (usedBy[r.key] ? <Pill tone="primary">{usedBy[r.key]}</Pill> : <span className="text-xs text-muted">—</span>) },
          {
            header: "File",
            cell: (r) => (
              <a href={`/media/${r.media.path}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline">
                /media/{r.media.path} · {formatBytes(r.media.sizeBytes)}
              </a>
            ),
          },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deleteDocument.bind(null, r.id)} confirm={`Hapus dokumen “${r.title}”?`} /> },
        ]}
      />
    </>
  );
}
