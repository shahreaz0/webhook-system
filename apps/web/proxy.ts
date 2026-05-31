import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("webhook_jwt_token")?.value;

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/signin") || pathname.startsWith("/register");
  const isProtectedRoute = pathname.startsWith("/dashboard");

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/signin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/register"],
};
