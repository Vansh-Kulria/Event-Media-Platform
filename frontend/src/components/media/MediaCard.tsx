"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
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
import { Star, X, Heart, MessageCircle, Share2, Download, Link as LinkIcon, Check, ExternalLink } from "lucide-react";

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{ url: string; count: number }>({ url: "", count: 0 });
  const [copied, setCopied] = useState(false);
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
      setShareData({ url: res.data.shareUrl, count: res.data.shareCount });
      setShowShareModal(true);
      setCopied(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to share");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareData.url);
    setCopied(true);
    toast.success("Share link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const canDelete = user?.role === "ADMIN" || media.uploadedById === user?.id;

  return (
    <>
      <div className="group relative flex flex-col h-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 dark:hover:border-white/20">
        {/* Uploader info (Social Header) */}
        {media.uploadedBy && (
          <div className="flex items-center gap-2.5 mb-3 px-0.5">
            <Link 
              href={`/dashboard/users/${media.uploadedBy.id}`} 
              className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-tr from-violet-500 to-indigo-500 text-[11px] font-extrabold text-white uppercase shadow-inner cursor-pointer hover:opacity-90 transition"
            >
              {media.uploadedBy.selfieUrl ? (
                <img 
                  src={media.uploadedBy.selfieUrl.startsWith("http") ? media.uploadedBy.selfieUrl : `http://localhost:5000${media.uploadedBy.selfieUrl}`} 
                  alt={media.uploadedBy.name} 
                  className="h-full w-full rounded-full object-cover" 
                />
              ) : (
                media.uploadedBy.name.charAt(0)
              )}
            </Link>
            <div className="flex flex-col">
              <Link 
                href={`/dashboard/users/${media.uploadedBy.id}`} 
                className="text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:text-violet-500 dark:hover:text-violet-400 transition cursor-pointer"
              >
                {media.uploadedBy.name}
              </Link>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                {media.uploadedBy.role || "MEMBER"}
              </span>
            </div>
          </div>
        )}

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

        {/* AI Tags list */}
        {media.tags && media.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1 px-1">
            {media.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 dark:text-violet-300 px-2.5 py-0.5 text-[9px] font-bold tracking-wide uppercase"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

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

      {/* Social Share Modal Overlay */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200 space-y-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient background glow */}
            <div className="absolute -top-12 -left-12 h-32 w-32 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 h-32 w-32 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
                <Share2 className="h-5 w-5 text-violet-400" />
                Share Media Link
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Direct Link Copy with Icon */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Direct Link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-3 text-slate-500">
                    <LinkIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={shareData.url}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-slate-300 outline-none select-all focus:border-violet-500 transition"
                  />
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 min-w-[95px] cursor-pointer shadow-lg ${
                    copied
                      ? "bg-emerald-600 shadow-emerald-950/20"
                      : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-950/20"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    "Copy Link"
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2.5">
              <div className="bg-white p-2.5 rounded-xl shadow-lg border border-white/5">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shareData.url)}`}
                  alt="Share QR Code"
                  className="h-[120px] w-[120px] object-contain"
                />
              </div>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                Scan QR to open on mobile
              </span>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Share To Socials
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this photo: " + shareData.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 transition flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.012 2C6.48 2 2 6.48 2 12.012c0 1.766.457 3.483 1.332 5.006L2 22l5.127-1.344a9.96 9.96 0 0 0 4.885 1.256c5.532 0 10.012-4.48 10.012-10.012C22.024 6.48 17.544 2 12.012 2zm6.275 13.91c-.276.772-1.366 1.41-1.886 1.503-.456.082-.84.288-2.854-.506-2.57-.996-4.205-3.57-4.332-3.74-.127-.17-1.03-1.364-1.03-2.603 0-1.24.643-1.848.873-2.096.23-.248.5-.31.67-.31h.525c.17 0 .393-.062.61.455.228.537.78 1.896.848 2.032.068.136.113.295.023.475-.09.18-.135.295-.27.455-.136.16-.285.35-.41.475-.136.126-.278.263-.12.536.158.273.7 1.144 1.503 1.854.803.71 1.48.93 1.69 1.023.21.092.333.078.455-.062.12-.14.536-.62.68-.83.14-.207.296-.17.495-.098.2.072 1.27.6 1.493.712.223.11.37.165.424.258.053.093.053.537-.222 1.31z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent("Check out this media item!")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/30 transition flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter / X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 transition flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M9.101 23.685v-9.504H6.183v-3.647h2.918V7.714c0-2.893 1.767-4.469 4.348-4.469 1.237 0 2.298.092 2.607.133v3.024h-1.79c-1.402 0-1.674.666-1.674 1.644v2.156h3.349l-.436 3.647h-2.913v9.503c5.913-.872 10.37-6.027 10.37-12.235C22.68 5.143 17.537 0 11.18 0S-.32 5.143-.32 11.45c0 6.208 4.457 11.363 10.37 12.235z" />
                  </svg>
                  Facebook
                </a>
              </div>
            </div>

            {/* Share Stats */}
            <div className="border-t border-white/5 pt-3.5 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>📈 Total Shares</span>
              <span className="font-extrabold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                {shareData.count} shares
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}