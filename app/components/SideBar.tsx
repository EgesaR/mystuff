import React, { useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsFileText, BsFolder2 } from "react-icons/bs";
import { IoMdAddCircleOutline } from "react-icons/io";
import { PiHashStraightBold } from "react-icons/pi";
import { BiTime } from "react-icons/bi";
import { RiHomeSmile2Line } from "react-icons/ri";
import { MdMenu, MdMenuOpen } from "react-icons/md";
import useMeasure from "react-use-measure";
import SideBarBtn from "./SideBarBtn";
import FileCollapsible from "./FileCollapsible";
import AddItemModal from "./AddItemModal";
import data from "~/data/data.json";

// Define types
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  folderId: string | null;
  assignee: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  folderId: string | null;
  tags: string[];
}

interface CalendarSchedule {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
  folderId: string | null;
  attendees: string[];
}

interface Subfolder {
  id: string;
  name: string;
  createdAt: string;
  parentFolderId: string;
  tasks: Task[];
  notes: Note[];
  calendarSchedules: CalendarSchedule[];
  subfolders: Subfolder[];
}

interface Folder extends Subfolder {
  updatedAt: string;
  parentFolderId: string | null;
}

interface SideBarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  isMobile: boolean;
  className?: string;
}

// Utility to generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Transform JSON data (memoized outside component)
const transformFolderData = (rawFolders: any[]): Folder[] =>
  rawFolders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    createdAt: folder.createdAt || new Date().toISOString(),
    updatedAt: folder.updatedAt || new Date().toISOString(),
    parentFolderId: folder.parentFolderId || null,
    tasks: folder.tasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status || "pending",
      priority: task.priority || "medium",
      dueDate: task.dueDate,
      createdAt: task.createdAt || new Date().toISOString(),
      folderId: task.folderId || null,
      assignee: task.assignee || "",
    })),
    notes: folder.notes.map((note: any) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: note.updatedAt || new Date().toISOString(),
      folderId: note.folderId || null,
      tags: note.tags || [],
    })),
    calendarSchedules: folder.calendarSchedules.map((schedule: any) => ({
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      startTime: schedule.dateTime || new Date().toISOString(),
      endTime: schedule.dateTime || new Date().toISOString(),
      location: schedule.location || "",
      createdAt: schedule.createdAt || new Date().toISOString(),
      folderId: schedule.folderId || null,
      attendees: schedule.attendees || [],
    })),
    subfolders: folder.subfolders.map((subfolder: any) => ({
      id: subfolder.id,
      name: subfolder.name,
      createdAt: subfolder.createdAt || new Date().toISOString(),
      parentFolderId: subfolder.parentFolderId || folder.id,
      tasks: subfolder.tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status || "pending",
        priority: task.priority || "medium",
        dueDate: task.dueDate,
        createdAt: task.createdAt || new Date().toISOString(),
        folderId: task.folderId || null,
        assignee: task.assignee || "",
      })),
      notes: subfolder.notes.map((note: any) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: note.updatedAt || new Date().toISOString(),
        folderId: note.folderId || null,
        tags: note.tags || [],
      })),
      calendarSchedules: subfolder.calendarSchedules.map((schedule: any) => ({
        id: schedule.id,
        title: schedule.title,
        description: schedule.description,
        startTime: schedule.dateTime || new Date().toISOString(),
        endTime: schedule.dateTime || new Date().toISOString(),
        location: schedule.location || "",
        createdAt: schedule.createdAt || new Date().toISOString(),
        folderId: schedule.folderId || null,
        attendees: schedule.attendees || [],
      })),
      subfolders: subfolder.subfolders ? transformFolderData(subfolder.subfolders) : [],
    })),
  }));

// Memoized initial folder data
const initialFolders = transformFolderData(data[0].space[0].folders);

const SideBar: React.FC<SideBarProps> = ({ sidebarOpen, toggleSidebar, isMobile, className }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [measureRef, { width: containerWidth }] = useMeasure();
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "folder" | "subfolder" | "note" | "task" | "schedule";
    parentFolderId: string | null;
  }>({ isOpen: false, type: "folder", parentFolderId: null });

  // Handle clicks outside and escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        toggleSidebar();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && sidebarOpen && isMobile) {
        toggleSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [sidebarOpen, toggleSidebar, isMobile]);

  // Get sidebar width based on state
  const getSidebarWidth = () => (isMobile ? `var(--sidebar-mobile-width)` : sidebarOpen ? `var(--sidebar-width)` : "60px");

  // Get folder icon and color
  const getFolderIcon = (folder: Folder): { icon: JSX.Element; color: string } => {
    const hasContent = folder.subfolders.length > 0 || folder.tasks.length > 0 || folder.notes.length > 0 || folder.calendarSchedules.length > 0;
    if (!hasContent) return { icon: <BsFolder2 />, color: "text-zinc-500" };
    if (folder.notes.length > 0 && folder.tasks.length === 0 && folder.calendarSchedules.length === 0)
      return { icon: <BsFileText />, color: "text-blue-400" };
    if (folder.tasks.length > 0 && folder.notes.length === 0 && folder.calendarSchedules.length === 0)
      return { icon: <PiHashStraightBold />, color: "text-green-400" };
    if (folder.calendarSchedules.length > 0 && folder.notes.length === 0 && folder.tasks.length === 0)
      return { icon: <BiTime />, color: "text-purple-400" };
    return { icon: <BsFolder2 />, color: "text-zinc-500" };
  };

  // Handle adding items
  const handleAddItem = (item: Folder | Subfolder | Note | Task | CalendarSchedule, type: typeof modalState.type) => {
    setFolders((prev) => {
      if (type === "folder") return [...prev, item as Folder];
      return prev.map((folder) =>
        folder.id !== modalState.parentFolderId
          ? folder
          : {
              ...folder,
              updatedAt: new Date().toISOString(),
              ...(type === "subfolder" && { subfolders: [...folder.subfolders, item as Subfolder] }),
              ...(type === "note" && { notes: [...folder.notes, item as Note] }),
              ...(type === "task" && { tasks: [...folder.tasks, item as Task] }),
              ...(type === "schedule" && { calendarSchedules: [...folder.calendarSchedules, item as CalendarSchedule] }),
            }
      );
    });
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Handle deleting items
  const handleDeleteItem = (itemId: string, type: typeof modalState.type, parentFolderId?: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    setFolders((prev) => {
      if (type === "folder") return prev.filter((folder) => folder.id !== itemId);
      return prev.map((folder) =>
        folder.id !== parentFolderId
          ? folder
          : {
              ...folder,
              updatedAt: new Date().toISOString(),
              subfolders: type === "subfolder" ? folder.subfolders.filter((sub) => sub.id !== itemId) : folder.subfolders,
              notes: type === "note" ? folder.notes.filter((note) => note.id !== itemId) : folder.notes,
              tasks: type === "task" ? folder.tasks.filter((task) => task.id !== itemId) : folder.tasks,
              calendarSchedules:
                type === "schedule" ? folder.calendarSchedules.filter((schedule) => schedule.id !== itemId) : folder.calendarSchedules,
            }
      );
    });
  };

  // Render folder content
  const renderFolderContent = (folder: Folder | Subfolder, isSubfolder: boolean = false, parentPath: string = ""): JSX.Element => {
    const path = isSubfolder ? `${parentPath}/${folder.name.toLowerCase().replace(/\s+/g, "-")}` : `/${folder.name.toLowerCase().replace(/\s+/g, "-")}`;
    const isFolderType = "subfolders" in folder;

    if (!isFolderType) {
      return (
        <motion.div
          key={folder.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <SideBarBtn
            text={folder.name}
            icon={<BsFolder2 className="w-5 h-5" />}
            color="text-zinc-500"
            to={path}
            onClick={isMobile ? toggleSidebar : undefined}
            isSubfolder
            isCollapsed={!sidebarOpen}
            className="rounded-lg"
          />
        </motion.div>
      );
    }

    const { icon, color } = getFolderIcon(folder);
    const hasContent = folder.subfolders.length > 0 || folder.tasks.length > 0 || folder.notes.length > 0 || folder.calendarSchedules.length > 0;

    if (!hasContent) {
      return (
        <motion.div
          key={folder.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <SideBarBtn
            text={folder.name}
            icon={icon}
            color={color}
            to={path}
            onClick={isMobile ? toggleSidebar : undefined}
            isCollapsed={!sidebarOpen}
            className="rounded-lg"
          />
        </motion.div>
      );
    }

    const children = [
      ...folder.subfolders.map((subfolder) => (
        <motion.div key={subfolder.id} className="pl-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {renderFolderContent(subfolder, true, path)}
        </motion.div>
      )),
      ...folder.tasks.map((task) => (
        <motion.div key={task.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <SideBarBtn
            text={task.title}
            icon={<PiHashStraightBold className="w-5 h-5" />}
            color="text-green-400"
            to={`${path}/task/${task.id}`}
            onClick={isMobile ? toggleSidebar : undefined}
            isSubfolder
            isCollapsed={!sidebarOpen}
            className="rounded-lg"
          />
        </motion.div>
      )),
      ...folder.notes.map((note) => (
        <motion.div key={note.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <SideBarBtn
            text={note.title}
            icon={<BsFileText className="w-5 h-5" />}
            color="text-blue-400"
            to={`${path}/note/${note.id}`}
            onClick={isMobile ? toggleSidebar : undefined}
            isSubfolder
            onDelete={() => handleDeleteItem(note.id, "note", folder.id)}
            isCollapsed={!sidebarOpen}
            className="rounded-lg"
          />
        </motion.div>
      )),
      ...folder.calendarSchedules.map((schedule) => (
        <motion.div key={schedule.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <SideBarBtn
            text={schedule.title}
            icon={<BiTime className="w-5 h-5" />}
            color="text-purple-400"
            to={`${path}/schedule/${schedule.id}`}
            onClick={isMobile ? toggleSidebar : undefined}
            isSubfolder
            isCollapsed={!sidebarOpen}
            className="rounded-lg"
          />
        </motion.div>
      )),
      <motion.div
        key={`add-${folder.id}`}
        className="pl-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <SideBarBtn
          text="Add Item"
          icon={<IoMdAddCircleOutline className="w-5 h-5" />}
          color="text-zinc-500"
          onClick={() => setModalState({ isOpen: true, type: "subfolder", parentFolderId: folder.id })}
          isSubfolder
          isCollapsed={!sidebarOpen}
          className="rounded-lg"
        />
      </motion.div>,
    ];

    return (
      <FileCollapsible
        key={folder.id}
        text={folder.name}
        icon={icon}
        color={color}
        to={path}
        onClick={isMobile ? toggleSidebar : undefined}
        onDelete={() => handleDeleteItem(folder.id, "folder")}
        isCollapsed={!sidebarOpen}
      >
        <div className="flex flex-col gap-1.5">{children}</div>
      </FileCollapsible>
    );
  };

  return (
    <div
      ref={measureRef}
      className={`h-full transition-all duration-300 ease-in-out z-20 ${
        isMobile && sidebarOpen ? "bg-zinc-950/70 fixed inset-0 w-full" : ""
      } ${className}`}
    >
      <style>
        {`
          .sidebar-mobile {
            width: var(--sidebar-mobile-width);
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
          }
          .sidebar-mobile.sidebar-visible {
            transform: translateX(0);
            opacity: 1;
          }
          .sidebar-desktop {
            width: ${getSidebarWidth()};
            transition: width 0.3s ease-in-out;
            overflow-x: hidden;
          }
          .sidebar-desktop.collapsed .sidebar-text {
            display: none;
          }
          .sidebar-desktop.collapsed .sidebar-btn {
            justify-content: center;
            padding-left: 0;
            padding-right: 0;
          }
          .sidebar-desktop.collapsed .file-collapsible-header {
            justify-content: center;
          }
          .sidebar-desktop.collapsed .file-collapsible-content {
            display: none;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        `}
      </style>
      <AddItemModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleAddItem}
        type={modalState.type}
        parentFolderId={modalState.parentFolderId}
      />
      {isMobile ? (
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              ref={sidebarRef}
              className="sidebar-mobile fixed top-[var(--appbar-height)] h-[calc(100%-var(--appbar-height))] py-4 px-3 flex flex-col justify-between bg-zinc-900 rounded-r-2xl z-30 overflow-y-auto custom-scrollbar"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "tween", duration: 0.3 }}
              role="navigation"
              aria-label="Main navigation"
              aria-expanded={sidebarOpen}
            >
              <div className="flex flex-col gap-2">
                <SideBarBtn text="Home" icon={<RiHomeSmile2Line className="w-5 h-5" />} color="text-white" to="/" onClick={toggleSidebar} className="rounded-lg" />
                <div className="flex flex-col gap-4 mt-6">
                  <h1 className="uppercase text-zinc-300 px-3 text-xs font-medium tracking-wide">Workspace</h1>
                  <div className="flex flex-col gap-1.5">
                    <SideBarBtn text="Notes" icon={<BsFileText className="w-5 h-5" />} color="text-blue-400" to="/notes" onClick={toggleSidebar} className="rounded-lg" />
                    <SideBarBtn text="Tasks" icon={<PiHashStraightBold className="w-5 h-5" />} color="text-green-400" to="/tasks" onClick={toggleSidebar} className="rounded-lg" />
                    <SideBarBtn text="Calendar" icon={<BiTime className="w-5 h-5" />} color="text-purple-400" to="/calendar" onClick={toggleSidebar} className="rounded-lg" />
                  </div>
                </div>
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex justify-between items-center px-3">
                    <h1 className="uppercase text-zinc-300 text-xs font-medium tracking-wide">Folders</h1>
                    <IoMdAddCircleOutline
                      className="text-white/70 w-5 h-5 cursor-pointer"
                      onClick={() => setModalState({ isOpen: true, type: "folder", parentFolderId: null })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <AnimatePresence>
                      {folders.map((folder) => (
                        <motion.div key={folder.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                          {renderFolderContent(folder)}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <div />
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <motion.div
          ref={sidebarRef}
          className={`sidebar-desktop h-full py-4 px-3 flex flex-col justify-between bg-zinc-900 rounded-r-2xl z-10 overflow-y-auto custom-scrollbar ${!sidebarOpen ? "collapsed" : ""} ${className}`}
          role="navigation"
          aria-label="Main navigation"
          aria-expanded={sidebarOpen}
        >
          <div className="flex flex-col gap-2">
            {!isMobile && (
              <div className="flex items-center justify-end mb-2">
                <button
                  onClick={toggleSidebar}
                  className="text-white/70 hover:text-white w-6 h-6"
                  aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                  {sidebarOpen ? <MdMenuOpen size={24} /> : <MdMenu size={24} />}
                </button>
              </div>
            )}
            <SideBarBtn text="Home" icon={<RiHomeSmile2Line className="w-5 h-5" />} color="text-white" to="/" isCollapsed={!sidebarOpen} className="rounded-lg sidebar-btn" />
            <div className="flex flex-col gap-4 mt-3">
              <h1 className={`uppercase text-zinc-300 px-3 text-xs font-medium tracking-wide ${!sidebarOpen ? "hidden" : ""}`}>Workspace</h1>
              <div className="flex flex-col gap-1.5">
                <SideBarBtn text="Notes" icon={<BsFileText className="w-5 h-5" />} color="text-blue-400" to="/notes" isCollapsed={!sidebarOpen} className="rounded-lg sidebar-btn" />
                <SideBarBtn text="Tasks" icon={<PiHashStraightBold className="w-5 h-5" />} color="text-green-400" to="/tasks" isCollapsed={!sidebarOpen} className="rounded-lg sidebar-btn" />
                <SideBarBtn
                  text="Calendar"
                  icon={<BiTime className="w-5 h-5" />}
                  color="text-purple-400"
                  to="/calendar"
                  isCollapsed={!sidebarOpen}
                  className="rounded-lg sidebar-btn"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-6">
              <div className={`flex justify-between items-center px-3 ${!sidebarOpen ? "hidden" : ""}`}>
                <h1 className="uppercase text-zinc-300 text-xs font-medium tracking-wide">Folders</h1>
                <IoMdAddCircleOutline
                  className="text-white/70 w-5 h-5 cursor-pointer"
                  onClick={() => setModalState({ isOpen: true, type: "folder", parentFolderId: null })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <AnimatePresence>
                  {folders.map((folder) => (
                    <motion.div key={folder.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      {renderFolderContent(folder)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div />
        </motion.div>
      )}
    </div>
  );
};

export default memo(SideBar);