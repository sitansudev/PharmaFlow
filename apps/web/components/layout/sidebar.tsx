"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Pill,
  FolderTree,
  Truck,
  ShoppingCart,
  Receipt,
  Users,
  UserRound,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";

import { Button } from "@/components/ui/button";

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
  const router = useRouter();

  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-white">
      {/* ======================================================
          LOGO
      ====================================================== */}

      <div className="flex h-16 items-center justify-center border-b">
        <h1 className="text-2xl font-bold text-blue-600">
          PharmaFlow
        </h1>
      </div>

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {menu.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

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

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* ======================================================
          USER + LOGOUT
      ====================================================== */}

      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <UserRound className="shrink-0" />

          <div className="min-w-0">
            <p className="truncate font-medium">
              {user?.fullName ?? "Admin"}
            </p>

            <p className="truncate text-sm text-gray-500">
              {user?.role ?? "Pharmacist"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut size={18} />

          Logout
        </Button>
      </div>
    </aside>
  );
}