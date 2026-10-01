import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "abala_session";

/**
 * Pemeriksaan optimistis: tanpa cookie sesi, /admin dialihkan ke halaman login.
 * Validasi sesi sebenarnya (ke database) tetap dilakukan di setiap halaman dan
 * Server Action admin lewat requireUser().
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = new URL("/admin/login", request.url);
    if (pathname !== "/admin") url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
