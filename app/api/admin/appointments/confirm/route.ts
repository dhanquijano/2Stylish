import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { appointments, sales } from "@/database/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { hasAdminAccess } from "@/lib/admin-utils";
import { users } from "@/database/schema";
import crypto from "crypto";

// POST - Confirm appointment and create sales record
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

    if (!hasAdminAccess(currentUser[0]?.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { 
      appointmentId, 
      gross, 
      discount = 0, 
      paymentMethod,
      notes 
    } = await request.json();

    if (!appointmentId || !gross || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Appointment ID, gross amount, and payment method are required" },
        { status: 400 }
      );
    }

    // Get appointment details
    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (appointment.length === 0) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    const apt = appointment[0];

    // Check if appointment is already completed
    if (apt.status === "completed") {
      return NextResponse.json(
        { success: false, error: "Appointment is already completed" },
        { status: 400 }
      );
    }

    // Calculate net amount
    const netAmount = parseFloat(gross) - parseFloat(discount.toString());

    // Create sales record
    const salesId = crypto.randomUUID();
    
    await db.insert(sales).values({
      id: salesId,
      date: apt.appointmentDate,
      time: apt.appointmentTime,
      branch: apt.branch,
      barber: apt.barber,
      services: apt.services,
      gross: gross.toString(),
      discount: discount.toString(),
      net: netAmount.toString(),
      paymentMethod,
      status: "completed",
      isManual: 0, // From appointment, not manual entry
      notes: notes || `Appointment confirmed for ${apt.fullName} (${apt.email})`,
      appointmentType: "reservation",
    });

    // Update appointment status to completed and link to sales record
    await db
      .update(appointments)
      .set({ 
        status: "completed",
        salesId: salesId,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId));

    return NextResponse.json({
      success: true,
      message: "Appointment confirmed and sales record created",
      data: {
        appointmentId,
        salesId,
      },
    });
  } catch (error) {
    console.error("Error confirming appointment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm appointment" },
      { status: 500 }
    );
  }
}

// PUT - Update appointment status
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

    if (!hasAdminAccess(currentUser[0]?.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { appointmentId, status, reason } = await request.json();

    if (!appointmentId || !status) {
      return NextResponse.json(
        { success: false, error: "Appointment ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "confirmed", "completed", "cancelled", "no-show"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update appointment status
    await db
      .update(appointments)
      .set({ 
        status: status as "pending" | "confirmed" | "completed" | "cancelled" | "no-show",
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId));

    return NextResponse.json({
      success: true,
      message: `Appointment status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update appointment status" },
      { status: 500 }
    );
  }
}
