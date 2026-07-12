import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/donors", "/requests", "/profile"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/donors/:path*", "/requests/:path*", "/profile/:path*"],
};