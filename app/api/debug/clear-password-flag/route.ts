import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

// Emergency endpoint to clear password change requirement
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email parameter is required. Use: ?email=your@email.com" },
        { status: 400 }
      );
    }

    // Update user to not require password change
    const result = await db
      .update(users)
      .set({ requirePasswordChange: 0 })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: `No user found with email: ${email}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Password change requirement cleared for ${email}`,
      user: {
        email: result[0].email,
        fullName: result[0].fullName,
        requirePasswordChange: result[0].requirePasswordChange
      }
    });
  } catch (error) {
    console.error("Error clearing password flag:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Update user to not require password change
    await db
      .update(users)
      .set({ requirePasswordChange: 0 })
      .where(eq(users.email, email));

    return NextResponse.json({
      success: true,
      message: `Password change requirement cleared for ${email}`,
    });
  } catch (error) {
    console.error("Error clearing password flag:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear flag" },
      { status: 500 }
    );
  }
}
