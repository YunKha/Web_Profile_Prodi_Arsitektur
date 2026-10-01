import type { Metadata } from "next";
import Image from "next/image";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPagination, DataTable, EditLink, Flash, ListToolbar, NewButton, PageHeader, Pill, StatusBadge, listHref } from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ADMIN_PAGE, adminParams } from "@/lib/admin/media";
import { lecturerDisplayName } from "@/lib/format";
import { deleteLecturer } from "./actions";

export const metadata: Metadata = { title: "Dosen & Staf" };

export default async function LecturerListPage({ searchParams }: PageProps<"/admin/dosen">) {
  await requireUser();
  const { q, status, page, ok } = adminParams(await searchParams);
  const where: Prisma.LecturerWhereInput = {
    ...(q ? { OR: [{ fullName: { contains: q } }, { expertise: { contains: q } }, { nidn: { contains: q } }] } : {}),
    ...(status ? { status } : {}),
  };
  const [rows, total] = await Promise.all([
    db.lecturer.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { fullName: "asc" }],
      skip: (page - 1) * ADMIN_PAGE,
      take: ADMIN_PAGE,
      include: { photo: { select: { path: true } } },
    }),
    db.lecturer.count({ where }),
  ]);

  return (
    <>
      <PageHeader title="Dosen & Staf" description="Data dosen dan tenaga kependidikan yang tampil di halaman Profil." action={<NewButton href="/admin/dosen/baru" label="Tambah dosen/staf" />} />
      <Flash message={ok} />
      <ListToolbar action="/admin/dosen" q={q} status={status} placeholder="Cari nama, keahlian, atau NIDN…" />
      <DataTable
        rows={rows}
        columns={[
          {
            header: "Nama",
            cell: (r) => (
              <div className="flex items-center gap-3">
                {r.photo ? (
                  <Image src={`/media/${r.photo.path}`} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
                ) : (
                  <span className="size-10 rounded-full bg-grey-100" />
                )}
                <div className="flex flex-col">
                  <EditLink href={`/admin/dosen/${r.id}`}>{lecturerDisplayName(r)}</EditLink>
                  <span className="text-xs text-muted">{r.structuralRole ?? "—"}</span>
                </div>
              </div>
            ),
          },
          { header: "Jenis", cell: (r) => <Pill tone={r.staffType === "dosen" ? "primary" : "neutral"}>{r.staffType === "dosen" ? "Dosen" : "Tendik"}</Pill> },
          { header: "Keahlian", cell: (r) => <span className="text-xs text-ink-soft">{r.expertise ?? "—"}</span> },
          { header: "Urutan", cell: (r) => r.sortOrder, className: "text-right" },
          { header: "Status", cell: (r) => (r.isActive ? <StatusBadge status={r.status} /> : <Pill tone="warning">Nonaktif</Pill>) },
          { header: "Aksi", className: "text-right", cell: (r) => <DeleteButton compact action={deleteLecturer.bind(null, r.id)} confirm={`Hapus ${r.fullName}? Data penelitian & pembimbing terkait juga dilepas.`} /> },
        ]}
      />
      <AdminPagination page={page} pageCount={Math.ceil(total / ADMIN_PAGE)} total={total} href={listHref("/admin/dosen", { q, status })} />
    </>
  );
}
