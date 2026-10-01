"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Building,
  ExternalLink,
  FileText,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  ScrollText,
  Settings,
  Tag,
  Trophy,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cx } from "@/components/ui/primitives";

type Item = { href: string; label: string; icon: LucideIcon; adminOnly?: boolean };
type Group = { label: string; items: Item[] };

export const adminNav: Group[] = [
  { label: "", items: [{ href: "/admin", label: "Dasbor", icon: LayoutDashboard }] },
  {
    label: "Konten",
    items: [
      { href: "/admin/berita", label: "Berita", icon: Newspaper },
      { href: "/admin/kategori", label: "Kategori & Label", icon: Tag },
      { href: "/admin/prestasi", label: "Prestasi", icon: Trophy },
      { href: "/admin/penelitian", label: "Penelitian", icon: FlaskConical },
      { href: "/admin/pengabdian", label: "Pengabdian", icon: HeartHandshake },
    ],
  },
  {
    label: "Profil & Akademik",
    items: [
      { href: "/admin/dosen", label: "Dosen & Staf", icon: Users },
      { href: "/admin/akreditasi", label: "Akreditasi", icon: BadgeCheck },
      { href: "/admin/fasilitas", label: "Fasilitas", icon: Building },
      { href: "/admin/mata-kuliah", label: "Mata Kuliah & RPS", icon: BookOpen },
      { href: "/admin/dokumen", label: "Dokumen", icon: FileText },
    ],
  },
  {
    label: "Kemahasiswaan",
    items: [
      { href: "/admin/program", label: "Program Kegiatan", icon: Award },
      { href: "/admin/lembaga", label: "Lembaga", icon: GraduationCap },
      { href: "/admin/alumni", label: "Alumni", icon: Users },
      { href: "/admin/kerja-sama", label: "Kerja Sama", icon: Handshake },
    ],
  },
  {
    label: "Situs",
    items: [
      { href: "/admin/halaman", label: "Halaman", icon: FolderOpen },
      { href: "/admin/media", label: "Pustaka Media", icon: Images },
      { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings, adminOnly: true },
      { href: "/admin/pengguna", label: "Pengguna", icon: UserCog, adminOnly: true },
      { href: "/admin/log", label: "Log Aktivitas", icon: ScrollText, adminOnly: true },
    ],
  },
];

function NavLinks({ role, onNavigate }: { role: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Menu admin" className="flex flex-col gap-6">
      {adminNav.map((g) => {
        const items = g.items.filter((i) => !i.adminOnly || role === "admin");
        if (!items.length) return null;
        return (
          <div key={g.label || "root"} className="flex flex-col gap-1">
            {g.label ? <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">{g.label}</p> : null}
            {items.map((i) => {
              const active = i.href === "/admin" ? pathname === "/admin" : pathname === i.href || pathname.startsWith(`${i.href}/`);
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active ? "bg-primary text-white shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <i.icon className="size-4 shrink-0" aria-hidden />
                  {i.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({ user }: { user: { name: string; email: string; role: string } }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const content = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-5">
      <Link href="/admin" className="flex items-center gap-2.5 px-2">
        <Image src="/images/logo-untad.png" alt="" width={32} height={32} className="size-8 object-contain" />
        <span className="leading-tight">
          <span className="block font-display text-sm font-bold text-white">ARSITEKTUR UNTAD</span>
          <span className="block text-[11px] text-white/50">Panel Admin</span>
        </span>
      </Link>
      <NavLinks role={user.role} onNavigate={() => setOpen(false)} />
      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <ExternalLink className="size-4" aria-hidden /> Lihat website
        </a>
        <Link href="/admin/akun" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-white">{user.name.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
            <span className="block text-[11px] capitalize text-white/50">{user.role}</span>
          </span>
        </Link>
        {/* POST biasa ke route handler → navigasi penuh, state klien dibuang. */}
        <form method="post" action="/api/auth/logout">
          <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut className="size-4" aria-hidden /> Keluar
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink lg:block">{content}</aside>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-ink px-4 lg:hidden">
        <span className="font-display text-sm font-bold text-white">Admin Arsitektur UNTAD</span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Buka menu" aria-expanded={open} className="flex size-10 items-center justify-center rounded-lg text-white">
          <Menu className="size-5" />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Tutup menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-ink">
            <button type="button" onClick={() => setOpen(false)} aria-label="Tutup menu" className="absolute right-3 top-4 flex size-9 items-center justify-center rounded-lg text-white/70">
              <X className="size-5" />
            </button>
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
