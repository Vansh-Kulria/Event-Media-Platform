"use client";

import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
  clearAllNotifications,
} from "@/services/notification.service";
import { toast } from "sonner";
import { Check, Trash2, BellOff } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      // Update local state directly instead of full reload for faster feedback
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all notifications from your inbox?");
    if (!confirmed) return;
    try {
      await clearAllNotifications();
      setNotifications([]);
      toast.success("Notification inbox cleared");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear notifications");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time updates on likes, comments, and tags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleReadAll}
              className="inline-flex items-center gap-2 justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-lg w-fit"
            >
              <Check className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-2 justify-center rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/25 px-5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 hover:text-red-700 dark:hover:text-red-300 transition cursor-pointer shadow-lg w-fit"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Inbox</span>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto" />
          <p className="text-slate-400 text-sm">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 mb-4">
            <BellOff className="h-6 w-6" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold">All caught up!</p>
          <p className="text-slate-500 text-xs mt-1">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center justify-between rounded-2xl border p-4 transition duration-300 ${
                notification.isRead
                  ? "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400"
                  : "bg-white dark:bg-slate-900/60 border-violet-500/25 dark:border-violet-500/20 shadow-md shadow-violet-500/5 text-slate-900 dark:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Status Dot */}
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    notification.isRead ? "bg-transparent" : "bg-violet-600 dark:bg-violet-500 animate-pulse"
                  }`}
                />
                <p className="text-sm font-medium">{notification.message}</p>
              </div>

              {!notification.isRead && (
                <button
                  onClick={() => handleRead(notification.id)}
                  className="rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition cursor-pointer"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}