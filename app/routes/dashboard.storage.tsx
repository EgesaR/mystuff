// routes/dashboard.storage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "./+types/dashboard.storage";
import {
  File as FileIcon,
  Image as ImageIcon,
  FileVideo,
  FileAudio,
  Folder,
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
  UploadCloud,
  Plus,
  Layers,
  ArrowLeft,
  ExternalLink,
  FolderPlus,
  Clock,
  type LucideIcon,
} from "lucide-react";
import UploadDropzone from "~/components/dashboard/uploads/UploadDropzone";
import { useUploads } from "~/context/UploadContext";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useClickOutside } from "~/hooks/useClickOutside";
import { useClickTimer, useLongPress } from "~/hooks/useItemInteractions";
import { useBoxSelect } from "~/hooks/useBoxSelect";
import {
  ContextMenu,
  type ContextMenuItem,
} from "~/components/dashboard/storage/ContextMenu";
import { MediaViewer } from "~/components/dashboard/storage/MediaViewer";
import { CreateItemModal } from "~/components/dashboard/storage/CreateItemModal";
import { CollectionPickerMenu } from "~/components/dashboard/storage/CollectionPickerMenu";

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

interface CollectionRecord {
  id: string;
  name: string;
  color: string;
  file_count?: number;
  created_at: string;
  updated_at: string;
}

type SortKey = "name" | "size" | "modified";
type CreateType = "folder" | "collection";

type RenameTarget =
  | { kind: "folder"; item: FolderRecord }
  | { kind: "file"; item: FileRecord }
  | { kind: "collection"; item: CollectionRecord }
  | null;

interface CtxMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

interface ViewerState {
  files: FileRecord[];
  index: number;
}

interface CollectionPickerState {
  x: number;
  y: number;
  fileIds: string[];
  memberIds?: Set<string>;
}

const MEDIA_TYPES: {
  key: string;
  label: string;
  Icon: LucideIcon;
  color: string;
}[] = [
  { key: "image", label: "Images", Icon: ImageIcon, color: "#6366f1" },
  { key: "video", label: "Videos", Icon: FileVideo, color: "#f43f5e" },
  { key: "audio", label: "Audio", Icon: FileAudio, color: "#f59e0b" },
  { key: "file", label: "Files", Icon: FileIcon, color: "#64748b" },
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

function isMediaFile(file: FileRecord): boolean {
  return (
    !!file.mime_type &&
    (file.mime_type.startsWith("image/") ||
      file.mime_type.startsWith("video/") ||
      file.mime_type.startsWith("audio/"))
  );
}

// ── Minimal modal (used for rename) ───────────────────────────────────────

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
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose, open);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        ref={ref}
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

// ── Usage ring ──────────────────────────────────────────────────────────

function UsageRing({ pct }: { pct: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, pct / 100)) * c;
  return (
    <svg
      width={60}
      height={60}
      viewBox="0 0 64 64"
      className="-rotate-90 shrink-0"
    >
      <circle
        cx={32}
        cy={32}
        r={r}
        fill="none"
        strokeWidth={6}
        className="stroke-black/5 dark:stroke-white/10"
      />
      <circle
        cx={32}
        cy={32}
        r={r}
        fill="none"
        stroke="url(#storageRingGradient)"
        strokeWidth={6}
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="storageRingGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Folder card ────────────────────────────────────────────────────────────

function FolderCard({
  folder,
  isDragOver,
  onOpen,
  onDragOver,
  onDragLeave,
  onDrop,
  onContextMenuRequest,
}: {
  folder: FolderRecord;
  isDragOver: boolean;
  onOpen: () => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onContextMenuRequest: (x: number, y: number) => void;
}) {
  const longPress = useLongPress((x, y) => onContextMenuRequest(x, y));

  return (
    <div
      onClick={onOpen}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenuRequest(e.clientX, e.clientY);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...longPress}
      className={cn(
        "group relative flex items-center gap-2.5 px-3 py-3 bg-card border rounded-xl shadow-sm cursor-pointer transition-all select-none",
        isDragOver
          ? "border-indigo-500/50 ring-2 ring-indigo-500/30 scale-[1.02]"
          : "border-border/50 hover:border-border hover:shadow-md",
      )}
    >
      <Folder
        size={20}
        style={{ color: folder.color }}
        className="shrink-0"
        fill={folder.color}
        fillOpacity={0.15}
      />
      <span className="text-sm font-medium truncate flex-1">{folder.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          onContextMenuRequest(rect.left, rect.bottom + 4);
        }}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground shrink-0 transition-opacity"
      >
        <MoreHorizontal size={15} />
      </button>
    </div>
  );
}

// ── Collection card ─────────────────────────────────────────────────────────

function CollectionCard({
  collection,
  onOpen,
  onContextMenuRequest,
}: {
  collection: CollectionRecord;
  onOpen: () => void;
  onContextMenuRequest: (x: number, y: number) => void;
}) {
  const longPress = useLongPress((x, y) => onContextMenuRequest(x, y));

  return (
    <div
      onClick={onOpen}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenuRequest(e.clientX, e.clientY);
      }}
      {...longPress}
      className="group relative flex items-center gap-2.5 px-3 py-3 bg-card border border-border/50 rounded-xl shadow-sm cursor-pointer hover:border-border hover:shadow-md transition-all select-none"
    >
      <div
        className="size-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${collection.color}22` }}
      >
        <Layers size={16} style={{ color: collection.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{collection.name}</p>
        {collection.file_count !== undefined && (
          <p className="text-[11px] text-muted-foreground">
            {collection.file_count} item{collection.file_count === 1 ? "" : "s"}
          </p>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          onContextMenuRequest(rect.left, rect.bottom + 4);
        }}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground shrink-0 transition-opacity"
      >
        <MoreHorizontal size={15} />
      </button>
    </div>
  );
}

// ── File row / tile shared interaction props ────────────────────────────────

interface FileItemProps {
  file: FileRecord;
  checked: boolean;
  selectionActive: boolean;
  isDropTarget: boolean;
  onToggleCheck: () => void;
  onSelect: (additive: boolean) => void;
  onOpen: () => void;
  onContextMenuRequest: (x: number, y: number) => void;
  onDragStartFile: (e: React.DragEvent) => void;
  onDragOverFile: () => void;
  onDragLeaveFile: () => void;
  onDropOnFile: (e: React.DragEvent) => void;
  onDelete: () => void;
}

function FileListRow({
  file,
  checked,
  selectionActive,
  isDropTarget,
  onToggleCheck,
  onSelect,
  onOpen,
  onContextMenuRequest,
  onDragStartFile,
  onDragOverFile,
  onDragLeaveFile,
  onDropOnFile,
  onDelete,
}: FileItemProps) {
  const { onClick } = useClickTimer(
    (e) => onSelect(e.metaKey || e.ctrlKey),
    () => onOpen(),
  );
  const longPress = useLongPress((x, y) => onContextMenuRequest(x, y));
  const Icon = iconFor(file.mime_type);

  return (
    <tr
      data-item-id={file.id}
      draggable
      onDragStart={(e) => {
        onDragStartFile(e);
        e.currentTarget.classList.add("opacity-40");
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove("opacity-40")}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOverFile();
      }}
      onDragLeave={onDragLeaveFile}
      onDrop={onDropOnFile}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenuRequest(e.clientX, e.clientY);
      }}
      {...longPress}
      className={cn(
        "group border-b border-border/30 last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer select-none transition-colors",
        checked && "bg-indigo-500/5",
        isDropTarget && "ring-2 ring-inset ring-indigo-500/40 bg-indigo-500/5",
      )}
    >
      <td className="py-2 pl-4" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggleCheck}
          className={cn(
            "accent-indigo-600 transition-opacity",
            checked || selectionActive
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100",
          )}
        />
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2 truncate max-w-xs">
          <Icon size={14} className="text-muted-foreground shrink-0" />
          <span className="truncate">{file.name}</span>
        </div>
      </td>
      <td className="py-2 text-muted-foreground">
        {formatBytes(file.size_bytes)}
      </td>
      <td className="py-2 text-muted-foreground">
        {formatDate(file.updated_at)}
      </td>
      <td className="py-2 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

function FileGridTile({
  file,
  checked,
  selectionActive,
  isDropTarget,
  onToggleCheck,
  onSelect,
  onOpen,
  onContextMenuRequest,
  onDragStartFile,
  onDragOverFile,
  onDragLeaveFile,
  onDropOnFile,
  onDelete,
}: FileItemProps) {
  const { onClick } = useClickTimer(
    (e) => onSelect(e.metaKey || e.ctrlKey),
    () => onOpen(),
  );
  const longPress = useLongPress((x, y) => onContextMenuRequest(x, y));
  const Icon = iconFor(file.mime_type);
  const isImage = file.mime_type?.startsWith("image/");

  return (
    <div
      data-item-id={file.id}
      draggable
      onDragStart={(e) => {
        onDragStartFile(e);
        e.currentTarget.classList.add("opacity-40", "scale-95");
      }}
      onDragEnd={(e) =>
        e.currentTarget.classList.remove("opacity-40", "scale-95")
      }
      onDragOver={(e) => {
        e.preventDefault();
        onDragOverFile();
      }}
      onDragLeave={onDragLeaveFile}
      onDrop={onDropOnFile}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenuRequest(e.clientX, e.clientY);
      }}
      {...longPress}
      className={cn(
        "group relative flex flex-col rounded-xl border overflow-hidden cursor-pointer select-none transition-all active:scale-[0.98]",
        checked || isDropTarget
          ? "border-indigo-500/50 ring-2 ring-indigo-500/30"
          : "border-border/50 hover:shadow-md",
      )}
    >
      <label
        className="absolute left-2 top-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggleCheck}
          className={cn(
            "accent-indigo-600 transition-opacity",
            checked || selectionActive
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100",
          )}
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
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 bg-white/80 dark:bg-black/50 rounded-full p-1 transition-opacity"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ── File table (list/grid switch, shared by Files and Collection views) ────

interface FileTableProps {
  files: FileRecord[];
  loading: boolean;
  emptyMessage: string;
  viewMode: "list" | "grid";
  selected: Set<string>;
  onToggleSelected: (id: string) => void;
  onSelectOnly: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpenFile: (mediaFiles: FileRecord[], index: number) => void;
  onContextMenuRequest: (x: number, y: number, file: FileRecord) => void;
  onDeleteFile: (id: string) => void;
  onDragStartFile: (e: React.DragEvent, fileId: string) => void;
  dragOverFileId: string | null;
  onDragOverFile: (id: string) => void;
  onDragLeaveFile: () => void;
  onDropOnFile: (e: React.DragEvent, file: FileRecord) => void;
}

function FileTable({
  files,
  loading,
  emptyMessage,
  viewMode,
  selected,
  onToggleSelected,
  onSelectOnly,
  onToggleSelectAll,
  onOpenFile,
  onContextMenuRequest,
  onDeleteFile,
  onDragStartFile,
  dragOverFileId,
  onDragOverFile,
  onDragLeaveFile,
  onDropOnFile,
}: FileTableProps) {
  const selectionActive = selected.size > 0;
  const mediaFiles = useMemo(() => files.filter(isMediaFile), [files]);

  const openFile = (file: FileRecord) => {
    if (isMediaFile(file)) {
      const idx = mediaFiles.findIndex((f) => f.id === file.id);
      onOpenFile(mediaFiles, idx === -1 ? 0 : idx);
    } else {
      window.open(file.url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center text-sm text-muted-foreground m-auto">
        Loading…
      </div>
    );
  }
  if (files.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center px-4 m-auto">
        <span className="text-sm text-muted-foreground">{emptyMessage}</span>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <table className="w-full text-sm">
        <thead className="group">
          <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
            <th className="w-10 py-2 pl-4">
              <input
                type="checkbox"
                checked={selected.size > 0 && selected.size === files.length}
                onChange={onToggleSelectAll}
                className={cn(
                  "accent-indigo-600 transition-opacity",
                  selectionActive
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100",
                )}
              />
            </th>
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Size</th>
            <th className="py-2 font-medium">Modified</th>
            <th className="w-16 py-2 pr-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <FileListRow
              key={file.id}
              file={file}
              checked={selected.has(file.id)}
              selectionActive={selectionActive}
              isDropTarget={dragOverFileId === file.id}
              onToggleCheck={() => onToggleSelected(file.id)}
              onSelect={(additive) =>
                additive ? onToggleSelected(file.id) : onSelectOnly(file.id)
              }
              onOpen={() => openFile(file)}
              onContextMenuRequest={(x, y) => onContextMenuRequest(x, y, file)}
              onDragStartFile={(e) => onDragStartFile(e, file.id)}
              onDragOverFile={() => onDragOverFile(file.id)}
              onDragLeaveFile={onDragLeaveFile}
              onDropOnFile={(e) => onDropOnFile(e, file)}
              onDelete={() => onDeleteFile(file.id)}
            />
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
      {files.map((file) => (
        <FileGridTile
          key={file.id}
          file={file}
          checked={selected.has(file.id)}
          selectionActive={selectionActive}
          isDropTarget={dragOverFileId === file.id}
          onToggleCheck={() => onToggleSelected(file.id)}
          onSelect={(additive) =>
            additive ? onToggleSelected(file.id) : onSelectOnly(file.id)
          }
          onOpen={() => openFile(file)}
          onContextMenuRequest={(x, y) => onContextMenuRequest(x, y, file)}
          onDragStartFile={(e) => onDragStartFile(e, file.id)}
          onDragOverFile={() => onDragOverFile(file.id)}
          onDragLeaveFile={onDragLeaveFile}
          onDropOnFile={(e) => onDropOnFile(e, file)}
          onDelete={() => onDeleteFile(file.id)}
        />
      ))}
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
  const [dragOverFileId, setDragOverFileId] = useState<string | null>(null);
  const [movePopoverOpen, setMovePopoverOpen] = useState(false);

  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null);
  const [renameTarget, setRenameTarget] = useState<RenameTarget>(null);
  const [renameValue, setRenameValue] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDefaultType, setCreateDefaultType] =
    useState<CreateType>("folder");
  const [mergeCandidates, setMergeCandidates] = useState<FileRecord[]>([]);

  const [uploadPanelOpen, setUploadPanelOpen] = useState(false);
  const uploadPanelRef = useRef<HTMLDivElement>(null);
  useClickOutside(
    uploadPanelRef,
    () => setUploadPanelOpen(false),
    uploadPanelOpen,
  );

  const [topView, setTopView] = useState<"files" | "recent" | "collections">(
    "files",
  );
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [activeCollection, setActiveCollection] =
    useState<CollectionRecord | null>(null);
  const [collectionFiles, setCollectionFiles] = useState<FileRecord[]>([]);
  const [collectionFilesLoading, setCollectionFilesLoading] = useState(false);
  const [collectionPicker, setCollectionPicker] =
    useState<CollectionPickerState | null>(null);

  const [viewer, setViewer] = useState<ViewerState | null>(null);

  // Lasso / box-select: drag a rectangle over the file list or grid to
  // select everything it overlaps. Scoped to files only (not folders or
  // collections) since bulk actions already operate on file ids.
  const browserContainerRef = useRef<HTMLDivElement>(null);
  const selectionBox = useBoxSelect({
    containerRef: browserContainerRef,
    onSelect: (ids, additive) => {
      setSelected((prev) => {
        if (additive) {
          const next = new Set(prev);
          ids.forEach((id) => next.add(id));
          return next;
        }
        return new Set(ids);
      });
    },
  });

  // ── Data loading ──

  const refreshFiles = async () => {
    try {
      const res = await fetch("/api/files", { credentials: "include" });
      if (res.ok) setAllFiles(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const refreshFolders = async (parentId: string | null) => {
    const qs = parentId ? `?parent_id=${parentId}` : "";
    const res = await fetch(`/api/files/folders${qs}`, {
      credentials: "include",
    });
    if (res.ok) setFolders(await res.json());
  };

  // NOTE: collections are a new concept — this assumes a small REST surface
  // on the backend: GET/POST /api/files/collections, PATCH/DELETE
  // /api/files/collections/{id}, GET/POST /api/files/collections/{id}/files,
  // DELETE /api/files/collections/{id}/files/{file_id}, and optionally
  // GET /api/files/{id}/collections. Calls are wrapped in try/catch so the
  // rest of the page keeps working even before those routes exist.
  const refreshCollections = async () => {
    setCollectionsLoading(true);
    try {
      const res = await fetch("/api/files/collections", {
        credentials: "include",
      });
      if (res.ok) setCollections(await res.json());
    } catch {
      // backend route not implemented yet
    } finally {
      setCollectionsLoading(false);
    }
  };

  useEffect(() => {
    refreshFiles();
    refreshCollections();
  }, []);

  useEffect(() => {
    refreshFolders(currentFolderId);
    setSelected(new Set());
  }, [currentFolderId]);

  const doneCount = uploads.filter((u) => u.status === "done").length;
  useEffect(() => {
    if (doneCount > 0) refreshFiles();
  }, [doneCount]);

  // ── Derived data ──

  const isSearching = query.trim().length > 0;

  const sortFiles = (files: FileRecord[]) =>
    [...files].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "size") cmp = a.size_bytes - b.size_bytes;
      else
        cmp =
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

  const visibleFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = isSearching
      ? allFiles.filter((f) => f.name.toLowerCase().includes(q))
      : allFiles.filter((f) => (f.folder_id ?? null) === currentFolderId);
    return sortFiles(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFiles, query, isSearching, currentFolderId, sortBy, sortDir]);

  const visibleCollectionFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? collectionFiles.filter((f) => f.name.toLowerCase().includes(q))
      : collectionFiles;
    return sortFiles(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionFiles, query, sortBy, sortDir]);

  const recentFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? allFiles.filter((f) => f.name.toLowerCase().includes(q))
      : allFiles;
    return [...base]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 60);
  }, [allFiles, query]);

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

  const typeBytes = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const f of allFiles)
      totals[f.media_type] = (totals[f.media_type] ?? 0) + f.size_bytes;
    return totals;
  }, [allFiles]);

  // ── Folder actions ──

  const openFolder = (folder: FolderRecord) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };
  const goToBreadcrumb = (index: number) =>
    setBreadcrumbs((prev) => prev.slice(0, index + 1));

  const openCreateModal = (type: CreateType, files: FileRecord[] = []) => {
    setCreateDefaultType(type);
    setMergeCandidates(files);
    setCreateModalOpen(true);
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      const res = await fetch("/api/files/folders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, parent_id: currentFolderId }),
      });
      if (!res.ok) return;
      const folder: FolderRecord = await res.json();
      setFolders((prev) => [...prev, folder]);
      if (mergeCandidates.length > 0) {
        await moveFiles(
          mergeCandidates.map((f) => f.id),
          folder.id,
        );
      }
    } finally {
      setMergeCandidates([]);
    }
  };

  const handleCreateCollection = async (name: string, color: string) => {
    try {
      const res = await fetch("/api/files/collections", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      if (!res.ok) return;
      const collection: CollectionRecord = await res.json();
      setCollections((prev) => [...prev, collection]);
      if (mergeCandidates.length > 0) {
        await Promise.all(
          mergeCandidates.map((f) => addFileToCollection(f.id, collection.id)),
        );
      }
    } catch {
      // backend route not implemented yet
    } finally {
      setMergeCandidates([]);
    }
  };

  const confirmRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    const name = renameValue.trim();

    if (renameTarget.kind === "folder") {
      const res = await fetch(`/api/files/folders/${renameTarget.item.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFolders((prev) =>
          prev.map((f) => (f.id === updated.id ? updated : f)),
        );
      }
    } else if (renameTarget.kind === "file") {
      setAllFiles((prev) =>
        prev.map((f) => (f.id === renameTarget.item.id ? { ...f, name } : f)),
      );
      try {
        // Assumes PATCH /api/files/{id} accepts a name field — add this
        // route if it doesn't exist yet.
        await fetch(`/api/files/${renameTarget.item.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
      } catch {
        // ignore — optimistic update already applied
      }
    } else if (renameTarget.kind === "collection") {
      try {
        const res = await fetch(
          `/api/files/collections/${renameTarget.item.id}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          },
        );
        if (res.ok) {
          const updated = await res.json();
          setCollections((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c)),
          );
        }
      } catch {
        // backend route not implemented yet
      }
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
    refreshFiles();
  };

  const deleteCollection = async (collection: CollectionRecord) => {
    if (
      !confirm(
        `Delete collection "${collection.name}"? Files themselves won't be deleted.`,
      )
    )
      return;
    setCollections((prev) => prev.filter((c) => c.id !== collection.id));
    if (activeCollection?.id === collection.id) {
      setActiveCollection(null);
      setCollectionFiles([]);
    }
    try {
      await fetch(`/api/files/collections/${collection.id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // backend route not implemented yet
    }
  };

  // ── File actions ──

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAllFor = (files: FileRecord[]) => {
    setSelected((prev) =>
      prev.size === files.length && files.length > 0
        ? new Set()
        : new Set(files.map((f) => f.id)),
    );
  };

  const deleteFile = async (id: string) => {
    setAllFiles((prev) => prev.filter((f) => f.id !== id));
    setCollectionFiles((prev) => prev.filter((f) => f.id !== id));
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
    setCollectionFiles((prev) => prev.filter((f) => !selected.has(f.id)));
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

  // ── Collections ──

  const addFileToCollection = async (fileId: string, collectionId: string) => {
    try {
      await fetch(`/api/files/collections/${collectionId}/files`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId }),
      });
    } catch {
      // backend route not implemented yet
    }
  };

  const removeFileFromCollection = async (
    fileId: string,
    collectionId: string,
  ) => {
    try {
      await fetch(`/api/files/collections/${collectionId}/files/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // backend route not implemented yet
    }
  };

  const openCollection = async (collection: CollectionRecord) => {
    setActiveCollection(collection);
    setCollectionFilesLoading(true);
    try {
      const res = await fetch(`/api/files/collections/${collection.id}/files`, {
        credentials: "include",
      });
      setCollectionFiles(res.ok ? await res.json() : []);
    } catch {
      setCollectionFiles([]);
    } finally {
      setCollectionFilesLoading(false);
    }
  };

  const openCollectionPickerForFile = async (
    x: number,
    y: number,
    file: FileRecord,
  ) => {
    let memberIds = new Set<string>();
    try {
      const res = await fetch(`/api/files/collections/for-file/${file.id}`, {
        credentials: "include",
      });
      if (res.ok)
        memberIds = new Set(
          (await res.json()).map((c: CollectionRecord) => c.id),
        );
    } catch {
      // backend route not implemented yet — picker still works, just without checkmarks
    }
    setCollectionPicker({ x, y, fileIds: [file.id], memberIds });
  };

  const handleCollectionToggle = async (collectionId: string) => {
    if (!collectionPicker) return;
    if (collectionPicker.fileIds.length === 1) {
      const fileId = collectionPicker.fileIds[0];
      const already = collectionPicker.memberIds?.has(collectionId) ?? false;
      if (already) await removeFileFromCollection(fileId, collectionId);
      else await addFileToCollection(fileId, collectionId);
      setCollectionPicker((prev) => {
        if (!prev) return prev;
        const next = new Set(prev.memberIds);
        already ? next.delete(collectionId) : next.add(collectionId);
        return { ...prev, memberIds: next };
      });
    } else {
      await Promise.all(
        collectionPicker.fileIds.map((id) =>
          addFileToCollection(id, collectionId),
        ),
      );
      setCollectionPicker(null);
    }
  };

  const handleCollectionPickerCreateNew = () => {
    if (!collectionPicker) return;
    const files = allFiles.filter((f) =>
      collectionPicker.fileIds.includes(f.id),
    );
    setCollectionPicker(null);
    openCreateModal("collection", files);
  };

  const handleRemoveFromActiveCollection = async (fileId: string) => {
    if (!activeCollection) return;
    setCollectionFiles((prev) => prev.filter((f) => f.id !== fileId));
    await removeFileFromCollection(fileId, activeCollection.id);
  };

  // ── Drag and drop ──

  const handleFileDragStart = (e: React.DragEvent, fileId: string) => {
    const ids = selected.has(fileId) ? Array.from(selected) : [fileId];
    e.dataTransfer.setData("text/plain", JSON.stringify(ids));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFolderDrop = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(null);
    try {
      const ids = JSON.parse(e.dataTransfer.getData("text/plain")) as string[];
      moveFiles(ids, targetId);
    } catch {
      // not a file drag
    }
  };

  const handleFileDrop = (e: React.DragEvent, targetFile: FileRecord) => {
    e.preventDefault();
    setDragOverFileId(null);
    try {
      const ids = JSON.parse(e.dataTransfer.getData("text/plain")) as string[];
      const mergeIds = Array.from(new Set([...ids, targetFile.id]));
      if (mergeIds.length < 2) return;
      const files = allFiles.filter((f) => mergeIds.includes(f.id));
      if (files.length < 2) return;
      openCreateModal("folder", files);
    } catch {
      // not a file drag
    }
  };

  // ── Context menus ──

  const handleOpenFile = (mediaFiles: FileRecord[], index: number) =>
    setViewer({ files: mediaFiles, index });

  const handleFileContextMenu = (x: number, y: number, file: FileRecord) => {
    if (!selected.has(file.id)) setSelected(new Set([file.id]));
    const sourceList = activeCollection ? visibleCollectionFiles : visibleFiles;
    const mediaList = sourceList.filter(isMediaFile);

    const items: ContextMenuItem[] = [
      {
        label: "Open",
        icon: ExternalLink,
        onClick: () => {
          if (isMediaFile(file)) {
            const idx = mediaList.findIndex((f) => f.id === file.id);
            setViewer({ files: mediaList, index: idx === -1 ? 0 : idx });
          } else {
            window.open(file.url, "_blank", "noopener,noreferrer");
          }
        },
      },
      {
        label: "Rename",
        icon: Pencil,
        separatorBefore: true,
        onClick: () => {
          setRenameTarget({ kind: "file", item: file });
          setRenameValue(file.name);
        },
      },
      {
        label: "Move to",
        icon: Move,
        onClick: () => {
          setSelected(new Set([file.id]));
          setMovePopoverOpen(true);
        },
      },
      {
        label: "Add to collection",
        icon: Layers,
        onClick: () => openCollectionPickerForFile(x, y, file),
      },
      {
        label: "Download",
        icon: Download,
        onClick: () => window.open(file.url, "_blank", "noopener,noreferrer"),
      },
    ];

    if (activeCollection) {
      items.push({
        label: "Remove from collection",
        icon: X,
        separatorBefore: true,
        onClick: () => handleRemoveFromActiveCollection(file.id),
      });
    } else {
      items.push({
        label: "Delete",
        icon: Trash2,
        danger: true,
        separatorBefore: true,
        onClick: () => deleteFile(file.id),
      });
    }
    setCtxMenu({ x, y, items });
  };

  const handleFolderContextMenu = (
    x: number,
    y: number,
    folder: FolderRecord,
  ) => {
    setCtxMenu({
      x,
      y,
      items: [
        {
          label: "Open",
          icon: ChevronRight,
          onClick: () => openFolder(folder),
        },
        {
          label: "Rename",
          icon: Pencil,
          separatorBefore: true,
          onClick: () => {
            setRenameTarget({ kind: "folder", item: folder });
            setRenameValue(folder.name);
          },
        },
        {
          label: "Delete",
          icon: Trash2,
          danger: true,
          separatorBefore: true,
          onClick: () => deleteFolder(folder),
        },
      ],
    });
  };

  const handleCollectionContextMenu = (
    x: number,
    y: number,
    collection: CollectionRecord,
  ) => {
    setCtxMenu({
      x,
      y,
      items: [
        {
          label: "Open",
          icon: ChevronRight,
          onClick: () => openCollection(collection),
        },
        {
          label: "Rename",
          icon: Pencil,
          separatorBefore: true,
          onClick: () => {
            setRenameTarget({ kind: "collection", item: collection });
            setRenameValue(collection.name);
          },
        },
        {
          label: "Delete",
          icon: Trash2,
          danger: true,
          separatorBefore: true,
          onClick: () => deleteCollection(collection),
        },
      ],
    });
  };

  return (
    <div className="w-full h-full flex flex-col py-8 px-8 gap-5 relative">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Cloud Storage
          </h1>
          <p className="text-muted-foreground text-sm">
            Files and folders synced to your account.
          </p>
        </div>
        <div className="relative group flex items-center gap-4 px-4 py-3 bg-card border border-border/50 rounded-2xl shadow-sm cursor-default">
          <UsageRing pct={usagePct} />
          <div className="min-w-[10rem]">
            <p className="text-sm font-semibold">
              {formatBytes(totalUsed)}{" "}
              <span className="text-muted-foreground font-normal">used</span>
            </p>
            <p className="text-[11px] text-muted-foreground mb-2">
              of {formatBytes(SOFT_STORAGE_CAP_BYTES)}
            </p>
            <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden flex">
              {MEDIA_TYPES.map(({ key, color }) => {
                const bytes = typeBytes[key] ?? 0;
                const widthPct = totalUsed > 0 ? (bytes / totalUsed) * 100 : 0;
                return widthPct > 0 ? (
                  <div
                    key={key}
                    style={{ width: `${widthPct}%`, backgroundColor: color }}
                  />
                ) : null;
              })}
            </div>
          </div>

          {/* Hover breakdown */}
          <div className="absolute inset-0 bg-card border border-border/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-center gap-1.5 pointer-events-none">
            <p className="text-xs font-semibold text-center mb-1">
              {usagePct.toFixed(1)}% full
            </p>
            {MEDIA_TYPES.map(({ key, label, color }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 text-[11px]"
              >
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="size-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </span>
                <span className="font-medium">
                  {formatBytes(typeBytes[key] ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Type summary */}
      <div className="grid grid-cols-4 gap-3">
        {MEDIA_TYPES.map(({ key, label, Icon, color }) => (
          <div
            key={key}
            className="flex items-center gap-2.5 px-3 py-2.5 bg-card border border-border/50 rounded-xl shadow-sm"
          >
            <div
              className="size-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}18` }}
            >
              <Icon size={14} style={{ color }} />
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

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-black/5 dark:bg-white/5 p-1 w-fit">
        <button
          onClick={() => setTopView("files")}
          className={cn(
            "flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium transition-colors",
            topView === "files"
              ? "bg-white dark:bg-neutral-800 shadow-sm"
              : "text-muted-foreground",
          )}
        >
          <Folder size={13} /> Files
        </button>
        <button
          onClick={() => setTopView("recent")}
          className={cn(
            "flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium transition-colors",
            topView === "recent"
              ? "bg-white dark:bg-neutral-800 shadow-sm"
              : "text-muted-foreground",
          )}
        >
          <Clock size={13} /> Recent
        </button>
        <button
          onClick={() => setTopView("collections")}
          className={cn(
            "flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium transition-colors",
            topView === "collections"
              ? "bg-white dark:bg-neutral-800 shadow-sm"
              : "text-muted-foreground",
          )}
        >
          <Layers size={13} /> Collections
        </button>
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

          {topView === "files" && (
            <>
              <Button
                size="sm"
                variant={uploadPanelOpen ? "secondary" : "outline"}
                className="h-8 rounded-lg gap-1.5"
                onClick={() => setUploadPanelOpen((v) => !v)}
              >
                <UploadCloud size={14} /> Upload
              </Button>
              <Button
                size="sm"
                className="h-8 rounded-lg gap-1.5"
                onClick={() => openCreateModal("folder")}
              >
                <Plus size={14} /> New Folder
              </Button>
            </>
          )}
          {topView === "collections" && !activeCollection && (
            <Button
              size="sm"
              className="h-8 rounded-lg gap-1.5"
              onClick={() => openCreateModal("collection")}
            >
              <Plus size={14} /> New Collection
            </Button>
          )}
        </div>
      </div>

      {topView === "files" && (
        <>
          {/* Breadcrumbs */}
          {!isSearching && (
            <div className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <div
                  key={crumb.id ?? "root"}
                  className="flex items-center gap-1"
                >
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
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  isDragOver={dragOverFolderId === folder.id}
                  onOpen={() => openFolder(folder)}
                  onDragOver={() => setDragOverFolderId(folder.id)}
                  onDragLeave={() => setDragOverFolderId(null)}
                  onDrop={(e) => handleFolderDrop(e, folder.id)}
                  onContextMenuRequest={(x, y) =>
                    handleFolderContextMenu(x, y, folder)
                  }
                />
              ))}
            </div>
          )}

          {/* Upload panel (opened via the Upload button) */}
          {uploadPanelOpen && (
            <div
              ref={uploadPanelRef}
              className="bg-card border border-border/50 rounded-2xl shadow-sm p-4 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Upload files</p>
                <button
                  onClick={() => setUploadPanelOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
              <UploadDropzone folderId={currentFolderId} />
            </div>
          )}

          {/* Files */}
          <div
            ref={browserContainerRef}
            className="bg-card border border-border/50 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto flex flex-col">
              <FileTable
                files={visibleFiles}
                loading={loading}
                emptyMessage={
                  isSearching
                    ? "No files match your search."
                    : "No files here yet."
                }
                viewMode={viewMode}
                selected={selected}
                onToggleSelected={toggleSelected}
                onSelectOnly={(id) => setSelected(new Set([id]))}
                onToggleSelectAll={() => toggleSelectAllFor(visibleFiles)}
                onOpenFile={handleOpenFile}
                onContextMenuRequest={handleFileContextMenu}
                onDeleteFile={deleteFile}
                onDragStartFile={handleFileDragStart}
                dragOverFileId={dragOverFileId}
                onDragOverFile={setDragOverFileId}
                onDragLeaveFile={() => setDragOverFileId(null)}
                onDropOnFile={handleFileDrop}
              />
            </div>
          </div>
        </>
      )}

      {topView === "recent" && (
        <div
          ref={browserContainerRef}
          className="bg-card border border-border/50 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col"
        >
          <div className="flex-1 overflow-y-auto flex flex-col">
            <FileTable
              files={recentFiles}
              loading={loading}
              emptyMessage={
                isSearching
                  ? "No files match your search."
                  : "No files uploaded yet."
              }
              viewMode={viewMode}
              selected={selected}
              onToggleSelected={toggleSelected}
              onSelectOnly={(id) => setSelected(new Set([id]))}
              onToggleSelectAll={() => toggleSelectAllFor(recentFiles)}
              onOpenFile={handleOpenFile}
              onContextMenuRequest={handleFileContextMenu}
              onDeleteFile={deleteFile}
              onDragStartFile={handleFileDragStart}
              dragOverFileId={dragOverFileId}
              onDragOverFile={setDragOverFileId}
              onDragLeaveFile={() => setDragOverFileId(null)}
              onDropOnFile={handleFileDrop}
            />
          </div>
        </div>
      )}

      {topView === "collections" && !activeCollection && (
        <div className="flex-1 overflow-y-auto">
          {collections.length === 0 && !collectionsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <Layers size={28} className="text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground max-w-xs">
                No collections yet. Group files from anywhere into a collection
                without moving them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onOpen={() => openCollection(collection)}
                  onContextMenuRequest={(x, y) =>
                    handleCollectionContextMenu(x, y, collection)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {topView === "collections" && activeCollection && (
        <>
          <div className="flex items-center gap-2 -mt-1">
            <button
              onClick={() => {
                setActiveCollection(null);
                setCollectionFiles([]);
              }}
              className="size-7 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={15} />
            </button>
            <Layers size={15} style={{ color: activeCollection.color }} />
            <h2 className="text-sm font-semibold">{activeCollection.name}</h2>
          </div>
          <div
            ref={browserContainerRef}
            className="bg-card border border-border/50 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto flex flex-col">
              <FileTable
                files={visibleCollectionFiles}
                loading={collectionFilesLoading}
                emptyMessage="No files in this collection yet. Right-click a file and choose “Add to collection”."
                viewMode={viewMode}
                selected={selected}
                onToggleSelected={toggleSelected}
                onSelectOnly={(id) => setSelected(new Set([id]))}
                onToggleSelectAll={() =>
                  toggleSelectAllFor(visibleCollectionFiles)
                }
                onOpenFile={handleOpenFile}
                onContextMenuRequest={handleFileContextMenu}
                onDeleteFile={deleteFile}
                onDragStartFile={handleFileDragStart}
                dragOverFileId={dragOverFileId}
                onDragOverFile={setDragOverFileId}
                onDragLeaveFile={() => setDragOverFileId(null)}
                onDropOnFile={handleFileDrop}
              />
            </div>
          </div>
        </>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-full border border-black/5 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="text-xs font-medium px-2">
            {selected.size} selected
          </span>
          <div className="h-4 w-px bg-border mx-1" />

          <Button
            size="sm"
            variant="ghost"
            className="h-7 rounded-full text-xs gap-1"
            onClick={() =>
              openCreateModal(
                "folder",
                allFiles.filter((f) => selected.has(f.id)),
              )
            }
          >
            <FolderPlus size={13} /> Group
          </Button>

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
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setCollectionPicker({
                x: rect.left,
                y: rect.top - 8,
                fileIds: Array.from(selected),
              });
            }}
          >
            <Layers size={13} /> Add to collection
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 rounded-full text-xs gap-1"
            onClick={() => {
              selected.forEach((id) => {
                const f =
                  allFiles.find((x) => x.id === id) ??
                  collectionFiles.find((x) => x.id === id);
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

      {/* Lasso select overlay */}
      {selectionBox && (
        <div
          className="fixed z-40 border-2 border-indigo-500/60 bg-indigo-500/10 rounded-sm pointer-events-none"
          style={{
            left: selectionBox.x,
            top: selectionBox.y,
            width: selectionBox.w,
            height: selectionBox.h,
          }}
        />
      )}

      {/* Floating menus & modals */}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={ctxMenu.items}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {collectionPicker && (
        <CollectionPickerMenu
          x={collectionPicker.x}
          y={collectionPicker.y}
          collections={collections.map((c) => ({
            id: c.id,
            name: c.name,
            color: c.color,
          }))}
          selectedIds={collectionPicker.memberIds ?? new Set()}
          onToggle={handleCollectionToggle}
          onCreateNew={handleCollectionPickerCreateNew}
          onClose={() => setCollectionPicker(null)}
        />
      )}

      {viewer && (
        <MediaViewer
          files={viewer.files}
          initialIndex={viewer.index}
          onClose={() => setViewer(null)}
        />
      )}

      <CreateItemModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setMergeCandidates([]);
        }}
        defaultType={createDefaultType}
        preselectedFiles={
          mergeCandidates.length > 0
            ? mergeCandidates.map((f) => ({
                id: f.id,
                name: f.name,
                mime_type: f.mime_type,
              }))
            : undefined
        }
        onCreateFolder={handleCreateFolder}
        onCreateCollection={handleCreateCollection}
      />

      <Modal
        open={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        title={
          renameTarget?.kind === "folder"
            ? "Rename Folder"
            : renameTarget?.kind === "collection"
              ? "Rename Collection"
              : "Rename File"
        }
      >
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && confirmRename()}
          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 mb-4"
        />
        <Button
          onClick={confirmRename}
          className="w-full rounded-lg"
          disabled={!renameValue.trim()}
        >
          Save
        </Button>
      </Modal>
    </div>
  );
}
