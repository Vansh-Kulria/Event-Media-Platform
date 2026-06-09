"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getEventById,
  deleteEvent,
} from "@/services/event.service";
import MediaUpload from "@/components/media/MediaUpload";
import MediaGallery
  from "@/components/media/MediaGallery";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EventDetailsPage({
  params,
}: Props) {
  const router = useRouter();

  const [event, setEvent] =
    useState<any>(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  useEffect(() => {
    const loadEvent = async () => {
      const { id } = await params;

      const data =
        await getEventById(id);

      setEvent(data);
    };

    loadEvent();
  }, [params]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this event?"
    );

    if (!confirmed) return;

    try {
      await deleteEvent(event.id);

      router.push("/dashboard/events");
    } catch (error) {
      console.error(error);
      alert("Failed to delete event");
    }
  };

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-3xl font-bold">
        {event.title}
      </h1>

      <div className="space-y-3">
        <p>
          <strong>Description:</strong>{" "}
          {event.description}
        </p>

        <p>
          <strong>Category:</strong>{" "}
          {event.category}
        </p>

        <p>
          <strong>Date:</strong>{" "}
          {new Date(
            event.eventDate
          ).toLocaleString()}
        </p>

        <p>
          <strong>Visibility:</strong>{" "}
          {event.isPublic
            ? "Public"
            : "Private"}
        </p>

        <p>
          <strong>Created By:</strong>{" "}
          {event.createdBy?.name}
        </p>
      </div>

      <div className="mt-6 flex gap-4">
        <Link
          href={`/dashboard/events/${event.id}/edit`}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Edit Event
        </Link>

        <button
          onClick={handleDelete}
          className="rounded bg-red-600 px-4 py-2 text-white"
        >
          Delete Event
        </button>
      </div>

      <div className="mt-10">
        <MediaUpload
          eventId={event.id}
          onUpload={() =>
            setRefreshKey((prev) => prev + 1)
          }
        />

        <MediaGallery
          key={refreshKey}
          eventId={event.id}
        />
      </div>
    </div>
  );
}