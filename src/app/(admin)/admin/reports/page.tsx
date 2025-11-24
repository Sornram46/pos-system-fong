"use client";
import { useState, useEffect } from "react";
import ReportTypeSelector from "@/components/admin/ReportTypeSelector";

type Row = { date: string; total: number; orders: number };

export default function AdminReportsPage() {
  const [type, setType] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?type=${type}`)
      .then(r => r.json())
      .then(data => setRows(data))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary mb-2">รายงานยอดขาย</h1>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-base font-medium">เลือกประเภท:</span>
        <ReportTypeSelector value={type} onChange={setType} />
      </div>
      <div className="rounded-xl shadow-lg border border-neutral-200 bg-white dark:bg-neutral-900 p-6">
        <div className="text-xl font-semibold mb-4 text-primary">
          {type === "daily"
            ? "ยอดขายรายวัน"
            : type === "weekly"
            ? "ยอดขายรายสัปดาห์"
            : type === "monthly"
            ? "ยอดขายรายเดือน"
            : "ยอดขายรายปี"}
        </div>
        {loading ? (
          <div className="p-8 text-center text-neutral-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-1">
              <thead>
                <tr>
                  <th className="text-left p-3 bg-primary/10 text-primary rounded-l-lg">
                    {type === "daily"
                      ? "วันที่"
                      : type === "weekly"
                      ? "สัปดาห์"
                      : type === "monthly"
                      ? "เดือน"
                      : "ปี"}
                  </th>
                  <th className="text-right p-3 bg-primary/10 text-primary">ยอดขาย (฿)</th>
                  <th className="text-right p-3 bg-primary/10 text-primary rounded-r-lg">จำนวนออเดอร์</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-neutral-400">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr
                      key={r.date}
                      className={`transition hover:bg-primary/5 ${
                        i % 2 === 0 ? "bg-neutral-50 dark:bg-neutral-800" : "bg-white dark:bg-neutral-900"
                      }`}
                    >
                      <td className="p-3 font-medium">{r.date}</td>
                      <td className="p-3 text-right text-green-700 dark:text-green-400 font-semibold">
                        {r.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right">{r.orders}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
