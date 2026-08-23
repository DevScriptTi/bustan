import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected paths for psychologist clinical portal
  if (pathname.startsWith("/psychologist")) {
    const authSession = request.cookies.get("auth_session")?.value;
    const userRole = request.cookies.get("user_role")?.value;

    // Server-side check if explicit cookies exist and role is invalid
    if (userRole && userRole !== "psychologist" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/psychologist/:path*"],
};
