import "server-only";
import { db } from "@/lib/db/client";
import { lecturerDisplayName } from "@/lib/format";

/** Daftar dosen untuk field pilihan (pembimbing, penulis, pimpinan). */
export async function lecturerOptions() {
  const rows = await db.lecturer.findMany({
    orderBy: [{ sortOrder: "asc" }, { fullName: "asc" }],
    select: { id: true, fullName: true, frontTitle: true, backTitle: true, structuralRole: true, status: true },
  });
  return rows.map((l) => ({
    id: l.id,
    label: lecturerDisplayName(l),
    sub: [l.structuralRole, l.status === "draft" ? "draf" : null].filter(Boolean).join(" · ") || null,
  }));
}
