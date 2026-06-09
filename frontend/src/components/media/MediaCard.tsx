"use client";

import { useEffect, useState, useRef } from "react";
import {
  toggleLike,
  getLikesCount,
  toggleFavorite,
  deleteMedia,
  tagUser,
  getMediaTags,
  searchUsers,
} from "@/services/media.service";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth-store";
import MediaComments from "./MediaComments";
import { toast } from "sonner";
import { Star, X, Heart, MessageCircle, Share2, Download } from "lucide-react";

type Props = {
  media: any;
  onDelete?: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isSelectionMode?: boolean;
};

export default function MediaCard({
  media,
  onDelete,
  isSelected = false,
  onToggleSelect,
  isSelectionMode = false,
}: Props) {
  const { user } = useAuthStore();
  const [likes, setLikes] = useState(media.likesCount || 0);
  const [isLiked, setIsLiked] = useState(media.likedByCurrentUser || false);
  const [isFavorited, setIsFavorited] = useState(media.favoritedByCurrentUser || false);
  const [tags, setTags] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state if props change
  useEffect(() => {
    setIsLiked(media.likedByCurrentUser || false);
    setIsFavorited(media.favoritedByCurrentUser || false);
  }, [media.likedByCurrentUser, media.favoritedByCurrentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadLikes = async () => {
    try {
      const data = await getLikesCount(media.id);
      setLikes(data.likesCount);
    } catch (error) {
      console.error(error);
    }
  };

  const loadTags = async () => {
    try {
      const data = await getMediaTags(media.id);
      setTags(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadLikes();
    loadTags();
  }, [media.id]);

  const handleLike = async () => {
    try {
      const res = await toggleLike(media.id);
      setIsLiked(res.liked);
      loadLikes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFavorite = async () => {
    try {
      const res = await toggleFavorite(media.id);
      setIsFavorited(res.favorited);
      toast.success(res.favorited ? "Added to favorites!" : "Removed from favorites!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const users = await searchUsers(val);
      setSearchResults(users);
      setShowDropdown(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTag = async () => {
    if (!selectedUser) return;
    try {
      await tagUser(media.id, selectedUser.id);
      await loadTags();
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
      setShowDropdown(false);
      toast.success("User tagged!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to tag user");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this photo?");
    if (!confirmed) return;
    try {
      await deleteMedia(media.id);
      toast.success("Photo deleted successfully");
      onDelete?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete photo");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/media/${media.id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `media-${media.id}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };

  const handleShare = async () => {
    try {
      const res = await api.get(`/media/${media.id}/share`);
      navigator.clipboard.writeText(res.data.shareUrl);
      toast.success(`Share link copied to clipboard! (Shared ${res.data.shareCount} times)`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to share");
    }
  };

  const canDelete = user?.role === "ADMIN" || media.uploadedById === user?.id;

  return (
    <>
      <div className="group relative flex flex-col h-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 dark:hover:border-white/20">
        {/* Thumbnail (opens Lightbox on click) */}
        <div 
          onClick={() => setIsLightboxOpen(true)}
          className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 cursor-pointer flex items-center justify-center group/thumb"
        >
          {media.type === "VIDEO" ? (
            <div className="relative w-full h-full">
              <video
                src={media.url.startsWith("http") ? media.url : `http://localhost:5000${media.url}`}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/thumb:bg-black/35 transition duration-300">
                <span className="text-3xl drop-shadow-lg text-white">▶️</span>
              </div>
            </div>
          ) : (
            <img
              src={media.url.startsWith("http") ? media.url : `http://localhost:5000${media.url}`}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          )}
          
          {/* Dynamic type tag */}
          <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-300 uppercase z-10">
            {media.type}
          </div>

          {/* Floating Download Button (revealed on hover) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 hover:bg-violet-600 text-white opacity-0 group-hover/thumb:opacity-100 transition duration-200 cursor-pointer shadow-lg z-10 border border-white/10"
            title="Download Watermarked Image"
          >
            <Download className="h-4 w-4" />
          </button>
          
          {/* Selection Checkbox Overlay */}
          {onToggleSelect && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className={`absolute top-2 left-2 z-10 transition duration-200 ${
                isSelected || isSelectionMode ? "opacity-100" : "opacity-0 group-hover/thumb:opacity-100"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelect();
                }}
                className="h-5 w-5 rounded border-white/20 bg-black/60 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600"
              />
            </div>
          )}

          {/* Top-right delete control */}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600/80 text-white opacity-0 group-hover/thumb:opacity-100 transition duration-200 cursor-pointer shadow-lg z-10"
            >
              ✕
            </button>
          )}
        </div>

        {/* Social Actions row */}
        <div className="mt-3.5 flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3.5 px-1">
          {/* Left actions: Like, Comment, Favorite */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-bold transition hover:scale-110 cursor-pointer ${
                isLiked ? "text-red-500" : "text-slate-400 hover:text-red-500 dark:hover:text-red-400"
              }`}
              title="Like Photo"
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              <span>{likes}</span>
            </button>
            
            <button
              onClick={() => setShowCommentsModal(true)}
              className="flex items-center text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition hover:scale-110 cursor-pointer"
              title="Comments"
            >
              <MessageCircle className="h-5 w-5" />
            </button>

            <button
              onClick={handleFavorite}
              className="flex items-center transition hover:scale-110 cursor-pointer text-slate-400 hover:text-yellow-500 dark:hover:text-yellow-400"
              title="Favorite"
            >
              {isFavorited ? (
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              ) : (
                <Star className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Right actions: Share */}
          <div className="flex items-center">
            <button
              onClick={handleShare}
              className="flex items-center text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition hover:scale-110 cursor-pointer"
              title="Share Link"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Autocomplete Tagging */}
        <div className="mt-4 flex flex-col gap-2 pb-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Tag Friends
          </label>
          <div className="relative flex gap-2" ref={dropdownRef}>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search user by name..."
                value={searchQuery}
                onChange={(e) => handleUserSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2 text-xs text-slate-800 dark:text-white placeholder-slate-500 outline-none focus:border-violet-500 transition"
              />
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 mt-1 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-1 z-30 max-h-40 overflow-y-auto">
                  {searchResults.map((usr) => (
                    <button
                      key={usr.id}
                      onClick={() => {
                        setSelectedUser(usr);
                        setSearchQuery(usr.name);
                        setShowDropdown(false);
                      }}
                      className="block w-full rounded-md px-3 py-1.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      <p className="font-semibold">{usr.name}</p>
                      <p className="text-[10px] text-slate-500">{usr.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleTag}
              disabled={!selectedUser}
              className="rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition cursor-pointer"
            >
              Tag
            </button>
          </div>

          {/* Tags list */}
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tg) => (
                <span
                  key={tg.id}
                  className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                >
                  🏷️ {tg.user.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div 
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl shadow-2xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing lightbox when clicking image/video
          >
            {media.type === "VIDEO" ? (
              <video
                src={media.url.startsWith("http") ? media.url : `http://localhost:5000${media.url}`}
                className="max-h-[85vh] max-w-[85vw] rounded-lg"
                controls
                autoPlay
              />
            ) : (
              <img
                src={media.url.startsWith("http") ? media.url : `http://localhost:5000${media.url}`}
                alt=""
                className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
              />
            )}
            {media.description && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-sm text-white backdrop-blur-md">
                {media.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Comments Modal Window */}
      {showCommentsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowCommentsModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                💬 Comments Thread
              </h3>
              <button
                onClick={() => setShowCommentsModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Comments List & Input Form */}
            <div className="mt-1">
              <MediaComments mediaId={media.id} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}