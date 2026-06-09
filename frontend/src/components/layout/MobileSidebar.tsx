"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Events", href: "/dashboard/events" },
    { name: "Media", href: "/dashboard/media" },
    { name: "Comments", href: "/dashboard/comments" },
    { name: "Users", href: "/dashboard/users" },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)}>
        <Menu size={20} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="fixed left-0 top-0 h-full w-64 bg-white z-50 p-4">
            <button
              onClick={() => setOpen(false)}
              className="mb-4"
            >
              <X />
            </button>

            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}