import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/contexts/HabitContext";

const ICONS = ["🎯", "💪", "📚", "🧘", "💧", "🏃", "🌱", "⭐", "🔥", "✨", "🧠", "🏋️", "🎸", "🍎", "😴"];
const WEEKLY_OPTS = [1, 2, 3, 4, 5, 6, 7];
const CATEGORIES = ["Health", "Productivity", "Mindfulness", "Learning", "Fitness", "Sleep", "Custom"];

export default function AddHabit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addHabit } = useHabits();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      toast({ variant: "destructive", title: "Not authenticated", description: "Please log in first." });
      navigate("/login", { replace: true });
    }
  }, [navigate, toast]);

  const [form, setForm] = useState({
    title: "",
    identity_statement: "",
    description: "",
    weeklyGoal: 5,
    startDate: new Date().toISOString().split("T")[0],
    tags: [] as string[],
    icon: "🎯",
    category: "Health",
  });
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm((p) => ({ ...p, tags: [...p.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (t: string) => setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addHabit({
        name: form.title,
        identity_statement: form.identity_statement,
        description: form.description,
        frequency: form.weeklyGoal.toString(),
        icon: form.icon,
        weekly_goal: form.weeklyGoal,
        tags: form.tags,
      });
      toast({ title: "Habit created! 👑", description: "Your royal habit has been added." });
      navigate("/habits");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(10,10,15,0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "0.625rem",
    color: "#F5F0FF",
    outline: "none",
    transition: "all 0.2s ease",
    padding: "0 1rem",
    height: "2.75rem",
    width: "100%",
    fontSize: "0.875rem",
  } as const;

  const labelStyle = { color: "#B8B0CC", fontSize: "0.8125rem", fontWeight: 500 } as const;
  const hintStyle = { color: "#6B6380", fontSize: "0.75rem" } as const;

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(212,168,70,0.5)";
    e.target.style.boxShadow = "0 0 0 3px rgba(212,168,70,0.1)";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.08)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="min-h-screen bg-obsidian-night">
      {/* ── Header ── */}
      <header className="page-header sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-gold-royal transition-smooth" />
            <div>
              <h1 className="font-outfit font-bold text-lg sm:text-2xl text-foreground">Create New Habit</h1>
              <p className="text-xs sm:text-sm" style={{ color: "#6B6380" }}>Define and track your path to royalty</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/habits")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-smooth hover:bg-white/5"
            style={{ color: "#6B6380", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 pb-mobile md:pb-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(28,25,41,0.95) 0%, rgba(19,17,28,0.95) 100%)",
            border: "1px solid rgba(212,168,70,0.1)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          {/* Card hero */}
          <div
            className="px-6 py-5 flex items-center gap-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(212,168,70,0.04)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(212,168,70,0.2), rgba(155,109,255,0.2))" }}
            >
              <Crown className="w-5 h-5 text-gold-royal" />
            </div>
            <div>
              <h2 className="font-outfit font-semibold text-foreground">Habit Details</h2>
              <p style={hintStyle}>Fill in the details to create your royal habit</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
            {/* Icon picker */}
            <div className="space-y-2">
              <label style={labelStyle}>Choose Icon</label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map((icon) => (
                  <button
                    type="button"
                    key={icon}
                    onClick={() => set("icon", icon)}
                    className="text-xl w-11 h-11 rounded-xl transition-bounce hover:scale-110 flex items-center justify-center"
                    style={{
                      background: form.icon === icon ? "rgba(212,168,70,0.15)" : "rgba(255,255,255,0.04)",
                      border: form.icon === icon ? "1px solid rgba(212,168,70,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label style={labelStyle}>Habit Title *</label>
              <input
                type="text"
                placeholder="e.g., Exercise for 30 minutes"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                onFocus={focusStyle}
                onBlur={blurStyle}
                required
                style={inputStyle}
              />
            </div>

            {/* Identity Statement */}
            <div className="space-y-1.5">
              <label style={labelStyle}>Identity Statement</label>
              <input
                type="text"
                placeholder='e.g., "I am an athlete"'
                value={form.identity_statement}
                onChange={(e) => set("identity_statement", e.target.value)}
                onFocus={focusStyle}
                onBlur={blurStyle}
                style={inputStyle}
              />
              <p style={hintStyle}>Frame your habit as who you want to become</p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label style={labelStyle}>Description</label>
              <textarea
                placeholder="Describe your habit in detail..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                onFocus={focusStyle as any}
                onBlur={blurStyle as any}
                rows={3}
                style={{
                  ...inputStyle,
                  height: "auto",
                  padding: "0.75rem 1rem",
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label style={labelStyle}>Category</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => set("category", cat)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth"
                    style={
                      form.category === cat
                        ? { background: "rgba(155,109,255,0.15)", color: "#9B6DFF", border: "1px solid rgba(155,109,255,0.3)" }
                        : { background: "rgba(255,255,255,0.04)", color: "#6B6380", border: "1px solid rgba(255,255,255,0.06)" }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Goal */}
            <div className="space-y-2">
              <label style={labelStyle}>Weekly Goal *</label>
              <div className="flex gap-2">
                {WEEKLY_OPTS.map((days) => (
                  <button
                    type="button"
                    key={days}
                    onClick={() => set("weeklyGoal", days)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-bounce hover:scale-105"
                    style={
                      form.weeklyGoal === days
                        ? { background: "rgba(212,168,70,0.15)", color: "#D4A846", border: "1px solid rgba(212,168,70,0.35)", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }
                        : { background: "rgba(255,255,255,0.04)", color: "#6B6380", border: "1px solid rgba(255,255,255,0.06)" }
                    }
                  >
                    {days}
                  </button>
                ))}
              </div>
              <p style={hintStyle}>Days per week — currently: {form.weeklyGoal} day{form.weeklyGoal > 1 ? "s" : ""}</p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label style={labelStyle}>Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-smooth disabled:opacity-40"
                  style={{ background: "rgba(255,255,255,0.07)", color: "#B8B0CC", border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}
                >
                  Add
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {form.tags.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => removeTag(tag)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-smooth hover:opacity-70"
                      style={{ background: "rgba(155,109,255,0.15)", color: "#9B6DFF", border: "1px solid rgba(155,109,255,0.25)" }}
                    >
                      {tag}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !form.title.trim()}
                className="btn-gold flex-1 h-12 rounded-xl font-outfit font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: "#0A0A0F" }}
              >
                <Sparkles className="w-4 h-4" />
                {loading ? "Creating..." : "Create Royal Habit"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/habits")}
                className="flex-1 sm:flex-none h-12 px-6 rounded-xl font-medium text-sm transition-smooth hover:bg-white/5"
                style={{
                  color: "#6B6380",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}