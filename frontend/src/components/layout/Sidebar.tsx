"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Events", href: "/dashboard/events" },
  { name: "Media", href: "/dashboard/media" },
  { name: "Comments", href: "/dashboard/comments" },
  { name: "Users", href: "/dashboard/users" },
  {
  name: "Favorites",
  href: "/dashboard/favorites"},
  {
  name: "Notifications",
  href: "/dashboard/notifications",
}

];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-64 border-r">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold">
          Event Media
        </h2>
      </div>

      <nav className="space-y-2 p-4">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`block rounded-md px-3 py-2 transition ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}