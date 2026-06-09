"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/services/event.service";
import { Event } from "@/types/event";
import Link from "next/link";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEvents();
                setEvents(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <button
  onClick={() =>
    console.log(
      localStorage.getItem("token")
    )
  }
>
  Check Token
</button>

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Events
                </h1>

                <Link
                    href="/dashboard/events/create"
                    className="rounded bg-black px-4 py-2 text-white"
                >
                    Create Event
                </Link>
            </div>

            <div className="space-y-4">
                {events.length === 0 ? (
                    <div className="rounded-lg border p-6">
                        No events found
                    </div>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className="rounded-lg border p-4"
                        >
                            <Link
  href={`/dashboard/events/${event.id}`}
  className="text-lg font-semibold hover:underline"
>
  {event.title}
</Link>
                            <p>{event.category}</p>

                            <p>
                                {new Date(
                                    event.eventDate
                                ).toLocaleDateString()}
                            </p>

                            <p>
                                Created by: {event.createdBy?.name}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}