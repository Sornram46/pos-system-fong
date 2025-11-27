import { sql } from "@/lib/db";
import Link from "next/link";

interface OrderDetailRow {
  id: string;
  number: string;
  created_at?: string;
  status?: string;
  total: number;
}

interface OrderItemRow {
  id: string;
  name: string | null;
  sku: string | null;
  price: number;
  qty: number;
}

export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  // ดึงข้อมูลออเดอร์
// ...existing code...
const orderRows = await sql`
  SELECT id, number, created_at, status, COALESCE(total,0) as total
  FROM orders
  WHERE id = ${id}
`;
const order: OrderDetailRow | undefined = orderRows[0] as OrderDetailRow | undefined;
// ...existing code...
  // ดึงรายการสินค้าในออเดอร์
  const items: OrderItemRow[] = (await sql`
  SELECT oi.id, p.name, p.sku, oi.price, oi.qty
  FROM order_items oi
  LEFT JOIN products p ON p.id = oi.product_id
  WHERE oi.order_id = ${id}
  ORDER BY oi.id
`) as OrderItemRow[];

  if (!order) {
    return <div className="p-4">Order not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Link href="/admin/orders" className="text-blue-600 hover:underline">&larr; Back to Orders</Link>
      <h2 className="text-xl font-semibold">Order #{order.number}</h2>
      <div className="text-sm text-neutral-600">
        Date: {order.created_at ? new Date(order.created_at).toLocaleString() : "-"}
        <br />
        Status: {order.status ?? "-"}
      </div>
      <div className="border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="text-left p-2">Product</th>
              <th className="text-left p-2">SKU</th>
              <th className="text-right p-2">Qty</th>
              <th className="text-right p-2">Price</th>
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-2">{it.name ?? <span className="text-neutral-400 italic">[deleted]</span>}</td>
                <td className="p-2">{it.sku ?? "-"}</td>
                <td className="p-2 text-right">{it.qty}</td>
                <td className="p-2 text-right">฿ {Number(it.price).toFixed(2)}</td>
                <td className="p-2 text-right">฿ {(it.qty * Number(it.price)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-right font-semibold text-lg">
        รวมทั้งสิ้น: ฿ {Number(order.total).toFixed(2)}
      </div>
    </div>
  );
}