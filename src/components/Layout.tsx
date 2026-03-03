import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-obsidian-night">
        {/* Sidebar — visible on md+ */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 transition-smooth pb-mobile md:pb-0">
          {children}
        </main>

        {/* Bottom nav — visible on mobile only */}
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}