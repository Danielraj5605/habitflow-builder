import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, Calendar, Flame, Target, Award, BarChart3, Plus, Crown,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

interface OverallSummary {
  total_habits: number; active_habits: number;
  overall_completion_rate: number; current_streak: number;
  longest_streak: number; total_completions: number;
}
interface WeeklySummary { week_start: string; completion_rate: number; }
interface HabitSummaryData {
  habit_id: string; habit_name: string; current_streak: number;
  longest_streak: number; total_completions: number; completion_rate: number;
}
interface DailyCompletion { date: string; count: number; }

const MILESTONES = [
  { title: "First Habit", icon: "🎯", req: (s: OverallSummary) => s.total_habits >= 1 },
  { title: "7-Day Streak", icon: "🔥", req: (s: OverallSummary) => s.longest_streak >= 7 },
  { title: "30-Day Streak", icon: "💎", req: (s: OverallSummary) => s.longest_streak >= 30 },
  { title: "Century Club", icon: "🏆", req: (s: OverallSummary) => s.total_completions >= 100 },
  { title: "Habit Hoarder", icon: "🌟", req: (s: OverallSummary) => s.total_habits >= 5 },
  { title: "Consistency King", icon: "👑", req: (s: OverallSummary) => s.total_completions >= 21 },
];

const customTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(28,25,41,0.95)", border: "1px solid rgba(212,168,70,0.2)",
      borderRadius: "0.625rem", padding: "0.625rem 1rem",
    }}>
      <p style={{ color: "#6B6380", fontSize: "0.75rem" }}>{label}</p>
      <p style={{ color: "#D4A846", fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
        {payload[0].value}%
      </p>
    </div>
  );
};

export default function Summary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [overall, setOverall] = useState<OverallSummary | null>(null);
  const [weekly, setWeekly] = useState<WeeklySummary[]>([]);
  const [topHabits, setTopHabits] = useState<HabitSummaryData[]>([]);
  const [daily, setDaily] = useState<DailyCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const [ov, wk, top, dc] = await Promise.allSettled([
          fetchWithAuth(`${API_BASE_URL}/summary/overall`),
          fetchWithAuth(`${API_BASE_URL}/summary/weekly`),
          fetchWithAuth(`${API_BASE_URL}/summary/top-habits`),
          fetchWithAuth(`${API_BASE_URL}/summary/daily-completions`),
        ]);
        if (ov.status === "fulfilled") setOverall(ov.value);
        if (wk.status === "fulfilled") setWeekly(Array.isArray(wk.value) ? wk.value : []);
        if (top.status === "fulfilled") setTopHabits(Array.isArray(top.value) ? top.value : []);
        if (dc.status === "fulfilled") setDaily(Array.isArray(dc.value) ? dc.value : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const weeklyData = weekly.map((w) => ({
    week: new Date(w.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    completion: Math.round(w.completion_rate),
  }));

  const milestones = MILESTONES.map((m) => ({
    ...m,
    unlocked: overall ? m.req(overall) : false,
  }));

  // Heatmap
  const heatmapCells = (() => {
    const today = new Date();
    const ago30 = new Date(today.getTime() - 30 * 86400000);
    const startOfWeek = new Date(ago30);
    startOfWeek.setDate(ago30.getDate() - ago30.getDay());
    const cells: { date: Date; count: number; inRange: boolean; isToday: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const ds = date.toISOString().split("T")[0];
      const found = daily.find((d) => d.date === ds);
      cells.push({
        date,
        count: found?.count || 0,
        inRange: date >= ago30 && date <= today,
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    return cells;
  })();

  const heatColor = (count: number, inRange: boolean) => {
    if (!inRange) return "rgba(10,10,15,0.3)";
    if (count === 0) return "rgba(39,35,54,0.8)";
    if (count <= 1) return "rgba(74,123,247,0.3)";
    if (count <= 3) return "rgba(155,109,255,0.45)";
    if (count <= 5) return "rgba(155,109,255,0.75)";
    return "#D4A846";
  };

  const statCards = [
    { label: "Completion Rate", value: `${Math.round(overall?.overall_completion_rate || 0)}%`, icon: TrendingUp, color: "#34D399" },
    { label: "Longest Streak", value: `${overall?.longest_streak || 0}d`, icon: Flame, color: "#FBBF24" },
    { label: "Active Habits", value: overall?.active_habits || 0, icon: Target, color: "#4A7BF7" },
    { label: "Total Check-ins", value: overall?.total_completions || 0, icon: Award, color: "#9B6DFF" },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };
  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

  return (
    <div className="min-h-screen bg-obsidian-night">
      {/* ── Header ── */}
      <header className="page-header sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-gold-royal transition-smooth" />
            <div>
              <h1 className="font-outfit font-bold text-lg sm:text-2xl text-foreground">Analytics</h1>
              <p className="text-xs sm:text-sm" style={{ color: "#6B6380" }}>Your habit-building journey at a glance</p>
            </div>
          </div>
        </div>
      </header>

      <motion.div
        className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* ── Stat Cards ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6B6380" }}>{label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              <p className="font-outfit font-bold text-2xl sm:text-3xl" style={{ color }}>
                {loading ? "—" : value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── Weekly Chart ── */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5 sm:p-6"
          style={{ background: "rgba(28,25,41,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <BarChart3 className="w-5 h-5 text-gold-royal" />
            <h2 className="font-outfit font-semibold text-lg text-foreground">Weekly Progress</h2>
          </div>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A846" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#9B6DFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week" tick={{ fill: "#6B6380", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6B6380", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={customTooltip} />
                <Area
                  type="monotone"
                  dataKey="completion"
                  stroke="#D4A846"
                  strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={{ fill: "#D4A846", r: 4, strokeWidth: 0 }}
                  activeDot={{ fill: "#E8C05A", r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center">
              <BarChart3 className="w-10 h-10 mb-3 opacity-20" style={{ color: "#D4A846" }} />
              <p className="text-sm" style={{ color: "#6B6380" }}>Complete habits to see your weekly data</p>
            </div>
          )}
        </motion.div>

        {/* ── Activity Heatmap ── */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5 sm:p-6"
          style={{ background: "rgba(28,25,41,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gold-royal" />
              <h2 className="font-outfit font-semibold text-lg text-foreground">Activity Heatmap</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "#6B6380" }}>Less</span>
              {["rgba(39,35,54,0.8)", "rgba(74,123,247,0.3)", "rgba(155,109,255,0.45)", "rgba(155,109,255,0.75)", "#D4A846"].map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
              ))}
              <span className="text-xs" style={{ color: "#6B6380" }}>More</span>
            </div>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1.5 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <p key={d} className="text-center text-[9px]" style={{ color: "#6B6380" }}>{d}</p>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {heatmapCells.map((cell, i) => (
              <div
                key={i}
                title={`${cell.date.toLocaleDateString()}: ${cell.count} completions`}
                className="aspect-square rounded-sm transition-smooth hover:scale-110 cursor-default"
                style={{
                  background: heatColor(cell.count, cell.inRange),
                  outline: cell.isToday ? "2px solid #D4A846" : "none",
                  outlineOffset: "1px",
                  opacity: cell.inRange ? 1 : 0.25,
                }}
              />
            ))}
          </div>

          {daily.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                { label: "Total Completions", val: daily.reduce((s, d) => s + d.count, 0), color: "#34D399" },
                { label: "Active Days", val: daily.filter((d) => d.count > 0).length, color: "#4A7BF7" },
                { label: "Consistency", val: `${Math.round((daily.filter((d) => d.count > 0).length / Math.max(daily.length, 1)) * 100)}%`, color: "#9B6DFF" },
                { label: "Best Day", val: Math.max(...daily.map((d) => d.count), 0), color: "#D4A846" },
              ].map(({ label, val, color }) => (
                <div key={label} className="text-center">
                  <p className="font-outfit font-bold text-xl" style={{ color }}>{val}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B6380" }}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Top Habits + Milestones ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Habits */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(28,25,41,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-5 h-5" style={{ color: "#34D399" }} />
              <h2 className="font-outfit font-semibold text-base text-foreground">Top Habits</h2>
            </div>
            {topHabits.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-10 h-10 mx-auto mb-3 opacity-20 text-gold-royal" />
                <p className="text-sm" style={{ color: "#6B6380" }}>No habits to analyze yet</p>
                <button
                  onClick={() => navigate("/add-habit")}
                  className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-smooth hover:opacity-80"
                  style={{ background: "rgba(212,168,70,0.1)", color: "#D4A846", border: "1px solid rgba(212,168,70,0.2)" }}
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />Create Habit
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {topHabits.slice(0, 5).map((h, i) => (
                  <div
                    key={h.habit_id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-smooth hover:bg-white/3"
                    style={{ border: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-outfit flex-shrink-0"
                      style={{ background: i < 3 ? "rgba(212,168,70,0.15)" : "rgba(255,255,255,0.05)", color: i < 3 ? "#D4A846" : "#6B6380" }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{h.habit_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Flame className="w-3 h-3" style={{ color: "#FBBF24" }} />
                        <span className="text-xs" style={{ color: "#6B6380" }}>{h.current_streak}d streak</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-outfit font-bold text-sm" style={{ color: "#34D399" }}>
                        {Math.round(h.completion_rate)}%
                      </p>
                      <p className="text-[10px]" style={{ color: "#6B6380" }}>done</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Milestones */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(28,25,41,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-5 h-5 text-gold-royal" />
              <h2 className="font-outfit font-semibold text-base text-foreground">Milestones</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {milestones.map((m) => (
                <div
                  key={m.title}
                  className="achievement-badge"
                  style={m.unlocked ? {} : {}}
                  data-unlocked={m.unlocked}
                >
                  <div className={`text-2xl mb-2 transition-smooth ${m.unlocked ? "animate-float" : ""}`}>
                    {m.unlocked ? m.icon : "🔒"}
                  </div>
                  <p
                    className="text-xs font-medium leading-tight"
                    style={{ color: m.unlocked ? "#D4A846" : "#6B6380" }}
                  >
                    {m.title}
                  </p>
                  {m.unlocked && (
                    <p className="text-[10px] mt-1" style={{ color: "#34D399" }}>Unlocked! ✓</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}