import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar />

      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        <Header />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  );
}