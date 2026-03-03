import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Crown, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { login as apiLogin } from "@/lib/api";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/", { replace: true });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      localStorage.setItem("token", res.access_token);
      toast({ title: "Welcome back! 👑", description: "Signed in successfully." });
      navigate("/");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login failed", description: err.message || "Invalid credentials." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#0A0A0F" }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(212,168,70,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(155,109,255,0.08) 0%, transparent 60%)",
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(212,168,70,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "linear-gradient(135deg, rgba(28,25,41,0.95) 0%, rgba(19,17,28,0.95) 100%)",
            border: "1px solid rgba(212,168,70,0.15)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 48px rgba(212,168,70,0.06)",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #D4A846 0%, #9B6DFF 100%)" }}
            >
              <Crown className="w-8 h-8" style={{ color: "#0A0A0F" }} />
            </div>
            <h1 className="font-outfit font-bold text-2xl text-gradient-gold mb-1">
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "#6B6380" }}>
              Sign in to continue your royal journey
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "#B8B0CC" }}>
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#6B6380" }}
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="royal-input w-full h-11 pl-10 pr-4 text-sm"
                  style={{
                    background: "rgba(10,10,15,0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.625rem",
                    color: "#F5F0FF",
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(212,168,70,0.5)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(212,168,70,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "#B8B0CC" }}>
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#6B6380" }}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="royal-input w-full h-11 pl-10 pr-12 text-sm"
                  style={{
                    background: "rgba(10,10,15,0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.625rem",
                    color: "#F5F0FF",
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(212,168,70,0.5)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(212,168,70,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-smooth hover:text-gold-royal"
                  style={{ color: "#6B6380" }}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm transition-smooth hover:text-gold-royal"
                style={{ color: "#6B6380" }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full h-11 rounded-xl font-outfit font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ color: "#0A0A0F" }}
            >
              {loading ? "Signing in..." : "✨ Sign In"}
            </button>

            {/* Divider */}
            <p className="text-sm text-center" style={{ color: "#6B6380" }}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium transition-smooth hover:underline"
                style={{ color: "#D4A846" }}
              >
                Create account
              </Link>
            </p>
          </form>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-xs mt-6" style={{ color: "#4A4060" }}>
          🏆 Join thousands building royal habits daily
        </p>
      </motion.div>
    </div>
  );
}