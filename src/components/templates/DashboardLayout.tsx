import type { ReactNode } from "react";
import Navbar from "@/components/organisms/Navbar";
import { Toaster } from "@/components/ui/sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <Toaster position="top-right" richColors duration={2000}  offset={{ top: 70 }}/>
    </div>
  );
}

export default DashboardLayout;