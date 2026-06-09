"use client";

import { useEffect, useState } from "react";
import { getEventMedia } from "@/services/media.service";
import MediaCard
from "./MediaCard";

type Props = {
  eventId: string;
};

export default function MediaGallery({
  eventId,
}: Props) {
  const [media, setMedia] =
    useState<any[]>([]);

  const loadMedia = async () => {
    try {
      const data =
        await getEventMedia(eventId);

      setMedia(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [eventId]);

  if (media.length === 0) {
    return (
      <div className="mt-6 rounded border p-4">
        No media uploaded yet
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-semibold">
        Media Gallery
      </h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
       {media.map((item) => (
  <MediaCard
    key={item.id}
    media={item}
    onDelete={loadMedia}
  />
))}
      </div>
    </div>
  );
}