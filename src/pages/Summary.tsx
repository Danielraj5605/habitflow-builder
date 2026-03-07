import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, Calendar, Flame, Target, Award, BarChart3, Plus, Crown, Info,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";

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
    <div className="bg-popover border border-primary/20 rounded-lg p-2.5 shadow-xl backdrop-blur-md">
      <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1 font-bold">{label}</p>
      <p className="text-primary font-bold font-outfit text-lg">
        {payload[0].value}% <span className="text-[10px] text-muted-foreground font-normal">completion</span>
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

  // Map daily completions to heatmap format
  const heatmapData = daily.map(d => {
    let level = 0;
    if (d.count === 0) level = 0;
    else if (d.count <= 1) level = 1;
    else if (d.count <= 3) level = 2;
    else if (d.count <= 5) level = 3;
    else level = 4;
    
    return {
      date: d.date,
      count: d.count,
      level: level
    };
  });

  const statCards = [
    { label: "Completion Rate", value: `${Math.round(overall?.overall_completion_rate || 0)}%`, icon: TrendingUp, color: "hsl(var(--success))" },
    { label: "Longest Streak", value: `${overall?.longest_streak || 0}d`, icon: Flame, color: "hsl(var(--warning))" },
    { label: "Active Habits", value: overall?.active_habits || 0, icon: Target, color: "hsl(var(--info))" },
    { label: "Total Check-ins", value: overall?.total_completions || 0, icon: Award, color: "hsl(var(--accent))" },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };
  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ── Header ── */}
      <header className="page-header sticky top-0 z-40 bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-primary transition-smooth" />
            <div>
              <h1 className="font-outfit font-bold text-lg sm:text-2xl">Analytics</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Your habit-building journey at a glance</p>
            </div>
          </div>
        </div>
      </header>

      <motion.div
        className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* ── Stat Cards ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card bg-card border border-border/50 hover:border-primary/30 group">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{label}</p>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
              </div>
              <p className="font-outfit font-bold text-2xl sm:text-3xl">
                {loading ? <span className="animate-pulse">...</span> : value}
              </p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Weekly Chart ── */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 rounded-2xl p-6 bg-card border border-border/50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h2 className="font-outfit font-semibold text-lg">Weekly Progress</h2>
              </div>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </div>
            
            <div className="h-[280px]">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} 
                      axisLine={false} 
                      tickLine={false} 
                      domain={[0, 100]}
                    />
                    <Tooltip content={customTooltip} />
                    <Area
                      type="monotone"
                      dataKey="completion"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#areaGrad)"
                      dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                      activeDot={{ fill: "hsl(var(--primary))", r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 opacity-20 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Complete habits to see your weekly data</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Top Habits ── */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl p-6 bg-card border border-border/50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <Award className="w-4 h-4" />
              </div>
              <h2 className="font-outfit font-semibold text-lg">Top Performing</h2>
            </div>
            
            {topHabits.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 opacity-20 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">No habits to analyze yet</p>
                <button
                  onClick={() => navigate("/add-habit")}
                  className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />Create Habit
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {topHabits.slice(0, 5).map((h, i) => (
                  <div
                    key={h.habit_id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/30 hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold font-outfit flex-shrink-0"
                      style={{ 
                        background: i === 0 ? "hsl(var(--warning)/0.2)" : i === 1 ? "hsl(var(--muted)/0.5)" : i === 2 ? "hsl(var(--primary)/0.15)" : "hsl(var(--muted)/0.3)",
                        color: i === 0 ? "hsl(var(--warning))" : i === 1 ? "hsl(var(--muted-foreground))" : i === 2 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{h.habit_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Flame className="w-3 h-3 text-warning" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{h.current_streak}d Streak</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-outfit font-bold text-sm text-success">
                        {Math.round(h.completion_rate)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Activity Heatmap ── */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6 bg-card border border-border/50 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="font-outfit font-semibold text-lg">Consistency Map</h2>
            </div>
            
            <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full">
              {[
                { label: "Total", val: daily.reduce((s, d) => s + d.count, 0), icon: Award },
                { label: "Active", val: daily.filter((d) => d.count > 0).length, icon: Calendar },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="flex items-center gap-1.5 px-1 border-r last:border-0 border-border/50 pr-3 last:pr-1">
                  <Icon className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{val} {label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/10 rounded-xl p-4 overflow-hidden">
            <ActivityHeatmap data={heatmapData} loading={loading} />
          </div>

          {daily.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 pt-6 border-t border-border/50">
              {[
                { label: "Check-ins", val: daily.reduce((s, d) => s + d.count, 0), color: "hsl(var(--success))" },
                { label: "Active Days", val: daily.filter((d) => d.count > 0).length, color: "hsl(var(--info))" },
                { label: "Consistency", val: `${Math.round((daily.filter((d) => d.count > 0).length / Math.max(daily.length, 1)) * 100)}%`, color: "hsl(var(--accent))" },
                { label: "Daily Peak", val: Math.max(...daily.map((d) => d.count), 0), color: "hsl(var(--warning))" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex flex-col">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                  <p className="font-outfit font-bold text-xl" style={{ color }}>{val}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Milestones ── */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6 bg-card border border-border/50 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <Crown className="w-4 h-4" />
            </div>
            <h2 className="font-outfit font-semibold text-lg">Achievements</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {milestones.map((m) => (
              <div
                key={m.title}
                className={`achievement-badge p-4 text-center rounded-2xl transition-all duration-300 ${
                  m.unlocked 
                    ? "bg-primary/5 border-primary/20 shadow-glow-gold scale-100 opacity-100" 
                    : "bg-muted/10 border-transparent opacity-40 grayscale"
                }`}
              >
                <div className={`text-3xl mb-3 transition-transform duration-500 ${m.unlocked ? "animate-float" : ""}`}>
                  {m.unlocked ? m.icon : "🔒"}
                </div>
                <p className={`text-[11px] font-bold leading-tight uppercase tracking-tighter ${m.unlocked ? "text-primary" : "text-muted-foreground"}`}>
                  {m.title}
                </p>
                {m.unlocked && (
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[9px] font-bold text-success uppercase">Unlocked</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
