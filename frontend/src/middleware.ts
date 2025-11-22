import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("bai_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Exclude static assets and internal Next.js routes from checks
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // Images, favicon, etc.
  ) {
    return NextResponse.next();
  }

  // 2. Define Paths
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isPublicRoot = pathname === "/";
  // If it's not public root and not auth page, assume it requires protection
  const isProtectedRoute = !isPublicRoot && !isAuthPage;

  // 3. Redirect Logic

  // CASE A: User is NOT logged in
  if (!token) {
    // If trying to access protected route -> Login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Otherwise (Landing, Login, Register) -> Allow
    return NextResponse.next();
  }

  // CASE B: User IS logged in
  // If trying to access Login/Register -> Go to Dashboard
  if (isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  // IMPORTANT: If they are at root '/', allow them to see the Landing Page?
  // OR redirect to Dashboard?
  // DECISION: Let's allow logged-in users to see the Landing Page at '/',
  // but give them a button to "Go to Dashboard".
  // So, we simply allow next() for root.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};