// routes/dashboard.notes.tsx
import { useEffect, useState, useOptimistic, useTransition } from "react";
import { Plus, Pin, Trash2 } from "lucide-react";
import { Link } from "react-router"; // Assuming React Router v7 navigation
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface NoteRecord {
  id: string;
  title: string;
  plain_text: string | null;
  color: string;
  pinned: boolean;
  updated_at: string;
}

type OptimisticAction =
  | { type: "CREATE"; note: NoteRecord }
  | { type: "DELETE"; id: string }
  | { type: "TOGGLE_PIN"; id: string };

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refresh = async () => {
    const res = await fetch("/api/notes", { credentials: "include" });
    if (res.ok) setNotes(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  // 1. React 19 useOptimistic configuration
  const [optimisticNotes, updateOptimisticNotes] = useOptimistic(
    notes,
    (state: NoteRecord[], action: OptimisticAction) => {
      switch (action.type) {
        case "CREATE":
          return [action.note, ...state];
        case "DELETE":
          return state.filter((n) => n.id !== action.id);
        case "TOGGLE_PIN":
          return state.map((n) =>
            n.id === action.id ? { ...n, pinned: !n.pinned } : n,
          );
        default:
          return state;
      }
    },
  );

  const createNote = async () => {
    const tempNote: NoteRecord = {
      id: `temp-${Date.now()}`,
      title: "Untitled Note",
      plain_text: "Empty note",
      color: "#ffffff",
      pinned: false,
      updated_at: new Date().toISOString(),
    };

    startTransition(async () => {
      // Instantly show note on screen
      updateOptimisticNotes({ type: "CREATE", note: tempNote });

      const res = await fetch("/api/notes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Note" }),
      });

      if (res.ok) {
        const savedNote = await res.json();
        // Sync real state with server response (replacing temp item)
        setNotes((prev) => [savedNote, ...prev]);
      } else {
        // Automatically rolls back if request fails
        refresh();
      }
    });
  };

  const togglePin = async (note: NoteRecord) => {
    startTransition(async () => {
      updateOptimisticNotes({ type: "TOGGLE_PIN", id: note.id });

      const res = await fetch(
        `/api/notes/${note.id}/${note.pinned ? "unpin" : "pin"}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (res.ok) {
        const updated = await res.json();
        setNotes((prev) =>
          prev.map((n) => (n.id === updated.id ? updated : n)),
        );
      } else {
        refresh();
      }
    });
  };

  const deleteNote = async (id: string) => {
    startTransition(async () => {
      updateOptimisticNotes({ type: "DELETE", id });

      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      } else {
        refresh();
      }
    });
  };

  // Sort pinned notes to the top
  const sorted = [...optimisticNotes].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned),
  );

  return (
    <div className="w-full h-full flex flex-col py-8 px-8 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Notes
          </h1>
          <p className="text-muted-foreground text-sm">
            {optimisticNotes.length} notes
          </p>
        </div>
        <Button
          onClick={createNote}
          disabled={isPending}
          className="rounded-lg gap-1.5"
        >
          <Plus size={15} /> New note
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          No notes yet — create your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((note) => {
            const isTemp = note.id.startsWith("temp-");
            return (
              <div
                key={note.id}
                className={cn(
                  "group relative rounded-2xl border border-border/50 p-4 shadow-sm flex flex-col gap-2 min-h-32 transition-opacity",
                  isTemp && "opacity-60 border-dashed animate-pulse",
                )}
                style={{
                  backgroundColor:
                    note.color !== "#ffffff" ? note.color : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Link wrapper to navigate to specific note view */}
                  <Link
                    to={`/dashboard/notes/${note.id}`}
                    className="font-semibold text-sm truncate hover:underline flex-1"
                  >
                    {note.title}
                  </Link>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => togglePin(note)}
                      disabled={isTemp}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pin
                        size={13}
                        className={cn(
                          note.pinned &&
                            "fill-current text-indigo-600 dark:text-indigo-400",
                        )}
                      />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      disabled={isTemp}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <Link
                  to={`/dashboard/notes/note/${note.id}`}
                  className="flex-1 flex flex-col justify-between"
                >
                  <p className="text-xs text-muted-foreground line-clamp-4">
                    {note.plain_text || "Empty note"}
                  </p>
                  <span className="text-[10px] text-muted-foreground/70 mt-2">
                    {isTemp
                      ? "Saving..."
                      : new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
