"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/insumos", label: "Insumos" },
  { href: "/compras", label: "Compras" },
  { href: "/recetas", label: "Recetas" },
  { href: "/ventas", label: "Ventas" },
  { href: "/proveedores", label: "Proveedores" },
];

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin
    ? [...links, { href: "/usuarios", label: "Usuarios" }]
    : links;

  return (
    <nav className="flex flex-col gap-1 p-4">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-black/5",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
