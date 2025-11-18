import { demoOrders } from "@/data/orders";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <div className="overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="text-left p-2">Order</th>
              <th className="text-left p-2">Date</th>
              <th className="text-right p-2">Total</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {demoOrders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-2">{o.number}</td>
                <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="p-2 text-right">฿ {o.total.toFixed(2)}</td>
                <td className="p-2">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
