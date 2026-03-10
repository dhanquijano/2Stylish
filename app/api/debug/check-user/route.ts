import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

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

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { success: false, error: `No user found with email: ${email}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email,
        fullName: user[0].fullName,
        role: user[0].role,
        branch: user[0].branch,
        requirePasswordChange: user[0].requirePasswordChange,
        createdAt: user[0].createdAt,
      }
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
