import {
  Suspense,
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Await,
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  type ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { NotebookSplash } from "~/components/dashboard/notebook/notebook-splash";
import { ShareDialog } from "~/components/dashboard/notebook/share-dialog";
import { RichTextToolbar } from "~/components/dashboard/notebook/rich-text-toolbar";
import { deleteNote, getNote, updateNote } from "~/lib/api/notes";
import type { NoteRecord } from "~/types/storage";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  return { id: params.id!, notePromise: getNote(params.id!) };
}

// The core fix: without this, every fetcher.submit() below (title save,
// body save, delete) triggers React Router's default post-action loader
// revalidation. That refetches the note from the server mid-typing and
// resets useOptimistic's base state to a stale snapshot, which is what
// made typed text appear to vanish. We only want the loader to actually
// re-run when the user navigates to a *different* note.
export function shouldRevalidate({
  currentParams,
  nextParams,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (currentParams.id === nextParams.id) return false;
  return defaultShouldRevalidate;
}

export async function clientAction({
  request,
  params,
}: ClientActionFunctionArgs) {
  const id = params.id!;
  const formData = await request.formData();

  if (formData.get("intent") === "delete") {
    await deleteNote(id);
    return { deleted: true };
  }

  const fields: Partial<NoteRecord> = {};
  if (formData.has("title")) fields.title = String(formData.get("title"));
  if (formData.has("text"))
    fields.content = { text: String(formData.get("text")) };

  return { note: await updateNote(id, fields) };
}

export default function NoteDetailRoute() {
  const { id, notePromise } = useLoaderData<typeof clientLoader>();

  return (
    <Suspense fallback={<NotebookSplash />}>
      <Await resolve={notePromise}>
        {(note: NoteRecord | null) =>
          note ? (
            // key={id} forces a clean remount per note: fresh editor DOM,
            // fresh timers, fresh optimistic base. Simpler and safer than
            // trying to manually resync internal refs across notes.
            <NoteEditor key={id} id={id} initialNote={note} />
          ) : (
            <NoteMissing />
          )
        }
      </Await>
    </Suspense>
  );
}

function NoteMissing() {
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

function NoteEditor({
  id,
  initialNote,
}: {
  id: string;
  initialNote: NoteRecord;
}) {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [, startTransition] = useTransition();
  const [autoSave, setAutoSave] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const titleSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [note, setOptimisticNote] = useOptimistic(
    initialNote,
    (state, patch: Partial<NoteRecord>) => ({ ...state, ...patch }),
  );

  // Seed the contentEditable DOM exactly once per mounted note. We never
  // re-sync innerHTML from `note.content` after this — contentEditable owns
  // its own DOM, and re-assigning innerHTML on every keystroke would throw
  // the caret back to the start of the text every time you type.
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialNote.content?.text ?? "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
      if (contentSaveTimer.current) clearTimeout(contentSaveTimer.current);
    };
  }, []);

  const persistFields = useCallback(
    (fields: Record<string, string>) => {
      const fd = new FormData();
      fd.set("intent", "update");
      Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
      fetcher.submit(fd, { method: "POST" });
    },
    [fetcher],
  );

  const handleTitleChange = useCallback(
    (value: string) => {
      startTransition(() => setOptimisticNote({ title: value }));
      if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
      titleSaveTimer.current = setTimeout(
        () => persistFields({ title: value }),
        500,
      );
    },
    [persistFields, setOptimisticNote, startTransition],
  );

  const handleEditorInput = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    startTransition(() => setOptimisticNote({ content: { text: html } }));
    if (!autoSave) return;
    if (contentSaveTimer.current) clearTimeout(contentSaveTimer.current);
    contentSaveTimer.current = setTimeout(
      () => persistFields({ text: html }),
      800,
    );
  }, [autoSave, persistFields, setOptimisticNote, startTransition]);

  const handleManualSave = useCallback(() => {
    // Read straight from the DOM rather than React state — it's the
    // uncontrolled source of truth for a contentEditable editor.
    persistFields({ text: editorRef.current?.innerHTML ?? "" });
  }, [persistFields]);

  const handleDelete = useCallback(() => {
    const fd = new FormData();
    fd.set("intent", "delete");
    fetcher.submit(fd, { method: "POST" });
    navigate("/dashboard/notes");
  }, [fetcher, navigate]);

  const exec = useCallback(
    (cmd: string, val?: string) => {
      editorRef.current?.focus();

      if (cmd === "createLink") {
        const url = window.prompt("Link URL", "https://");
        if (!url) return;
        document.execCommand("createLink", false, url);
      } else if (cmd === "blockquote") {
        document.execCommand("formatBlock", false, "blockquote");
      } else if (cmd === "code") {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const pre = document.createElement("pre");
          const codeEl = document.createElement("code");
          codeEl.textContent = range.toString() || "code";
          pre.appendChild(codeEl);
          range.deleteContents();
          range.insertNode(pre);
          sel.removeAllRanges();
        }
      } else {
        document.execCommand(cmd, false, val);
      }

      handleEditorInput();
    },
    [handleEditorInput],
  );

  const isSaving = fetcher.state !== "idle";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full h-full flex flex-col p-8 gap-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/notes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back to notes
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareOpen(true)}
            className="gap-1.5"
          >
            <Share2 size={14} /> Share
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="gap-1.5"
          >
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>

      <div
        className="flex-1 flex flex-col rounded-2xl border border-border/50 shadow-sm transition-colors overflow-hidden"
        style={{
          backgroundColor: note.color !== "#ffffff" ? note.color : undefined,
        }}
      >
        <input
          value={note.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title..."
          className="text-2xl font-bold bg-transparent outline-none border-b border-transparent focus:border-border/60 px-6 pt-6 pb-2 transition-colors"
        />

        <RichTextToolbar onCommand={exec} />

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={handleEditorInput}
            data-placeholder="Start typing your note content..."
            className="min-h-[300px] outline-none text-sm text-foreground/90 leading-relaxed
              empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
              [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
              [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
              [&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:text-xs [&_pre]:font-mono
              [&_code]:font-mono [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded
              [&_a]:text-indigo-500 [&_a]:underline"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground/70 px-6 py-3 border-t border-border/40">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoSave}
              onCheckedChange={setAutoSave}
              id="autosave"
            />
            <label htmlFor="autosave">Autosave</label>
            {!autoSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualSave}
                className="h-6 px-2 text-xs"
              >
                Save now
              </Button>
            )}
          </div>
          <AnimatePresence mode="wait">
            {isSaving && (
              <motion.span
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-indigo-500 font-medium"
              >
                Saving…
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        resourceType="note"
        resourceId={id}
      />
    </motion.div>
  );
}
