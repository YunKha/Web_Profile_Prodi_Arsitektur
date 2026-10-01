import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Award, BookOpen, Briefcase, Clock, GraduationCap, IdCard } from "lucide-react";
import { Breadcrumb } from "@/components/layouts/breadcrumb";
import { SubNav } from "@/components/layouts/sub-nav";
import { MediaImage } from "@/components/ui/media-image";
import { Container, Paragraphs } from "@/components/ui/primitives";
import { lecturerDisplayName } from "@/lib/format";
import { currentYear } from "@/lib/queries/common";
import { getLecturer, getLecturerSlugs } from "@/lib/queries/people";
import { profilTabs, siteUrl, mediaUrl } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getLecturerSlugs();
  return (slugs.length ? slugs : ["__placeholder__"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/profil/dosen-staf/[slug]">): Promise<Metadata> {
  const l = await getLecturer((await params).slug);
  if (!l) return {};
  const name = lecturerDisplayName(l);
  return {
    title: name,
    description: `${name}${l.structuralRole ? ` — ${l.structuralRole}` : ""}. Bidang keahlian: ${l.expertise ?? "Arsitektur"}.`,
    openGraph: l.photo ? { images: [mediaUrl(l.photo.path) as string] } : undefined,
  };
}

export default async function DosenDetailPage({ params }: PageProps<"/profil/dosen-staf/[slug]">) {
  const { slug } = await params;
  const [l, year] = await Promise.all([getLecturer(slug), currentYear()]);
  if (!l) notFound();

  const name = lecturerDisplayName(l);
  const tenure = l.startYear ? `${Math.max(0, year - l.startYear)} Tahun` : "—";
  const summary = [
    { icon: Award, label: "Jabatan Akademik", value: l.academicRank },
    { icon: Briefcase, label: "Pangkat / Golongan", value: l.civilRank },
    { icon: GraduationCap, label: "Program Studi", value: l.studyProgram },
    { icon: Clock, label: "Masa Kerja", value: tenure },
  ];
  const identity: [string, string | null, string | null][] = [
    ["Email", l.email, l.email ? `mailto:${l.email}` : null],
    ["NIDN", l.nidn, null],
    ["NUPTK", l.nuptk, null],
    ["SINTA ID", l.sintaId, l.sintaUrl],
    ["Scopus ID", l.scopusId, l.scopusId ? `https://www.scopus.com/authid/detail.uri?authorId=${l.scopusId}` : null],
    ["ORCID ID", l.orcidId, l.orcidId ? `https://orcid.org/${l.orcidId}` : null],
  ];
  const links = [
    { label: "SINTA Kemdikbud", tag: "SINTA", href: l.sintaUrl },
    { label: "Google Scholar", tag: "Scholar", href: l.scholarUrl },
    { label: "ORCID", tag: "iD", href: l.orcidId ? `https://orcid.org/${l.orcidId}` : null },
    { label: "Situs Web", tag: "Web", href: l.websiteUrl },
  ].filter((x) => x.href);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: l.structuralRole ?? l.academicRank ?? undefined,
    email: l.email ?? undefined,
    image: l.photo ? new URL(mediaUrl(l.photo.path) as string, siteUrl).toString() : undefined,
    affiliation: { "@type": "CollegeOrUniversity", name: "Universitas Tadulako" },
    sameAs: links.map((x) => x.href),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SubNav items={profilTabs} label="Navigasi profil" />
      <Container className="flex flex-col gap-12 py-14 lg:py-20">
        <header className="flex flex-col gap-5">
          <Breadcrumb items={[{ label: "Profil", href: "/profil" }, { label: "Dosen & Staf", href: "/profil/dosen-staf" }, { label: l.fullName }]} />
          <h1 className="font-display text-4xl font-black text-ink sm:text-6xl">Profil Dosen</h1>
          <p className="max-w-3xl text-lg text-ink-soft">Informasi akademik, identitas peneliti, dan riwayat pendidikan.</p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[368fr_760fr]">
          <div className="flex flex-col gap-8 lg:sticky lg:top-40">
            <article className="flex flex-col items-center gap-4 rounded-2xl border border-line-warm bg-white p-8 text-center shadow-[var(--shadow-card)]">
              <h2 className="font-display text-2xl font-black leading-tight text-ink">{name}</h2>
              {l.structuralRole ? <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{l.structuralRole}</p> : null}
              <div className="relative mt-2 size-48 overflow-hidden rounded-full border-4 border-white shadow-[0_0_0_4px_var(--primary-100),var(--shadow-soft)]">
                <MediaImage media={l.photo} alt={name} sizes="192px" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf3] px-3 py-1 text-xs font-bold text-[#067647]">
                <span className="size-2 rounded-full bg-[#17b26a]" aria-hidden />
                {l.isActive ? "Aktif" : "Tidak aktif"}
              </span>
            </article>

            <article className="rounded-2xl border border-line-warm bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
              <header className="flex items-center justify-between border-b border-line-warm pb-4">
                <h3 className="font-display text-lg font-bold text-ink">Identitas Akademik</h3>
                <IdCard className="size-5 text-primary" aria-hidden />
              </header>
              <dl className="divide-y divide-line">
                {identity.map(([label, value, href]) => (
                  <div key={label} className="grid grid-cols-[106px_1fr] gap-3 py-3 text-sm">
                    <dt className="font-semibold text-muted">{label}</dt>
                    <dd className="min-w-0 break-words font-medium text-ink">
                      {value ? (
                        href ? (
                          <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="inline-flex items-center gap-1 hover:text-primary">
                            {value}
                            {href.startsWith("http") ? <ArrowUpRight className="size-3" aria-hidden /> : null}
                          </a>
                        ) : (
                          value
                        )
                      ) : (
                        <span className="text-grey-300">—</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>

          <div className="flex flex-col gap-8">
            <section aria-label="Ringkasan akademik" className="grid gap-4 sm:grid-cols-2">
              {summary.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col gap-3 rounded-2xl border border-line-warm bg-white p-6 shadow-[var(--shadow-card)]">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary-100 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{label}</p>
                  <p className="font-display text-xl font-bold text-ink">{value || "—"}</p>
                </div>
              ))}
            </section>

            {links.length ? (
              <ul className="flex flex-wrap gap-3">
                {links.map((x) => (
                  <li key={x.label}>
                    <a
                      href={x.href as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 rounded-full border border-line-warm bg-white py-2 pl-2 pr-5 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
                    >
                      <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-black text-primary-500">{x.tag}</span>
                      {x.label}
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}

            {l.bio ? (
              <section className="rounded-2xl border border-line-warm bg-white p-6 sm:p-8">
                <h3 className="font-display text-xl font-bold text-ink">Tentang</h3>
                <Paragraphs text={l.bio} className="mt-4 text-[15px] leading-7 text-ink-soft" />
              </section>
            ) : null}

            <section className="rounded-2xl border border-line-warm bg-white p-6 sm:p-8" aria-labelledby="pendidikan">
              <h3 id="pendidikan" className="flex items-center gap-3 font-display text-2xl font-bold text-ink">
                <GraduationCap className="size-6 text-primary" aria-hidden />
                Riwayat Pendidikan
              </h3>
              {l.education.length ? (
                <ol className="mt-8 flex flex-col">
                  {l.education.map((e, i) => (
                    <li key={e.id} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <span className={`flex size-12 shrink-0 items-center justify-center rounded-full font-display text-sm font-black ${i === 0 ? "bg-primary text-white shadow-md" : "border-2 border-primary-200 bg-white text-primary"}`}>
                          {e.degree}
                        </span>
                        {i < l.education.length - 1 ? <span className="my-2 w-px flex-1 bg-line-warm" aria-hidden /> : null}
                      </div>
                      <div className="flex flex-col gap-1 pb-8">
                        <h4 className="font-display text-lg font-bold text-ink">{e.major}</h4>
                        <p className="text-base text-ink-soft">{e.institution}</p>
                        <span className="mt-1 w-fit rounded-full bg-background px-3 py-1 text-xs font-bold text-muted">Lulus {e.gradYear}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-sm text-muted">Riwayat pendidikan belum diisi.</p>
              )}
            </section>

            {l.research.length ? (
              <section className="rounded-2xl border border-line-warm bg-white p-6 sm:p-8" aria-labelledby="riset">
                <h3 id="riset" className="flex items-center gap-3 font-display text-2xl font-bold text-ink">
                  <BookOpen className="size-6 text-primary" aria-hidden />
                  Penelitian
                </h3>
                <ul className="mt-6 divide-y divide-line">
                  {l.research.map(({ research: r }) => (
                    <li key={r.slug}>
                      <Link href={`/penelitian/${r.slug}`} className="flex items-start justify-between gap-4 py-4 hover:text-primary">
                        <span className="font-semibold">{r.title}</span>
                        <span className="shrink-0 text-sm text-muted">{r.year}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </Container>
    </>
  );
}
