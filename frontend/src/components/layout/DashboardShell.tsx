"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import api from "@/lib/axios";
import { useSocket } from "@/hooks/useSocket";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // Connect socket for real-time notifications
  useSocket();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/profile");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        localStorage.removeItem("token");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("token")) {
      loadProfile();
    } else {
      window.location.href = "/login";
    }
  }, [setUser]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto" />
          <p className="text-sm font-medium tracking-wider text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-x-hidden">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}