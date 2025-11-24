import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql`SELECT id, name FROM categories ORDER BY name ASC`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/categories failed:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name: string = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const rows: any[] = await sql`
      INSERT INTO categories (id, name)
      VALUES (gen_random_uuid(), ${name})
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 });
    }
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/categories failed:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
