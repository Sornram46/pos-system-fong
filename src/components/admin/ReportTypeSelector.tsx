"use client";
export default function ReportTypeSelector({
  value,
  onChange,
}: {
  value: "daily" | "weekly" | "monthly" | "yearly";
  onChange: (v: "daily" | "weekly" | "monthly" | "yearly") => void;
}) {
  return (
    <select
      className="border rounded px-2 py-1"
      value={value}
      onChange={e => onChange(e.target.value as any)}
    >
      <option value="daily">รายวัน</option>
      <option value="weekly">รายสัปดาห์</option>
      <option value="monthly">รายเดือน</option>
      <option value="yearly">รายปี</option>
    </select>
  );
}