// routes/dashboard.notes.tsx
import { useEffect, useState } from "react";
import { Plus, Pin, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Card } from "~/components/ui/card";

interface NoteRecord {
  id: string;
  title: string;
  plain_text: string | null;
  color: string;
  pinned: boolean;
  updated_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const res = await fetch("/api/notes", { credentials: "include" });
    if (res.ok) setNotes(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const createNote = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Note" }),
    });
    if (res.ok) refresh();
  };

  const togglePin = async (note: NoteRecord) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n)),
    );
    await fetch(`/api/notes/${note.id}/${note.pinned ? "unpin" : "pin"}`, {
      method: "POST",
      credentials: "include",
    });
  };

  const deleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="w-full h-full flex flex-col py-8 px-8 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Notes
          </h1>
          <p className="text-muted-foreground text-sm">{notes.length} notes</p>
        </div>
        <Button onClick={createNote} className="rounded-lg gap-1.5">
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
          {sorted.map((note) => (
            <div
              key={note.id}
              className="group relative rounded-2xl border border-border/50 p-4 shadow-sm flex flex-col gap-2 min-h-32"
              style={{
                backgroundColor:
                  note.color !== "#ffffff" ? note.color : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm truncate">{note.title}</h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => togglePin(note)}
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
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-4 flex-1">
                {note.plain_text || "Empty note"}
              </p>
              <span className="text-[10px] text-muted-foreground/70">
                {new Date(note.updated_at).toLocaleDateString()}
              </span>
            </div>
          ))}
              {sorted.map((note) => (
                <Card></Card>
              ))}
        </div>
      )}
    </div>
  );
}
