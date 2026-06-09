"use client";

import MobileSidebar from "./MobileSidebar";
import UserDropdown from "./UserDropdown";

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-4">
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