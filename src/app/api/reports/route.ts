import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "daily";
  let rows: any[] = [];

  if (type === "daily") {
    rows = await sql`
      SELECT
        to_char(created_at::date, 'YYYY-MM-DD') AS date,
        SUM(total)::float AS total,
        COUNT(*) AS orders
      FROM orders
      GROUP BY date
      ORDER BY date DESC
      LIMIT 14
    `;
  } else if (type === "weekly") {
    rows = await sql`
      SELECT
        to_char(date_trunc('week', created_at), 'IYYY-"W"IW') AS date,
        SUM(total)::float AS total,
        COUNT(*) AS orders
      FROM orders
      GROUP BY date
      ORDER BY date DESC
      LIMIT 10
    `;
  } else if (type === "monthly") {
    rows = await sql`
      SELECT
        to_char(created_at, 'YYYY-MM') AS date,
        SUM(total)::float AS total,
        COUNT(*) AS orders
      FROM orders
      GROUP BY date
      ORDER BY date DESC
      LIMIT 12
    `;
  } else if (type === "yearly") {
    rows = await sql`
      SELECT
        to_char(created_at, 'YYYY') AS date,
        SUM(total)::float AS total,
        COUNT(*) AS orders
      FROM orders
      GROUP BY date
      ORDER BY date DESC
      LIMIT 5
    `;
  }
  return NextResponse.json(rows);
}