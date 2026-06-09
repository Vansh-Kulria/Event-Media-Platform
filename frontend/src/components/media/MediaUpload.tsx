"use client";

import { useState } from "react";
import { uploadMedia } from "@/services/media.service";

type Props = {
  eventId: string;
  onUpload?: () => void;
};

export default function MediaUpload({
  eventId,
  onUpload,
}: Props) {
  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);

      await uploadMedia(
        eventId,
        file
      );

      alert(
        "Media uploaded successfully"
      );

      setFile(null);

      onUpload?.();
    } catch (error) {
      console.error(error);

      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded border p-4">
      <h2 className="mb-3 font-semibold">
        Upload Media
      </h2>

      <input
        type="file"
        onChange={(e) =>
          setFile(
            e.target.files?.[0] || null
          )
        }
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="ml-3 rounded bg-black px-4 py-2 text-white"
      >
        {loading
          ? "Uploading..."
          : "Upload"}
      </button>
    </div>
  );
}