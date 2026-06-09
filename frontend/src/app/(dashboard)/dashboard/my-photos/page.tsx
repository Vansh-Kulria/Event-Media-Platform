"use client";

import { useEffect, useState } from "react";
import { getMyPhotos } from "@/services/media.service";
import MediaCard from "@/components/media/MediaCard";

export default function MyPhotosPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await getMyPhotos();
      setPhotos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          My Matched Photos
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Photos containing your face identified by AI facial recognition.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto" />
          <p className="text-slate-400 text-sm">Searching galleries...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
          <span className="text-4xl block mb-2">🔍</span>
          <p className="text-slate-300 font-semibold">No matched photos</p>
          <p className="text-slate-500 text-xs mt-1">Upload a reference selfie and click "Find My Photos" to get matches!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((item) => (
            <MediaCard
              key={item.id}
              media={item.media}
              onDelete={loadPhotos}
            />
          ))}
        </div>
      )}
    </div>
  );
}