import { useEffect, useOptimistic, useState } from "react";
import {
  Link,
  useFetcher,
  useLoaderData,
  useNavigation,
  useRevalidator,
} from "react-router";
import { Plus, Pin, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { NoteRecord } from "~/types/storage";
import type { Route } from "./+types/dashboard.notes";

import { listNotes } from "~/lib/loaders/notes.server";
import { createNote, deleteNote, updateNote } from "~/lib/actions/notes.server";

type OptimisticAction =
  | { type: "CREATE"; note: NoteRecord }
  | { type: "DELETE"; id: string }
  | { type: "TOGGLE_PIN"; id: string };

export async function loader({ request }: Route.LoaderArgs) {
  const notes = await listNotes(request);
  return { notes };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const note = await createNote(request, { title: "Untitled Note" });
    return { ok: !!note, note };
  }

  if (intent === "toggle-pin") {
    const id = String(formData.get("id"));
    const currentlyPinned = formData.get("pinned") === "true";
    const note = await updateNote(request, id, { pinned: !currentlyPinned });
    return { ok: !!note, note };
  }

  if (intent === "delete") {
    const id = String(formData.get("id"));
    const ok = await deleteNote(request, id);
    return { ok };
  }

  return { ok: false };
}

export default function NotesPage() {
  const { notes: serverNotes } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();

  const isPending =
    navigation.state !== "idle" ||
    fetcher.state === "submitting" ||
    fetcher.state === "loading";

  // Authoritative list comes from the loader.
  // We keep a local copy so optimistic updates feel instant.
  const [notes, setNotes] = useState<NoteRecord[]>(serverNotes);

  // Keep local state in sync when the loader revalidates
  useEffect(() => {
    setNotes(serverNotes);
  }, [serverNotes]);

  const [optimisticNotes, updateOptimisticNotes] = useOptimistic<
    NoteRecord[],
    OptimisticAction
  >(notes, (state, action) => {
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
  });

  // React to successful mutations
  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;

    const data = fetcher.data;

    if (data.ok && data.note) {
      // CREATE or TOGGLE_PIN succeeded
      setNotes((prev) => {
        const exists = prev.some((n) => n.id === data.note!.id);
        if (exists) {
          return prev.map((n) => (n.id === data.note!.id ? data.note! : n));
        }
        return [data.note!, ...prev];
      });
    }

    // After any mutation we can also force a revalidation if needed
    // revalidator.revalidate();
  }, [fetcher.state, fetcher.data]);

  const handleCreate = () => {
    const tempNote = {
      id: `temp-${Date.now()}`,
      title: "Untitled Note",
      plain_text: "Empty note",
      color: "#ffffff",
      pinned: false,
      updated_at: new Date().toISOString(),
    } as NoteRecord;

    updateOptimisticNotes({ type: "CREATE", note: tempNote });

    fetcher.submit({ intent: "create" }, { method: "post" });
  };

  const handleTogglePin = (note: NoteRecord) => {
    if (note.id.startsWith("temp-")) return;

    updateOptimisticNotes({ type: "TOGGLE_PIN", id: note.id });

    fetcher.submit(
      {
        intent: "toggle-pin",
        id: note.id,
        pinned: String(note.pinned),
      },
      { method: "post" },
    );
  };

  const handleDelete = (id: string) => {
    if (id.startsWith("temp-")) return;

    updateOptimisticNotes({ type: "DELETE", id });

    fetcher.submit({ intent: "delete", id }, { method: "post" });
  };

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

        <Button type="button" onClick={handleCreate} disabled={isPending}>
          <Plus size={16} />
          New note
        </Button>
      </div>

      {/* Content */}
      {sorted.length === 0 ? (
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

                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
                      "focus-within:opacity-100",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleTogglePin(note)}
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

                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
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
