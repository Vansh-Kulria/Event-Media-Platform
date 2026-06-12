"use client";

import { useState } from "react";
import { register } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailError("");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const checkPasswordStrength = (val: string) => {
    setPassword(val);
    if (!val) {
      setPasswordStrength("");
      return;
    }
    if (val.length < 6) {
      setPasswordStrength("Weak (Must be at least 6 characters)");
    } else {
      const hasLetters = /[a-zA-Z]/.test(val);
      const hasNumbers = /[0-9]/.test(val);
      if (hasLetters && hasNumbers) {
        setPasswordStrength("Strong");
      } else {
        setPasswordStrength("Medium (Try adding letters & numbers)");
      }
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.startsWith("Weak")) return "text-red-400";
    if (passwordStrength.startsWith("Medium")) return "text-yellow-400";
    if (passwordStrength === "Strong") return "text-emerald-400";
    return "text-slate-400";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all fields");
      toast.warning("Please fill out all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setError("");
    try {
      setLoading(true);
      await register(name, email, password, role);
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background blobs for premium glassmorphic effect */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <h2 className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-3xl font-extrabold text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Join the Event Media Platform
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center text-sm text-red-400 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <div className="relative mt-1.5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-3 py-3 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:bg-white/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => validateEmail(e.target.value)}
                  placeholder="john@example.com"
                  className={`w-full rounded-xl border bg-white/5 pl-11 pr-3 py-3 text-white placeholder-slate-500 outline-none transition focus:bg-white/10 ${
                    emailError
                      ? "border-red-500/50 focus:border-red-500"
                      : email && !emailError
                      ? "border-emerald-500/50 focus:border-emerald-500"
                      : "border-white/10 focus:border-violet-500"
                  }`}
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative mt-1.5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => checkPasswordStrength(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-10 py-3 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:bg-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordStrength && (
                <p className={`mt-1.5 text-[11px] font-bold tracking-wide transition-colors duration-200 ${getPasswordStrengthColor()}`}>
                  Password strength: {passwordStrength}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Register As
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition focus:border-violet-500 focus:bg-white/10 [&>option]:bg-slate-900"
              >
                <option value="VIEWER">Viewer (Public Only)</option>
                <option value="MEMBER">Club Member (Full Access)</option>
                <option value="PHOTOGRAPHER">Photographer (Upload + Manage)</option>
                <option value="ADMIN">Admin (Organizer)</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-3 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 focus:outline-none disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-950/20"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>

          <div className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}