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
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="hsl(var(--muted)/0.3)"
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
          className="transition-all duration-1000 ease-in-out"
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary)/0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-outfit font-bold text-gradient-gold" style={{ fontSize: size > 100 ? "1.5rem" : "1.1rem" }}>
          {value}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">today</span>
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
      className="stat-card bg-card border border-border/50 hover:border-primary/30 group"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="font-outfit font-bold text-2xl sm:text-3xl" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] mt-1 font-medium text-muted-foreground">{sub}</p>}
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ── Page Header ── */}
      <header className="page-header sticky top-0 z-40 bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-primary transition-smooth" />
            <div>
              <h1 className="font-outfit font-bold text-lg sm:text-2xl leading-tight text-foreground">
                {greetIcon} {greeting}, {userName}!
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{currentDate}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/add-habit")}
            className="btn-gold w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
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
        <motion.div variants={itemVariants} className="hero-banner p-6 sm:p-8 bg-card border-border/50 shadow-md">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <CircularProgress value={progressPct} size={140} />
            <div className="text-center sm:text-left flex-1">
              <p className="font-outfit font-bold text-xl sm:text-3xl mb-2">
                {completedToday < totalToday
                  ? `${totalToday - completedToday} habit${totalToday - completedToday > 1 ? "s" : ""} remaining`
                  : totalToday === 0 ? "Add your first habit!"
                    : "🎉 All done for today!"}
              </p>
              <p className="text-base italic mb-4 text-muted-foreground leading-relaxed">
                "{quote.text}"
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">— {quote.author}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Total Habits" value={totalToday} color="hsl(var(--info))" />
          <StatCard icon={TrendingUp} label="Avg Consistency" value={`${avgConsistency}%`} color="hsl(var(--success))" sub="all habits" />
          <StatCard icon={Flame} label="Best Streak" value={`${maxStreak}d`} color="hsl(var(--warning))" sub="days in a row" />
          <StatCard icon={Calendar} label="Today" value={`${completedToday}/${totalToday}`} color="hsl(var(--primary))" sub="completed" />
        </motion.div>

        {/* ── Today's Habits ── */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-outfit font-bold text-xl">Today's Habits</h2>
            <button
              onClick={() => navigate("/habits")}
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
            >
              View all →
            </button>
          </div>

          {habits.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center bg-card border border-border/50 shadow-sm"
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-gold"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.15), hsl(var(--accent)/0.15))" }}
              >
                <Crown className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-outfit font-bold text-xl mb-2">Start your royal journey</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
                Create your first habit and begin building the life you deserve. Consistency is key.
              </p>
              <button
                onClick={() => navigate("/add-habit")}
                className="btn-gold px-8 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-primary-foreground" />
                <span>Create First Habit</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysHabits.map((habit, i) => {
                const done = habit.currentWeek[todayIndex];
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`habit-row bg-card border border-border/50 hover:border-primary/30 group ${done ? "completed opacity-70" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(habit.id)}
                        className={`habit-check ${done ? "checked" : ""}`}
                      >
                        {done && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>

                      {/* Icon + Text */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{habit.icon || "🎯"}</span>
                        <div className="min-w-0">
                          <p
                            className={`font-semibold text-sm truncate transition-all ${done ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                          >
                            {habit.identityStatement || habit.title || habit.name}
                          </p>
                          {(habit.identityStatement || habit.title || habit.name) !== (habit.title || habit.name) && (
                            <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                              {habit.title || habit.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 bg-warning/10 px-2 py-1 rounded-full border border-warning/20">
                        <Flame className="w-3.5 h-3.5 streak-flame text-warning" />
                        <span className="text-xs font-bold font-mono text-warning">
                          {habit.streak}
                        </span>
                      </div>
                    </div>

                    {/* Consistency bar */}
                    <div className="mt-4 ml-12">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {Math.round(habit.consistencyScore)}% consistent
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {habit.frequency}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${habit.consistencyScore}%`,
                            background: done
                              ? "linear-gradient(90deg, hsl(var(--success)), #059669)"
                              : "var(--gradient-gold)",
                            boxShadow: !done ? "0 0 8px hsl(var(--primary)/0.3)" : "none"
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
          className="rounded-2xl p-5 sm:p-6 border border-primary/20 shadow-sm"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)/0.08) 0%, hsl(var(--accent)/0.08) 100%)",
          }}
        >
          <div className="flex items-center gap-6">
            <div className="text-4xl animate-float">🌱</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-outfit font-bold text-base text-gradient-gold">
                  Level 1 — Seed
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">60 XP to next level</span>
              </div>
              <div className="h-3 rounded-full bg-muted/30 overflow-hidden border border-border/30">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: "20%",
                    background: "var(--gradient-gold)",
                    boxShadow: "0 0 12px hsl(var(--primary)/0.4)",
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