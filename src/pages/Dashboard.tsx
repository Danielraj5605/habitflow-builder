import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Target, TrendingUp, Flame, Calendar, Crown, CheckCircle2, Sun, Sunset, Moon, Star } from "lucide-react";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHabits } from "@/contexts/HabitContext";

const motivationalQuotes = [
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Small steps every day lead to massive results over time.", author: "HabitFlow" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
];

const TIME_GROUPS = [
  { label: "Morning", icon: Sun, color: "#FBBF24", range: "All Habits" },
];

function CircularProgress({ value, size = 120 }: { value: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A846" />
            <stop offset="100%" stopColor="#9B6DFF" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(39,35,54,1)"
          strokeWidth="10"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)", filter: "drop-shadow(0 0 6px rgba(212,168,70,0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-outfit font-bold text-gradient-gold" style={{ fontSize: size > 100 ? "1.5rem" : "1.1rem" }}>
          {value}%
        </span>
        <span className="text-xs" style={{ color: "#6B6380" }}>today</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6B6380" }}>{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="font-outfit font-bold text-3xl" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "#6B6380" }}>{sub}</p>}
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { habits, toggleHabitDay } = useHabits();

  const currentDayIndex = new Date().getDay();
  const todayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  const userName = localStorage.getItem("userName") || "Daniel";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const greetIcon = hour < 12 ? "☀️" : hour < 17 ? "🌤️" : "🌙";

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const quote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length];

  const todaysHabits = habits.filter((h) => h.isActive);
  const completedToday = todaysHabits.filter((h) => h.currentWeek[todayIndex]).length;
  const totalToday = todaysHabits.length;
  const progressPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;
  const avgConsistency = habits.length > 0
    ? Math.round(habits.reduce((a, h) => a + h.consistencyScore, 0) / habits.length)
    : 0;

  const handleToggle = (habitId: number) => toggleHabitDay(habitId, todayIndex);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  return (
    <div className="min-h-screen bg-obsidian-night">
      {/* ── Page Header ── */}
      <header className="page-header sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-gold-royal transition-smooth" />
            <div>
              <h1 className="font-outfit font-bold text-lg sm:text-2xl leading-tight text-foreground">
                {greetIcon} {greeting}, {userName}!
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: "#6B6380" }}>{currentDate}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/add-habit")}
            className="btn-gold w-10 h-10 rounded-full flex items-center justify-center"
          >
            <Plus className="w-5 h-5" style={{ color: "#0A0A0F" }} />
          </button>
        </div>
      </header>

      <motion.div
        className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Hero: Progress Ring + Quote ── */}
        <motion.div variants={itemVariants} className="hero-banner p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <CircularProgress value={progressPct} size={130} />
            <div className="text-center sm:text-left flex-1">
              <p className="font-outfit font-bold text-xl sm:text-2xl text-foreground mb-1">
                {completedToday < totalToday
                  ? `${totalToday - completedToday} habit${totalToday - completedToday > 1 ? "s" : ""} remaining`
                  : totalToday === 0 ? "Add your first habit!"
                    : "🎉 All done for today!"}
              </p>
              <p className="text-sm italic mb-3" style={{ color: "#B8B0CC" }}>
                "{quote.text}"
              </p>
              <p className="text-xs" style={{ color: "#6B6380" }}>— {quote.author}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={Target} label="Total Habits" value={totalToday} color="#4A7BF7" />
          <StatCard icon={TrendingUp} label="Avg Consistency" value={`${avgConsistency}%`} color="#34D399" sub="all habits" />
          <StatCard icon={Flame} label="Best Streak" value={`${maxStreak}d`} color="#FBBF24" sub="days in a row" />
          <StatCard icon={Calendar} label="Today" value={`${completedToday}/${totalToday}`} color="#D4A846" sub="completed" />
        </motion.div>

        {/* ── Today's Habits ── */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-outfit font-bold text-xl text-foreground">Today's Habits</h2>
            <button
              onClick={() => navigate("/habits")}
              className="text-xs font-medium transition-smooth hover:text-gold-royal"
              style={{ color: "#6B6380" }}
            >
              View all →
            </button>
          </div>

          {habits.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: "rgba(28,25,41,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, rgba(212,168,70,0.15), rgba(155,109,255,0.15))" }}
              >
                <Crown className="w-8 h-8 text-gold-royal" />
              </div>
              <h3 className="font-outfit font-bold text-lg text-foreground mb-2">Start your royal journey</h3>
              <p className="text-sm mb-6" style={{ color: "#6B6380" }}>
                Create your first habit and begin building the life you deserve.
              </p>
              <button
                onClick={() => navigate("/add-habit")}
                className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" style={{ color: "#0A0A0F" }} />
                <span style={{ color: "#0A0A0F" }}>Create First Habit</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysHabits.map((habit, i) => {
                const done = habit.currentWeek[todayIndex];
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`habit-row ${done ? "completed" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(habit.id)}
                        className={`habit-check ${done ? "checked" : ""}`}
                      >
                        {done && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>

                      {/* Icon + Text */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-xl flex-shrink-0">{habit.icon || "🎯"}</span>
                        <div className="min-w-0">
                          <p
                            className={`font-medium text-sm truncate transition-smooth ${done ? "line-through opacity-60" : "text-foreground"
                              }`}
                          >
                            {habit.identityStatement || habit.title || habit.name}
                          </p>
                          {habit.identityStatement && (
                            <p className="text-xs truncate" style={{ color: "#6B6380" }}>
                              {habit.title || habit.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Flame className="w-3.5 h-3.5 streak-flame" style={{ color: "#FBBF24" }} />
                        <span className="text-sm font-bold font-mono" style={{ color: "#FBBF24" }}>
                          {habit.streak}
                        </span>
                      </div>
                    </div>

                    {/* Consistency bar */}
                    <div className="mt-2.5 ml-11">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px]" style={{ color: "#6B6380" }}>
                          {Math.round(habit.consistencyScore)}% consistent
                        </span>
                        <span className="text-[10px]" style={{ color: "#6B6380" }}>
                          {habit.frequency}
                        </span>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div
                          className="h-1 rounded-full transition-smooth"
                          style={{
                            width: `${habit.consistencyScore}%`,
                            background: done
                              ? "linear-gradient(90deg, #34D399, #059669)"
                              : "linear-gradient(90deg, #D4A846, #9B6DFF)",
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Level / XP Banner ── */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-4 sm:p-5"
          style={{
            background: "linear-gradient(135deg, rgba(212,168,70,0.08) 0%, rgba(155,109,255,0.08) 100%)",
            border: "1px solid rgba(212,168,70,0.15)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl animate-float">🌱</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-outfit font-semibold text-sm text-gradient-gold">
                  Level 1 — Seed
                </span>
                <span className="text-xs font-mono" style={{ color: "#6B6380" }}>60 XP to next</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: "20%",
                    background: "linear-gradient(90deg, #D4A846, #9B6DFF)",
                    boxShadow: "0 0 8px rgba(212,168,70,0.4)",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}