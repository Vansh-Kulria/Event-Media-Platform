"use client";

import { useState, useRef, useEffect } from "react";
import { uploadMediaBulk } from "@/services/media.service";

import { toast } from "sonner";

type Props = {
  eventId: string;
  onUpload?: () => void;
};

export default function MediaUpload({
  eventId,
  onUpload,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validFiles = Array.from(selectedFiles).filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      return isImage || isVideo;
    });

    if (validFiles.length === 0) return;

    setFiles((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setLoading(true);
      await uploadMediaBulk(eventId, files);
      toast.success("Media uploaded successfully");
      setFiles([]);
      setPreviews([]);
      setTags("");
      onUpload?.();
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl">
      <h2 className="mb-4 text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
        Upload Event Media
      </h2>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition ${
          isDragging
            ? "border-violet-500 bg-violet-500/10"
            : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/20"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="text-4xl mb-2">📥</div>
        <p className="text-sm font-semibold text-slate-300 text-center">
          Drag & drop photos or videos here, or click to browse
        </p>
        <p className="text-xs text-slate-500 mt-1 text-center">
          Supports JPG, PNG, WEBP, MP4 (Max 20 files at once)
        </p>
      </div>

      {/* Previews Grid */}
      {previews.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">
            Selected Files ({previews.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-1">
            {previews.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group bg-slate-950">
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute top-1 right-1 h-5 w-5 bg-black/60 rounded-full text-white text-[10px] flex items-center justify-center hover:bg-red-600 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags Input & Action Button */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Tags (Optional, comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="sports, nature, team"
            className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:bg-white/10 transition"
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={loading || files.length === 0}
          className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer h-[38px] flex items-center justify-center"
        >
          {loading ? "Uploading..." : `Upload ${files.length} Item${files.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}