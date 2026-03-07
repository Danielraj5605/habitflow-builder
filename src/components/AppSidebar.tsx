import { useLocation, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Target,
  Plus,
  BarChart3,
  Settings,
  User,
  LogOut,
  Crown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Habit Tracker", url: "/habits", icon: Target },
  { title: "Add Habit", url: "/add-habit", icon: Plus },
  { title: "Analytics", url: "/summary", icon: BarChart3 },
];

const accountItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Account", url: "/account", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const isExpanded = state === "expanded";

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Sidebar
      className="border-r border-sidebar-border transition-colors duration-300"
      style={{
        background: "hsl(var(--sidebar-background))",
      }}
    >
      {/* ── Logo ── */}
      <SidebarHeader
        className="p-5 border-b border-sidebar-border"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Crown className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {isExpanded && (
            <div>
              <h1 className="font-outfit font-bold text-lg text-gradient-gold">
                HabitFlow
              </h1>
              <p className="text-xs text-muted-foreground">
                Build royal habits
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-5 flex flex-col h-[calc(100%-5rem)] bg-transparent">
        {/* ── Main nav ── */}
        <SidebarGroup>
          {isExpanded && (
            <SidebarGroupLabel
              className="text-[10px] uppercase tracking-widest mb-2 px-2 text-muted-foreground"
            >
              Main
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const active = isActive(item.url);
                const isAddHabit = item.title === "Add Habit";
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-11 px-3 rounded-xl">
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        style={{
                          background: isAddHabit
                            ? "var(--gradient-gold)"
                            : active
                              ? "hsl(var(--sidebar-accent))"
                              : "transparent",
                          borderLeft: active
                            ? "2px solid hsl(var(--sidebar-primary))"
                            : isAddHabit
                              ? "2px solid transparent"
                              : "2px solid transparent",
                          color: isAddHabit
                            ? "hsl(var(--sidebar-primary-foreground))"
                            : active
                              ? "hsl(var(--sidebar-primary))"
                              : "hsl(var(--sidebar-foreground))",
                          transition: "all 0.2s ease",
                          borderRadius: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0 0.75rem",
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: active ? 600 : 400,
                          fontSize: "0.875rem",
                        }}
                        className={`hover:!bg-sidebar-accent hover:!text-sidebar-primary transition-smooth ${isAddHabit ? 'shadow-glow-gold' : ''}`}
                      >
                        <item.icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{
                            color: isAddHabit 
                              ? "hsl(var(--sidebar-primary-foreground))" 
                              : active 
                                ? "hsl(var(--sidebar-primary))" 
                                : "hsl(var(--sidebar-foreground))",
                          }}
                        />
                        {isExpanded && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Account nav ── */}
        <SidebarGroup className="mt-8">
          {isExpanded && (
            <SidebarGroupLabel
              className="text-[10px] uppercase tracking-widest mb-2 px-2 text-muted-foreground"
            >
              Account
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {accountItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-11 px-3 rounded-xl">
                      <NavLink
                        to={item.url}
                        style={{
                          background: active ? "hsl(var(--sidebar-accent))" : "transparent",
                          borderLeft: active
                            ? "2px solid hsl(var(--sidebar-primary))"
                            : "2px solid transparent",
                          color: active ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground))",
                          transition: "all 0.2s ease",
                          borderRadius: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0 0.75rem",
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: active ? 600 : 400,
                          fontSize: "0.875rem",
                        }}
                        className="hover:!bg-sidebar-accent hover:!text-sidebar-primary"
                      >
                        <item.icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: active ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground))" }}
                        />
                        {isExpanded && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Logout */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="h-11 px-3 rounded-xl cursor-pointer hover:!bg-destructive/10"
                  style={{
                    borderLeft: "2px solid transparent",
                    color: "hsl(var(--destructive))",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0 0.75rem",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease",
                  }}
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  {isExpanded && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Level badge ── */}
        {isExpanded && (
          <div
            className="mt-auto mx-1 p-3 rounded-xl border border-primary/20"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)/0.08) 0%, hsl(var(--accent)/0.08) 100%)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🌱</span>
              <span className="font-outfit font-semibold text-sm text-gradient-gold">
                Level 1 — Seed
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: "20%",
                  background: "var(--gradient-gold)",
                }}
              />
            </div>
            <p className="text-[10px] mt-1 text-muted-foreground">
              60 XP to next level
            </p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}