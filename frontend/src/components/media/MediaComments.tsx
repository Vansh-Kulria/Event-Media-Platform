"use client";

import { useEffect, useState } from "react";
import { getComments, addComment } from "@/services/media.service";

type Props = {
  mediaId: string;
};

export default function MediaComments({ mediaId }: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");

  const loadComments = async () => {
    try {
      const data = await getComments(mediaId);
      setComments(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadComments();
  }, [mediaId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      await addComment(mediaId, content);
      setContent("");
      loadComments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-3 flex flex-col flex-1 justify-between">
      {/* Comments list - bounded and scrollable */}
      <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 text-slate-300 scrollbar-thin scrollbar-thumb-white/10">
        {comments.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="text-xs break-words py-0.5 leading-relaxed">
              <span className="font-bold text-violet-400">
                {comment.user?.name || "User"}
              </span>
              : <span className="text-slate-300">{comment.content}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 flex gap-1.5">
        <input
          className="flex-grow rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:bg-white/10 transition"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add comment..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />

        <button
          onClick={handleSubmit}
          className="rounded-lg bg-violet-600/80 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-600 transition cursor-pointer"
        >
          Post
        </button>
      </div>
    </div>
  );
}