"use client";

import MobileSidebar from "./MobileSidebar";
import UserDropdown from "./UserDropdown";
import ThemeToggle from "./ThemeToggle";

import { useEffect, useState }
  from "react";

import {
  getUnreadCount,
} from "@/services/notification.service";
import Link from "next/link";



export default function Navbar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUnreadCount();
        setCount(data.count);
      } catch (err) {
        console.error("Failed to load notifications count", err);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const handleNewNotification = () => {
      setCount((prev) => prev + 1);
    };

    window.addEventListener("new-notification", handleNewNotification);
    return () => {
      window.removeEventListener("new-notification", handleNewNotification);
    };
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-900/40 px-6 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <MobileSidebar />
        </div>

        <h1 className="font-bold text-lg bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          Event Media Platform
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link
          href="/dashboard/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <span>🔔</span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white shadow-lg animate-pulse">
              {count}
            </span>
          )}
        </Link>
        <UserDropdown />
      </div>
    </header>
  );
}