import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPagination, DataTable, EditLink, Flash, ListToolbar, NewButton, PageHeader, Pill, StatusBadge, listHref } from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ADMIN_PAGE, adminParams } from "@/lib/admin/media";
import { deleteService } from "./actions";

export const metadata: Metadata = { title: "Pengabdian" };

export default async function ServiceListPage({ searchParams }: PageProps<"/admin/pengabdian">) {
  await requireUser();
  const sp = await searchParams;
  const { q, status, page, ok, one } = adminParams(sp);
  const kind = one(sp.jenis);
  const where: Prisma.CommunityServiceWhereInput = {
    ...(q ? { OR: [{ title: { contains: q } }, { locationName: { contains: q } }] } : {}),
    ...(status ? { status } : {}),
    ...(kind === "dosen" || kind === "mahasiswa" ? { kind } : {}),
  };
  const [rows, total] = await Promise.all([
    db.communityService.findMany({ where, orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }], skip: (page - 1) * ADMIN_PAGE, take: ADMIN_PAGE }),
    db.communityService.count({ where }),
  ]);

  return (
    <>
      <PageHeader title="Pengabdian Masyarakat" description="Kegiatan pengabdian dosen dan mahasiswa." action={<NewButton href="/admin/pengabdian/baru" label="Tambah kegiatan" />} />
      <Flash message={ok} />
      <ListToolbar action="/admin/pengabdian" q={q} status={status} placeholder="Cari judul atau lokasi…">
        <select name="jenis" defaultValue={kind} aria-label="Jenis" className="h-10 rounded-xl border border-[#d6d3d1] bg-white px-3 text-sm">
          <option value="">Semua jenis</option>
          <option value="dosen">Dosen</option>
          <option value="mahasiswa">Mahasiswa</option>
        </select>
      </ListToolbar>
      <DataTable
        rows={rows}
        columns={[
          {
            header: "Kegiatan",
            cell: (r) => (
              <div className="flex flex-col">
                <EditLink href={`/admin/pengabdian/${r.id}`}>{r.title}</EditLink>
                <span className="text-xs text-muted">{r.locationName ?? "—"}</span>
              </div>
            ),
          },
          { header: "Jenis", cell: (r) => <Pill tone={r.kind === "dosen" ? "primary" : "neutral"}>{r.kind === "dosen" ? "Dosen" : "Mahasiswa"}</Pill> },
          { header: "Tahun", cell: (r) => r.year ?? "—" },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deleteService.bind(null, r.id)} confirm={`Hapus “${r.title}”?`} /> },
        ]}
      />
      <AdminPagination page={page} pageCount={Math.ceil(total / ADMIN_PAGE)} total={total} href={listHref("/admin/pengabdian", { q, status, jenis: kind })} />
    </>
  );
}
