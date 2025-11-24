type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export function ReceiptModal({
  open,
  onClose,
  items,
  cash,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  cash?: number;
}) {
  if (!open) return null;
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  const change = cash !== undefined ? cash - total : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 print:bg-transparent">
      <div
        className="bg-white rounded-lg shadow-lg p-4 relative print:shadow-none print:bg-white"
        style={{
          width: "80mm",
          minHeight: "100mm",
          fontFamily: "monospace",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-neutral-400 hover:text-red-500 print:hidden"
        >
          ×
        </button>
        <div className="text-center mb-2">
          <div className="font-bold text-lg">ใบเสร็จรับเงิน</div>
          <div className="text-xs text-neutral-500">POS Demo Shop</div>
          <div className="text-xs text-neutral-500">{new Date().toLocaleString()}</div>
        </div>
        <hr className="my-2 border-dashed" />
        <table className="w-full text-xs mb-2">
          <thead>
            <tr>
              <th className="text-left">สินค้า</th>
              <th className="text-right">จำนวน</th>
              <th className="text-right">ราคา</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.name}</td>
                <td className="text-right">{it.qty}</td>
                <td className="text-right">{(it.price * it.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr className="my-2 border-dashed" />
        <div className="flex justify-between font-bold text-base">
          <span>รวม</span>
          <span>฿ {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        {cash !== undefined && (
          <>
            <div className="flex justify-between mt-2">
              <span>รับเงิน</span>
              <span>฿ {cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span>เงินทอน</span>
              <span>฿ {change !== undefined ? change.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}</span>
            </div>
          </>
        )}
        <div className="mt-4 text-center text-xs text-neutral-500">
          ขอบคุณที่ใช้บริการ
        </div>
        <div className="mt-4 flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 rounded bg-primary text-white py-2 font-semibold hover:bg-primary/80 transition"
          >
            พิมพ์ใบเสร็จ
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded bg-neutral-200 text-neutral-700 py-2 font-semibold hover:bg-neutral-300 transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiptModal;