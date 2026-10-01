import { audit } from "@/lib/audit";
import { destroySession, getSessionUser } from "@/lib/auth/session";

/**
 * Keluar lewat POST formulir biasa (bukan Server Action) agar browser melakukan
 * navigasi penuh: halaman admin yang disimpan tersembunyi di memori klien
 * (React <Activity>) ikut terbuang, sehingga data tidak tertinggal di DOM.
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return new Response("Asal permintaan tidak valid.", { status: 403 });
  }
  const user = await getSessionUser();
  await destroySession();
  if (user) await audit(user, "logout", "user", user.id);
  return new Response(null, { status: 303, headers: { Location: "/admin/login", "Cache-Control": "no-store" } });
}
