"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Calendar, Search, Star, Camera, Image, Bell, Sparkles } from "lucide-react";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "AI Search", href: "/dashboard/search", icon: Search },
  { name: "Favorites", href: "/dashboard/favorites", icon: Star },
  { name: "Selfie Upload", href: "/dashboard/selfie", icon: Camera },
  { name: "My Matched Photos", href: "/dashboard/my-photos", icon: Image },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        title="Open Navigation Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && mounted && createPortal(
        <div className="relative z-50">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="fixed left-0 top-0 h-screen w-72 bg-black/90 dark:bg-slate-950/95 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 p-6 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                <h2 className="text-lg font-extrabold bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
                  EventMedia
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Links List */}
            <nav className="flex-1 space-y-1">
              {links.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20"
                        : "text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 transition-colors ${active ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-4 text-center mt-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Event Media Platform v1.0
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}