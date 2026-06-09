"use client";

import { useState } from "react";
import { register } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all fields");
      toast.warning("Please fill out all fields");
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

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <h2 className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-3xl font-extrabold text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Join the Event Media Platform
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Register As
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white outline-none transition focus:border-violet-500 focus:bg-white/10 [&>option]:bg-slate-900"
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
              className="relative flex w-full justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 p-3 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 focus:outline-none disabled:opacity-50 cursor-pointer"
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