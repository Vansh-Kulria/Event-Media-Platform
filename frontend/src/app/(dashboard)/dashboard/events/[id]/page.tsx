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
import { Tag, Edit3, Trash2, FileText, Calendar, User as UserIcon } from "lucide-react";

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
      ? "bg-emerald-500/20 text-emerald-450 dark:text-emerald-400 border border-emerald-500/30"
      : "bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30";
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6 mb-6">
          <div className="space-y-1">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2.5 py-0.5 text-slate-500 dark:text-slate-350">
                <Tag className="h-3 w-3 text-slate-400" />
                <span>{event.category}</span>
              </span>
              <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded ${getVisibilityBadge(event.isPublic)}`}>
                {event.isPublic ? "Public Album" : "Private Album"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {event.title}
            </h1>
          </div>

          {isCreatorOrAdmin && (
            <div className="flex gap-3">
              <Link
                href={`/dashboard/events/${event.id}/edit`}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Event</span>
              </Link>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-650 hover:bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition cursor-pointer shadow-lg shadow-red-900/10 flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Event</span>
              </button>
            </div>
          )}
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-550 dark:text-violet-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Description</p>
              <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{event.description || "No description."}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-550 dark:text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Date & Time</p>
              <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                {new Date(event.eventDate).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-550 dark:text-cyan-400">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Created By</p>
              <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{event.createdBy?.name || "Unknown"}</p>
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