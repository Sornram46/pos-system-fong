"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || null;
    setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = (theme === "dark" ? "light" : "dark") || "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
    setTheme(next);
  };

  const label = theme === "dark" ? "สว่าง" : "มืด";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="px-3 py-2 rounded-md text-sm border hover:bg-primary/10"
    >
      {theme === "dark" ? "☀️ " : "🌙 "}{label}
    </button>
  );
}
