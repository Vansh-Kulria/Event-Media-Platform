"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getEventById,
  deleteEvent,
} from "@/services/event.service";
import MediaUpload from "@/components/media/MediaUpload";
import MediaGallery from "@/components/media/MediaGallery";
import { useAuthStore } from "@/store/auth-store";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EventDetailsPage({
  params,
}: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadEvent = async () => {
      const { id } = await params;
      const data = await getEventById(id);
      setEvent(data);
    };

    loadEvent();
  }, [params]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this event?");
    if (!confirmed) return;

    try {
      await deleteEvent(event.id);
      toast.success("Event deleted successfully");
      router.push("/dashboard/events");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    }
  };

  if (!event) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto" />
        <p className="text-slate-400 text-sm">Loading event details...</p>
      </div>
    );
  }

  const isCreatorOrAdmin = user?.role === "ADMIN" || event.createdById === user?.id;
  const isPhotographerOrAdmin = user?.role === "ADMIN" || user?.role === "PHOTOGRAPHER";

  const getVisibilityBadge = (isPublic: boolean) => {
    return isPublic
      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
      : "bg-amber-500/20 text-amber-400 border border-amber-500/30";
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
          <div className="space-y-1">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-white/5 border border-white/10 rounded px-2.5 py-0.5 text-slate-300">
                🏷️ {event.category}
              </span>
              <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded ${getVisibilityBadge(event.isPublic)}`}>
                {event.isPublic ? "Public Album" : "Private Album"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              {event.title}
            </h1>
          </div>

          {isCreatorOrAdmin && (
            <div className="flex gap-3">
              <Link
                href={`/dashboard/events/${event.id}/edit`}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
              >
                ✏️ Edit Event
              </Link>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-600/80 hover:bg-red-500 px-4 py-2.5 text-xs font-semibold text-white transition cursor-pointer shadow-lg shadow-red-900/10"
              >
                🗑️ Delete Event
              </button>
            </div>
          )}
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Description</p>
              <p className="text-slate-300 font-medium mt-0.5">{event.description || "No description."}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Date & Time</p>
              <p className="text-slate-300 font-medium mt-0.5">
                {new Date(event.eventDate).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Created By</p>
              <p className="text-slate-300 font-medium mt-0.5">{event.createdBy?.name || "Unknown"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload & Media sections */}
      <div className="space-y-10">
        {/* Only Photographers or Admins can upload media */}
        {isPhotographerOrAdmin && (
          <MediaUpload
            eventId={event.id}
            onUpload={() => setRefreshKey((prev) => prev + 1)}
          />
        )}

        <MediaGallery
          key={refreshKey}
          eventId={event.id}
        />
      </div>
    </div>
  );
}