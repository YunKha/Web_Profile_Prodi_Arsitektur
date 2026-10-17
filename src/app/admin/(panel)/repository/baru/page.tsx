import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { newFormKey } from "@/lib/admin/request";
import { RepositoryArticleForm } from "../form";

export const metadata: Metadata = { title: "Tambah Artikel Repositori" };

export default async function NewRepositoryArticlePage() {
  await requireUser();
  const formKey = await newFormKey();

  const categories = await db.repositoryArticle.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  const categoryOptions = categories
    .map((c) => c.category)
    .filter((c): c is string => Boolean(c && c.trim()));

  return (
    <>
      <PageHeader
        title="Tambah Artikel Repositori"
        back={{ href: "/admin/repository", label: "Semua artikel" }}
      />
      <RepositoryArticleForm key={formKey} categoryOptions={categoryOptions} />
    </>
  );
}
