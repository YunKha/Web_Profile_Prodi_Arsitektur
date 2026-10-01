import { PageHero } from "@/components/layouts/page-hero";
import { Container, Paragraphs } from "@/components/ui/primitives";
import { getPageBlocks } from "@/lib/queries/common";

export async function LegalPage({ pageKey, fallbackTitle }: { pageKey: string; fallbackTitle: string }) {
  const content = (await getPageBlocks(pageKey)).content;
  return (
    <>
      <PageHero title={content?.title ?? fallbackTitle} breadcrumb={[{ label: content?.title ?? fallbackTitle }]} />
      <section className="py-16 lg:py-20">
        <Container className="max-w-3xl">
          <Paragraphs text={content?.body ?? "Konten belum tersedia."} className="text-base leading-8 text-ink-soft" />
        </Container>
      </section>
    </>
  );
}
