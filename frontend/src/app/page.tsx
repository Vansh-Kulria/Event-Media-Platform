"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Zap, Sparkles, Smartphone, Tag, Shield, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_center,var(--color-violet-600),transparent_70%)] opacity-15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-violet-400 fill-violet-400/10" />
          <span className="text-lg font-extrabold bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
            EventMedia
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 cursor-pointer shadow-lg shadow-violet-600/25"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white transition cursor-pointer"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-white/10 hover:bg-white/15 px-5 py-2 text-sm font-semibold text-white border border-white/10 transition cursor-pointer"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-6 py-20 flex flex-col items-center text-center space-y-12">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase bg-violet-600/10 border border-violet-500/20 rounded-full px-4 py-1 text-violet-400 shadow-sm shadow-violet-600/5">
            <Sparkles className="h-3.5 w-3.5" /> AI-Powered Event Photography Hub
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Capture, Share, and Discover <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Event Media in Real-Time
            </span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mt-4 font-medium leading-relaxed">
            The modern media management platform built for event organizers, photographers, and participants. Connect, download watermarked content, and find yourself instantly using face matching.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 cursor-pointer shadow-xl shadow-violet-600/25 text-center"
            >
              Enter Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 cursor-pointer shadow-xl shadow-violet-600/25 text-center"
              >
                Get Started for Free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-8 py-3.5 text-base font-semibold text-white transition cursor-pointer text-center"
              >
                Sign In to Account
              </Link>
            </>
          )}
        </div>

        {/* Features Preview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 w-full text-left">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg backdrop-blur-xl">
            <Smartphone className="h-8 w-8 text-violet-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Facial Recognition</h3>
            <p className="text-slate-400 text-sm">
              Upload a reference selfie profile. AI matches your face with all event photos, creating a custom album just for you.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg backdrop-blur-xl">
            <Tag className="h-8 w-8 text-indigo-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Smart AI Tagging</h3>
            <p className="text-slate-400 text-sm">
              Photos are scanned and tagged automatically using keywords. Filter events easily by mountains, beaches, sports, and crowds.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg backdrop-blur-xl">
            <Shield className="h-8 w-8 text-cyan-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Dynamic Watermarks</h3>
            <p className="text-slate-400 text-sm">
              Encourage platform shares while protecting copyright. Downloads are custom watermarked with the club, event, and user role.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 h-20 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 text-xs text-slate-500 gap-4">
        <p>© 2026 EventMedia Platform. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}