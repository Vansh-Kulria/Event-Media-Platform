"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

export default function UserDropdown() {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "PHOTOGRAPHER": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "MEMBER": return "bg-green-500/20 text-green-400 border border-green-500/30";
      default: return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition cursor-pointer"
      >
        {user?.selfieUrl ? (
          <img
            src={`http://localhost:5000${user.selfieUrl}`}
            alt=""
            className="h-6 w-6 rounded-full object-cover border border-violet-500/50"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-violet-600/30 text-xs font-bold text-violet-400 flex items-center justify-center">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
        )}
        <span>{user?.name || "User"}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl p-2 z-50">
          <div className="px-3 py-2 border-b border-white/5 mb-2">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate mb-1">{user?.email}</p>
            {user?.role && (
              <span className={`inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            )}
          </div>

          <button
            onClick={() => { setOpen(false); router.push(`/dashboard/users/${user?.id}`); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition text-left cursor-pointer"
          >
            👤 View Profile
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-left cursor-pointer"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}