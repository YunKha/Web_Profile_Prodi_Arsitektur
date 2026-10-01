import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel Admin", template: "%s · Admin Arsitektur UNTAD" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-full flex-1 flex-col bg-[#f5f5f4]">{children}</div>;
}
