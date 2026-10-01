import type { Metadata } from "next";
import { Star } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPagination, DataTable, EditLink, Flash, ListToolbar, NewButton, PageHeader, Pill, StatusBadge, listHref } from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ADMIN_PAGE, adminParams } from "@/lib/admin/media";
import { deleteAchievement } from "./actions";

export const metadata: Metadata = { title: "Prestasi" };

export default async function AchievementListPage({ searchParams }: PageProps<"/admin/prestasi">) {
  await requireUser();
  const { q, status, page, ok } = adminParams(await searchParams);
  const where: Prisma.AchievementWhereInput = {
    ...(q ? { OR: [{ title: { contains: q } }, { studentName: { contains: q } }] } : {}),
    ...(status ? { status } : {}),
  };
  const [rows, total] = await Promise.all([
    db.achievement.findMany({ where, orderBy: [{ achievementYear: "desc" }, { updatedAt: "desc" }], skip: (page - 1) * ADMIN_PAGE, take: ADMIN_PAGE }),
    db.achievement.count({ where }),
  ]);

  return (
    <>
      <PageHeader title="Prestasi Mahasiswa" description="Capaian mahasiswa di kompetisi dan karya terbaik." action={<NewButton href="/admin/prestasi/baru" label="Tambah prestasi" />} />
      <Flash message={ok} />
      <ListToolbar action="/admin/prestasi" q={q} status={status} placeholder="Cari judul atau nama mahasiswa…" />
      <DataTable
        rows={rows}
        columns={[
          {
            header: "Prestasi",
            cell: (r) => (
              <div className="flex flex-col">
                <EditLink href={`/admin/prestasi/${r.id}`}>
                  {r.isFeatured ? <Star className="mr-1 inline size-3.5 fill-primary text-primary" aria-label="Tampil di beranda" /> : null}
                  {r.title}
                </EditLink>
                <span className="text-xs text-muted">{r.studentName}</span>
              </div>
            ),
          },
          { header: "Peringkat", cell: (r) => (r.rankLabel ? <Pill tone="primary">{r.rankLabel}</Pill> : "—") },
          { header: "Tingkat", cell: (r) => <span className="capitalize">{r.level}</span> },
          { header: "Tahun", cell: (r) => r.achievementYear },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          {
            header: "Aksi",
            className: "text-right",
            cell: (r) => <DeleteButton compact action={deleteAchievement.bind(null, r.id)} confirm={`Hapus prestasi “${r.title}”?`} />,
          },
        ]}
      />
      <AdminPagination page={page} pageCount={Math.ceil(total / ADMIN_PAGE)} total={total} href={listHref("/admin/prestasi", { q, status })} />
    </>
  );
}
