import React, { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  // Redirect to sign-in if not authenticated
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return <>{children}</>;
};

export default Layout;
