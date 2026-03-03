import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Crown, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { register as apiRegister } from "@/lib/api";
import { motion } from "framer-motion";

export default function Signup() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ variant: "destructive", title: "Passwords don't match", description: "Please check your passwords." });
      return;
    }
    setLoading(true);
    try {
      await apiRegister(form.email, form.password);
      toast({ title: "Account created! 👑", description: "You can now sign in." });
      navigate("/login");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Signup failed", description: err.message || "Could not create account." });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(10,10,15,0.8)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "0.625rem", color: "#F5F0FF", outline: "none",
    transition: "all 0.2s ease", width: "100%", height: "2.75rem",
    padding: "0 1rem 0 2.75rem", fontSize: "0.875rem",
  } as const;

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(212,168,70,0.5)";
    e.target.style.boxShadow = "0 0 0 3px rgba(212,168,70,0.12)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.08)";
    e.target.style.boxShadow = "none";
  };

  const fields = [
    { key: "fullName", label: "Full Name", icon: User, type: "text", ph: "Your full name" },
    { key: "email", label: "Email", icon: Mail, type: "email", ph: "your@email.com" },
    { key: "password", label: "Password", icon: Lock, type: showPwd ? "text" : "password", ph: "Create a password" },
    { key: "confirm", label: "Confirm Password", icon: Lock, type: "password", ph: "Repeat password" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#0A0A0F" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(155,109,255,0.10) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(212,168,70,0.07) 0%, transparent 60%)",
      }} />
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: "radial-gradient(circle, rgba(155,109,255,0.12) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-2xl p-8" style={{
          background: "linear-gradient(135deg, rgba(28,25,41,0.95) 0%, rgba(19,17,28,0.95) 100%)",
          border: "1px solid rgba(155,109,255,0.15)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 48px rgba(155,109,255,0.05)",
        }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{
              background: "linear-gradient(135deg, #9B6DFF 0%, #D4A846 100%)",
            }}>
              <Crown className="w-8 h-8" style={{ color: "#0A0A0F" }} />
            </div>
            <h1 className="font-outfit font-bold text-2xl mb-1" style={{
              background: "linear-gradient(135deg, #9B6DFF, #D4A846)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Join HabitFlow
            </h1>
            <p className="text-sm" style={{ color: "#6B6380" }}>Start your royal habit journey today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {fields.map(({ key, label, icon: Icon, type, ph }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: "#B8B0CC" }}>{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6B6380" }} />
                  <input
                    type={type}
                    placeholder={ph}
                    value={(form as any)[key]}
                    onChange={(e) => set(key, e.target.value)}
                    required
                    onFocus={onFocus}
                    onBlur={onBlur}
                    style={{
                      ...inputStyle,
                      paddingRight: key === "password" ? "3rem" : "1rem",
                    }}
                  />
                  {key === "password" && (
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-smooth hover:text-gold-royal"
                      style={{ color: "#6B6380" }}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="btn-gold w-full h-11 rounded-xl font-outfit font-semibold text-sm disabled:opacity-60"
                style={{ color: "#0A0A0F" }}
              >
                {loading ? "Creating account..." : "✨ Create Account"}
              </button>
            </div>

            <p className="text-sm text-center" style={{ color: "#6B6380" }}>
              Already have an account?{" "}
              <Link to="/login" className="font-medium transition-smooth hover:underline" style={{ color: "#D4A846" }}>
                Sign in
              </Link>
            </p>
          </form>
        </div>
        <p className="text-center text-xs mt-6" style={{ color: "#4A4060" }}>
          🏆 Join thousands building royal habits daily
        </p>
      </motion.div>
    </div>
  );
}