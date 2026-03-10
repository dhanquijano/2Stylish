import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { users, passwordResetTokens } from "@/database/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email (case-insensitive)
    const user = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${email})`)
      .limit(1);

    // Always return success even if user doesn't exist (security best practice)
    if (user.length === 0) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, a reset link has been sent.",
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await db.insert(passwordResetTokens).values({
      userId: user[0].id,
      token,
      expiresAt,
    });

    // Create reset link with proper URL handling for Vercel
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetLink, user[0].fullName);

    if (!emailSent) {
      console.warn('Failed to send password reset email, but token was created');
      // Still return success to user (don't reveal if email exists)
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, a reset link has been sent.",
      // Remove this in production - only for development
      ...(process.env.NODE_ENV === "development" && { resetLink }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}
