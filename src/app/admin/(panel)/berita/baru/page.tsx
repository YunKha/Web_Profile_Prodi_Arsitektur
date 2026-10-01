import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { NewsForm } from "../form";
import { newFormKey } from "@/lib/admin/request";

export const metadata: Metadata = { title: "Tulis Berita" };

export default async function NewNewsPage() {
  await requireUser();
  const formKey = await newFormKey();
  const [categories, tags] = await Promise.all([db.newsCategory.findMany({ orderBy: { name: "asc" } }), db.tag.findMany({ orderBy: { name: "asc" } })]);
  return (
    <>
      <PageHeader title="Tulis Berita" back={{ href: "/admin/berita", label: "Semua berita" }} />
      <NewsForm key={formKey} categories={categories} tags={tags} />
    </>
  );
}
