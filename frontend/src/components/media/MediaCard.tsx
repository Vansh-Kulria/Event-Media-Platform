"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  toggleLike,
  getLikesCount,
} from "@/services/media.service";

import MediaComments
from "./MediaComments";
import { toggleFavorite }
from "@/services/media.service";

import { deleteMedia } from "@/services/media.service";

type Props = {
  media: any;
  onDelete?: () => void;
};
export default function MediaCard({
  media,
  onDelete,
}: Props) {
  const [likes, setLikes] =
    useState(0);

    const handleFavorite =
  async () => {
    try {
      await toggleFavorite(
        media.id
      );

      alert(
        "Favorite updated"
      );
    } catch (error) {
      console.error(error);
    }
  };


  const loadLikes = async () => {
    try {
      const data =
        await getLikesCount(
          media.id
        );

      setLikes(
        data.likesCount
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
  const confirmed = window.confirm(
    "Delete this photo?"
  );

  if (!confirmed) return;

  try {
    await deleteMedia(media.id);

    onDelete?.();
  } catch (error) {
    console.error(error);

    alert("Failed to delete photo");
  }
};


  useEffect(() => {
    loadLikes();
  }, []);

  const handleLike = async () => {
    try {
      await toggleLike(
        media.id
      );

      loadLikes();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="rounded-lg border p-3 shadow-sm">
      <img
        src={`http://localhost:5000${media.url}`}
        alt=""
        className="h-48 w-full rounded object-cover"
      />

      <button
  onClick={handleLike}
  className="mt-2 text-sm"
>
  ❤️ {likes} Likes
</button>

<MediaComments
  mediaId={media.id}
/>

<button
  onClick={handleDelete}
  className="mt-2 rounded bg-red-600 px-3 py-1 text-white"
>
  Delete
</button>

<button
  onClick={handleFavorite}
  className="mt-2 rounded bg-yellow-500 px-3 py-1 text-white"
>
  ⭐ Favorite
</button>

    </div>
  );
}