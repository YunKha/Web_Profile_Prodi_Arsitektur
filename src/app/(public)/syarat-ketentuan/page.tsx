import type { Metadata } from "next";
import { LegalPage } from "../_legal";

export const metadata: Metadata = { title: "Syarat & Ketentuan" };

export default function SyaratKetentuanPage() {
  return <LegalPage pageKey="syarat-ketentuan" fallbackTitle="Syarat & Ketentuan" />;
}
