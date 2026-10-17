import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { GhostLink, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mediaItemSelect, toMediaItem } from "@/lib/admin/media";
import { newFormKey } from "@/lib/admin/request";
import { formatDateTime } from "@/lib/format";
import { deleteRepositoryArticle } from "../actions";
import { RepositoryArticleForm } from "../form";

export const metadata: Metadata = { title: "Edit Artikel Repositori" };

function parseDriveLinks(raw: unknown): { title: string; url: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is { title: string; url: string } =>
        typeof item === "object" && item !== null && typeof item.title === "string" && typeof item.url === "string",
    )
    .map((item) => ({ title: item.title, url: item.url }));
}

export default async function EditRepositoryArticlePage({
  params,
}: PageProps<"/admin/repository/[id]">) {
  await requireUser();
  const formKey = await newFormKey();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [article, categories] = await Promise.all([
    db.repositoryArticle.findUnique({
      where: { id },
      include: { cover: { select: mediaItemSelect } },
    }),
    db.repositoryArticle.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  if (!article) notFound();

  const categoryOptions = categories
    .map((c) => c.category)
    .filter((c): c is string => Boolean(c && c.trim()));

  return (
    <>
      <PageHeader
        title="Edit Artikel Repositori"
        description={`Terakhir diperbarui ${formatDateTime(article.updatedAt)}`}
        back={{ href: "/admin/repository", label: "Semua artikel" }}
        action={
          <>
            {article.status === "published" ? (
              <GhostLink href={`/repository/${article.slug}`} external>
                <ExternalLink className="size-4" aria-hidden /> Lihat di website
              </GhostLink>
            ) : null}
            <DeleteButton
              action={deleteRepositoryArticle.bind(null, article.id)}
              confirm={`Hapus artikel repositori “${article.title}”?`}
            />
          </>
        }
      />
      <RepositoryArticleForm
        key={formKey}
        categoryOptions={categoryOptions}
        article={{
          ...article,
          cover: toMediaItem(article.cover),
          driveLinks: parseDriveLinks(article.driveLinks),
        }}
      />
    </>
  );
}
