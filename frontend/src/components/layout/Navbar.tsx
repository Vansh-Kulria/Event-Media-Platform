"use client";

import MobileSidebar from "./MobileSidebar";
import UserDropdown from "./UserDropdown";

import { useEffect, useState }
  from "react";

import {
  getUnreadCount,
} from "@/services/notification.service";
import Link from "next/link";



export default function Navbar() {
  const [count, setCount] =
  useState(0);

useEffect(() => {
  const load = async () => {
    const data =
      await getUnreadCount();

    setCount(data.count);
  };

  load();
}, []);

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/notifications"
        >
          🔔 {count}
        </Link>
        <div className="md:hidden">
          <MobileSidebar />
        </div>

        <h1 className="font-semibold">
          Dashboard

        </h1>
      </div>

      <UserDropdown />
    </header>
  );
}