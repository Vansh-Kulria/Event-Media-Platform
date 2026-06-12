"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { getAnalytics } from "@/services/media.service";
import { X, Download, Heart, Award, Sparkles, Calendar, Image as ImageIcon, Users, Activity, User, Camera } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto" />
        <p className="text-slate-400 text-sm">Loading analytics dashboard...</p>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Events",
      value: analytics?.totalEvents || 0,
      icon: Calendar,
      color: "from-violet-600/10 to-indigo-600/10 text-violet-500 dark:text-violet-400 border-violet-500/20",
      link: "/dashboard/events",
      linkLabel: "Browse albums →",
    },
    {
      name: "Uploaded Media",
      value: analytics?.totalMedia || 0,
      icon: ImageIcon,
      color: "from-indigo-600/10 to-blue-600/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20",
      link: "/dashboard/events",
      linkLabel: "View gallery →",
    },
    {
      name: "Community Users",
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: "from-cyan-600/10 to-blue-600/10 text-cyan-500 dark:text-cyan-400 border-cyan-500/20",
      link: "/dashboard/search",
      linkLabel: "Search users →",
    },
    {
      name: "Interactions",
      value: (analytics?.totalLikes || 0) + (analytics?.totalComments || 0) + (analytics?.totalFavorites || 0),
      icon: Activity,
      color: "from-emerald-600/10 to-teal-600/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20",
      link: "/dashboard/notifications",
      linkLabel: "View alerts →",
    },
  ];

  const mostLikedMedia = analytics?.mostLikedMedia;
  const isVideo = mostLikedMedia?.url && [".mp4", ".mov", ".webm", ".avi", ".mkv"].some((ext) =>
    mostLikedMedia.url.toLowerCase().endsWith(ext)
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Here is the real-time analytical overview of your Event Media Hub activity.
        </p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-xl shadow-lg transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20"
            >
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">{stat.name}</p>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} border border-transparent`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</span>
                <Link
                  href={stat.link}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  {stat.linkLabel}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Most Active Photographer */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
              <Award className="h-5 w-5 text-violet-500 dark:text-violet-400" />
              <h2 className="text-sm font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                Top Contributor
              </h2>
            </div>

            {analytics?.mostActiveUser ? (
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{analytics.mostActiveUser.name}</p>
                    <p className="text-xs text-slate-400">Community Photographer</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Uploaded Items</span>
                  <span className="font-extrabold text-violet-500 dark:text-violet-400">{analytics.mostActiveUser.uploads} uploads</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">No active users yet.</p>
            )}
          </div>


          <div className="mt-6">
            <p className="text-xs text-slate-400 leading-relaxed">
              Awarded to the photographer who uploaded the highest amount of photos and videos.
            </p>
          </div>
        </div>

        {/* Most Popular Image */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
              <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              <h2 className="text-sm font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                Most Liked Photo
              </h2>
            </div>

            {mostLikedMedia ? (
              <div className="flex items-center gap-4 py-1">
                <div 
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative h-20 w-32 rounded-lg overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-950 cursor-pointer shadow group/thumb"
                >
                  {isVideo ? (
                    <video
                      src={mostLikedMedia.url.startsWith("http") ? mostLikedMedia.url : `http://localhost:5000${mostLikedMedia.url}`}
                      className="h-full w-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={mostLikedMedia.url.startsWith("http") ? mostLikedMedia.url : `http://localhost:5000${mostLikedMedia.url}`}
                      alt="Most Liked"
                      className="h-full w-full object-cover group-hover/thumb:scale-105 transition duration-300"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition duration-200">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">View</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Popularity Rank #1</p>
                  <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900 dark:text-white">
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    <span>{mostLikedMedia.likes} Likes</span>
                  </div>
                  <button 
                    onClick={() => setIsLightboxOpen(true)}
                    className="text-xs font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition cursor-pointer"
                  >
                    Open lightbox view →
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">No likes recorded yet.</p>
            )}
          </div>

          <div className="mt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Highest rated media file in event galleries based on community likes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Actions Panel */}
      <div className="rounded-3xl border border-slate-250 dark:border-white/10 bg-slate-100/30 dark:bg-slate-900/20 p-8 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/events/create"
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 p-6 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 shadow-md cursor-pointer"
          >
            <div>
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-500 w-fit mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition">
                Create Event
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Launch a new event album, configure public or private roles, and start gathering photos.
              </p>
            </div>
            <span className="mt-6 text-xs font-semibold tracking-wider uppercase text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform inline-block">
              Get Started →
            </span>
          </Link>

          <Link
            href="/dashboard/selfie"
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 p-6 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 shadow-md cursor-pointer"
          >
            <div>
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 w-fit mb-4">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                Upload Selfie Profile
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Train facial recognition on your reference photo to instantly pull all matching event images.
              </p>
            </div>
            <span className="mt-6 text-xs font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform inline-block">
              Configure AI →
            </span>
          </Link>
        </div>
      </div>

      {/* Lightbox Modal for Most Liked Image */}
      {isLightboxOpen && mostLikedMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            {isVideo ? (
              <video
                src={mostLikedMedia.url.startsWith("http") ? mostLikedMedia.url : `http://localhost:5000${mostLikedMedia.url}`}
                className="max-h-[85vh] max-w-[85vw] rounded-lg"
                controls
                autoPlay
              />
            ) : (
              <img
                src={mostLikedMedia.url.startsWith("http") ? mostLikedMedia.url : `http://localhost:5000${mostLikedMedia.url}`}
                alt="Most Popular Media"
                className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}