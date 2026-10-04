import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, EditLink, Flash, GhostLink, NewButton, PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { adminParams } from "@/lib/admin/media";
import { deleteTrack } from "./actions";

export const metadata: Metadata = { title: "Jalur Tugas Akhir" };

export default async function TrackListPage({ searchParams }: PageProps<"/admin/jalur-ta">) {
  await requireUser();
  const { ok } = adminParams(await searchParams);
  const rows = await db.thesisTrack.findMany({ orderBy: { sortOrder: "asc" }, include: { steps: { orderBy: { sortOrder: "asc" }, select: { title: true } } } });

  return (
    <>
      <PageHeader
        title="Jalur Tugas Akhir"
        description="Setiap jalur tampil sebagai tab di halaman Panduan TA dengan tahapannya sendiri."
        action={
          <>
            <GhostLink href="/akademik/panduan-ta" external>
              <ExternalLink className="size-4" aria-hidden /> Lihat halaman
            </GhostLink>
            <NewButton href="/admin/jalur-ta/baru" label="Tambah jalur" />
          </>
        }
      />
      <Flash message={ok} />
      <DataTable
        rows={rows}
        empty="Belum ada jalur Tugas Akhir."
        columns={[
          { header: "Urutan", cell: (r) => r.sortOrder, className: "w-20" },
          { header: "Jalur", cell: (r) => <EditLink href={`/admin/jalur-ta/${r.id}`}>{r.name}</EditLink> },
          {
            header: "Tahapan",
            cell: (r) => (
              <span className="text-xs text-ink-soft">
                {r.steps.length} tahap{r.steps.length ? ` — ${r.steps.map((s) => s.title).join(" → ")}` : ""}
              </span>
            ),
          },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deleteTrack.bind(null, r.id)} confirm={`Hapus jalur “${r.name}” beserta tahapannya?`} /> },
        ]}
      />
    </>
  );
}
