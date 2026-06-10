"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import MediaCard from "@/components/media/MediaCard";
import { 
  ArrowLeft, 
  Calendar, 
  Heart, 
  Mail, 
  Shield, 
  Image as ImageIcon, 
  Folder, 
  Grid, 
  ImageOff 
} from "lucide-react";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"grouped" | "all">("grouped");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/users/${userId}/profile`);
      setProfileData(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto" />
          <p className="text-sm font-medium text-slate-400">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center space-y-4">
        <div className="rounded-full bg-red-500/10 p-4 text-red-500">
          <ImageOff className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Failed to Load Profile</h2>
        <p className="text-sm text-slate-500 max-w-xs">{error || "User could not be found."}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  const { user, media } = profileData;

  // Calculate metrics
  const totalUploads = media.length;
  
  // Unique events contributed to
  const uniqueEvents = Array.from(new Set(media.map((item: any) => item.event.id))).length;
  
  // Total likes received
  const totalLikes = media.reduce((sum: number, item: any) => sum + (item.likes?.length || 0), 0);

  // Group media by Event
  const groupedByEvent = media.reduce((acc: any[], item: any) => {
    const existingEvent = acc.find((e) => e.id === item.event.id);
    if (existingEvent) {
      existingEvent.media.push(item);
    } else {
      acc.push({
        ...item.event,
        media: [item],
      });
    }
    return acc;
  }, []);

  const handleMediaDeleted = () => {
    // Refresh data if an image is deleted by user (if they are admin/owner)
    fetchProfile();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back Header Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>

      {/* User Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 lg:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-12 -left-12 h-40 w-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 h-40 w-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
          {/* Large Avatar */}
          <div className="flex h-24 w-24 lg:h-28 lg:w-28 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-3xl font-black text-white uppercase shadow-lg border-2 border-violet-500/30">
            {user.selfieUrl ? (
              <img
                src={user.selfieUrl.startsWith("http") ? user.selfieUrl : `http://localhost:5000${user.selfieUrl}`}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              user.name.charAt(0)
            )}
          </div>

          {/* Profile details & metrics */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1.5">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
                  {user.name}
                </h1>
                <span className="inline-flex self-center items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider">
                  <Shield className="h-3 w-3" /> {user.role}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Member since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>

            {/* Metrics cards row */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto md:mx-0 pt-2">
              <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-3 text-center transition hover:border-slate-200 dark:hover:border-white/10">
                <p className="text-xl lg:text-2xl font-black text-violet-500 dark:text-violet-400">{totalUploads}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Uploads</p>
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-3 text-center transition hover:border-slate-200 dark:hover:border-white/10">
                <p className="text-xl lg:text-2xl font-black text-indigo-500 dark:text-indigo-400">{uniqueEvents}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Events</p>
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-3 text-center transition hover:border-slate-200 dark:hover:border-white/10">
                <p className="text-xl lg:text-2xl font-black text-rose-500 dark:text-rose-400">{totalLikes}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Likes Recd</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs selector */}
      <div className="flex border-b border-slate-200 dark:border-white/5">
        <button
          onClick={() => setActiveTab("grouped")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === "grouped"
              ? "border-violet-600 text-violet-600 dark:text-violet-400"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <Folder className="h-4 w-4" /> Grouped by Event
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === "all"
              ? "border-violet-600 text-violet-600 dark:text-violet-400"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <Grid className="h-4 w-4" /> All Uploads Feed
        </button>
      </div>

      {/* Media Grid Lists */}
      <div className="space-y-8">
        {totalUploads === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 space-y-4 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-white/5">
            <div className="rounded-full bg-slate-200 dark:bg-white/5 p-4 text-slate-400">
              <ImageIcon className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No media uploads</h3>
              <p className="text-xs text-slate-500 mt-1">This user hasn't uploaded any event photos or videos yet.</p>
            </div>
          </div>
        ) : activeTab === "all" ? (
          /* All Uploads continuous grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((item: any) => (
              <MediaCard 
                key={item.id} 
                media={item} 
                onDelete={handleMediaDeleted}
              />
            ))}
          </div>
        ) : (
          /* Grouped by Event List view */
          <div className="space-y-10">
            {groupedByEvent.map((evt: any) => (
              <div 
                key={evt.id} 
                className="space-y-4 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/10 p-5 lg:p-6 shadow-md"
              >
                {/* Event header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Folder className="h-4 w-4 text-violet-500" />
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      📁 Category: <span className="font-bold text-slate-500 dark:text-slate-400">{evt.category}</span>
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/events?id=${evt.id}`}
                    className="inline-flex self-start sm:self-center items-center justify-center gap-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    View Event Album
                  </Link>
                </div>

                {/* Event media grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {evt.media.map((item: any) => (
                    <MediaCard 
                      key={item.id} 
                      media={item} 
                      onDelete={handleMediaDeleted}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
