"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function PasswordChangeGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check if still loading or not authenticated
    if (status === "loading" || status === "unauthenticated") {
      return;
    }

    // Skip check if already on change-password page or auth pages
    if (
      pathname === "/change-password" ||
      pathname === "/sign-in" ||
      pathname === "/sign-up" ||
      pathname === "/forgot-password" ||
      pathname?.startsWith("/reset-password")
    ) {
      return;
    }

    // Check if user needs to change password
    if (session?.user?.requirePasswordChange) {
      router.push("/change-password");
    }
  }, [session, status, pathname, router]);

  return <>{children}</>;
}
