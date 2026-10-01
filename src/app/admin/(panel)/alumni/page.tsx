import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPagination, DataTable, EditLink, Flash, ListToolbar, NewButton, PageHeader, StatusBadge, listHref } from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ADMIN_PAGE, adminParams } from "@/lib/admin/media";
import { deleteAlumnus } from "./actions";

export const metadata: Metadata = { title: "Alumni" };

export default async function AlumniListPage({ searchParams }: PageProps<"/admin/alumni">) {
  await requireUser();
  const { q, status, page, ok } = adminParams(await searchParams);
  const where: Prisma.AlumnusWhereInput = {
    ...(q ? { OR: [{ name: { contains: q } }, { company: { contains: q } }] } : {}),
    ...(status ? { status } : {}),
  };
  const [rows, total] = await Promise.all([
    db.alumnus.findMany({ where, orderBy: [{ gradYear: "desc" }, { name: "asc" }], skip: (page - 1) * ADMIN_PAGE, take: ADMIN_PAGE }),
    db.alumnus.count({ where }),
  ]);
  return (
    <>
      <PageHeader
        title="Alumni"
        description="Cerita dan testimoni alumni. Statistik tracer study diatur di Pengaturan."
        action={<NewButton href="/admin/alumni/baru" label="Tambah alumni" />}
      />
      <Flash message={ok} />
      <ListToolbar action="/admin/alumni" q={q} status={status} placeholder="Cari nama atau instansi…" />
      <DataTable
        rows={rows}
        columns={[
          { header: "Nama", cell: (r) => <EditLink href={`/admin/alumni/${r.id}`}>{r.name}</EditLink> },
          { header: "Lulus", cell: (r) => r.gradYear ?? "—" },
          { header: "Pekerjaan", cell: (r) => <span className="text-xs">{[r.jobTitle, r.company].filter(Boolean).join(" · ") || "—"}</span> },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deleteAlumnus.bind(null, r.id)} confirm={`Hapus data ${r.name}?`} /> },
        ]}
      />
      <AdminPagination page={page} pageCount={Math.ceil(total / ADMIN_PAGE)} total={total} href={listHref("/admin/alumni", { q, status })} />
    </>
  );
}
