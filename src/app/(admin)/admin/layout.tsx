import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <div className="mx-auto max-w-7xl w-full flex">
        <AdminSidebar />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
