import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { inventoryBranches } from "@/database/schema";

export async function GET() {
  try {
    const branches = await db.select().from(inventoryBranches);
    
    return NextResponse.json({
      count: branches.length,
      branches: branches.map(b => ({
        id: b.id,
        name: b.name,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
