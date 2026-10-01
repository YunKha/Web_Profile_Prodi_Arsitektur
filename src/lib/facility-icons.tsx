import {
  Archive,
  Armchair,
  Box,
  Check,
  Cloud,
  Hammer,
  Lamp,
  LayoutGrid,
  Monitor,
  Presentation,
  Ruler,
  Scissors,
  Snowflake,
  Speaker,
  SquarePen,
  Table,
  User,
  Users,
  Video,
  Wifi,
  type LucideIcon,
} from "lucide-react";

/** Ikon fitur fasilitas. Kunci disimpan di kolom facility_features.icon. */
export const facilityIcons: Record<string, { icon: LucideIcon; label: string }> = {
  check: { icon: Check, label: "Centang" },
  ruler: { icon: Ruler, label: "Penggaris" },
  lamp: { icon: Lamp, label: "Lampu" },
  layout: { icon: LayoutGrid, label: "Panel / Papan" },
  archive: { icon: Archive, label: "Loker" },
  scissors: { icon: Scissors, label: "Potong / Laser" },
  box: { icon: Box, label: "Printer 3D / Kotak" },
  hammer: { icon: Hammer, label: "Workshop" },
  table: { icon: Table, label: "Meja" },
  monitor: { icon: Monitor, label: "Layar / Proyektor" },
  "pen-square": { icon: SquarePen, label: "Whiteboard" },
  speaker: { icon: Speaker, label: "Audio" },
  snowflake: { icon: Snowflake, label: "AC" },
  cloud: { icon: Cloud, label: "Udara" },
  wifi: { icon: Wifi, label: "WiFi" },
  armchair: { icon: Armchair, label: "Kursi" },
  user: { icon: User, label: "Orang" },
  users: { icon: Users, label: "Kapasitas" },
  presentation: { icon: Presentation, label: "Presentasi" },
  video: { icon: Video, label: "CCTV / Kamera" },
};

export function FacilityIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  const Icon = facilityIcons[name ?? ""]?.icon ?? Check;
  return <Icon className={className} aria-hidden />;
}
