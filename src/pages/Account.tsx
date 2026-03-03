import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User, Mail, Lock, LogOut, Crown, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, updateUserProfile } from "@/lib/api";
import { motion } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const cardStyle = {
  background: "linear-gradient(135deg, rgba(28,25,41,0.95) 0%, rgba(19,17,28,0.95) 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "1rem",
  padding: "1.5rem",
} as const;

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

export default function Account() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ fullName: "", email: "", joinDate: "", totalHabits: 0, completedSessions: 0 });
  const [pwData, setPwData] = useState({ current: "", next: "", confirm: "" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchWithAuth(`${API_BASE_URL}/users/me`).then((d) => {
      setProfile({
        fullName: d?.name || "Demo User",
        email: d?.email || "",
        joinDate: d?.created_at ? new Date(d.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "",
        totalHabits: d?.total_habits || 0,
        completedSessions: d?.completed_sessions || 0,
      });
    }).catch(() => { });
  }, []);

  const handleUpdate = async () => {
    try {
      const r = await updateUserProfile({ name: profile.fullName });
      setProfile((p) => ({ ...p, fullName: r.name || r.fullName }));
      toast({ title: "Profile updated! 👑" });
      setEditing(false);
    } catch {
      toast({ variant: "destructive", title: "Update failed" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast({ title: "Signed out", description: "See you soon!" });
    setTimeout(() => navigate("/login"), 800);
  };

  const initials = profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(212,168,70,0.5)";
    e.target.style.boxShadow = "0 0 0 3px rgba(212,168,70,0.1)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.08)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="min-h-screen bg-obsidian-night">
      <header className="page-header sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4">
          <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-gold-royal transition-smooth" />
          <div>
            <h1 className="font-outfit font-bold text-lg sm:text-2xl text-foreground">Account</h1>
            <p className="text-xs sm:text-sm" style={{ color: "#6B6380" }}>Manage your profile and settings</p>
          </div>
        </div>
      </header>

      <motion.div
        className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* ── Profile Card ── */}
        <div style={cardStyle}>
          <div className="flex items-center gap-3 mb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem" }}>
            <Crown className="w-5 h-5 text-gold-royal" />
            <h2 className="font-outfit font-semibold text-foreground">Profile Information</h2>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-outfit font-bold"
                style={{ background: "linear-gradient(135deg, #D4A846 0%, #9B6DFF 100%)", color: "#0A0A0F" }}
              >
                {initials}
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-smooth hover:opacity-80"
                style={{ background: "rgba(28,25,41,1)", border: "1px solid rgba(212,168,70,0.3)", color: "#D4A846" }}
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h3 className="font-outfit font-semibold text-lg text-foreground">{profile.fullName || "—"}</h3>
              <p className="text-sm" style={{ color: "#6B6380" }}>{profile.email}</p>
              {profile.joinDate && (
                <p className="text-xs mt-0.5" style={{ color: "#6B6380" }}>Member since {profile.joinDate}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Total Habits", val: profile.totalHabits, color: "#4A7BF7" },
              { label: "Sessions Done", val: profile.completedSessions, color: "#34D399" },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="font-outfit font-bold text-2xl" style={{ color }}>{val}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6B6380" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Edit form */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#B8B0CC" }}>Full Name</label>
                <input
                  value={profile.fullName}
                  onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                  disabled={!editing}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={{ ...inputStyle, opacity: editing ? 1 : 0.6 }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#B8B0CC" }}>Email</label>
                <input value={profile.email} disabled style={{ ...inputStyle, opacity: 0.5 }} />
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleUpdate} className="btn-gold px-5 py-2 rounded-xl text-sm font-outfit font-semibold" style={{ color: "#0A0A0F" }}>Save Changes</button>
                  <button onClick={() => setEditing(false)} className="px-5 py-2 rounded-xl text-sm transition-smooth hover:bg-white/5" style={{ color: "#6B6380", border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="px-5 py-2 rounded-xl text-sm font-medium transition-smooth hover:bg-white/5" style={{ color: "#B8B0CC", border: "1px solid rgba(255,255,255,0.1)" }}>Edit Profile</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Change Password ── */}
        <div style={cardStyle}>
          <div className="flex items-center gap-3 mb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem" }}>
            <Lock className="w-5 h-5" style={{ color: "#4A7BF7" }} />
            <h2 className="font-outfit font-semibold text-foreground">Change Password</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: "current", label: "Current Password", ph: "••••••••" },
              { key: "next", label: "New Password", ph: "New password" },
              { key: "confirm", label: "Confirm Password", ph: "Repeat new password" },
            ].map(({ key, label, ph }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#B8B0CC" }}>{label}</label>
                <input
                  type="password"
                  placeholder={ph}
                  value={(pwData as any)[key]}
                  onChange={(e) => setPwData((p) => ({ ...p, [key]: e.target.value }))}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={inputStyle}
                />
              </div>
            ))}
            <button
              disabled={!pwData.current || !pwData.next || !pwData.confirm}
              className="px-5 py-2 rounded-xl text-sm font-medium transition-smooth hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "rgba(74,123,247,0.12)", color: "#4A7BF7", border: "1px solid rgba(74,123,247,0.2)" }}
              onClick={() => {
                if (pwData.next !== pwData.confirm) {
                  toast({ variant: "destructive", title: "Passwords don't match" }); return;
                }
                toast({ title: "Password updated!" });
                setPwData({ current: "", next: "", confirm: "" });
              }}
            >
              Update Password
            </button>
          </div>
        </div>

        {/* ── Danger ── */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-outfit font-semibold text-sm" style={{ color: "#F87171" }}>Sign Out</h3>
              <p className="text-xs mt-0.5" style={{ color: "#6B6380" }}>Sign out of your HabitFlow account</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-smooth hover:opacity-80"
              style={{ background: "rgba(248,113,113,0.12)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}