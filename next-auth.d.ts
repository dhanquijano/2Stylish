// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      role?: string;
      branch?: string;
      requirePasswordChange?: boolean;
    };
  }

  interface User {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    branch?: string;
    requirePasswordChange?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    branch?: string;
    requirePasswordChange?: boolean;
  }
}
