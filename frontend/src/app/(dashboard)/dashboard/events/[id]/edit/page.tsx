"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getEventById,
  updateEvent,
} from "@/services/event.service";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditEventPage({
  params,
}: Props) {
  const router = useRouter();

  const [eventId, setEventId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      category: "",
      eventDate: "",
      isPublic: true,
    });

  useEffect(() => {
    const loadEvent = async () => {
      const { id } = await params;

      setEventId(id);

      const event =
        await getEventById(id);

      setFormData({
        title: event.title,
        description:
          event.description || "",
        category: event.category,
        eventDate:
          new Date(event.eventDate)
            .toISOString()
            .slice(0, 16),
        isPublic: event.isPublic,
      });
    };

    loadEvent();
  }, [params]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await updateEvent(
        eventId,
        formData
      );

      alert(
        "Event updated successfully"
      );

      router.push(
        `/dashboard/events/${eventId}`
      );
    } catch (error: any) {
  const message =
    error.response?.data?.message ||
    "Failed to update event";

  alert(message);
}finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">
        Edit Event
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
              description:
                e.target.value,
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
              category:
                e.target.value,
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
              eventDate:
                e.target.value,
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
                isPublic:
                  e.target.checked,
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
            ? "Updating..."
            : "Update Event"}
        </button>
      </form>
    </div>
  );
}