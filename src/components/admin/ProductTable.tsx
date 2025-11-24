"use client";
import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";

interface AdminProductRow {
  id: string;
  name: string;
  sku: string;
  price: number;
  category_name: string | null;
}

export default function ProductTable({ products: initial }: { products: AdminProductRow[] }) {
  const [products, setProducts] = useState(initial);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const toggleAll = () =>
    setSelected(
      selected.length === products.length ? [] : products.map((p) => p.id)
    );

  async function handleBulkDelete() {
    if (selected.length === 0) return;
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: `คุณต้องการลบสินค้าที่เลือก (${selected.length} รายการ) หรือไม่`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
    });
    if (result.isConfirmed) {
      let ok = 0;
      for (const id of selected) {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (res.ok) ok++;
      }
      setProducts((prev) => prev.filter((p) => !selected.includes(p.id)));
      setSelected([]);
      Swal.fire("ลบสำเร็จ!", `ลบ ${ok} รายการแล้ว`, "success");
    }
  }

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <button
          className="rounded bg-red-600 text-white px-4 py-2 font-semibold shadow hover:bg-red-700 transition disabled:opacity-50"
          disabled={selected.length === 0}
          onClick={handleBulkDelete}
        >
          ลบที่เลือก
        </button>
        <span className="text-sm text-neutral-500">
          {selected.length > 0 && `เลือก ${selected.length} รายการ`}
        </span>
      </div>
      <div className="rounded-xl shadow-lg border border-neutral-200 bg-white dark:bg-neutral-900 overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="p-3 bg-primary/10 text-primary rounded-l-lg">
                <input
                  type="checkbox"
                  checked={selected.length === products.length && products.length > 0}
                  onChange={toggleAll}
                  aria-label="เลือกทั้งหมด"
                />
              </th>
              <th className="text-left p-3 bg-primary/10 text-primary">ชื่อสินค้า</th>
              <th className="text-left p-3 bg-primary/10 text-primary">SKU</th>
              <th className="text-right p-3 bg-primary/10 text-primary">ราคา</th>
              <th className="text-left p-3 bg-primary/10 text-primary">หมวดหมู่</th>
              <th className="p-3 bg-primary/10 text-primary rounded-r-lg">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-neutral-400">
                  ไม่พบสินค้า
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr
                  key={p.id}
                  className={`transition hover:bg-primary/5 ${
                    i % 2 === 0
                      ? "bg-neutral-50 dark:bg-neutral-800"
                      : "bg-white dark:bg-neutral-900"
                  }`}
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggle(p.id)}
                      aria-label={`เลือก ${p.name}`}
                    />
                  </td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.sku}</td>
                  <td className="p-3 text-right text-green-700 dark:text-green-400 font-semibold">
                    ฿ {Number(p.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3">{p.category_name || "-"}</td>
                  <td className="p-3 text-center">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium transition"
                    >
                      แก้ไข
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}