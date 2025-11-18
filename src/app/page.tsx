import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl w-full p-6">
        <h1 className="text-3xl font-semibold mb-6">Welcome to POS System</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          เลือกโหมดการใช้งานที่ต้องการด้านล่าง
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/pos" className="rounded-lg border p-6 hover:shadow-sm">
            <div className="text-xl font-semibold mb-1">POS</div>
            <div className="text-sm text-neutral-600">หน้าขายสินค้าและคิดเงิน</div>
          </Link>
          <Link href="/admin" className="rounded-lg border p-6 hover:shadow-sm">
            <div className="text-xl font-semibold mb-1">Admin</div>
            <div className="text-sm text-neutral-600">จัดการสินค้า ออเดอร์ และรายงาน</div>
          </Link>
        </div>
      </main>
    </div>
  );
}
