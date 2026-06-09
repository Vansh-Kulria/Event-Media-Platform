"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import api from "@/lib/axios";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function SharedMediaPage({ params }: Props) {
  const { id: mediaId } = use(params);
  const [media, setMedia] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadSharedMedia = async () => {
      try {
        setLoading(true);
        // 1. Fetch public media details
        const mediaRes = await api.get(`/media/${mediaId}/public`);
        setMedia(mediaRes.data);

        // 2. Fetch public comments
        const commentsRes = await api.get(`/media/${mediaId}/comments`);
        setComments(commentsRes.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadSharedMedia();
  }, [mediaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
        <p className="text-slate-400 text-sm">Loading shared media...</p>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-4">
        <span className="text-5xl">⚠️</span>
        <h1 className="text-2xl font-bold text-white">Media Not Found</h1>
        <p className="text-slate-400 text-sm max-w-md">
          This shared link may have expired, or the media item was removed by the photographer.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 cursor-pointer shadow-lg shadow-violet-600/10"
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  const isVideo = [".mp4", ".mov", ".webm", ".avi", ".mkv"].some((ext) =>
    media.url.toLowerCase().endsWith(ext)
  ) || media.type === "VIDEO";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-lg font-extrabold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          ⚡ EventMedia
        </Link>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 cursor-pointer shadow shadow-violet-600/20"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Media Frame */}
        <div className="md:col-span-3 flex flex-col justify-center">
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-3 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
            {isVideo ? (
              <video
                src={media.url.startsWith("http") ? media.url : `http://localhost:5000${media.url}`}
                controls
                autoPlay
                muted
                className="w-full h-auto max-h-[500px] object-contain rounded-2xl bg-black"
              />
            ) : (
              <img
                src={media.url.startsWith("http") ? media.url : `http://localhost:5000${media.url}`}
                alt="Shared Media"
                className="w-full h-auto max-h-[500px] object-contain rounded-2xl bg-black"
              />
            )}
          </div>
        </div>

        {/* Media Info & Comments */}
        <div className="md:col-span-2 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">❤️</span>
              <span className="text-sm font-semibold text-slate-300">
                {media.likesCount} Like{media.likesCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Comments list */}
            <div className="border border-white/10 rounded-2xl bg-slate-900/20 p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                Public Comments ({comments.length})
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">No comments yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-300">{comment.user.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed bg-white/5 rounded-lg p-2.5">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Join Call to Action */}
          <div className="rounded-2xl border border-dashed border-violet-500/30 bg-violet-600/5 p-4 text-center space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Want to like, leave a comment, favorite, or download this media? Join the EventMedia platform now!
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500 bg-slate-950">
        <p>Event Media Platform v1.0 • All Rights Reserved</p>
      </footer>
    </div>
  );
}
