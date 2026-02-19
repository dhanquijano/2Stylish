import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { appointments, barbers, inventoryBranches } from "@/database/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');
    const branchId = searchParams.get('branchId');

    // Get all appointments
    const allAppointments = await db.select().from(appointments);
    
    // Get barber and branch info
    const [barbersData, branchesData] = await Promise.all([
      db.select().from(barbers),
      db.select().from(inventoryBranches),
    ]);

    const barber = barbersData.find((b: any) => b.id === barberId);
    const branch = branchesData.find((b: any) => b.id === branchId);

    const barberName = barber?.name || barberId;
    const branchName = branch?.name || branchId;

    // Filter appointments for this date/barber/branch
    const filteredAppointments = date && barberId && branchId
      ? await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.appointmentDate, date),
              eq(appointments.barber, barberName),
              eq(appointments.branch, branchName),
            ),
          )
      : [];

    return NextResponse.json({
      debug: {
        requestParams: { date, barberId, branchId },
        barberMapping: { barberId, barberName },
        branchMapping: { branchId, branchName },
        allAppointmentsCount: allAppointments.length,
        filteredAppointmentsCount: filteredAppointments.length,
      },
      allAppointments: allAppointments.map(a => ({
        id: a.id,
        date: a.appointmentDate,
        time: a.appointmentTime,
        barber: a.barber,
        branch: a.branch,
        fullName: a.fullName,
      })),
      filteredAppointments: filteredAppointments.map(a => ({
        id: a.id,
        date: a.appointmentDate,
        time: a.appointmentTime,
        barber: a.barber,
        branch: a.branch,
        fullName: a.fullName,
      })),
      availableBarbers: barbersData.map(b => ({ id: b.id, name: b.name })),
      availableBranches: branchesData.map(b => ({ id: b.id, name: b.name })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: String(error) },
      { status: 500 }
    );
  }
}
