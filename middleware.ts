import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigin = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || "*";

  // Handle API CORS preflight & response headers
  if (req.nextUrl.pathname.startsWith("/api")) {
    if (req.method === "OPTIONS") {
      const preflightHeaders = {
        "Access-Control-Allow-Origin": allowedOrigin === "*" && origin ? origin : allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true"
      };
      return new NextResponse(null, { status: 204, headers: preflightHeaders });
    }

    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", allowedOrigin === "*" && origin ? origin : allowedOrigin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    return res;
  }

  if (req.nextUrl.pathname.startsWith("/admin")) {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/account";
      url.searchParams.set("redirect", "/admin");
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"]
};
