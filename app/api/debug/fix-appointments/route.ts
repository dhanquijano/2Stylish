import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { appointments } from "@/database/schema";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Update all appointments with "Sanbry Main Branch" to use "Ayala Malls Circuit" (branch-1)
    const result = await db
      .update(appointments)
      .set({ branch: "Ayala Malls Circuit" })
      .where(sql`${appointments.branch} = 'Sanbry Main Branch'`);

    // Get updated count
    const updatedAppointments = await db
      .select()
      .from(appointments)
      .where(sql`${appointments.branch} = 'Ayala Malls Circuit'`);

    return NextResponse.json({
      success: true,
      message: "Updated appointments from 'Sanbry Main Branch' to 'Ayala Malls Circuit'",
      updatedCount: updatedAppointments.length,
      appointments: updatedAppointments.map(a => ({
        id: a.id,
        date: a.appointmentDate,
        time: a.appointmentTime,
        barber: a.barber,
        branch: a.branch,
        fullName: a.fullName,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Just show what would be updated
    const oldBranchAppointments = await db
      .select()
      .from(appointments)
      .where(sql`${appointments.branch} = 'Sanbry Main Branch'`);

    return NextResponse.json({
      message: "These appointments have invalid branch names and need to be updated",
      count: oldBranchAppointments.length,
      appointments: oldBranchAppointments.map(a => ({
        id: a.id,
        date: a.appointmentDate,
        time: a.appointmentTime,
        barber: a.barber,
        branch: a.branch,
        fullName: a.fullName,
      })),
      instruction: "Send a POST request to this endpoint to update these appointments to 'Ayala Malls Circuit'",
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
