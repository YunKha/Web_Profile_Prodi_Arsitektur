import type { Metadata } from "next";
import { ExternalLink, Link as LinkIcon } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  AdminPagination,
  DataTable,
  EditLink,
  Flash,
  ListToolbar,
  NewButton,
  PageHeader,
  Pill,
  StatusBadge,
  listHref,
} from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ADMIN_PAGE, adminParams } from "@/lib/admin/media";
import { deleteRepositoryArticle } from "./actions";

export const metadata: Metadata = { title: "Repositori Artikel" };

export default async function RepositoryListPage({
  searchParams,
}: PageProps<"/admin/repository">) {
  await requireUser();
  const sp = await searchParams;
  const { q, status, page, ok, one } = adminParams(sp);
  const category = one(sp.kategori);
  const year = Number(one(sp.tahun)) || undefined;

  const where: Prisma.RepositoryArticleWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { slug: { contains: q } },
            { authors: { contains: q } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(year ? { year } : {}),
  };

  const [rows, total, categories, years] = await Promise.all([
    db.repositoryArticle.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * ADMIN_PAGE,
      take: ADMIN_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        authors: true,
        category: true,
        year: true,
        driveLinks: true,
        status: true,
        viewCount: true,
        createdAt: true,
      },
    }),
    db.repositoryArticle.count({ where }),
    db.repositoryArticle.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    db.repositoryArticle.findMany({
      where: { year: { not: null } },
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Repositori Artikel"
        description="Kelola kumpulan artikel ilmiah, publikasi, dan arsip dokumen tugas akhir beserta tautan Google Drive."
        action={<NewButton href="/admin/repository/baru" label="Tambah artikel" />}
      />
      <Flash message={ok} />

      <ListToolbar action="/admin/repository" q={q} status={status} placeholder="Cari judul, slug, atau penulis…">
        {categories.length ? (
          <label>
            <span className="sr-only">Kategori</span>
            <select
              name="kategori"
              defaultValue={category}
              className="h-10 rounded-xl border border-[#d6d3d1] bg-white px-3 text-sm"
            >
              <option value="">Semua kategori</option>
              {categories.map((c) =>
                c.category ? (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ) : null,
              )}
            </select>
          </label>
        ) : null}

        {years.length ? (
          <label>
            <span className="sr-only">Tahun</span>
            <select
              name="tahun"
              defaultValue={year ? String(year) : ""}
              className="h-10 rounded-xl border border-[#d6d3d1] bg-white px-3 text-sm"
            >
              <option value="">Semua tahun</option>
              {years.map((y) =>
                y.year ? (
                  <option key={y.year} value={String(y.year)}>
                    {y.year}
                  </option>
                ) : null,
              )}
            </select>
          </label>
        ) : null}
      </ListToolbar>

      <DataTable
        rows={rows}
        empty="Belum ada artikel repositori. Klik “Tambah artikel” untuk memulai."
        columns={[
          {
            header: "Judul & Penulis",
            cell: (r) => (
              <div className="flex flex-col">
                <EditLink href={`/admin/repository/${r.id}`}>{r.title}</EditLink>
                <span className="text-xs text-muted">
                  {r.authors ? `Oleh: ${r.authors}` : "Penulis tidak dicantumkan"}
                </span>
              </div>
            ),
          },
          {
            header: "Kategori",
            cell: (r) => r.category ?? <span className="text-muted">—</span>,
          },
          {
            header: "Tahun",
            cell: (r) => (r.year ? String(r.year) : <span className="text-muted">—</span>),
          },
          {
            header: "Berkas Google Drive",
            cell: (r) => {
              const links = Array.isArray(r.driveLinks) ? r.driveLinks : [];
              if (!links.length) return <span className="text-xs text-muted">Tanpa link</span>;
              return (
                <span className="inline-flex items-center gap-1">
                  <Pill tone="primary">
                    <LinkIcon className="mr-1 inline-block size-3" />
                    {links.length} tautan
                  </Pill>
                </span>
              );
            },
          },
          {
            header: "Status",
            cell: (r) => <StatusBadge status={r.status} />,
          },
          {
            header: "Aksi",
            className: "text-right",
            cell: (r) => (
              <div className="flex items-center justify-end gap-1">
                {r.status === "published" ? (
                  <a
                    href={`/repository/${r.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-lg text-ink-soft hover:bg-background hover:text-primary"
                    aria-label="Lihat di website"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                ) : null}
                <DeleteButton
                  compact
                  action={deleteRepositoryArticle.bind(null, r.id)}
                  confirm={`Hapus artikel repositori “${r.title}”?`}
                />
              </div>
            ),
          },
        ]}
      />

      <AdminPagination
        page={page}
        pageCount={Math.ceil(total / ADMIN_PAGE)}
        total={total}
        href={listHref("/admin/repository", {
          q,
          status,
          kategori: category || undefined,
          tahun: year ? String(year) : undefined,
        })}
      />
    </>
  );
}
