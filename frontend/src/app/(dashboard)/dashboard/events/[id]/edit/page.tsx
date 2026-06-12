"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

      toast.success(
        "Event updated successfully"
      );

      router.push(
        `/dashboard/events/${eventId}`
      );
    } catch (error: any) {
  const message =
    error.response?.data?.message ||
    "Failed to update event";

  toast.error(message);
}finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/5 pb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
          Edit Event
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Modify details, category, or access permissions for this album.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Event Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Sports Day 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-violet-500 dark:focus:border-violet-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Description
            </label>
            <textarea
              placeholder="Describe the event, date, or location details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-violet-500 dark:focus:border-violet-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Category
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sports, Wedding, Party"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-violet-500 dark:focus:border-violet-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Event Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 dark:focus:border-violet-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/5">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4.5 w-4.5 rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-slate-950 text-violet-650 focus:ring-violet-500 cursor-pointer accent-violet-600"
            />
            <label htmlFor="isPublic" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              Make Event Album Public (Visible to Viewers)
            </label>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-600/10 text-center"
            >
              {loading ? "Updating Event..." : "Update Event"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/events/${eventId}`)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}