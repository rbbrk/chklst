export { auth as middleware } from "@/auth";

export const config = {
  // Protect all routes except Next.js internals and static files
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
