"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const pathname = usePathname();
  const linkCls = (href: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      pathname.startsWith(href)
        ? "bg-primary text-primary-foreground"
        : "hover:bg-primary/10"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="text-lg font-semibold">POS System</Link>
        <nav className="flex items-center gap-2">
          <Link href="/pos" className={linkCls("/pos")}>
            POS
          </Link>
          <Link href="/admin" className={linkCls("/admin")}>
            Admin
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
