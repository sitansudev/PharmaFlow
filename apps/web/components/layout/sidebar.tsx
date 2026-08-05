"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Pill,
  FolderTree,
  Truck,
  ShoppingCart,
  Receipt,
  Users,
  UserRound,
} from "lucide-react";

const menu = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Medicines",
    href: "/medicines",
    icon: Pill,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: FolderTree,
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Truck,
  },
  {
    title: "Purchases",
    href: "/purchases",
    icon: ShoppingCart,
  },
  {
    title: "Sales",
    href: "/sales",
    icon: Receipt,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="h-16 flex items-center justify-center border-b">
        <h1 className="text-2xl font-bold text-blue-600">
          PharmaFlow
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-100"
              }`}
            >
              <Icon size={20} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 flex items-center gap-3">
        <UserRound />

        <div>
          <p className="font-medium">Admin</p>
          <p className="text-sm text-gray-500">
            Pharmacist
          </p>
        </div>
      </div>
    </aside>
  );
}