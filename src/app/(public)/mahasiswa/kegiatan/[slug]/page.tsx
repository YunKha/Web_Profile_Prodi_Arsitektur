import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layouts/page-hero";
import { SubNav } from "@/components/layouts/sub-nav";
import { Container, Prose } from "@/components/ui/primitives";
import { getProgram, getProgramSlugs } from "@/lib/queries/content";
import { mahasiswaTabs } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getProgramSlugs();
  return (slugs.length ? slugs : ["__placeholder__"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/mahasiswa/kegiatan/[slug]">): Promise<Metadata> {
  const p = await getProgram((await params).slug);
  return p ? { title: p.title, description: p.summary ?? undefined } : {};
}

export default async function ProgramDetailPage({ params }: PageProps<"/mahasiswa/kegiatan/[slug]">) {
  const p = await getProgram((await params).slug);
  if (!p) notFound();
  const parent = p.kind === "akademik" ? mahasiswaTabs[0] : mahasiswaTabs[1];
  return (
    <>
      <PageHero
        title={p.title}
        description={p.summary}
        image={p.image}
        breadcrumb={[{ label: "Mahasiswa", href: "/mahasiswa/kegiatan-akademik" }, { label: parent.label, href: parent.href }, { label: p.title }]}
      />
      <SubNav items={mahasiswaTabs} label="Navigasi kemahasiswaan" />
      <section className="py-16 lg:py-24">
        <Container className="max-w-4xl">
          <Prose html={p.body} />
        </Container>
      </section>
    </>
  );
}
