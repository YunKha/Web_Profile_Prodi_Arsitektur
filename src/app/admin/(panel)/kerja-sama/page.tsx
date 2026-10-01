import type { Metadata } from "next";
import { House } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, EditLink, Flash, ListToolbar, NewButton, PageHeader, Pill, StatusBadge } from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { adminParams } from "@/lib/admin/media";
import { formatDate } from "@/lib/format";
import { deletePartnership } from "./actions";

export const metadata: Metadata = { title: "Kerja Sama" };

export default async function PartnershipListPage({ searchParams }: PageProps<"/admin/kerja-sama">) {
  await requireUser();
  const { q, status, ok } = adminParams(await searchParams);
  const where: Prisma.PartnershipWhereInput = {
    ...(q ? { OR: [{ partnerName: { contains: q } }, { partnerType: { contains: q } }] } : {}),
    ...(status ? { status } : {}),
  };
  const [rows, now] = await Promise.all([db.partnership.findMany({ where, orderBy: [{ sortOrder: "asc" }, { partnerName: "asc" }] }), Promise.resolve(new Date())]);
  return (
    <>
      <PageHeader title="Kerja Sama" description="Mitra pemerintah, asosiasi, dan industri." action={<NewButton href="/admin/kerja-sama/baru" label="Tambah mitra" />} />
      <Flash message={ok} />
      <ListToolbar action="/admin/kerja-sama" q={q} status={status} placeholder="Cari nama atau kelompok mitra…" />
      <DataTable
        rows={rows}
        columns={[
          {
            header: "Mitra",
            cell: (r) => (
              <EditLink href={`/admin/kerja-sama/${r.id}`}>
                {r.showOnHome ? <House className="mr-1 inline size-3.5 text-primary" aria-label="Tampil di beranda" /> : null}
                {r.partnerName}
              </EditLink>
            ),
          },
          { header: "Kelompok", cell: (r) => r.partnerType ?? "—" },
          {
            header: "Periode",
            cell: (r) => (
              <span className="text-xs">
                {r.startDate ? formatDate(r.startDate) : "—"} – {r.endDate ? formatDate(r.endDate) : "sekarang"}
                {r.endDate && r.endDate < now ? (
                  <span className="ml-2">
                    <Pill tone="warning">Berakhir</Pill>
                  </span>
                ) : null}
              </span>
            ),
          },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deletePartnership.bind(null, r.id)} confirm={`Hapus mitra “${r.partnerName}”?`} /> },
        ]}
      />
    </>
  );
}
