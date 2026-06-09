"use client";

import { useEffect, useState } from "react";

import {
  getNotifications,
  markNotificationRead,
  markAllRead,
} from "@/services/notification.service";

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<any[]>([]);

  const loadNotifications = async () => {
    const data =
      await getNotifications();

    setNotifications(data);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (
    id: string
  ) => {
    await markNotificationRead(id);

    loadNotifications();
  };

  const handleReadAll =
    async () => {
      await markAllRead();

      loadNotifications();
    };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Notifications
        </h1>

        <button
          onClick={handleReadAll}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Mark All Read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map(
          (notification) => (
            <div
              key={notification.id}
              className={`rounded border p-4 ${
                notification.isRead
                  ? "bg-white"
                  : "bg-yellow-50"
              }`}
            >
              <p>
                {notification.message}
              </p>

              <button
                onClick={() =>
                  handleRead(
                    notification.id
                  )
                }
                className="mt-2 text-sm text-blue-600"
              >
                Mark Read
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}