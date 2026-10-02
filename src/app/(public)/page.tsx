import Image from "next/image";
import { NewsCard, ShowcaseCard, Avatar } from "@/components/cards";
import { MediaImage } from "@/components/ui/media-image";
import { Container, LinkButton, SectionHeading, cx } from "@/components/ui/primitives";
import { formatCompact, lecturerDisplayName } from "@/lib/format";
import { getPageBlocks, getSettings, getStats } from "@/lib/queries/common";
import { listFeaturedAchievements, listHomePartners, listLatestNews } from "@/lib/queries/content";
import { getLecturersByIds } from "@/lib/queries/people";
import { siteFullName, siteUrl, mediaUrl } from "@/lib/site";

export default async function HomePage() {
  const [blocks, settings, stats, news, achievements, partners] = await Promise.all([
    getPageBlocks("beranda"),
    getSettings(),
    getStats(),
    listLatestNews(3),
    listFeaturedAchievements(3),
    listHomePartners(),
  ]);
  const { home } = settings;
  const [leaderList, management] = await Promise.all([
    getLecturersByIds(home.leaderLecturerId ? [home.leaderLecturerId] : []),
    getLecturersByIds(home.managementIds),
  ]);
  const leader = leaderList[0];
  const hero = blocks.hero;
  const cta = blocks.cta;

  const statCards = [
    { icon: "/images/icons/stat-students.svg", w: 56, h: 50, value: `${stats.studentCount}+`, label: "Mahasiswa Aktif" },
    { icon: "/images/icons/stat-lecturers.svg", w: 54, h: 56, value: String(stats.lecturerCount), label: "Dosen Profesional" },
    { icon: "/images/icons/stat-alumni.svg", w: 52, h: 54, value: formatCompact(stats.alumniCount).toLowerCase(), label: "Alumni" },
    { icon: "/images/icons/stat-accreditation.svg", w: 54, h: 59, value: stats.accreditationRank, label: "Akreditasi BAN-PT" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: siteFullName,
    url: siteUrl,
    logo: new URL("/images/logo-untad.png", siteUrl).toString(),
    email: settings.contact.email,
    telephone: settings.contact.phone,
    address: { "@type": "PostalAddress", streetAddress: settings.contact.address.replace(/\n/g, ", "), addressCountry: "ID" },
    foundingDate: String(stats.foundedYear),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative isolate">
        <div className="relative flex min-h-[600px] items-center overflow-hidden lg:h-[640px]">
          <MediaImage media={hero?.image} preload sizes="100vw" className="-z-20" />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--color-primary)_0%,rgb(107_63_18/0.6)_40%,rgb(107_63_18/0)_100%)]"
          />
          <Container className="pb-32 pt-16 lg:pb-24 flex justify-center">
            <div className="flex max-w-4xl flex-col items-center text-center gap-5">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary-200">{home.heroEyebrow}</p>
              <h1 className="font-serif text-6xl font-bold tracking-tight text-center text-white drop-shadow-sm">
                {hero?.title ?? "Membangun Generasi Arsitek yang Kreatif & Berkelanjutan"}
              </h1>
              {hero?.body ? <p className="max-w-2xl pt-3 text-lg font-medium leading-7 text-grey-100 sm:text-xl">{hero.body}</p> : null}
              <div className="flex flex-wrap justify-center gap-5 pt-7">
                <LinkButton href="/profil" className="px-10 py-[18px] text-sm">
                  Profil Prodi
                </LinkButton>
                <LinkButton href="#kontak" variant="ghostLight" className="px-10 py-4 text-sm">
                  Hubungi Kami
                </LinkButton>
              </div>
            </div>
          </Container>
        </div>

        {/* Statistik menimpa tepi bawah hero */}
        <Container className="relative z-10 -mt-24 lg:-mt-16">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {statCards.map((s) => (
              <li key={s.label} className="flex flex-col items-start gap-3 rounded-2xl border border-line-warm bg-white p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:gap-5 sm:p-6 lg:p-8">
                <Image src={s.icon} alt="" width={s.w} height={s.h} className="h-11 w-auto shrink-0 sm:h-auto" />
                <div className="flex flex-col gap-1">
                  <p className="font-display text-2xl font-black leading-none text-[#222] sm:text-3xl">{s.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-muted">{s.label}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Warta Arsitektur */}
      <section className="bg-background pb-24 pt-20 lg:pt-28" aria-labelledby="warta">
        <Container className="flex flex-col gap-12 lg:gap-16">
          <SectionHeading
            title={<span id="warta">Warta Arsitektur</span>}
            description="Ikuti kabar terbaru, inovasi, dan perkembangan penelitian terkini dari civitas akademika Jurusan Arsitektur Universitas Tadulako."
            action={
              <LinkButton href="/berita" variant="outline" className="self-start md:self-auto">
                Lihat Semua Berita
              </LinkButton>
            }
          />
          {news.length ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
              {news.map((n) => (
                <NewsCard key={n.slug} news={n} />
              ))}
            </div>
          ) : (
            <p className="text-muted">Belum ada berita terbit.</p>
          )}
        </Container>
      </section>

      {/* Profil Pimpinan */}
      {leader || management.length ? (
        <section className="relative overflow-hidden bg-background py-24" aria-labelledby="pimpinan">
          <div aria-hidden className="absolute inset-0 bg-[url(/images/grid-pattern.svg)] bg-cover bg-top" />
          <Container className="relative flex flex-col gap-16 lg:gap-20">
            <SectionHeading
              align="center"
              title={<span id="pimpinan">Profil Pimpinan</span>}
              description="Berkomitmen memajukan pendidikan arsitektur di Indonesia Timur melalui inovasi berkelanjutan."
            />
            {leader ? (
              <div className="grid items-center gap-16 lg:grid-cols-[453fr_635fr] lg:gap-16">
                <div className="relative mx-auto w-full max-w-md">
                  <div aria-hidden className="absolute -inset-6 -rotate-6 rounded-3xl bg-[rgb(231_225_216/0.5)] sm:-inset-10" />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-8 border-background shadow-[0_25px_50px_0_rgb(0_0_0/0.25)]">
                    <MediaImage media={leader.photo} alt={lecturerDisplayName(leader)} sizes="(min-width: 1024px) 450px, 90vw" />
                  </div>
                </div>
                <figure className="flex flex-col gap-8">
                  <blockquote className="text-2xl font-medium italic leading-[1.2] text-ink sm:text-[30px]">
                    &ldquo;{home.leaderQuote}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center gap-6 pt-8">
                    <span className="h-16 w-1.5 rounded-full bg-primary" aria-hidden />
                    <span className="flex flex-col gap-2">
                      <a href={`/profil/dosen-staf/${leader.slug}`} className="font-display text-2xl font-black tracking-[-0.025em] text-ink hover:text-primary sm:text-3xl">
                        {lecturerDisplayName(leader)}
                      </a>
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-soft">{home.leaderTitle}</span>
                    </span>
                  </figcaption>
                </figure>
              </div>
            ) : null}
            {management.length ? (
              <ul className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {management.map((m) => (
                  <li key={m.slug}>
                    <a
                      href={`/profil/dosen-staf/${m.slug}`}
                      className="flex h-full flex-col items-center gap-1 rounded-2xl border border-line bg-background p-8 text-center transition hover:border-primary-200 hover:bg-white"
                    >
                      <span className="rounded-full border-4 border-line shadow-[var(--shadow-soft)]">
                        <Avatar media={m.photo} name={m.fullName} size={88} />
                      </span>
                      <span className="pt-4 font-display text-sm font-bold text-ink">{lecturerDisplayName(m)}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.1em] text-ink-soft">{m.structuralRole}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Container>
        </section>
      ) : null}

      {/* Galeri Karya & Prestasi */}
      {achievements.length ? (
        <section className="bg-background pb-28 pt-24" aria-labelledby="galeri">
          <Container className="flex flex-col gap-16 lg:gap-20">
            <SectionHeading
              align="center"
              title={<span id="galeri">Galeri Karya &amp; Prestasi</span>}
              description="Rekaman jejak kreativitas mahasiswa dan pencapaian akademik terbaik dalam merespons tantangan desain kontemporer."
            />
            <div className="grid gap-8 md:grid-cols-3 lg:gap-10">
              {achievements.map((a, i) => (
                <ShowcaseCard key={a.slug} item={a} highlight={i === 1} />
              ))}
            </div>
            <div className="flex justify-center">
              <LinkButton href="/mahasiswa/prestasi" variant="outline">
                Lihat Semua Prestasi
              </LinkButton>
            </div>
          </Container>
        </section>
      ) : null}

      {/* Visi & masa depan */}
      <section className="relative isolate flex min-h-[560px] items-center overflow-hidden py-28 lg:min-h-[660px]" aria-labelledby="visi-cta">
        <MediaImage media={cta?.image} sizes="100vw" className="-z-20" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[rgb(175_100_14/0.4)] backdrop-blur-[1px]" />
        <Container className="flex flex-col items-center gap-6 text-center">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-[#ecdece]">Visi &amp; Masa Depan</p>
          <h2 id="visi-cta" className="max-w-4xl font-display text-4xl font-black leading-[1] text-background sm:text-5xl lg:text-6xl">
            {cta?.title ?? "Membangun Solusi Digital untuk Masa Depan yang Terhubung."}
          </h2>
          {cta?.body ? <p className="max-w-2xl text-lg font-medium leading-7 text-background sm:text-xl">{cta.body}</p> : null}
          <LinkButton href="/profil#visi-misi" variant="light" className="mt-6 rounded-sm px-12 py-5 text-base">
            Lihat Visi dan Misi
          </LinkButton>
        </Container>
      </section>

      {/* Mitra */}
      {partners.length ? (
        <section className="border-b border-background bg-background py-20" aria-labelledby="mitra">
          <Container className="flex flex-col gap-14">
            <h2 id="mitra" className="text-center font-display text-[15px] font-black uppercase tracking-[0.22em] text-ink">
              Didukung &amp; Bekerjasama Dengan
            </h2>
            <ul className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 lg:gap-x-20">
              {partners.map((p) => {
                const logo = mediaUrl(p.logo?.path);
                return logo ? (
                  <li key={p.id}>
                    <a
                      href={p.url ?? "/kerja-sama"}
                      {...(p.url ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={cx("block opacity-40 grayscale transition hover:opacity-100 hover:grayscale-0")}
                      title={p.partnerName}
                    >
                      <Image src={logo} alt={p.partnerName} width={64} height={64} className="size-16 object-contain" />
                    </a>
                  </li>
                ) : null;
              })}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
