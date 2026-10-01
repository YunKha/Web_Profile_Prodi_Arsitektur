import type { Metadata } from "next";
import { LegalPage } from "../_legal";

export const metadata: Metadata = { title: "Kebijakan Privasi" };

export default function KebijakanPrivasiPage() {
  return <LegalPage pageKey="kebijakan-privasi" fallbackTitle="Kebijakan Privasi" />;
}
