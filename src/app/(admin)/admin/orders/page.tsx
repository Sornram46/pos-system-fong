import { sql } from "@/lib/db";
import Link from "next/link";

interface OrderRow {
  id: string;
  number: string;
  created_at?: string;
  total: number;
  status?: string;
}

export default async function AdminOrdersPage() {
  let orders: OrderRow[] = [];
  try {
    const rows = await sql`
      SELECT
        o.id,
        o.number,
        o.created_at,
        o.status,
        COALESCE(SUM(oi.price * oi.qty), 0) AS total
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `;
    orders = rows as OrderRow[];
  } catch (e) {
    console.error("AdminOrdersPage query error", e);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary mb-2">รายการออเดอร์</h1>
      <div className="rounded-xl shadow-lg border border-neutral-200 bg-white dark:bg-neutral-900 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr>
                <th className="text-left p-3 bg-primary/10 text-primary rounded-l-lg">
                  Order
                </th>
                <th className="text-left p-3 bg-primary/10 text-primary">
                  Date
                </th>
                <th className="text-right p-3 bg-primary/10 text-primary">
                  Total
                </th>
                <th className="text-left p-3 bg-primary/10 text-primary">
                  Status
                </th>
                <th className="text-left p-3 bg-primary/10 text-primary rounded-r-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-neutral-400">
                    ไม่พบข้อมูลออเดอร์
                  </td>
                </tr>
              ) : (
                orders.map((o, i) => (
                  <tr
                    key={o.id}
                    className={`transition hover:bg-primary/5 ${
                      i % 2 === 0
                        ? "bg-neutral-50 dark:bg-neutral-800"
                        : "bg-white dark:bg-neutral-900"
                    }`}
                  >
                    <td className="p-3 font-medium">{o.number}</td>
                    <td className="p-3">
                      {o.created_at
                        ? new Date(o.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="p-3 text-right text-green-700 dark:text-green-400 font-semibold">
                      ฿{" "}
                      {Number(o.total).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-3">{o.status ?? "-"}</td>
                    <td className="p-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
