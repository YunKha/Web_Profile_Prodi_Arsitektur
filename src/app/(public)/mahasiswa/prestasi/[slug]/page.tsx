import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, Building, Calendar, Info, Lightbulb, MapPin, Trophy } from "lucide-react";
import { Avatar, levelLabel } from "@/components/cards";
import { PageHero } from "@/components/layouts/page-hero";
import { MediaImage } from "@/components/ui/media-image";
import { Container, LinkButton, Paragraphs } from "@/components/ui/primitives";
import { formatDate, lecturerDisplayName } from "@/lib/format";
import { getAchievement, getAchievementSlugs } from "@/lib/queries/content";
import { mediaUrl } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getAchievementSlugs();
  return (slugs.length ? slugs : ["__placeholder__"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/mahasiswa/prestasi/[slug]">): Promise<Metadata> {
  const a = await getAchievement((await params).slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.summary ?? `${a.studentName} — ${a.title}`,
    openGraph: a.cover ? { images: [mediaUrl(a.cover.path) as string] } : undefined,
  };
}

export default async function PrestasiDetailPage({ params }: PageProps<"/mahasiswa/prestasi/[slug]">) {
  const a = await getAchievement((await params).slug);
  if (!a) notFound();

  const meta = [
    a.eventDate ? { icon: Calendar, text: formatDate(a.eventDate) } : { icon: Calendar, text: String(a.achievementYear) },
    { icon: Trophy, text: levelLabel[a.level] },
    a.organizer ? { icon: Building, text: a.organizer } : null,
    a.eventLocation ? { icon: MapPin, text: a.eventLocation } : null,
  ].filter((m) => m != null);

  const info = [
    { label: "Penyelenggara", value: a.organizer },
    { label: "Tingkat", value: levelLabel[a.level] },
    { label: "Waktu & Lokasi", value: [a.eventDate ? formatDate(a.eventDate) : String(a.achievementYear), a.eventLocation].filter(Boolean).join(" · ") },
    { label: "Kategori", value: a.category },
  ].filter((i) => i.value);

  const advisors = a.advisors.map((x) => x.lecturer).filter((l) => l.status === "published");

  return (
    <>
      <PageHero
        size="lg"
        title={a.title}
        image={a.cover}
        breadcrumb={[{ label: "Mahasiswa", href: "/mahasiswa/kegiatan-akademik" }, { label: "Prestasi Mahasiswa", href: "/mahasiswa/prestasi" }, { label: a.studentName }]}
      >
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-sm font-medium text-white/90">
          {meta.map((m, i) => (
            <li key={i} className="flex items-center gap-2">
              <m.icon className="size-4 text-primary-200" aria-hidden />
              {m.text}
            </li>
          ))}
        </ul>
      </PageHero>

      {/* Prestasi utama */}
      <section className="py-20 lg:py-28">
        <Container className="grid items-center gap-14 lg:grid-cols-[564fr_466fr] lg:gap-[122px]">
          <div className="flex flex-col gap-6">
            {a.rankLabel ? (
              <span className="w-fit rounded-full border border-primary-200 bg-primary-100 px-4 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-primary-500">
                {a.rankLabel}
              </span>
            ) : null}
            <h2 className="font-display text-4xl font-black text-ink sm:text-5xl">{a.studentName}</h2>
            <dl className="flex flex-col gap-1 text-lg text-ink-soft">
              {a.nim ? (
                <div className="flex gap-2">
                  <dt>NIM:</dt>
                  <dd className="font-semibold text-ink">{a.nim}</dd>
                </div>
              ) : null}
              {a.cohortYear ? (
                <div className="flex gap-2">
                  <dt>Angkatan:</dt>
                  <dd className="font-semibold text-ink">{a.cohortYear}</dd>
                </div>
              ) : null}
              <div className="flex gap-2">
                <dt>Tahun Prestasi:</dt>
                <dd className="font-semibold text-ink">{a.achievementYear}</dd>
              </div>
            </dl>
            <Paragraphs text={a.summary} className="text-base leading-8 text-ink-soft sm:text-lg" />
          </div>
          <div className="relative mx-auto w-full max-w-[466px]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-line-warm shadow-[0_25px_50px_-12px_rgb(0_0_0/0.25)]">
              <MediaImage media={a.studentPhoto ?? a.cover} alt={a.studentName} sizes="(min-width: 1024px) 466px, 90vw" />
            </div>
            <span className="absolute -bottom-8 -left-8 flex size-28 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_20px_40px_-10px_rgb(175_100_14/0.6)] sm:size-32">
              <Award className="size-10" aria-hidden />
            </span>
          </div>
        </Container>
      </section>

      {/* Tentang kompetisi + sidebar */}
      {a.competitionInfo || info.length || advisors.length ? (
        <section className="bg-white py-20 lg:py-24">
          <Container className="grid items-start gap-8 lg:grid-cols-[760fr_368fr]">
            <article className="rounded-2xl border border-line-warm bg-background p-8 sm:p-10">
              <h3 className="flex items-center gap-3 font-display text-2xl font-black text-ink sm:text-3xl">
                <Info className="size-5 text-primary" aria-hidden />
                Tentang Kompetisi
              </h3>
              <Paragraphs text={a.competitionInfo ?? a.body} className="mt-6 text-base leading-8 text-ink-soft" />
            </article>
            <aside className="flex flex-col gap-6">
              {info.length ? (
                <div className="rounded-2xl border border-line-warm bg-white p-6 shadow-[var(--shadow-card)]">
                  <h4 className="font-display text-xl font-bold text-ink">Informasi Kompetisi</h4>
                  <dl className="mt-5 flex flex-col gap-4">
                    {info.map((i) => (
                      <div key={i.label} className="border-l-2 border-primary-200 pl-4">
                        <dt className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{i.label}</dt>
                        <dd className="mt-1 font-semibold text-ink">{i.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
              {advisors.length ? (
                <div className="rounded-2xl border border-line-warm bg-white p-6 shadow-[var(--shadow-card)]">
                  <h4 className="font-display text-xl font-bold text-ink">Dosen Pembimbing</h4>
                  <ul className="mt-5 flex flex-col gap-5">
                    {advisors.map((l) => (
                      <li key={l.slug} className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar media={l.photo} name={l.fullName} size={64} />
                          <div>
                            <p className="font-display font-bold leading-snug text-ink">{lecturerDisplayName(l)}</p>
                            {l.structuralRole ? <p className="text-xs text-muted">{l.structuralRole}</p> : null}
                          </div>
                        </div>
                        <Link
                          href={`/profil/dosen-staf/${l.slug}`}
                          className="rounded-full border border-line-warm py-2 text-center text-xs font-bold uppercase tracking-[0.1em] text-primary hover:border-primary"
                        >
                          Lihat Profil
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </Container>
        </section>
      ) : null}

      {/* Karya yang dilombakan */}
      {a.images.length || a.concept ? (
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div aria-hidden className="absolute -left-20 top-10 size-64 rounded-full bg-primary-100/60 blur-3xl" />
          <Container className="relative flex flex-col gap-12">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
              <p className="eyebrow text-primary">Karya yang Dilombakan</p>
              <h2 className="font-display text-3xl font-black text-ink sm:text-5xl">{a.workTitle ?? a.title}</h2>
            </div>
            {a.images.length ? (
              <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-2">
                {a.images.map((img) => (
                  <figure key={img.id} className="rounded-2xl border border-line-warm bg-white p-2 shadow-[var(--shadow-card)]">
                    <div className="relative aspect-video overflow-hidden rounded-xl">
                      <MediaImage media={img.media} sizes="(min-width: 768px) 500px, 90vw" />
                    </div>
                    {img.caption ? <figcaption className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted">{img.caption}</figcaption> : null}
                  </figure>
                ))}
              </div>
            ) : null}
            {a.concept ? (
              <div className="mx-auto w-full max-w-5xl rounded-2xl border border-line-warm bg-white p-8 shadow-[var(--shadow-card)] sm:p-10">
                <h3 className="flex items-center gap-3 font-display text-2xl font-bold text-ink">
                  <Lightbulb className="size-5 text-primary" aria-hidden />
                  Konsep Desain
                </h3>
                <Paragraphs text={a.concept} className="mt-4 text-base leading-8 text-ink-soft" />
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      <section className="bg-zinc-900 py-20 text-white lg:py-24">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-3xl font-display text-3xl font-black sm:text-5xl">Jelajahi Prestasi Lainnya</h2>
          <p className="max-w-2xl text-lg text-white/90">
            Lihat bagaimana mahasiswa Arsitektur UNTAD terus berinovasi dan mengukir prestasi di berbagai ajang nasional maupun internasional.
          </p>
          <LinkButton href="/mahasiswa/prestasi" variant="light" className="mt-2">
            Semua Prestasi
          </LinkButton>
        </Container>
      </section>
    </>
  );
}
