import { db } from "@/database/drizzle";
import { appointments } from "@/database/schema";
import { eq } from "drizzle-orm";

async function fixBranchNames() {
  try {
    console.log("Starting branch name fix...");
    
    // Get all appointments with old branch name
    const oldAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.branch, "Sanbry Main Branch"));
    
    console.log(`Found ${oldAppointments.length} appointments with "Sanbry Main Branch"`);
    
    if (oldAppointments.length > 0) {
      // Update each appointment
      for (const apt of oldAppointments) {
        await db
          .update(appointments)
          .set({ branch: "Ayala Malls Circuit" })
          .where(eq(appointments.id, apt.id));
        
        console.log(`Updated appointment ${apt.id}: ${apt.appointmentDate} ${apt.appointmentTime} - ${apt.barber}`);
      }
    }
    
    // Verify the fix
    const verifyAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentDate, "2026-02-18"));
    
    console.log("\nVerification - Appointments on 2026-02-18:");
    verifyAppointments.forEach(apt => {
      console.log(`  ${apt.appointmentTime} - ${apt.barber} at ${apt.branch}`);
    });
    
    console.log("\nBranch name fix completed successfully!");
  } catch (error) {
    console.error("Error fixing branch names:", error);
    process.exit(1);
  }
}

fixBranchNames();
