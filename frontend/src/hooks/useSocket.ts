"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export function useSocket() {
  const { user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to the socket server
    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to notification socket, joining room:", user.id);
      socket.emit("join", user.id);
    });

    socket.on("notification", (notification: any) => {
      console.log("Received socket notification:", notification);
      
      // Trigger Sonner toast
      toast("🔔 New Notification", {
        description: notification.message,
        action: {
          label: "View",
          onClick: () => {
            window.location.href = "/dashboard/notifications";
          },
        },
      });

      // Broadcast event to update notification indicators
      window.dispatchEvent(new CustomEvent("new-notification", { detail: notification }));
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from notification socket");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return socketRef.current;
}
