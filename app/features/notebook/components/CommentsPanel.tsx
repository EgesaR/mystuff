import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { createComment, deleteComment, listComments } from "~/lib/api/comments";
import type { CommentRecord } from "~/types/storage";

export function CommentsPanel({ noteId }: { noteId: string }) {
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    listComments(noteId).then((c) => {
      setComments(c);
      setLoading(false);
    });
  }, [noteId]);

  const handlePost = async () => {
    if (!draft.trim()) return;
    setPosting(true);
    const created = await createComment(noteId, draft.trim());
    if (created) {
      setComments((prev) => [...prev, created]);
      setDraft("");
    }
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteComment(id);
    if (ok) setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-t border-border/40 print:hidden"
    >
      <div className="max-h-64 overflow-y-auto px-6 py-3 flex flex-col gap-3">
        {loading && (
          <p className="text-xs text-muted-foreground">Loading comments…</p>
        )}
        {!loading && comments.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No comments yet. Use @username to notify someone.
          </p>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className="flex items-start justify-between gap-2 text-sm"
          >
            <div>
              <span className="font-medium">{c.author_username}</span>{" "}
              <span className="text-muted-foreground text-xs">
                {new Date(c.created_at).toLocaleString()}
              </span>
              <p className="text-foreground/90 mt-0.5">{c.body}</p>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              className="text-muted-foreground hover:text-destructive shrink-0"
              title="Delete comment"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 px-6 py-2 border-t border-border/30">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePost()}
          placeholder="Add a comment... @username to notify"
          className="flex-1 bg-transparent outline-none text-sm border border-border/50 rounded-md px-3 py-1.5"
        />
        <Button
          size="sm"
          onClick={handlePost}
          disabled={posting}
          className="gap-1.5"
        >
          <Send size={14} /> Post
        </Button>
      </div>
    </motion.div>
  );
}
