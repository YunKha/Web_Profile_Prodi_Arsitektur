import type { Metadata } from "next";
import { Star } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPagination, DataTable, EditLink, Flash, ListToolbar, NewButton, PageHeader, StatusBadge, listHref } from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ADMIN_PAGE, adminParams } from "@/lib/admin/media";
import { formatCompact } from "@/lib/format";
import { deleteResearch } from "./actions";

export const metadata: Metadata = { title: "Penelitian" };

export default async function ResearchListPage({ searchParams }: PageProps<"/admin/penelitian">) {
  await requireUser();
  const { q, status, page, ok } = adminParams(await searchParams);
  const where: Prisma.ResearchWhereInput = {
    ...(q ? { OR: [{ title: { contains: q } }, { authorsText: { contains: q } }, { field: { contains: q } }] } : {}),
    ...(status ? { status } : {}),
  };
  const [rows, total] = await Promise.all([
    db.research.findMany({ where, orderBy: [{ year: "desc" }, { updatedAt: "desc" }], skip: (page - 1) * ADMIN_PAGE, take: ADMIN_PAGE }),
    db.research.count({ where }),
  ]);

  return (
    <>
      <PageHeader title="Penelitian" description="Riset dosen dan mahasiswa beserta dokumen publikasinya." action={<NewButton href="/admin/penelitian/baru" label="Tambah penelitian" />} />
      <Flash message={ok} />
      <ListToolbar action="/admin/penelitian" q={q} status={status} placeholder="Cari judul, penulis, atau bidang…" />
      <DataTable
        rows={rows}
        columns={[
          {
            header: "Judul",
            cell: (r) => (
              <div className="flex max-w-xl flex-col">
                <EditLink href={`/admin/penelitian/${r.id}`}>
                  {r.isFeatured ? <Star className="mr-1 inline size-3.5 fill-primary text-primary" aria-label="Unggulan" /> : null}
                  {r.title}
                </EditLink>
                <span className="text-xs text-muted">{r.authorsText ?? "—"}</span>
              </div>
            ),
          },
          { header: "Bidang", cell: (r) => r.field ?? "—" },
          { header: "Tahun", cell: (r) => r.year ?? "—" },
          { header: "Dilihat", cell: (r) => formatCompact(r.viewCount), className: "text-right" },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deleteResearch.bind(null, r.id)} confirm="Hapus penelitian ini?" /> },
        ]}
      />
      <AdminPagination page={page} pageCount={Math.ceil(total / ADMIN_PAGE)} total={total} href={listHref("/admin/penelitian", { q, status })} />
    </>
  );
}
