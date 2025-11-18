import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql`select id, name from categories order by name asc`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/categories failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
