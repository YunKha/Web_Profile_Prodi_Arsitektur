"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/site";
import { cx } from "@/components/ui/primitives";

/** Sub-navigasi tab per seksi (FR-02): garis bawah oranye pada tab aktif. */
export function SubNav({ items, label }: { items: NavLink[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="sticky top-20 z-40 border-b border-line-warm bg-white/95 backdrop-blur-[6px]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-16">
        <ul className="-mb-px flex gap-8 overflow-x-auto [scrollbar-width:none]">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "block border-b-2 py-4 text-sm font-semibold transition-colors",
                    active ? "border-primary text-primary" : "border-transparent text-ink-soft hover:border-primary-200 hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
