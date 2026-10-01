import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Arsitektur UNTAD — Program Studi Arsitektur Universitas Tadulako",
    template: "%s | Arsitektur UNTAD",
  },
  description:
    "Website resmi Program Studi Arsitektur Universitas Tadulako: profil, akreditasi, dosen, fasilitas, akademik, penelitian, pengabdian, dan berita.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Arsitektur UNTAD",
  },
  icons: { icon: "/images/logo-untad.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${hanken.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
