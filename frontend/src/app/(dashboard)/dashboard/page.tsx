"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="text-slate-400 mt-2">
          Here is an overview of your Event Media Hub activities.
        </p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-violet-600/10 blur-xl" />
          <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">Total Events</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">📅 View</span>
            <Link
              href="/dashboard/events"
              className="text-xs font-bold text-violet-400 hover:text-violet-300 transition cursor-pointer"
            >
              Browse list →
            </Link>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-indigo-600/10 blur-xl" />
          <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">My Favorites</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">⭐ Saved</span>
            <Link
              href="/dashboard/favorites"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
            >
              View saved →
            </Link>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-cyan-600/10 blur-xl" />
          <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">Selfie Discovery</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">📸 Matched</span>
            <Link
              href="/dashboard/my-photos"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
            >
              Find matches →
            </Link>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-600/10 blur-xl" />
          <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">Notifications</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">🔔 Alerts</span>
            <Link
              href="/dashboard/notifications"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
            >
              Check inbox →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Actions Panel */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/20 p-8 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/events/create"
            className="group relative flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-md cursor-pointer"
          >
            <div>
              <span className="text-2xl mb-3 block">➕</span>
              <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition">
                Create Event
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Launch a new event album, configure public or private roles, and start gathering photos.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold tracking-wider uppercase text-violet-400 group-hover:translate-x-1 transition-transform inline-block">
              Get Started →
            </span>
          </Link>

          <Link
            href="/dashboard/selfie"
            className="group relative flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-md cursor-pointer"
          >
            <div>
              <span className="text-2xl mb-3 block">🤳</span>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">
                Upload Selfie Profile
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Train facial recognition on your reference photo to instantly pull all matching event images.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold tracking-wider uppercase text-cyan-400 group-hover:translate-x-1 transition-transform inline-block">
              Configure AI →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}