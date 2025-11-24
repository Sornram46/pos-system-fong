"use client";
import { useState } from "react";

export default function PayModal({
  open,
  total,
  onConfirm,
  onClose,
}: {
  open: boolean;
  total: number;
  onConfirm: (cash: number) => void;
  onClose: () => void;
}) {
  const [cash, setCash] = useState<string>("");

  const handleNumpad = (val: string) => {
    if (val === "C") setCash("");
    else if (val === "←") setCash((c) => c.slice(0, -1));
    else setCash((c) => (c === "0" ? val : c + val));
  };

  const cashNum = Number(cash || "0");
  const change = cashNum - total;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[320px] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-neutral-400 hover:text-red-500"
        >
          ×
        </button>
        <div className="text-lg font-bold mb-2">รับชำระเงิน</div>
        <div className="mb-2 flex justify-between">
          <span>ยอดรวม</span>
          <span className="font-semibold text-green-700">
            ฿ {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mb-2">
          <label className="block text-sm mb-1">รับเงินจากลูกค้า</label>
          <div className="w-full border rounded px-3 py-2 text-right text-2xl font-mono bg-neutral-50 mb-2 select-none">
            {cash === "" ? "0" : cash}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {["7", "8", "9", "4", "5", "6", "1", "2", "3", "00", "0", "←"].map((v) => (
            <button
              key={v}
              className={`py-3 rounded text-xl font-semibold bg-neutral-100 hover:bg-primary/20 transition ${
                v === "←" ? "text-red-500" : ""
              }`}
              onClick={() => handleNumpad(v)}
              type="button"
            >
              {v}
            </button>
          ))}
          <button
            className="col-span-3 py-2 rounded bg-neutral-200 hover:bg-red-200 text-red-700 font-semibold mt-1"
            onClick={() => handleNumpad("C")}
            type="button"
          >
            ล้าง
          </button>
        </div>
        <div className="mb-4 flex justify-between">
          <span>เงินทอน</span>
          <span className="font-semibold text-blue-700">
            ฿ {change >= 0 ? change.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
          </span>
        </div>
        <button
          className="w-full rounded bg-primary text-white py-2 font-semibold hover:bg-primary/80 transition disabled:opacity-50"
          disabled={cashNum < total}
          onClick={() => onConfirm(cashNum)}
        >
          ยืนยันรับเงิน
        </button>
      </div>
    </div>
  );
}