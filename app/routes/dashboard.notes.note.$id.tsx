// app/routes/dashboard.notes.$id.tsx
import { useEffect, useState, useTransition } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";

interface NoteDetail {
  id: string;
  title: string;
  content: string | null;
  color: string;
  pinned: boolean;
  updated_at: string;
}

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchNote() {
      const res = await fetch(`/api/notes/${id}`, { credentials: "include" });
      if (res.ok) {
        setNote(await res.json());
      }
      setLoading(false);
    }
    fetchNote();
  }, [id]);

  const handleUpdate = async (fields: Partial<NoteDetail>) => {
    if (!note) return;

    const updated = { ...note, ...fields };
    setNote(updated);

    startTransition(async () => {
      await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
    });
  };

  const handleDelete = async () => {
    startTransition(async () => {
      await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      navigate("/dashboard/notes");
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">Loading note...</div>
    );
  }

  if (!note) {
    return (
      <div className="p-8 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Note not found or deleted.
        </p>
        <Link
          to="/dashboard/notes"
          className="text-indigo-600 hover:underline text-sm"
        >
          &larr; Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-8 gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/notes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back to notes
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="gap-1.5"
        >
          <Trash2 size={14} /> Delete
        </Button>
      </div>

      <div
        className="flex-1 flex flex-col gap-4 rounded-2xl border border-border/50 p-6 shadow-sm transition-colors"
        style={{
          backgroundColor: note.color !== "#ffffff" ? note.color : undefined,
        }}
      >
        <input
          type="text"
          value={note.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          placeholder="Note Title..."
          className="text-2xl font-bold bg-transparent outline-none border-b border-transparent focus:border-border/60 pb-2 transition-colors"
        />

        <textarea
          value={note.content || ""}
          onChange={(e) => handleUpdate({ content: e.target.value })}
          placeholder="Start typing your note content..."
          className="w-full flex-1 bg-transparent outline-none resize-none text-sm text-foreground/90 leading-relaxed"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground/70 pt-4 border-t border-border/40">
          <span>
            Last updated: {new Date(note.updated_at).toLocaleTimeString()}
          </span>
          {isPending && (
            <span className="text-indigo-500 font-medium animate-pulse">
              Saving changes...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
