"use client";

import { useState } from "react";

export default function UserDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="border px-3 py-1 rounded"
      >
        User
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded border bg-white shadow">
          <button className="block w-full p-2 text-left hover:bg-gray-100">
            Profile
          </button>

          <button className="block w-full p-2 text-left hover:bg-gray-100">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}