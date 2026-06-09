"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getComments,
  addComment,
} from "@/services/media.service";

type Props = {
  mediaId: string;
};

export default function MediaComments({
  mediaId,
}: Props) {
  const [comments, setComments] =
    useState<any[]>([]);

  const [content, setContent] =
    useState("");

  const loadComments =
    async () => {
      const data =
        await getComments(
          mediaId
        );

      setComments(data);
    };

  useEffect(() => {
    loadComments();
  }, []);

  const handleSubmit =
    async () => {
      if (!content.trim()) return;

      await addComment(
        mediaId,
        content
      );

      setContent("");

      loadComments();
    };

  return (
    <div className="mt-3">
      <div className="space-y-1">
        {comments.map(
          (comment) => (
            <div
              key={comment.id}
              className="text-sm break-words"
            >
              <strong>
                {
                  comment.user
                    ?.name
                }
              </strong>
              :{" "}
              {
                comment.content
              }
            </div>
          )
        )}
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <input className="w-full rounded border p-2"
          value={content}
          onChange={(e) =>
            setContent(
              e.target.value
            )
          }
          placeholder="Add comment..."
        />

        <button
          onClick={
            handleSubmit
          }
          className="rounded bg-black px-3 py-2 text-white"
        >
          Post
        </button>
      </div>
    </div>
  );
}