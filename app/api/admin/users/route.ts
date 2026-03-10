import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendAccountCredentialsEmail } from "@/lib/email-service";
import { auth } from "@/auth";
import { hasAdminOnlyAccess } from "@/lib/admin-utils";

// GET - Fetch all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user role
    const currentUser = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!hasAdminOnlyAccess(currentUser[0]?.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all users
    const allUsers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        branch: users.branch,
        requirePasswordChange: users.requirePasswordChange,
        createdAt: users.createdAt,
        lastActivityDate: users.lastActivityDate,
      })
      .from(users);

    return NextResponse.json({
      success: true,
      data: allUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user role
    const currentUser = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!hasAdminOnlyAccess(currentUser[0]?.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { fullName, email, role, branch } = await request.json();

    // Validate required fields
    if (!fullName || !email || !role) {
      return NextResponse.json(
        { success: false, error: "Full name, email, and role are required" },
        { status: 400 }
      );
    }

    // Check if user already exists (case-insensitive)
    const existingUser = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${email})`)
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate temporary password (8 characters: letters + numbers)
    const temporaryPassword = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Hash the temporary password
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Create the user
    const newUser = await db
      .insert(users)
      .values({
        fullName,
        email: email.toLowerCase(), // Store email in lowercase
        password: hashedPassword,
        role: role as "USER" | "ADMIN" | "MANAGER" | "STAFF",
        branch: branch || null,
        requirePasswordChange: 1, // Require password change on first login
      })
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        branch: users.branch,
      });

    // Send account credentials email
    const emailSent = await sendAccountCredentialsEmail(
      email,
      temporaryPassword,
      fullName,
      role
    );

    if (!emailSent) {
      console.warn('Failed to send account credentials email');
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: newUser[0],
      // Only include in development
      ...(process.env.NODE_ENV === "development" && { temporaryPassword }),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PUT - Update user (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user role
    const currentUser = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!hasAdminOnlyAccess(currentUser[0]?.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id, fullName, email, role, branch } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await db
      .update(users)
      .set({
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(role && { role: role as "USER" | "ADMIN" | "MANAGER" | "STAFF" }),
        ...(branch !== undefined && { branch }),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        branch: users.branch,
      });

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user role
    const currentUser = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!hasAdminOnlyAccess(currentUser[0]?.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent deleting yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user
    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
