"use client";

import { useEffect, useState } from "react";
import { getEventMedia, deleteMediaBulk } from "@/services/media.service";
import MediaCard from "./MediaCard";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

type Props = {
  eventId: string;
};

export default function MediaGallery({ eventId }: Props) {
  const { user } = useAuthStore();
  const [media, setMedia] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMedia = async () => {
    try {
      const data = await getEventMedia(eventId);
      setMedia(data);
      // Clean up selected items that no longer exist
      const validIds = data.map((m: any) => m.id);
      setSelectedIds((prev) => prev.filter((id) => validIds.includes(id)));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [eventId]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === media.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(media.map((item) => item.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedIds.length} selected items?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteMediaBulk(selectedIds);
      toast.success(`${selectedIds.length} items deleted successfully`);
      setSelectedIds([]);
      loadMedia();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete selected items");
    } finally {
      setLoading(false);
    }
  };

  if (media.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-8 text-center text-slate-400 backdrop-blur-xl">
        No media uploaded yet for this event.
      </div>
    );
  }

  // Determine if the current user can delete the selected items.
  // Admins can delete anything. Otherwise, each selected media must be uploaded by the current user.
  const canDeleteSelected =
    user?.role === "ADMIN" ||
    (selectedIds.length > 0 &&
      selectedIds.every((id) => {
        const item = media.find((m) => m.id === id);
        return item && item.uploadedById === user?.id;
      }));

  return (
    <div className="mt-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          Media Gallery
        </h2>

        {/* Bulk Control Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            {selectedIds.length === media.length ? "Deselect All" : "Select All"}
          </button>

          {selectedIds.length > 0 && (
            <>
              <span className="text-xs text-slate-400 font-medium">
                {selectedIds.length} item{selectedIds.length !== 1 ? "s" : ""} selected
              </span>

              {canDeleteSelected && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  🗑️ {loading ? "Deleting..." : "Delete Selected"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {media.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            onDelete={loadMedia}
            isSelected={selectedIds.includes(item.id)}
            onToggleSelect={() => handleToggleSelect(item.id)}
            isSelectionMode={selectedIds.length > 0}
          />
        ))}
      </div>
    </div>
  );
}