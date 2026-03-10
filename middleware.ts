import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // Temporarily disable password change redirect to fix the loop
  // The password change will be handled client-side only
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
