import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const q = (searchParams.get("q") || "").trim();

    const like = q ? `%${q.toLowerCase()}%` : undefined;

    const rows: any[] = await sql`
      SELECT id,
             name,
             sku,
             price,
             image_url AS "imageUrl",
             category_id AS "categoryId"
      FROM products
      WHERE 1=1
      ${categoryId ? sql` AND category_id = ${categoryId}` : sql``}
      ${like ? sql` AND lower(name) LIKE ${like}` : sql``}
      ORDER BY name ASC
    `;

    const products = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      sku: r.sku,
      price: Number(r.price),
      imageUrl: r.imageUrl ?? r.image_url ?? null,
      categoryId: r.categoryId ?? r.category_id,
    }));

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/products failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
