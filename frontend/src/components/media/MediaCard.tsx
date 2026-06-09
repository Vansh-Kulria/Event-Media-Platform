"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  toggleLike,
  getLikesCount,
  toggleFavorite,
  deleteMedia,
  tagUser,
  getMediaTags,
} from "@/services/media.service";

import MediaComments from "./MediaComments";

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

  const [userId, setUserId] =
    useState("");

  const [tags, setTags] =
    useState<any[]>([]);

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

  const handleTag = async () => {
    try {
      await tagUser(
        media.id,
        userId
      );

      const updatedTags =
        await getMediaTags(
          media.id
        );

      setTags(updatedTags);

      setUserId("");

      alert("User tagged");
    } catch (error) {
      console.error(error);
      alert(
        "Failed to tag user"
      );
    }
  };

  const loadLikes =
    async () => {
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

  const handleDelete =
    async () => {
      const confirmed =
        window.confirm(
          "Delete this photo?"
        );

      if (!confirmed) return;

      try {
        await deleteMedia(
          media.id
        );

        onDelete?.();
      } catch (error) {
        console.error(error);

        alert(
          "Failed to delete photo"
        );
      }
    };

  const handleLike =
    async () => {
      try {
        await toggleLike(
          media.id
        );

        loadLikes();
      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    loadLikes();
  }, []);

  useEffect(() => {
    const loadTags =
      async () => {
        try {
          const data =
            await getMediaTags(
              media.id
            );

          setTags(data);
        } catch (error) {
          console.error(error);
        }
      };

    loadTags();
  }, [media.id]);

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
        onClick={
          handleFavorite
        }
        className="mt-2 rounded bg-yellow-500 px-3 py-1 text-white"
      >
        ⭐ Favorite
      </button>

      <div className="mt-3">
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) =>
            setUserId(
              e.target.value
            )
          }
          className="w-full rounded border p-2"
        />

        <button
          onClick={handleTag}
          className="mt-2 rounded bg-blue-600 px-3 py-1 text-white"
        >
          Tag User
        </button>
      </div>

      <div className="mt-3">
        {tags.map((tag) => (
          <p
            key={tag.id}
            className="text-sm"
          >
            🏷️ {tag.user.name}
          </p>
        ))}
      </div>
    </div>
  );
}