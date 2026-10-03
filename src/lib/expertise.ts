/** Kelompok bidang keahlian dosen (enum ExpertiseGroup di database). */
export const expertiseGroups = [
  { value: "perancangan", label: "Perancangan Arsitektur" },
  { value: "teori_sejarah", label: "Teori dan Sejarah" },
  { value: "sains_bangunan", label: "Sains dan Bangunan" },
] as const;

export type ExpertiseGroupValue = (typeof expertiseGroups)[number]["value"];

export function expertiseLabel(value: string | null | undefined): string | null {
  return expertiseGroups.find((g) => g.value === value)?.label ?? null;
}

export function isExpertiseGroup(value: string): value is ExpertiseGroupValue {
  return expertiseGroups.some((g) => g.value === value);
}
