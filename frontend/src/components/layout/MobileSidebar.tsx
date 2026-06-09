"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const links = [
  { name: "📊 Dashboard", href: "/dashboard" },
  { name: "📅 Events", href: "/dashboard/events" },
  { name: "🔍 AI Search", href: "/dashboard/search" },
  { name: "⭐ Favorites", href: "/dashboard/favorites" },
  { name: "📸 Selfie Upload", href: "/dashboard/selfie" },
  { name: "👤 My Matched Photos", href: "/dashboard/my-photos" },
  { name: "🔔 Notifications", href: "/dashboard/notifications" },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        title="Open Navigation Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="fixed left-0 top-0 h-full w-72 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-r border-slate-200 dark:border-white/10 z-50 p-6 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
              <h2 className="text-lg font-extrabold bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
                ⚡ EventMedia
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Links List */}
            <nav className="flex-1 space-y-2">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                Event Media Platform v1.0
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}