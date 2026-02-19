import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { appointments } from "@/database/schema";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get all appointments for Feb 18, 2026
    const allAppointments = await db
      .select()
      .from(appointments)
      .where(sql`${appointments.appointmentDate} = '2026-02-18'`);

    return NextResponse.json({
      count: allAppointments.length,
      appointments: allAppointments.map(a => ({
        id: a.id,
        date: a.appointmentDate,
        time: a.appointmentTime,
        barber: a.barber,
        branch: a.branch,
        fullName: a.fullName,
        email: a.email,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: String(error) },
      { status: 500 }
    );
  }
}
