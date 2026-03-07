import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User, Mail, Lock, LogOut, Crown, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, updateUserProfile, uploadProfilePhoto } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { motion } from "framer-motion";

const cardStyle = {
  background: "var(--gradient-surface)",
  border: "1px solid var(--border)",
  borderRadius: "1rem",
  padding: "1.5rem",
} as const;

const inputStyle = {
  background: "hsl(var(--input))",
  border: "1px solid var(--border)",
  borderRadius: "0.625rem",
  color: "hsl(var(--foreground))",
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
  const { user, refetch } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({ fullName: "", email: "", joinDate: "", totalHabits: 0, completedSessions: 0, photoUrl: "" });
  const [pwData, setPwData] = useState({ current: "", next: "", confirm: "" });
  const [editing, setEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.name || "Demo User",
        email: user.email || "",
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "",
        totalHabits: (user as any).total_habits || 0,
        completedSessions: (user as any).completed_sessions || 0,
        photoUrl: user.profile_photo_url || "",
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      const r = await updateUserProfile({ name: profile.fullName });
      toast({ title: "Profile updated! 👑" });
      setEditing(false);
      refetch();
    } catch {
      toast({ variant: "destructive", title: "Update failed" });
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Only images are allowed" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ variant: "destructive", title: "Image size must be less than 5MB" });
      return;
    }

    try {
      setIsUploading(true);
      await uploadProfilePhoto(file);
      toast({ title: "Photo uploaded! 📸" });
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast({ title: "Signed out", description: "See you soon!" });
    setTimeout(() => navigate("/login"), 800);
  };

  const initials = profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--primary)";
    e.target.style.boxShadow = "0 0 0 3px rgba(212,168,70,0.1)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="page-header sticky top-0 z-40 bg-background/80 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4">
          <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-primary transition-smooth" />
          <div>
            <h1 className="font-outfit font-bold text-lg sm:text-2xl text-foreground">Account</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage your profile and settings</p>
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
        <div style={cardStyle} className="bg-card">
          <div className="flex items-center gap-3 mb-5 border-b border-border pb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="font-outfit font-semibold text-foreground">Profile Information</h2>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-outfit font-bold overflow-hidden"
                style={{ background: "linear-gradient(135deg, var(--primary) 0%, #9B6DFF 100%)", color: "white" }}
              >
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <button
                onClick={handlePhotoClick}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-smooth hover:scale-110 active:scale-95 bg-card border border-primary text-primary shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div>
              <h3 className="font-outfit font-semibold text-lg text-foreground">{profile.fullName || "—"}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              {profile.joinDate && (
                <p className="text-xs mt-0.5 text-muted-foreground">Member since {profile.joinDate}</p>
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