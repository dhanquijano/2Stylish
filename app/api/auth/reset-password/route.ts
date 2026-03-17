import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { users, passwordResetTokens } from "@/database/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Find valid token
    const resetToken = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, 0),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (resetToken.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, resetToken[0].userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: 1 })
      .where(eq(passwordResetTokens.id, resetToken[0].id));

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}
