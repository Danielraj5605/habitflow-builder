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
      className="border-r"
      style={{
        background: "linear-gradient(180deg, #0D0B16 0%, #0A0A0F 100%)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Logo ── */}
      <SidebarHeader
        className="p-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #D4A846 0%, #9B6DFF 100%)" }}
          >
            <Crown className="w-5 h-5" style={{ color: "#0A0A0F" }} />
          </div>
          {isExpanded && (
            <div>
              <h1 className="font-outfit font-bold text-lg text-gradient-gold">
                HabitFlow
              </h1>
              <p className="text-xs" style={{ color: "#6B6380" }}>
                Build royal habits
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-5 flex flex-col h-[calc(100%-5rem)]">
        {/* ── Main nav ── */}
        <SidebarGroup>
          {isExpanded && (
            <SidebarGroupLabel
              className="text-[10px] uppercase tracking-widest mb-2 px-2"
              style={{ color: "#6B6380" }}
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
                            ? "linear-gradient(135deg, rgba(212,168,70,0.12) 0%, rgba(155,109,255,0.08) 100%)"
                            : active
                              ? "rgba(212,168,70,0.1)"
                              : "transparent",
                          borderLeft: active
                            ? "2px solid #D4A846"
                            : isAddHabit
                              ? "2px solid rgba(212,168,70,0.4)"
                              : "2px solid transparent",
                          color: active
                            ? "#D4A846"
                            : isAddHabit
                              ? "#D4A846"
                              : "#B8B0CC",
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
                        className="hover:!bg-white/5 hover:!text-[#D4A846]"
                      >
                        <item.icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{
                            color: active || isAddHabit ? "#D4A846" : "#B8B0CC",
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
              className="text-[10px] uppercase tracking-widest mb-2 px-2"
              style={{ color: "#6B6380" }}
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
                          background: active ? "rgba(212,168,70,0.1)" : "transparent",
                          borderLeft: active
                            ? "2px solid #D4A846"
                            : "2px solid transparent",
                          color: active ? "#D4A846" : "#B8B0CC",
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
                        className="hover:!bg-white/5 hover:!text-[#D4A846]"
                      >
                        <item.icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: active ? "#D4A846" : "#B8B0CC" }}
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
                  className="h-11 px-3 rounded-xl cursor-pointer hover:!bg-red-500/10"
                  style={{
                    borderLeft: "2px solid transparent",
                    color: "#F87171",
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
                  <LogOut className="w-4 h-4 flex-shrink-0" style={{ color: "#F87171" }} />
                  {isExpanded && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Level badge ── */}
        {isExpanded && (
          <div
            className="mt-auto mx-1 p-3 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(212,168,70,0.08) 0%, rgba(155,109,255,0.08) 100%)",
              border: "1px solid rgba(212,168,70,0.15)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🌱</span>
              <span className="font-outfit font-semibold text-sm text-gradient-gold">
                Level 1 — Seed
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: "20%",
                  background: "linear-gradient(90deg, #D4A846, #9B6DFF)",
                }}
              />
            </div>
            <p className="text-[10px] mt-1" style={{ color: "#6B6380" }}>
              60 XP to next level
            </p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}