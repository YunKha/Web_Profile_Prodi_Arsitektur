import type { Metadata } from "next";
import { FileCheck, FileX } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPagination, DataTable, EditLink, Flash, ListToolbar, NewButton, PageHeader, StatusBadge, listHref } from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ADMIN_PAGE, adminParams } from "@/lib/admin/media";
import { deleteCourse } from "./actions";

export const metadata: Metadata = { title: "Mata Kuliah & RPS" };

export default async function CourseListPage({ searchParams }: PageProps<"/admin/mata-kuliah">) {
  await requireUser();
  const sp = await searchParams;
  const { q, status, page, ok, one } = adminParams(sp);
  const semester = Number(one(sp.semester)) || 0;
  const where: Prisma.CourseWhereInput = {
    ...(q ? { OR: [{ code: { contains: q } }, { name: { contains: q } }] } : {}),
    ...(status ? { status } : {}),
    ...(semester ? { semester } : {}),
  };
  const [rows, total, missing] = await Promise.all([
    db.course.findMany({
      where,
      orderBy: [{ semester: "asc" }, { sortOrder: "asc" }, { code: "asc" }],
      skip: (page - 1) * ADMIN_PAGE,
      take: ADMIN_PAGE,
      include: { documents: { where: { type: "rps" }, select: { academicYear: true } } },
    }),
    db.course.count({ where }),
    db.course.count({ where: { documents: { none: { type: "rps" } } } }),
  ]);

  return (
    <>
      <PageHeader
        title="Mata Kuliah & RPS"
        description={missing ? `${missing} mata kuliah belum memiliki dokumen RPS.` : "Semua mata kuliah sudah memiliki RPS."}
        action={<NewButton href="/admin/mata-kuliah/baru" label="Tambah mata kuliah" />}
      />
      <Flash message={ok} />
      <ListToolbar action="/admin/mata-kuliah" q={q} status={status} placeholder="Cari kode atau nama…">
        <select name="semester" defaultValue={semester || ""} aria-label="Semester" className="h-10 rounded-xl border border-[#d6d3d1] bg-white px-3 text-sm">
          <option value="">Semua semester</option>
          {Array.from({ length: 8 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Semester {i + 1}
            </option>
          ))}
        </select>
      </ListToolbar>
      <DataTable
        rows={rows}
        columns={[
          { header: "Kode", cell: (r) => <span className="font-mono text-xs font-bold">{r.code}</span> },
          { header: "Mata kuliah", cell: (r) => <EditLink href={`/admin/mata-kuliah/${r.id}`}>{r.name}</EditLink> },
          { header: "Smt", cell: (r) => r.semester },
          { header: "SKS", cell: (r) => r.credits ?? "—" },
          {
            header: "RPS",
            cell: (r) =>
              r.documents[0] ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#067647]">
                  <FileCheck className="size-4" aria-hidden /> {r.documents[0].academicYear ?? "Ada"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#b54708]">
                  <FileX className="size-4" aria-hidden /> Belum ada
                </span>
              ),
          },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deleteCourse.bind(null, r.id)} confirm={`Hapus ${r.code} ${r.name}?`} /> },
        ]}
      />
      <AdminPagination page={page} pageCount={Math.ceil(total / ADMIN_PAGE)} total={total} href={listHref("/admin/mata-kuliah", { q, status, semester: semester || undefined })} />
    </>
  );
}
