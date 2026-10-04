import Image from "next/image";
import Link from "next/link";
import { currentYear, getSettings } from "@/lib/queries/common";
import type { LinkSetting } from "@/lib/settings";

function FooterLink({ link }: { link: LinkSetting }) {
  const external = /^https?:\/\//.test(link.url);
  const className =
    "text-sm text-ink-soft transition-colors hover:text-primary";
  if (external) {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.url || "#"} className={className}>
      {link.label}
    </Link>
  );
}

const socialIcons = [
  {
    key: "twitter",
    label: "Twitter / X",
    icon: "/images/icons/social-twitter.svg",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: "/images/icons/social-instagram.svg",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: "/images/icons/social-youtube.svg",
  },
] as const;

export async function SiteFooter() {
  const [settings, year] = await Promise.all([getSettings(), currentYear()]);
  const { contact, social, footer } = settings;

  return (
    <footer className="mt-auto border-t-2 border-line bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-16 sm:px-8 lg:px-16 lg:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo-untad.png"
                alt=""
                width={40}
                height={40}
                className="size-10 object-contain"
              />
              <div>
                <p className="text-base font-bold uppercase tracking-[0.025em] text-ink">
                  Arsitektur
                </p>
                <p className="text-xs text-ink-soft">Universitas Tadulako</p>
              </div>
            </div>
            <p className="text-sm leading-[1.625] text-ink-soft">
              {footer.tagline}
            </p>
            <div className="flex gap-4">
              {socialIcons.map((s) =>
                social[s.key] ? (
                  <a
                    key={s.key}
                    href={social[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex size-8 items-center justify-center rounded-xl bg-surface shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <Image src={s.icon} alt="" width={16} height={16} />
                  </a>
                ) : (
                  <span
                    key={s.key}
                    className="flex size-8 items-center justify-center rounded-xl bg-surface opacity-60"
                    aria-hidden
                  >
                    <Image src={s.icon} alt="" width={16} height={16} />
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.05em] text-ink">
              Akademik
            </h2>
            <ul className="flex flex-col gap-3">
              {footer.academicLinks.map((l) => (
                <li key={l.label}>
                  <FooterLink link={l} />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.05em] text-ink">
              Fasilitas &amp; Layanan
            </h2>
            <ul className="flex flex-col gap-3">
              {footer.serviceLinks.map((l) => (
                <li key={l.label}>
                  <FooterLink link={l} />
                </li>
              ))}
            </ul>
          </div>

          <div id="kontak" className="flex scroll-mt-24 flex-col gap-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.05em] text-ink">
              Hubungi Kami
            </h2>
            <address className="flex flex-col gap-4 not-italic">
              <p className="flex gap-3 text-sm leading-6 text-ink-soft">
                <Image
                  src="/images/icons/contact-address.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="mt-0.5 size-5 shrink-0"
                />
                <span className="whitespace-pre-line">{contact.address}</span>
              </p>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 text-sm text-ink-soft hover:text-primary"
              >
                <Image
                  src="/images/icons/contact-email.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 shrink-0"
                />
                {contact.email}
              </a>
              <a
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-3 text-sm text-ink-soft hover:text-primary"
              >
                <Image
                  src="/images/icons/contact-phone.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 shrink-0"
                />
                {contact.phone}
              </a>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>{footer.copyright.replace("{year}", String(year))}</p>
          <div className="flex gap-6">
            <Link href="/kebijakan-privasi" className="hover:text-primary">
              Kebijakan Privasi
            </Link>
            <Link href="/syarat-ketentuan" className="hover:text-primary">
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
