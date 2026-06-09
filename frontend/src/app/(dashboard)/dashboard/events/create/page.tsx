"use client";

import { useState } from "react";
import { createEvent } from "@/services/event.service";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    eventDate: "",
    isPublic: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createEvent(formData);

      alert("Event created successfully");

      router.push("/dashboard/events");
    } catch (error) {
      console.error(error);
      alert("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">
        Create Event
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) =>
            setFormData({
              ...formData,
              title: e.target.value,
            })
          }
          className="w-full rounded border p-2"
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
          className="w-full rounded border p-2"
        />

        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value,
            })
          }
          className="w-full rounded border p-2"
        />

        <input
          type="datetime-local"
          value={formData.eventDate}
          onChange={(e) =>
            setFormData({
              ...formData,
              eventDate: e.target.value,
            })
          }
          className="w-full rounded border p-2"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) =>
              setFormData({
                ...formData,
                isPublic: e.target.checked,
              })
            }
          />
          Public Event
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white"
        >
          {loading
            ? "Creating..."
            : "Create Event"}
        </button>
      </form>
    </div>
  );
}