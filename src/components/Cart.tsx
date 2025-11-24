"use client";
import { useMemo } from "react";
import Swal from "sweetalert2";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function Cart({
  items,
  onInc,
  onDec,
  onRemove,
  onClear,
  onCheckout,
}: {
  items: CartItem[];
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}) {
  const subtotal = useMemo(
    () => items.reduce((s, it) => s += it.price * it.qty, 0),
    [items]
  );

  // แทนที่ปุ่ม Checkout ให้เรียก Swal
  const handleCheckout = async () => {
    if (items.length === 0) {
      Swal.fire({ icon: 'info', title: 'ไม่มีสินค้าในตะกร้า' });
      return;
    }
    try {
      const payload = {
        items: items.map(it => ({ id: it.id, qty: it.qty, price: it.price }))
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Create order failed (${res.status})`);
      }
      const order = await res.json();
      Swal.fire({
        title: 'Checkout สำเร็จ!',
        html: `หมายเลขออเดอร์: <strong>${order.number}</strong><br/>ยอดรวม: ฿ ${Number(order.total).toFixed(2)}`,
        icon: 'success',
        confirmButtonText: 'ตกลง'
      }).then(() => {
        onCheckout();
      });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Checkout failed' });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto divide-y divide-neutral-200 dark:divide-neutral-800">
        {items.length === 0 && (
          <div className="p-4 text-neutral-500">Cart is empty</div>
        )}
        {items.map((it) => (
          <div key={it.id} className="p-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-neutral-500">฿ {it.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onDec(it.id)} className="px-2 py-1 rounded border">-</button>
              <div className="w-8 text-center">{it.qty}</div>
              <button onClick={() => onInc(it.id)} className="px-2 py-1 rounded border">+</button>
            </div>
            <div className="w-20 text-right font-semibold">
              ฿ {(it.qty * it.price).toFixed(2)}
            </div>
            <button onClick={() => onRemove(it.id)} className="px-2 py-1 text-sm text-red-600">Remove</button>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>฿ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onClear} className="flex-1 rounded-md border px-3 py-2">Clear</button>
          <button onClick={handleCheckout} className="flex-1 rounded-md bg-primary text-primary-foreground px-3 py-2">Checkout</button>
        </div>
      </div>
    </div>
  );
}
