import { useState, useEffect } from "react";
import { X, Save, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/contexts/HabitContext";

interface EditHabitDialogProps {
  habitId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ICONS = ["🎯", "💪", "📚", "🧘", "💧", "🏃", "🌱", "⭐", "🔥", "✨", "🧠", "🏋️"];
const WEEKLY_OPTS = [1, 2, 3, 4, 5, 6, 7];

export default function EditHabitDialog({ habitId, open, onOpenChange }: EditHabitDialogProps) {
  const { toast } = useToast();
  const { getHabitById, updateHabit } = useHabits();

  const [form, setForm] = useState({
    title: "",
    identity_statement: "",
    description: "",
    weeklyGoal: 5,
    tags: [] as string[],
    icon: "🎯",
  });
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habitId && open) {
      const habit = getHabitById(habitId);
      if (habit) {
        setForm({
          title: habit.title,
          identity_statement: habit.identityStatement || "",
          description: habit.description || "",
          weeklyGoal: habit.weeklyGoal,
          tags: habit.tags || [],
          icon: habit.icon || "🎯",
        });
      }
    }
  }, [habitId, open, getHabitById]);

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
    if (!habitId) return;
    setLoading(true);
    updateHabit(habitId, {
      title: form.title,
      name: form.title,
      identity_statement: form.identity_statement,
      description: form.description,
      weekly_goal: form.weeklyGoal,
      tags: form.tags,
      icon: form.icon,
    });
    setTimeout(() => {
      toast({ title: "Habit updated! ✨", description: "Your changes have been saved." });
      onOpenChange(false);
      setLoading(false);
    }, 500);
  };

  const inputStyle = {
    background: "rgba(10,10,15,0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "0.625rem",
    color: "#F5F0FF",
    outline: "none",
    transition: "all 0.2s ease",
    width: "100%",
    height: "2.75rem",
    padding: "0 1rem",
    fontSize: "0.875rem",
  } as const;

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(212,168,70,0.5)";
    e.target.style.boxShadow = "0 0 0 3px rgba(212,168,70,0.1)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.08)";
    e.target.style.boxShadow = "none";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[92vh] overflow-y-auto p-0 gap-0"
        style={{
          background: "linear-gradient(135deg, #1C1929 0%, #13111C 100%)",
          border: "1px solid rgba(212,168,70,0.15)",
          borderRadius: "1.25rem",
        }}
      >
        <DialogHeader
          className="px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <DialogTitle className="flex items-center gap-3 font-outfit font-bold text-lg" style={{ color: "#F5F0FF" }}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(212,168,70,0.2), rgba(155,109,255,0.2))" }}
            >
              <Crown className="w-5 h-5" style={{ color: "#D4A846" }} />
            </div>
            Edit Habit
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Icon picker */}
          <div className="space-y-2">
            <label className="text-xs font-medium" style={{ color: "#B8B0CC" }}>Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => set("icon", icon)}
                  className="text-xl w-10 h-10 rounded-xl transition-bounce hover:scale-110 flex items-center justify-center"
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
            <label className="text-xs font-medium" style={{ color: "#B8B0CC" }}>Habit Title *</label>
            <input
              type="text"
              placeholder="e.g., Exercise for 30 minutes"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              onFocus={onFocus} onBlur={onBlur}
              required
              style={inputStyle}
            />
          </div>

          {/* Identity statement */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "#B8B0CC" }}>Identity Statement</label>
            <input
              type="text"
              placeholder='"I am an athlete"'
              value={form.identity_statement}
              onChange={(e) => set("identity_statement", e.target.value)}
              onFocus={onFocus} onBlur={onBlur}
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "#B8B0CC" }}>Description</label>
            <textarea
              placeholder="Describe your habit..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              onFocus={onFocus as any} onBlur={onBlur as any}
              rows={3}
              style={{ ...inputStyle, height: "auto", padding: "0.75rem 1rem", resize: "vertical" }}
            />
          </div>

          {/* Weekly goal */}
          <div className="space-y-2">
            <label className="text-xs font-medium" style={{ color: "#B8B0CC" }}>Weekly Goal</label>
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
            <p className="text-xs" style={{ color: "#6B6380" }}>{form.weeklyGoal} day{form.weeklyGoal > 1 ? "s" : ""} per week</p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-medium" style={{ color: "#B8B0CC" }}>Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                onFocus={onFocus} onBlur={onBlur}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button" onClick={addTag} disabled={!newTag.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-smooth disabled:opacity-40"
                style={{ background: "rgba(255,255,255,0.07)", color: "#B8B0CC", border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}
              >
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {form.tags.map((tag) => (
                  <button
                    type="button" key={tag} onClick={() => removeTag(tag)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-smooth hover:opacity-70"
                    style={{ background: "rgba(155,109,255,0.15)", color: "#9B6DFF", border: "1px solid rgba(155,109,255,0.25)" }}
                  >
                    {tag} <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem" }}>
            <button
              type="submit"
              disabled={loading || !form.title.trim()}
              className="btn-gold flex-1 h-11 rounded-xl font-outfit font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: "#0A0A0F" }}
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 h-11 rounded-xl text-sm font-medium transition-smooth hover:bg-white/5"
              style={{ color: "#6B6380", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}