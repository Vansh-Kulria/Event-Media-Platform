"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Search, Star, Camera, Image, Bell, Sparkles } from "lucide-react";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "AI Search", href: "/dashboard/search", icon: Search },
  { name: "Favorites", href: "/dashboard/favorites", icon: Star },
  { name: "Selfie Upload", href: "/dashboard/selfie", icon: Camera },
  { name: "My Matched Photos", href: "/dashboard/my-photos", icon: Image },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80 p-5 backdrop-blur-xl transition-colors duration-200">
      <div className="flex items-center justify-center gap-2 border-b border-slate-200 dark:border-white/5 pb-6 mb-6">
        <Sparkles className="h-5.5 w-5.5 text-violet-500 dark:text-violet-400" />
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
          EventMedia
        </h2>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-colors ${active ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 dark:border-white/5 pt-4 text-center">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
          Event Media Platform v1.0
        </p>
      </div>
    </aside>
  );
}