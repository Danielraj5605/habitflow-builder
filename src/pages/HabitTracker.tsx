import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Flame, Target, CheckCircle2, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/contexts/HabitContext";
import EditHabitDialog from "@/components/EditHabitDialog";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FILTERS = ["all", "active", "completed", "archived"] as const;
type Filter = typeof FILTERS[number];

export default function HabitTracker() {
  const navigate = useNavigate();
  const { habits, toggleHabitDay, deleteHabit } = useHabits();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = () => {
    if (deletingId) {
      deleteHabit(deletingId);
      toast({ title: "Habit removed", description: "The habit has been deleted." });
      setDeletingId(null);
    }
  };

  const filtered = habits.filter((h) => {
    const matchSearch =
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      (h.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
    switch (filter) {
      case "active": return matchSearch && h.isActive;
      case "completed": return matchSearch && h.currentWeek.filter(Boolean).length >= h.weeklyGoal;
      case "archived": return matchSearch && !h.isActive;
      default: return matchSearch;
    }
  });

  return (
    <div className="min-h-screen bg-obsidian-night">
      {/* ── Header ── */}
      <header className="page-header sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-gold-royal transition-smooth" />
            <div>
              <h1 className="font-outfit font-bold text-lg sm:text-2xl text-foreground">Habit Tracker</h1>
              <p className="text-xs sm:text-sm" style={{ color: "#6B6380" }}>Monitor progress and build consistency</p>
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

      <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
        {/* ── Search & Filter Bar ── */}
        <div
          className="rounded-xl p-4"
          style={{ background: "rgba(28,25,41,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6B6380" }} />
              <input
                type="text"
                placeholder="Search habits or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-sm rounded-lg"
                style={{
                  background: "rgba(10,10,15,0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#F5F0FF",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(212,168,70,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-smooth"
                  style={
                    filter === f
                      ? { background: "rgba(212,168,70,0.15)", color: "#D4A846", border: "1px solid rgba(212,168,70,0.3)" }
                      : { background: "rgba(255,255,255,0.05)", color: "#6B6380", border: "1px solid rgba(255,255,255,0.06)" }
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Habit Cards ── */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-2xl p-10 text-center"
              style={{ background: "rgba(28,25,41,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Crown className="w-12 h-12 mx-auto mb-4 text-gold-royal opacity-50" />
              <h3 className="font-outfit font-bold text-lg text-foreground mb-2">
                {search ? "No habits found" : "No habits yet"}
              </h3>
              <p className="text-sm mb-6" style={{ color: "#6B6380" }}>
                {search ? "Try a different search" : "Start building royal habits today"}
              </p>
              <button
                onClick={() => navigate("/add-habit")}
                className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" style={{ color: "#0A0A0F" }} />
                <span style={{ color: "#0A0A0F" }}>Add Habit</span>
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filtered.map((habit, idx) => {
                const completedDays = habit.currentWeek.filter(Boolean).length;
                const pct = Math.round((completedDays / Math.max(habit.weeklyGoal, 1)) * 100);

                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.06 }}
                    className="rounded-2xl overflow-hidden transition-smooth group"
                    style={{
                      background: "linear-gradient(135deg, rgba(28,25,41,0.95) 0%, rgba(19,17,28,0.95) 100%)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(212,168,70,0.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                  >
                    {/* Card Header */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0 mt-0.5">{habit.icon || "🎯"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-outfit font-semibold text-base text-foreground truncate">
                                {habit.identityStatement || habit.title || habit.name}
                              </h3>
                              {habit.identityStatement && (
                                <p className="text-xs italic truncate mt-0.5" style={{ color: "#6B6380" }}>
                                  {habit.title || habit.name}
                                </p>
                              )}
                              {habit.description && (
                                <p className="text-xs mt-1 line-clamp-2" style={{ color: "#B8B0CC" }}>
                                  {habit.description}
                                </p>
                              )}
                            </div>
                            {/* Actions */}
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => setEditingId(habit.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-smooth hover:bg-white/5"
                                style={{ color: "#6B6380" }}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingId(habit.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-smooth hover:bg-red-500/10"
                                style={{ color: "#6B6380" }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Tags */}
                          {habit.tags && habit.tags.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {habit.tags.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                  style={{ background: "rgba(155,109,255,0.15)", color: "#9B6DFF" }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 streak-flame" style={{ color: "#FBBF24" }} />
                          <span className="text-sm font-bold font-mono" style={{ color: "#FBBF24" }}>{habit.streak}d</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" style={{ color: "#4A7BF7" }} />
                          <span className="text-sm font-bold font-mono" style={{ color: "#4A7BF7" }}>{Math.round(habit.consistencyScore)}%</span>
                        </div>
                        <div className="flex-1 ml-auto">
                          {/* Progress bar */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                              <div
                                className="h-1.5 rounded-full transition-smooth"
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                  background: pct >= 100
                                    ? "linear-gradient(90deg, #34D399, #059669)"
                                    : "linear-gradient(90deg, #D4A846, #9B6DFF)",
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono flex-shrink-0" style={{ color: "#6B6380" }}>
                              {completedDays}/{habit.weeklyGoal}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Week toggle grid */}
                    <div
                      className="px-4 sm:px-5 pb-4 sm:pb-5"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <p className="text-[10px] uppercase tracking-wider mb-2.5 mt-3" style={{ color: "#6B6380" }}>
                        This Week
                      </p>
                      <div className="grid grid-cols-7 gap-1.5">
                        {DAYS.map((day, i) => {
                          const done = habit.currentWeek[i];
                          return (
                            <div key={day} className="text-center">
                              <p className="text-[9px] mb-1.5" style={{ color: "#6B6380" }}>{day}</p>
                              <button
                                className={`day-toggle ${done ? "active" : ""}`}
                                onClick={() => toggleHabitDay(habit.id, i)}
                              >
                                {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit dialog */}
      <EditHabitDialog
        habitId={editingId}
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent
          style={{
            background: "linear-gradient(135deg, #1C1929, #13111C)",
            border: "1px solid rgba(248,113,113,0.2)",
            color: "#F5F0FF",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-outfit" style={{ color: "#F5F0FF" }}>Delete Habit?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: "#6B6380" }}>
              This action cannot be undone. Your streak data will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#B8B0CC",
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              style={{
                background: "rgba(248,113,113,0.15)",
                border: "1px solid rgba(248,113,113,0.3)",
                color: "#F87171",
              }}
            >
              Delete Habit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}