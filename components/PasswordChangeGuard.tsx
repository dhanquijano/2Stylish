"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PasswordChangeGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Don't check if still loading
    if (status === "loading") {
      return;
    }

    // Don't check on auth pages or change-password page
    const isAuthPage = 
      pathname === "/sign-in" ||
      pathname === "/sign-up" ||
      pathname === "/forgot-password" ||
      pathname?.startsWith("/reset-password") ||
      pathname === "/change-password";

    if (isAuthPage) {
      hasRedirected.current = false; // Reset when on auth pages
      return;
    }

    // Debug logging
    console.log("[PasswordChangeGuard] Status:", status);
    console.log("[PasswordChangeGuard] Session:", session);
    console.log("[PasswordChangeGuard] RequirePasswordChange:", session?.user?.requirePasswordChange);
    console.log("[PasswordChangeGuard] Pathname:", pathname);
    console.log("[PasswordChangeGuard] HasRedirected:", hasRedirected.current);

    // Check if user needs to change password and hasn't been redirected yet
    if (
      status === "authenticated" &&
      session?.user?.requirePasswordChange === true &&
      !hasRedirected.current
    ) {
      console.log("[PasswordChangeGuard] Redirecting to /change-password");
      hasRedirected.current = true;
      window.location.href = "/change-password"; // Use full page reload instead
    }
  }, [session, status, pathname, router]);

  return <>{children}</>;
}
