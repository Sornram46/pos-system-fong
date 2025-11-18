"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 dark:border-neutral-800 p-3 h-[calc(100dvh-57px)] sticky top-[57px]"> 
      <nav className="flex flex-col gap-1">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-md text-sm ${active ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
