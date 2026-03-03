import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { appointments } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    console.log("Starting branch name fix...");
    
    // Get all appointments with old branch name
    const oldAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.branch, "Sanbry Main Branch"));
    
    console.log(`Found ${oldAppointments.length} appointments with "Sanbry Main Branch"`);
    
    const updated: any[] = [];
    
    if (oldAppointments.length > 0) {
      // Update each appointment
      for (const apt of oldAppointments) {
        await db
          .update(appointments)
          .set({ branch: "Ayala Malls Circuit" })
          .where(eq(appointments.id, apt.id));
        
        updated.push({
          id: apt.id,
          date: apt.appointmentDate,
          time: apt.appointmentTime,
          barber: apt.barber,
          oldBranch: "Sanbry Main Branch",
          newBranch: "Ayala Malls Circuit"
        });
        
        console.log(`Updated appointment ${apt.id}: ${apt.appointmentDate} ${apt.appointmentTime} - ${apt.barber}`);
      }
    }
    
    // Verify the fix
    const verifyAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentDate, "2026-02-18"));
    
    console.log("\nVerification - Appointments on 2026-02-18:");
    const verification = verifyAppointments.map(apt => ({
      time: apt.appointmentTime,
      barber: apt.barber,
      branch: apt.branch,
      fullName: apt.fullName
    }));
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updated.length} appointments from "Sanbry Main Branch" to "Ayala Malls Circuit"`,
      updated,
      verification
    });
  } catch (error) {
    console.error("Error fixing branch names:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
