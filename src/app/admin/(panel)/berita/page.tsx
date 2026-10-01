import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPagination, DataTable, EditLink, Flash, ListToolbar, NewButton, PageHeader, Pill, StatusBadge, listHref } from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ADMIN_PAGE, adminParams } from "@/lib/admin/media";
import { formatCompact, formatDateTime } from "@/lib/format";
import { deleteNews } from "./actions";

export const metadata: Metadata = { title: "Berita" };

export default async function NewsListPage({ searchParams }: PageProps<"/admin/berita">) {
  await requireUser();
  const sp = await searchParams;
  const { q, status, page, ok, one } = adminParams(sp);
  const categoryId = Number(one(sp.kategori)) || 0;

  const where: Prisma.NewsWhereInput = {
    ...(q ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }] } : {}),
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
  };
  const [rows, total, categories, now] = await Promise.all([
    db.news.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * ADMIN_PAGE,
      take: ADMIN_PAGE,
      select: { id: true, title: true, slug: true, status: true, publishedAt: true, viewCount: true, category: { select: { name: true } }, author: { select: { name: true } } },
    }),
    db.news.count({ where }),
    db.newsCategory.findMany({ orderBy: { name: "asc" } }),
    Promise.resolve(new Date()),
  ]);

  return (
    <>
      <PageHeader title="Berita" description="Tulis, jadwalkan, dan terbitkan berita program studi." action={<NewButton href="/admin/berita/baru" label="Tulis berita" />} />
      <Flash message={ok} />
      <ListToolbar action="/admin/berita" q={q} status={status} placeholder="Cari judul atau slug…">
        <label>
          <span className="sr-only">Kategori</span>
          <select name="kategori" defaultValue={categoryId || ""} className="h-10 rounded-xl border border-[#d6d3d1] bg-white px-3 text-sm">
            <option value="">Semua kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </ListToolbar>
      <DataTable
        rows={rows}
        empty="Belum ada berita. Klik “Tulis berita” untuk memulai."
        columns={[
          {
            header: "Judul",
            cell: (r) => (
              <div className="flex flex-col">
                <EditLink href={`/admin/berita/${r.id}`}>{r.title}</EditLink>
                <span className="text-xs text-muted">oleh {r.author?.name ?? "—"}</span>
              </div>
            ),
          },
          { header: "Kategori", cell: (r) => r.category?.name ?? <span className="text-muted">—</span> },
          {
            header: "Status",
            cell: (r) =>
              r.status === "published" && r.publishedAt && r.publishedAt > now ? <Pill tone="warning">Terjadwal</Pill> : <StatusBadge status={r.status} />,
          },
          { header: "Terbit", cell: (r) => <span className="whitespace-nowrap text-xs text-ink-soft">{formatDateTime(r.publishedAt) || "—"}</span> },
          { header: "Dibaca", cell: (r) => formatCompact(r.viewCount), className: "text-right" },
          {
            header: "Aksi",
            className: "text-right",
            cell: (r) => (
              <div className="flex items-center justify-end gap-1">
                {r.status === "published" ? (
                  <a href={`/berita/${r.slug}`} target="_blank" rel="noopener noreferrer" className="flex size-8 items-center justify-center rounded-lg text-ink-soft hover:bg-background hover:text-primary" aria-label="Lihat di website">
                    <ExternalLink className="size-4" />
                  </a>
                ) : null}
                <DeleteButton compact action={deleteNews.bind(null, r.id)} confirm={`Hapus berita “${r.title}”?`} />
              </div>
            ),
          },
        ]}
      />
      <AdminPagination page={page} pageCount={Math.ceil(total / ADMIN_PAGE)} total={total} href={listHref("/admin/berita", { q, status, kategori: categoryId || undefined })} />
    </>
  );
}
