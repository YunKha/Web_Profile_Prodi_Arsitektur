import { z } from "zod";
import { db } from "@/lib/db/client";

const schema = z.object({ type: z.enum(["news", "research"]), id: z.number().int().positive() });

/** Penghitung tayang. Tidak meng-invalidate cache: angka di kartu boleh tertinggal beberapa jam. */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  const { type, id } = parsed.data;
  const where = { id, status: "published" as const };
  if (type === "news") await db.news.updateMany({ where, data: { viewCount: { increment: 1 } } });
  else await db.research.updateMany({ where, data: { viewCount: { increment: 1 } } });
  return new Response(null, { status: 204 });
}
