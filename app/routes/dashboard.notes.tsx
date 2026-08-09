import { useEffect, useOptimistic, useState, useTransition } from "react";
import { Link } from "react-router";
import { Plus, Pin, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  createNote as createNoteApi,
  deleteNote as deleteNoteApi,
  listNotes,
  updateNote,
} from "~/lib/api/notes";
import { cn } from "~/lib/utils";
import type { NoteRecord } from "~/types/storage";

type OptimisticAction =
  | {
      type: "CREATE";
      note: NoteRecord;
    }
  | {
      type: "DELETE";
      id: string;
    }
  | {
      type: "TOGGLE_PIN";
      id: string;
    };

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  /**
   * Load notes from the API.
   */
  const refresh = async () => {
    setLoading(true);

    try {
      const data = await listNotes();
      setNotes(data);
    } catch (error) {
      console.error("Failed to load notes:", error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial note loading.
   */
  useEffect(() => {
    void refresh();
  }, []);

  /**
   * React 19 optimistic state.
   *
   * `notes` remains the authoritative server-synchronized state.
   * `optimisticNotes` temporarily reflects user actions while
   * the server request is being processed.
   */
  const [optimisticNotes, updateOptimisticNotes] = useOptimistic<
    NoteRecord[],
    OptimisticAction
  >(notes, (state, action) => {
    switch (action.type) {
      case "CREATE":
        return [action.note, ...state];

      case "DELETE":
        return state.filter((note) => note.id !== action.id);

      case "TOGGLE_PIN":
        return state.map((note) =>
          note.id === action.id
            ? {
                ...note,
                pinned: !note.pinned,
              }
            : note,
        );

      default:
        return state;
    }
  });

  /**
   * Create a new note.
   *
   * A temporary note is displayed immediately while the
   * actual API request is running.
   */
  const createNote = () => {
    const tempNote = {
      id: `temp-${Date.now()}`,
      title: "Untitled Note",
      plain_text: "Empty note",
      color: "#ffffff",
      pinned: false,
      updated_at: new Date().toISOString(),
    } as NoteRecord;

    startTransition(async () => {
      // Immediately show the temporary note.
      updateOptimisticNotes({
        type: "CREATE",
        note: tempNote,
      });

      try {
        const savedNote = await createNoteApi({
          title: "Untitled Note",
        });

        if (!savedNote) {
          // Request failed.
          // The optimistic state will roll back when
          // the authoritative state is refreshed.
          await refresh();
          return;
        }

        // Replace the optimistic state with the real
        // server-created note.
        setNotes((previous) => [savedNote, ...previous]);
      } catch (error) {
        console.error("Failed to create note:", error);
        await refresh();
      }
    });
  };

  /**
   * Toggle note pin state.
   *
   * Uses PATCH /api/notes/:id through updateNote()
   * instead of maintaining separate /pin and /unpin
   * API calls.
   */
  const togglePin = (note: NoteRecord) => {
    if (note.id.startsWith("temp-")) {
      return;
    }

    startTransition(async () => {
      // Immediately toggle the UI.
      updateOptimisticNotes({
        type: "TOGGLE_PIN",
        id: note.id,
      });

      try {
        const updatedNote = await updateNote(note.id, {
          pinned: !note.pinned,
        });

        if (!updatedNote) {
          await refresh();
          return;
        }

        // Synchronize authoritative state with
        // the server response.
        setNotes((previous) =>
          previous.map((current) =>
            current.id === updatedNote.id ? updatedNote : current,
          ),
        );
      } catch (error) {
        console.error("Failed to update note pin:", error);

        await refresh();
      }
    });
  };

  /**
   * Delete a note.
   *
   * The note disappears immediately and is restored
   * if the server request fails.
   */
  const deleteNote = (id: string) => {
    if (id.startsWith("temp-")) {
      return;
    }

    startTransition(async () => {
      // Immediately remove the note from the UI.
      updateOptimisticNotes({
        type: "DELETE",
        id,
      });

      try {
        const deleted = await deleteNoteApi(id);

        if (!deleted) {
          await refresh();
          return;
        }

        // Synchronize the authoritative state.
        setNotes((previous) => previous.filter((note) => note.id !== id));
      } catch (error) {
        console.error("Failed to delete note:", error);
        await refresh();
      }
    });
  };

  /**
   * Pinned notes are displayed first.
   */
  const sorted = [...optimisticNotes].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notes</h1>

          <p className="text-sm text-muted-foreground">
            {optimisticNotes.length}{" "}
            {optimisticNotes.length === 1 ? "note" : "notes"}
          </p>
        </div>

        <Button type="button" onClick={createNote} disabled={isPending}>
          <Plus size={16} />
          New note
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No notes yet — create your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((note) => {
            const isTemp = note.id.startsWith("temp-");

            return (
              <div
                key={note.id}
                className={cn(
                  "group relative flex min-h-32 flex-col gap-2 rounded-2xl border border-border/50 p-4 shadow-sm transition-opacity",
                  isTemp && "animate-pulse border-dashed opacity-60",
                )}
                style={{
                  backgroundColor:
                    note.color !== "#ffffff" ? note.color : undefined,
                }}
              >
                {/* Note header */}
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/dashboard/notes/note/${note.id}`}
                    className="flex-1 truncate text-sm font-semibold hover:underline"
                  >
                    {note.title}
                  </Link>

                  {/* Note actions */}
                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
                      "focus-within:opacity-100",
                    )}
                  >
                    {/* Pin */}
                    <button
                      type="button"
                      onClick={() => togglePin(note)}
                      disabled={isTemp || isPending}
                      className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={note.pinned ? "Unpin note" : "Pin note"}
                    >
                      <Pin
                        size={13}
                        className={cn(
                          note.pinned &&
                            "fill-current text-indigo-600 dark:text-indigo-400",
                        )}
                      />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      disabled={isTemp || isPending}
                      className="text-muted-foreground hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Delete note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Note content */}
                <Link
                  to={`/dashboard/notes/note/${note.id}`}
                  className="flex flex-1 flex-col justify-between"
                >
                  <p className="line-clamp-4 text-xs text-muted-foreground">
                    {note.plain_text || "Empty note"}
                  </p>

                  <span className="mt-2 text-[10px] text-muted-foreground/70">
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
