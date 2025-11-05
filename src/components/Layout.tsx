import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-calm">
        <AppSidebar />
        <main className="flex-1 transition-smooth">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}