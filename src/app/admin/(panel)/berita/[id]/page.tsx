import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { GhostLink, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toMediaItem } from "@/lib/admin/media";
import { formatDateTime } from "@/lib/format";
import { deleteNews } from "../actions";
import { NewsForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Edit Berita" };

export default async function EditNewsPage({ params }: PageProps<"/admin/berita/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [news, categories, tags] = await Promise.all([
    db.news.findUnique({ where: { id }, include: { cover: { select: mediaItemSelect }, tags: true, author: { select: { name: true } } } }),
    db.newsCategory.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!news) notFound();

  return (
    <>
      <PageHeader
        title="Edit Berita"
        description={`Dibuat oleh ${news.author?.name ?? "—"} · diperbarui ${formatDateTime(news.updatedAt)}`}
        back={{ href: "/admin/berita", label: "Semua berita" }}
        action={
          <>
            {news.status === "published" ? (
              <GhostLink href={`/berita/${news.slug}`} external>
                <ExternalLink className="size-4" aria-hidden /> Lihat
              </GhostLink>
            ) : null}
            <DeleteButton action={deleteNews.bind(null, news.id)} confirm={`Hapus berita “${news.title}”?`} />
          </>
        }
      />
      <NewsForm
        key={formKey}
        categories={categories}
        tags={tags}
        news={{
          ...news,
          cover: toMediaItem(news.cover),
          tagIds: news.tags.map((t) => t.tagId),
        }}
      />
    </>
  );
}
