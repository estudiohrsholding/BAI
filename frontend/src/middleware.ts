import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("bai_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Exclude static assets and internal Next.js routes from checks
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Images, favicon, etc.
  ) {
    return NextResponse.next();
  }

  // 2. Define Paths
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isPublicRoot = pathname === "/";

  // 3. Redirect Logic

  // CASE A: User is NOT logged in
  if (!token) {
    // If trying to access auth pages or root -> Allow
    if (isAuthPage || isPublicRoot) {
      return NextResponse.next();
    }
    // Otherwise (protected routes) -> Redirect to Login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // CASE B: User IS logged in
  // If trying to access Login/Register -> Redirect to Dashboard
  if (isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  // Allow all other routes (including root landing page)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
