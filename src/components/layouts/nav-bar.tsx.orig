"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import type { NavItem } from "@/lib/site";
import { cx } from "@/components/ui/primitives";

function isActive(pathname: string, match: string) {
  return pathname === match || pathname.startsWith(`${match}/`);
}

export function NavBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Tutup menu mobile setiap kali halaman berganti.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setExpanded(null);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e5e5] bg-white/95 shadow-[0_1px_2px_0_rgb(0_0_0/0.05)] backdrop-blur-[6px]">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-8 lg:px-16">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Beranda Arsitektur UNTAD">
          <Image src="/images/logo-untad.png" alt="" width={34} height={34} className="size-[34px] object-contain" preload />
          <span className="font-display text-xl font-bold text-ink sm:text-2xl">S1 ARSITEKTUR UNTAD</span>
        </Link>

        <nav aria-label="Menu utama" className="hidden xl:block">
          <ul className="flex items-center gap-5">
            {items.map((item) => {
              const active = isActive(pathname, item.match);
              return (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "relative flex items-center gap-1 whitespace-nowrap py-7 text-sm font-semibold uppercase tracking-[0.05em] transition-colors",
                      active ? "text-primary" : "text-ink-soft hover:text-primary",
                    )}
                  >
                    {item.label}
                    <span
                      className={cx(
                        "absolute inset-x-0 bottom-5 h-0.5 bg-primary transition-transform",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                      )}
                    />
                  </Link>
                  {item.children ? (
                    <div className="invisible absolute left-1/2 top-full z-10 w-60 -translate-x-1/2 translate-y-1 pt-1 opacity-0 transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <ul className="overflow-hidden rounded-2xl border border-line-warm bg-white p-2 shadow-[0_20px_40px_-12px_rgb(0_0_0/0.2)]">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={cx(
                                  "block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                                  childActive ? "bg-primary-100 text-primary-500" : "text-ink-soft hover:bg-background hover:text-primary",
                                )}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-background xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Menu utama"
          className="fixed inset-x-0 bottom-0 top-20 overflow-y-auto border-t border-line bg-white px-4 pb-10 pt-4 sm:px-8 xl:hidden"
        >
          <ul className="flex flex-col">
            {items.map((item) => {
              const active = isActive(pathname, item.match);
              const isOpen = expanded === item.href;
              return (
                <li key={item.href} className="border-b border-line">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      className={cx("flex-1 py-4 text-sm font-semibold uppercase tracking-[0.05em]", active ? "text-primary" : "text-ink")}
                    >
                      {item.label}
                    </Link>
                    {item.children ? (
                      <button
                        type="button"
                        className="inline-flex size-11 items-center justify-center text-ink-soft"
                        aria-expanded={isOpen}
                        aria-label={`Submenu ${item.label}`}
                        onClick={() => setExpanded(isOpen ? null : item.href)}
                      >
                        <ChevronDown className={cx("size-5 transition-transform", isOpen && "rotate-180")} />
                      </button>
                    ) : null}
                  </div>
                  {item.children && isOpen ? (
                    <ul className="flex flex-col pb-3 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cx("block py-2.5 text-sm", pathname === child.href ? "font-semibold text-primary" : "text-ink-soft")}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
