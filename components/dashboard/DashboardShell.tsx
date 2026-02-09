"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface DashboardShellProps {
  user: { email: string };
  organizationName?: string;
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  organizationName,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-64">
        <Sidebar user={user} organizationName={organizationName} />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 border-b bg-background flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <span className="ml-2 font-bold tracking-tight">OpenGuard</span>
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <VisuallyHidden>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden>
          <Sidebar
            user={user}
            organizationName={organizationName}
            onNavigate={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="md:pl-64 pt-14 md:pt-0">
        <div className="min-h-screen">{children}</div>
      </main>
    </>
  );
}
