import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { DataTable, EditLink, Flash, NewButton, PageHeader, Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { adminParams } from "@/lib/admin/media";
import { formatDateTime } from "@/lib/format";
import { deleteUser } from "./actions";

export const metadata: Metadata = { title: "Pengguna" };

export default async function UserListPage({ searchParams }: PageProps<"/admin/pengguna">) {
  const me = await requireAdmin();
  const { ok } = adminParams(await searchParams);
  const rows = await db.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  return (
    <>
      <PageHeader title="Pengguna" description="Akun yang bisa masuk ke panel admin." action={<NewButton href="/admin/pengguna/baru" label="Tambah pengguna" />} />
      <Flash message={ok} />
      <DataTable
        rows={rows}
        columns={[
          {
            header: "Nama",
            cell: (r) => (
              <div className="flex flex-col">
                <EditLink href={`/admin/pengguna/${r.id}`}>
                  {r.name}
                  {r.id === me.id ? " (Anda)" : ""}
                </EditLink>
                <span className="text-xs text-muted">{r.email}</span>
              </div>
            ),
          },
          { header: "Peran", cell: (r) => <Pill tone={r.role === "admin" ? "primary" : "neutral"}>{r.role === "admin" ? "Admin" : "Editor"}</Pill> },
          { header: "Status", cell: (r) => (r.isActive ? <Pill>Aktif</Pill> : <Pill tone="warning">Nonaktif</Pill>) },
          { header: "Login terakhir", cell: (r) => <span className="text-xs">{r.lastLoginAt ? formatDateTime(r.lastLoginAt) : "Belum pernah"}</span> },
          {
            header: "Aksi",
            className: "text-right",
            cell: (r) => (r.id === me.id ? null : <DeleteButton compact action={deleteUser.bind(null, r.id)} confirm={`Hapus akun ${r.email}? Berita yang ditulisnya tetap ada.`} />),
          },
        ]}
      />
    </>
  );
}
