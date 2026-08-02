import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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
import {
  ArrowLeft,
  Share2,
  Trash2,
  MessageSquare,
  FileDown,
  Printer,
  PenLine,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { NotebookSplash } from "~/components/dashboard/notebook/notebook-splash";
import { ShareDialog } from "~/components/dashboard/notebook/share-dialog";
import { RichTextToolbar } from "~/components/dashboard/notebook/rich-text-toolbar";
import { FindReplacePanel } from "~/components/dashboard/notebook/find-replace-panel";
import { TableModal } from "~/components/dashboard/notebook/table-modal";
import { EmbedDialog } from "~/components/dashboard/notebook/embed-dialog";
import { CommentsPanel } from "~/components/dashboard/notebook/comments-panel";
import {
  CursorProvider,
  Cursor,
  CursorFollow,
} from "~/components/dashboard/notebook/cursor";
import { sanitizeNoteHtml } from "~/lib/sanitize-html";
import { computeNoteStats, type NoteStats } from "~/lib/note-stats";
import { downloadNoteAsMarkdown } from "~/lib/note-export";
import { uploadNoteImage } from "~/lib/api/media";
import { deleteNote, getNote, updateNote } from "~/lib/api/notes";
import type { NoteRecord } from "~/types/storage";
import FloatingMenu from "~/components/dashboard/notebook/floating-menu";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  return { id: params.id!, notePromise: getNote(params.id!) };
}

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

function ensureEscapeParagraphs(block: HTMLElement) {
  if (!block.previousElementSibling) {
    const before = document.createElement("p");
    before.innerHTML = "<br>";
    block.before(before);
  }
  if (!block.nextElementSibling) {
    const after = document.createElement("p");
    after.innerHTML = "<br>";
    block.after(after);
  }
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
  const [title, setTitle] = useState(initialNote.title);
  const [autoSave, setAutoSave] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [stats, setStats] = useState<NoteStats>(() =>
    computeNoteStats(initialNote.content?.text ?? ""),
  );
  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const titleSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchIndexRef = useRef(-1);
  const savedRangeRef = useRef<Range | null>(null);
  const consecutiveEnterRef = useRef(0);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = sanitizeNoteHtml(
        initialNote.content?.text ?? "",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
      if (contentSaveTimer.current) clearTimeout(contentSaveTimer.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFindOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
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
      setTitle(value);
      if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
      titleSaveTimer.current = setTimeout(
        () => persistFields({ title: value }),
        500,
      );
    },
    [persistFields],
  );

  const handleEditorInput = useCallback(() => {
    const rawHtml = editorRef.current?.innerHTML ?? "";
    const clean = sanitizeNoteHtml(rawHtml);
    setStats(computeNoteStats(clean));
    if (!autoSave) return;
    if (contentSaveTimer.current) clearTimeout(contentSaveTimer.current);
    contentSaveTimer.current = setTimeout(
      () => persistFields({ text: clean }),
      800,
    );
  }, [autoSave, persistFields]);

  const handleManualSave = useCallback(() => {
    const clean = sanitizeNoteHtml(editorRef.current?.innerHTML ?? "");
    persistFields({ text: clean });
  }, [persistFields]);

  const handleDelete = useCallback(() => {
    const fd = new FormData();
    fd.set("intent", "delete");
    fetcher.submit(fd, { method: "POST" });
    navigate("/dashboard/notes");
  }, [fetcher, navigate]);

  const handleEditorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement && target.type === "checkbox") {
        if (target.checked) target.setAttribute("checked", "");
        else target.removeAttribute("checked");
        const span = target.nextElementSibling as HTMLElement | null;
        span?.classList.toggle("line-through", target.checked);
        span?.classList.toggle("text-muted-foreground", target.checked);
        handleEditorInput();
      }
    },
    [handleEditorInput],
  );

  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Enter" || e.shiftKey) {
        consecutiveEnterRef.current = 0;
        return;
      }
      const sel = window.getSelection();
      const root = editorRef.current;
      if (!sel || sel.rangeCount === 0 || !root) {
        consecutiveEnterRef.current = 0;
        return;
      }
      let node: Node | null = sel.getRangeAt(0).startContainer;
      let escapable: HTMLElement | null = null;
      while (node && node !== root) {
        if (
          node instanceof HTMLElement &&
          (node.tagName === "PRE" || node.tagName === "BLOCKQUOTE")
        ) {
          escapable = node;
          break;
        }
        node = node.parentNode;
      }
      if (!escapable) {
        consecutiveEnterRef.current = 0;
        return;
      }
      consecutiveEnterRef.current += 1;
      if (consecutiveEnterRef.current < 2) return;
      e.preventDefault();
      consecutiveEnterRef.current = 0;
      ensureEscapeParagraphs(escapable);
      const landing = escapable.nextElementSibling as HTMLElement;
      const newRange = document.createRange();
      newRange.setStart(landing, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      handleEditorInput();
    },
    [handleEditorInput],
  );

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      editorRef.current?.contains(sel.anchorNode)
    ) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }, []);

  const insertHtmlAtCursor = useCallback(
    (html: string) => {
      requestAnimationFrame(() => {
        restoreSelection();
        document.execCommand("insertHTML", false, html);
        handleEditorInput();
      });
    },
    [restoreSelection, handleEditorInput],
  );

  const handleImageFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const media = await uploadNoteImage(id, file);
      if (media)
        insertHtmlAtCursor(
          `<p><img src="${media.url}" alt="" style="max-width:100%"></p>`,
        );
    },
    [id, insertHtmlAtCursor],
  );

  // Shared by both the fixed toolbar's "Insert image" button and
  // FloatingMenu's — same selection-preserving pattern as tables/embeds.
  const requestImageInsert = useCallback(() => {
    saveSelection();
    imageInputRef.current?.click();
  }, [saveSelection]);

  const requestShare = useCallback(() => setShareOpen(true), []);

  const exec = useCallback(
    (cmd: string, val?: string) => {
      if (cmd === "find") {
        setFindOpen(true);
        return;
      }
      if (cmd === "insertTable") {
        saveSelection();
        setTableOpen(true);
        return;
      }
      if (cmd === "insertEmbed") {
        saveSelection();
        setEmbedOpen(true);
        return;
      }
      if (cmd === "insertImage") {
        requestImageInsert();
        return;
      }

      editorRef.current?.focus();

      if (cmd === "createLink") {
        const url = window.prompt("Link URL", "https://");
        if (!url) return;
        document.execCommand("createLink", false, url);
      } else if (cmd === "blockquote") {
        document.execCommand("formatBlock", false, "blockquote");
        const sel = window.getSelection();
        const anchor = sel?.anchorNode;
        const anchorEl =
          anchor instanceof Element ? anchor : anchor?.parentElement;
        const bq = anchorEl?.closest("blockquote");
        if (bq && editorRef.current?.contains(bq)) ensureEscapeParagraphs(bq);
      } else if (cmd === "checklist") {
        document.execCommand(
          "insertHTML",
          false,
          '<div><input type="checkbox" /><span>New item</span></div><br>',
        );
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
          ensureEscapeParagraphs(pre);
        }
      } else {
        document.execCommand(cmd, false, val);
      }

      handleEditorInput();
    },
    [handleEditorInput, saveSelection, requestImageInsert],
  );

  const findMatches = useCallback((query: string): Range[] => {
    const root = editorRef.current;
    if (!root || !query) return [];
    const ranges: Range[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const lowerQuery = query.toLowerCase();
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent ?? "";
      const lowerText = text.toLowerCase();
      let idx = 0;
      while ((idx = lowerText.indexOf(lowerQuery, idx)) !== -1) {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + query.length);
        ranges.push(range);
        idx += query.length;
      }
    }
    return ranges;
  }, []);

  const handleFind = useCallback(
    (query: string, direction: "next" | "prev") => {
      const ranges = findMatches(query);
      if (ranges.length === 0) {
        matchIndexRef.current = -1;
        return 0;
      }
      matchIndexRef.current =
        direction === "next"
          ? (matchIndexRef.current + 1 + ranges.length) % ranges.length
          : (matchIndexRef.current - 1 + ranges.length) % ranges.length;
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(ranges[matchIndexRef.current]);
      ranges[
        matchIndexRef.current
      ].startContainer.parentElement?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
      return ranges.length;
    },
    [findMatches],
  );

  const handleReplaceAll = useCallback(
    (query: string, replacement: string) => {
      const root = editorRef.current;
      if (!root || !query) return 0;
      let count = 0;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) textNodes.push(node as Text);
      const lowerQuery = query.toLowerCase();
      textNodes.forEach((textNode) => {
        const text = textNode.textContent ?? "";
        const lowerText = text.toLowerCase();
        if (!lowerText.includes(lowerQuery)) return;
        let result = "";
        let idx = 0;
        let searchIdx: number;
        while ((searchIdx = lowerText.indexOf(lowerQuery, idx)) !== -1) {
          result += text.slice(idx, searchIdx) + replacement;
          idx = searchIdx + query.length;
          count++;
        }
        result += text.slice(idx);
        textNode.textContent = result;
      });
      if (count > 0) handleEditorInput();
      return count;
    },
    [handleEditorInput],
  );

  const isSaving = fetcher.state !== "idle";

  return (
    <div className="relative h-screen w-full">
      <FloatingMenu
        editorRef={editorRef}
        onChange={handleEditorInput}
        onRequestImage={requestImageInsert}
        onRequestShare={requestShare}
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full h-full flex flex-col p-3 sm:p-8 gap-4 sm:gap-6 max-w-6xl mx-auto"
      >
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/dashboard/notes"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft size={16} />{" "}
            <span className="hidden sm:inline">Back to notes</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadNoteAsMarkdown(
                  title,
                  editorRef.current?.innerHTML ?? "",
                )
              }
              className="gap-1.5 shrink-0"
            >
              <FileDown size={14} />{" "}
              <span className="hidden md:inline">Export .md</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 shrink-0"
            >
              <Printer size={14} />{" "}
              <span className="hidden md:inline">Print / PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommentsOpen((v) => !v)}
              className="gap-1.5 shrink-0"
            >
              <MessageSquare size={14} />{" "}
              <span className="hidden md:inline">Comments</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="gap-1.5 shrink-0"
            >
              <Share2 size={14} />{" "}
              <span className="hidden md:inline">Share</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="gap-1.5 shrink-0"
            >
              <Trash2 size={14} />{" "}
              <span className="hidden md:inline">Delete</span>
            </Button>
          </div>
        </div>

        <div
          className="flex-1 flex flex-col rounded-2xl border border-border/50 shadow-sm transition-colors overflow-hidden"
          style={{
            backgroundColor:
              initialNote.color !== "#ffffff" ? initialNote.color : undefined,
          }}
        >
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="text-xl sm:text-2xl font-bold bg-transparent outline-none border-b border-transparent focus:border-border/60 px-4 sm:px-6 pt-4 sm:pt-6 pb-2 transition-colors"
          />

          <RichTextToolbar onCommand={exec} />

          <AnimatePresence>
            {findOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden print:hidden"
              >
                <FindReplacePanel
                  onClose={() => setFindOpen(false)}
                  onFind={handleFind}
                  onReplaceAll={handleReplaceAll}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* CursorProvider tracks mouse position within THIS wrapper (its
              parent) and hides the native cursor while active — a local
              decorative touch, not multiplayer presence. On touch devices
              mousemove never fires, so it's naturally inert there. */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 relative">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              onInput={handleEditorInput}
              onClick={handleEditorClick}
              onKeyDown={handleEditorKeyDown}
              data-placeholder="Start typing your note content..."
              className="min-h-[300px] outline-none text-sm text-foreground/90 leading-relaxed
                empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2
                [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
                [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
                [&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:text-xs [&_pre]:font-mono [&_pre]:max-w-full
                [&_code]:font-mono [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded
                [&_a]:text-indigo-500 [&_a]:underline
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:block [&_table]:overflow-x-auto sm:[&_table]:table
                [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_th]:text-left
                [&_td]:border [&_td]:border-border [&_td]:p-2
                [&_img]:rounded-lg [&_img]:my-2 [&_img]:max-w-full
                [&_iframe]:rounded-lg [&_iframe]:my-2 [&_iframe]:max-w-full
                [&_input[type='checkbox']]:mr-2"
            />
            <CursorProvider className="contents">
              <Cursor>
                <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]" />
              </Cursor>
              <CursorFollow align="bottom-right">
                <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-medium text-white shadow-lg">
                  <PenLine size={10} /> Editing
                </span>
              </CursorFollow>
            </CursorProvider>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 text-xs text-muted-foreground/70 px-4 sm:px-6 py-3 border-t border-border/40 print:hidden">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span>
                {stats.words} words
                {stats.minutes > 0 ? ` · ${stats.minutes} min read` : ""}
              </span>
              <div className="hidden sm:block w-px h-4 bg-border/40" />
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

          <AnimatePresence>
            {commentsOpen && <CommentsPanel noteId={id} />}
          </AnimatePresence>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFileChange}
        />

        <TableModal
          open={tableOpen}
          onOpenChange={setTableOpen}
          onInsert={insertHtmlAtCursor}
        />
        <EmbedDialog
          open={embedOpen}
          onOpenChange={setEmbedOpen}
          onInsert={insertHtmlAtCursor}
        />
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          resourceType="note"
          resourceId={id}
        />
      </motion.div>
    </div>
  );
}
