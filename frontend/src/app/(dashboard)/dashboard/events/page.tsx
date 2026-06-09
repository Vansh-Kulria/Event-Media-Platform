"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/services/event.service";
import { Event } from "@/types/event";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

export default function EventsPage() {
    const { user } = useAuthStore();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("date");
    const [order, setOrder] = useState("desc");

    const isAdmin = user?.role === "ADMIN";

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const data = await getEvents(sortBy, order);
            setEvents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [sortBy, order]);

    const getVisibilityBadge = (isPublic: boolean) => {
        return isPublic
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                        Events
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Explore albums, upload media, and manage access controls.
                    </p>
                </div>

                {isAdmin && (
                    <Link
                        href="/dashboard/events/create"
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 cursor-pointer shadow-lg shadow-violet-600/20 w-fit"
                    >
                        ➕ Create Event
                    </Link>
                )}
            </div>

            {/* Sorting & Filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/20 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort By:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded-lg border border-white/10 bg-slate-950 p-2 text-xs text-white outline-none focus:border-violet-500 transition cursor-pointer"
                    >
                        <option value="date">Date</option>
                        <option value="name">Event Name</option>
                        <option value="category">Category</option>
                    </select>

                    <button
                        onClick={() => setOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                        className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 p-2 text-xs text-white font-medium transition cursor-pointer"
                    >
                        {order === "asc" ? "▲ Asc" : "▼ Desc"}
                    </button>
                </div>
                <div className="text-xs text-slate-400">
                    Showing {events.length} event{events.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Grid list */}
            {loading ? (
                <div className="py-20 text-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto" />
                    <p className="text-slate-400 text-sm">Fetching events...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
                    <span className="text-4xl block mb-2">📂</span>
                    <p className="text-slate-300 font-semibold">No events found</p>
                    <p className="text-slate-500 text-xs mt-1">Get started by creating your first event album!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl shadow-lg hover:border-white/20 transition-all duration-300"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-white/5 border border-white/10 rounded px-2.5 py-0.5 text-slate-300">
                                        🏷️ {event.category}
                                    </span>
                                    <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded ${getVisibilityBadge(event.isPublic)}`}>
                                        {event.isPublic ? "Public" : "Private"}
                                    </span>
                                </div>

                                <Link
                                    href={`/dashboard/events/${event.id}`}
                                    className="text-xl font-bold text-white group-hover:text-violet-400 transition cursor-pointer"
                                >
                                    {event.title}
                                </Link>
                                <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                                    {event.description || "No description provided."}
                                </p>
                            </div>

                            <div className="border-t border-white/5 pt-4 mt-6 flex flex-col gap-1 text-xs text-slate-500">
                                <p>📅 Date: {new Date(event.eventDate).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
                                <p>👤 Created by: <span className="font-semibold text-slate-400">{event.createdBy?.name || "Unknown"}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}