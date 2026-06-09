"use client";

import { useState } from "react";
import { login } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      toast.success("Welcome back! Login successful.");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <h2 className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-3xl font-extrabold text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage your Event Media
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-sm text-red-400 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 p-3 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>

          <div className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}