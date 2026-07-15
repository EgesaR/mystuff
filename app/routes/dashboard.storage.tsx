// routes/dashboard.storage.tsx
import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/dashboard.storage";
import {
  File as FileIcon,
  Image as ImageIcon,
  FileVideo,
  FileAudio,
  Folder,
  FolderPlus,
  Trash2,
  Search,
  List,
  Grid,
  SortAsc,
  SortDesc,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  X,
  Move,
  Download,
} from "lucide-react";
import  UploadDropzone  from "~/components/dashboard/uploads/UploadDropzone";
import { useUploads } from "~/context/UploadContext";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

export const meta: Route.MetaFunction = () => [{ title: "Storage" }];

// ── Types ─────────────────────────────────────────────────────────────────

interface FolderRecord {
  id: string;
  name: string;
  color: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

interface FileRecord {
  id: string;
  name: string;
  original_name: string;
  file_path: string;
  url: string;
  mime_type: string | null;
  size_bytes: number;
  media_type: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

type SortKey = "name" | "size" | "modified";

const FOLDER_COLORS = [
  "#6366f1",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
  "#64748b",
];

const SOFT_STORAGE_CAP_BYTES = 10 * 1024 * 1024 * 1024; // cosmetic only — not backend-enforced

// ── Helpers ───────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** exp).toFixed(exp === 0 ? 0 : 1)} ${units[exp]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function iconFor(mime: string | null) {
  if (!mime) return FileIcon;
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime.startsWith("video/")) return FileVideo;
  if (mime.startsWith("audio/")) return FileAudio;
  return FileIcon;
}

// ── Minimal modal (you don't have components/ui/dialog.tsx yet) ──────────

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-card border border-border/50 rounded-2xl shadow-xl p-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function StorageWorkspace() {
  const { uploads } = useUploads();

  const [allFiles, setAllFiles] = useState<FileRecord[]>([]);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string | null; name: string }[]
  >([{ id: null, name: "My Files" }]);
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const [folderMenuOpenId, setFolderMenuOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);
  const [renameTarget, setRenameTarget] = useState<FolderRecord | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [movePopoverOpen, setMovePopoverOpen] = useState(false);

  const refreshFiles = async () => {
    const res = await fetch("/api/files", { credentials: "include" });
    if (res.ok) setAllFiles(await res.json());
    setLoading(false);
  };

  const refreshFolders = async (parentId: string | null) => {
    const qs = parentId ? `?parent_id=${parentId}` : "";
    const res = await fetch(`/api/files/folders${qs}`, {
      credentials: "include",
    });
    if (res.ok) setFolders(await res.json());
  };

  useEffect(() => {
    refreshFiles();
  }, []);

  useEffect(() => {
    refreshFolders(currentFolderId);
    setSelected(new Set());
  }, [currentFolderId]);

  // Refresh after uploads land in this folder
  const doneCount = uploads.filter((u) => u.status === "done").length;
  useEffect(() => {
    if (doneCount > 0) refreshFiles();
  }, [doneCount]);

  const isSearching = query.trim().length > 0;

  const visibleFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = isSearching
      ? allFiles.filter((f) => f.name.toLowerCase().includes(q))
      : allFiles.filter((f) => (f.folder_id ?? null) === currentFolderId);

    const sorted = [...base].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "size") cmp = a.size_bytes - b.size_bytes;
      else
        cmp =
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [allFiles, query, isSearching, currentFolderId, sortBy, sortDir]);

  const totalUsed = useMemo(
    () => allFiles.reduce((sum, f) => sum + f.size_bytes, 0),
    [allFiles],
  );
  const usagePct = Math.min(100, (totalUsed / SOFT_STORAGE_CAP_BYTES) * 100);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of allFiles)
      counts[f.media_type] = (counts[f.media_type] ?? 0) + 1;
    return counts;
  }, [allFiles]);

  // ── Folder actions ──

  const openFolder = (folder: FolderRecord) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const goToBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const res = await fetch("/api/files/folders", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newFolderName.trim(),
        color: newFolderColor,
        parent_id: currentFolderId,
      }),
    });
    if (res.ok) {
      const folder = await res.json();
      setFolders((prev) => [...prev, folder]);
    }
    setNewFolderName("");
    setNewFolderColor(FOLDER_COLORS[0]);
    setCreateOpen(false);
  };

  const renameFolder = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    const res = await fetch(`/api/files/folders/${renameTarget.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFolders((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f)),
      );
    }
    setRenameTarget(null);
  };

  const deleteFolder = async (folder: FolderRecord) => {
    if (
      !confirm(
        `Delete "${folder.name}"? Files inside will move to My Files, not be deleted.`,
      )
    )
      return;
    setFolders((prev) => prev.filter((f) => f.id !== folder.id));
    await fetch(`/api/files/folders/${folder.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    refreshFiles(); // folder_id on its files resets to null server-side
  };

  // ── File actions ──

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.size === visibleFiles.length
        ? new Set()
        : new Set(visibleFiles.map((f) => f.id)),
    );
  };

  const deleteFile = async (id: string) => {
    setAllFiles((prev) => prev.filter((f) => f.id !== id));
    await fetch(`/api/files/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const deleteSelected = async () => {
    const ids = Array.from(selected);
    if (
      !confirm(
        `Delete ${ids.length} file${ids.length > 1 ? "s" : ""}? This can't be undone.`,
      )
    )
      return;
    setAllFiles((prev) => prev.filter((f) => !selected.has(f.id)));
    setSelected(new Set());
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/files/${id}`, { method: "DELETE", credentials: "include" }),
      ),
    );
  };

  const moveFiles = async (ids: string[], targetFolderId: string | null) => {
    setAllFiles((prev) =>
      prev.map((f) =>
        ids.includes(f.id) ? { ...f, folder_id: targetFolderId } : f,
      ),
    );
    setSelected(new Set());
    setMovePopoverOpen(false);
    await Promise.all(
      ids.map((id) => {
        const qs = targetFolderId ? `?folder_id=${targetFolderId}` : "";
        return fetch(`/api/files/${id}/move${qs}`, {
          method: "PATCH",
          credentials: "include",
        });
      }),
    );
  };

  // Native drag-and-drop: rows -> folder cards / breadcrumb root
  const handleRowDragStart = (e: React.DragEvent, fileId: string) => {
    const ids = selected.has(fileId) ? Array.from(selected) : [fileId];
    e.dataTransfer.setData("text/plain", JSON.stringify(ids));
  };
  const handleFolderDrop = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(null);
    const ids = JSON.parse(e.dataTransfer.getData("text/plain")) as string[];
    moveFiles(ids, targetId);
  };

  return (
    <div className="w-full h-full flex flex-col py-8 px-8 gap-5 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Cloud Storage
          </h1>
          <p className="text-muted-foreground text-sm">
            Files and folders synced to your account.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 w-48">
          <span className="text-xs text-muted-foreground">
            {formatBytes(totalUsed)} used
          </span>
          <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Type summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { key: "image", label: "Images", Icon: ImageIcon },
          { key: "video", label: "Videos", Icon: FileVideo },
          { key: "audio", label: "Audio", Icon: FileAudio },
          { key: "file", label: "Files", Icon: FileIcon },
        ].map(({ key, label, Icon }) => (
          <div
            key={key}
            className="flex items-center gap-2.5 px-3 py-2.5 bg-card border border-border/50 rounded-xl shadow-sm"
          >
            <div className="size-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
              <Icon size={14} className="text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">
                {typeCounts[key] ?? 0}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative w-64">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all files…"
            className="w-full h-8 rounded-lg border border-border bg-background pl-7 pr-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-8 rounded-lg border border-border bg-background px-2 text-[13px]"
          >
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="modified">Modified</option>
          </select>
          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5"
          >
            {sortDir === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />}
          </button>
          <div className="flex items-center gap-1 rounded-lg bg-black/5 dark:bg-white/5 p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "size-6 flex items-center justify-center rounded-md",
                viewMode === "list" && "bg-white dark:bg-neutral-800 shadow-sm",
              )}
            >
              <List size={13} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "size-6 flex items-center justify-center rounded-md",
                viewMode === "grid" && "bg-white dark:bg-neutral-800 shadow-sm",
              )}
            >
              <Grid size={13} />
            </button>
          </div>
          <Button
            size="sm"
            className="h-8 rounded-lg gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <FolderPlus size={14} /> New Folder
          </Button>
        </div>
      </div>

      {/* Breadcrumbs */}
      {!isSearching && (
        <div className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.id ?? "root"} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight size={13} className="text-muted-foreground" />
              )}
              <button
                onClick={() => goToBreadcrumb(i)}
                onDragOver={(e) => i === 0 && e.preventDefault()}
                onDrop={(e) => i === 0 && handleFolderDrop(e, null)}
                className={cn(
                  "px-1.5 py-0.5 rounded-md transition-colors",
                  i === breadcrumbs.length - 1
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
                )}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Folder grid */}
      {!isSearching && folders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => openFolder(folder)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverFolderId(folder.id);
              }}
              onDragLeave={() => setDragOverFolderId(null)}
              onDrop={(e) => handleFolderDrop(e, folder.id)}
              className={cn(
                "group relative flex items-center gap-2.5 px-3 py-3 bg-card border rounded-xl shadow-sm cursor-pointer transition-colors",
                dragOverFolderId === folder.id
                  ? "border-indigo-500/50 ring-2 ring-indigo-500/30"
                  : "border-border/50 hover:border-border",
              )}
            >
              <Folder
                size={20}
                style={{ color: folder.color }}
                className="shrink-0"
                fill={folder.color}
                fillOpacity={0.15}
              />
              <span className="text-sm font-medium truncate flex-1">
                {folder.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFolderMenuOpenId(
                    folderMenuOpenId === folder.id ? null : folder.id,
                  );
                }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground shrink-0"
              >
                <MoreHorizontal size={15} />
              </button>

              {folderMenuOpenId === folder.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-2 top-10 z-20 w-36 bg-card border border-border/50 rounded-lg shadow-lg py-1"
                >
                  <button
                    onClick={() => {
                      setRenameTarget(folder);
                      setRenameValue(folder.name);
                      setFolderMenuOpenId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Pencil size={12} /> Rename
                  </button>
                  <button
                    onClick={() => {
                      deleteFolder(folder);
                      setFolderMenuOpenId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-500/5"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <UploadDropzone folderId={currentFolderId} />

      {/* Files */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="py-12 flex items-center justify-center text-sm text-muted-foreground m-auto">
            Loading…
          </div>
        ) : visibleFiles.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4 m-auto">
            <span className="text-sm text-muted-foreground">
              {isSearching
                ? "No files match your search."
                : "No files here yet."}
            </span>
          </div>
        ) : viewMode === "list" ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                <th className="w-10 py-2 pl-4">
                  <input
                    type="checkbox"
                    checked={
                      selected.size > 0 && selected.size === visibleFiles.length
                    }
                    onChange={toggleSelectAll}
                    className="accent-indigo-600"
                  />
                </th>
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Size</th>
                <th className="py-2 font-medium">Modified</th>
                <th className="w-16 py-2 pr-4 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {visibleFiles.map((file) => {
                const Icon = iconFor(file.mime_type);
                return (
                  <tr
                    key={file.id}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, file.id)}
                    className={cn(
                      "group border-b border-border/30 last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]",
                      selected.has(file.id) && "bg-indigo-500/5",
                    )}
                  >
                    <td className="py-2 pl-4">
                      <input
                        type="checkbox"
                        checked={selected.has(file.id)}
                        onChange={() => toggleSelected(file.id)}
                        className="accent-indigo-600"
                      />
                    </td>

                    <td className="py-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 hover:underline truncate max-w-xs"
                      >
                        <Icon
                          size={14}
                          className="text-muted-foreground shrink-0"
                        />
                        <span className="truncate">{file.name}</span>
                      </a>
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {formatBytes(file.size_bytes)}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {formatDate(file.updated_at)}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 overflow-y-auto">
            {visibleFiles.map((file) => {
              const Icon = iconFor(file.mime_type);
              const isImage = file.mime_type?.startsWith("image/");
              return (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleRowDragStart(e, file.id)}
                  className={cn(
                    "group relative flex flex-col rounded-xl border overflow-hidden",
                    selected.has(file.id)
                      ? "border-indigo-500/50 ring-2 ring-indigo-500/30"
                      : "border-border/50",
                  )}
                >
                  <label className="absolute left-2 top-2 z-10">
                    <input
                      type="checkbox"
                      checked={selected.has(file.id)}
                      onChange={() => toggleSelected(file.id)}
                      className="accent-indigo-600"
                    />
                  </label>
                  <div className="h-24 bg-black/5 dark:bg-white/5 flex items-center justify-center">
                    {isImage ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon size={22} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatBytes(file.size_bytes)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 bg-white/80 dark:bg-black/50 rounded-full p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-full border border-black/5 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-lg">
          <span className="text-xs font-medium px-2">
            {selected.size} selected
          </span>
          <div className="h-4 w-px bg-border mx-1" />

          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 rounded-full text-xs gap-1"
              onClick={() => setMovePopoverOpen((v) => !v)}
            >
              <Move size={13} /> Move to
            </Button>
            {movePopoverOpen && (
              <div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-40 bg-card border border-border/50 rounded-lg shadow-lg py-1">
                <button
                  onClick={() => moveFiles(Array.from(selected), null)}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5"
                >
                  My Files (root)
                </button>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => moveFiles(Array.from(selected), f.id)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5 truncate"
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 rounded-full text-xs gap-1"
            onClick={() => {
              const first = allFiles.find((f) => selected.has(f.id));
              selected.forEach((id) => {
                const f = allFiles.find((x) => x.id === id);
                if (f) window.open(f.url, "_blank", "noopener,noreferrer");
              });
            }}
          >
            <Download size={13} /> Download
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 rounded-full text-xs gap-1 text-red-600 hover:text-red-600"
            onClick={deleteSelected}
          >
            <Trash2 size={13} /> Delete
          </Button>

          <button
            onClick={() => setSelected(new Set())}
            className="text-muted-foreground hover:text-foreground p-1.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Create folder modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Folder"
      >
        <input
          autoFocus
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createFolder()}
          placeholder="Folder name"
          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 mb-3"
        />
        <div className="flex items-center gap-1.5 mb-4">
          {FOLDER_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setNewFolderColor(color)}
              className={cn(
                "size-6 rounded-full border-2 transition-transform",
                newFolderColor === color
                  ? "border-foreground scale-110"
                  : "border-transparent",
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <Button
          onClick={createFolder}
          className="w-full rounded-lg"
          disabled={!newFolderName.trim()}
        >
          Create Folder
        </Button>
      </Modal>

      {/* Rename folder modal */}
      <Modal
        open={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        title="Rename Folder"
      >
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && renameFolder()}
          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 mb-4"
        />
        <Button
          onClick={renameFolder}
          className="w-full rounded-lg"
          disabled={!renameValue.trim()}
        >
          Save
        </Button>
      </Modal>
    </div>
  );
}
