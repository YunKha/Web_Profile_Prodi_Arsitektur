import type { Metadata } from "next";
import Form from "next/form";
import { AdminPagination, DataTable, PageHeader, Pill, listHref } from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { adminParams } from "@/lib/admin/media";
import { actionLabel, entityLabel, entityOptions } from "@/lib/admin/labels";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Log Aktivitas" };

const PAGE = 50;

function summary(diff: unknown): string {
  if (!diff || typeof diff !== "object") return "";
  const d = diff as Record<string, unknown>;
  const label = d.title ?? d.name ?? d.email ?? d.code ?? d.key ?? d.sk ?? d.path;
  const changed = Array.isArray(d.changed) && d.changed.length ? `ubah: ${d.changed.slice(0, 6).join(", ")}${d.changed.length > 6 ? "…" : ""}` : "";
  return [label ? String(label) : "", changed].filter(Boolean).join(" — ");
}

export default async function AuditLogPage({ searchParams }: PageProps<"/admin/log">) {
  await requireAdmin();
  const sp = await searchParams;
  const { page, one } = adminParams(sp);
  const entity = one(sp.entitas);
  const userId = Number(one(sp.pengguna)) || 0;
  const where: Prisma.AuditLogWhereInput = { ...(entity ? { entity } : {}), ...(userId ? { userId } : {}) };
  const [rows, total, users] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, include: { user: { select: { name: true } } } }),
    db.auditLog.count({ where }),
    db.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const select = "h-10 rounded-xl border border-[#d6d3d1] bg-white px-3 text-sm";

  return (
    <>
      <PageHeader title="Log Aktivitas" description="Catatan siapa mengubah apa dan kapan." />
      <Form action="/admin/log" className="flex flex-wrap gap-2">
        <select name="entitas" defaultValue={entity} aria-label="Jenis data" className={select}>
          <option value="">Semua data</option>
          {entityOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="pengguna" defaultValue={userId || ""} aria-label="Pengguna" className={select}>
          <option value="">Semua pengguna</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-xl border border-line bg-white px-4 text-sm font-semibold hover:border-primary hover:text-primary">
          Terapkan
        </button>
      </Form>
      <DataTable
        rows={rows}
        empty="Belum ada aktivitas."
        columns={[
          { header: "Waktu", cell: (r) => <span className="whitespace-nowrap text-xs">{formatDateTime(r.createdAt)}</span> },
          { header: "Pengguna", cell: (r) => r.user?.name ?? <span className="text-muted">Sistem/terhapus</span> },
          {
            header: "Aksi",
            cell: (r) => (
              <Pill tone={r.action === "delete" ? "warning" : r.action === "create" ? "primary" : "neutral"}>
                {actionLabel(r.action)} {entityLabel(r.entity)}
              </Pill>
            ),
          },
          { header: "ID", cell: (r) => <span className="font-mono text-xs">{r.entityId ?? "—"}</span> },
          { header: "Rincian", cell: (r) => <span className="text-xs text-ink-soft">{summary(r.diff)}</span> },
        ]}
      />
      <AdminPagination page={page} pageCount={Math.ceil(total / PAGE)} total={total} href={listHref("/admin/log", { entitas: entity, pengguna: userId || undefined })} />
    </>
  );
}
