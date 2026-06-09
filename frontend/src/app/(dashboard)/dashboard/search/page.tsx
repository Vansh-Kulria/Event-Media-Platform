"use client";

import { useState } from "react";
import { searchMedia } from "@/services/media.service";
import MediaCard from "@/components/media/MediaCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"tag" | "event" | "user">("tag");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const params = {
        [searchType]: query.trim(),
      };
      const data = await searchMedia(params);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Smart AI Tag Search
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Search for images using AI tags, event albums, or photographer names.
        </p>
      </div>

      {/* Search Bar Container */}
      <form onSubmit={handleSearch} className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-950 border border-white/10 rounded-xl p-1">
            {(["tag", "event", "user"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSearchType(type)}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  searchType === type
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {type === "tag" ? "🏷️ AI Tags" : type === "event" ? "📅 Events" : "👤 Uploaded By"}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[280px] relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchType === "tag"
                  ? "Enter AI tag (e.g. prison, candid, sports, nature)..."
                  : searchType === "event"
                  ? "Enter event album title..."
                  : "Enter photographer name..."
              }
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-600/10"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Search Results */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto" />
          <p className="text-slate-400 text-sm">Searching the vaults...</p>
        </div>
      ) : results.length === 0 ? (
        hasSearched && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
            <span className="text-4xl block mb-2">🤷‍♂️</span>
            <p className="text-slate-300 font-semibold">No matches found</p>
            <p className="text-slate-500 text-xs mt-1">Try another keyword or search category.</p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Search Results ({results.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                onDelete={() => setResults((prev) => prev.filter((r) => r.id !== item.id))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
