import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsFileText, BsFolder2, BsArchive, BsBriefcase, BsCollection } from "react-icons/bs";
import { IoIosSearch, IoMdAddCircleOutline } from "react-icons/io";
import { PiHashStraightBold } from "react-icons/pi";
import { BiTime } from "react-icons/bi";
import { RiHomeSmile2Line } from "react-icons/ri";
import useMeasure from "react-use-measure";
import SideBarBtn from "./SideBarBtn";
import FileCollapsible from "./FileCollapsible";
import AddItemModal from "./AddItemModal";
import data from "~/data/data.json";

// Define types for data structure
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  folderId: string;
  assignee: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  folderId: string;
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
  folderId: string;
  attendees: string[];
}

interface Subfolder {
  id: string;
  name: string;
  createdAt: string;
  parentFolderId: string;
}

interface Folder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  parentFolderId: string | null;
  subfolders: Subfolder[];
  tasks: Task[];
  notes: Note[];
  calendarSchedules: CalendarSchedule[];
}

interface SideBarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  isMobile: boolean;
  className?: string;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const SideBar: React.FC<SideBarProps> = ({ sidebarOpen, toggleSidebar, isMobile, className }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [measureRef, { width: containerWidth }] = useMeasure();
  const [folders, setFolders] = useState<Folder[]>(data[0].space[0].folders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"folder" | "subfolder" | "note" | "task" | "schedule">("folder");
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);

  // Handle clicks outside sidebar and escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
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

  const getSidebarWidth = () => (isMobile ? `var(--sidebar-mobile-width)` : `var(--sidebar-width)`);

  const getFolderIcon = (folder: Folder) => {
    const hasContent = folder.subfolders.length > 0 || folder.tasks.length > 0 || folder.notes.length > 0 || folder.calendarSchedules.length > 0;

    if (!hasContent) {
      const iconOptions = [
        { icon: <BsFolder2 />, color: "text-zinc-500" },
        { icon: <BsArchive />, color: "text-zinc-500" },
        { icon: <BsBriefcase />, color: "text-zinc-500" },
        { icon: <BsCollection />, color: "text-zinc-500" },
      ];
      return iconOptions[folder.name.length % iconOptions.length];
    }

    if (folder.notes.length > 0 && folder.tasks.length === 0 && folder.calendarSchedules.length === 0) {
      return { icon: <BsFileText />, color: "text-blue-400" };
    }
    if (folder.tasks.length > 0 && folder.notes.length === 0 && folder.calendarSchedules.length === 0) {
      return { icon: <PiHashStraightBold />, color: "text-green-400" };
    }
    if (folder.calendarSchedules.length > 0 && folder.notes.length === 0 && folder.tasks.length === 0) {
      return { icon: <BiTime />, color: "text-purple-400" };
    }
    return { icon: <BsFolder2 />, color: "text-zinc-500" };
  };

  const handleAddItem = (
    item: Folder | Subfolder | Note | Task | CalendarSchedule,
    type: "folder" | "subfolder" | "note" | "task" | "schedule"
  ) => {
    setFolders((prev) => {
      if (type === "folder") {
        return [...prev, item as Folder];
      }
      if (type === "subfolder") {
        return prev.map((folder) =>
          folder.id === parentFolderId
            ? { ...folder, subfolders: [...folder.subfolders, item as Subfolder] }
            : folder
        );
      }
      if (type === "note") {
        return prev.map((folder) =>
          folder.id === parentFolderId
            ? { ...folder, notes: [...folder.notes, item as Note], updatedAt: new Date().toISOString() }
            : folder
        );
      }
      if (type === "task") {
        return prev.map((folder) =>
          folder.id === parentFolderId
            ? { ...folder, tasks: [...folder.tasks, item as Task], updatedAt: new Date().toISOString() }
            : folder
        );
      }
      if (type === "schedule") {
        return prev.map((folder) =>
          folder.id === parentFolderId
            ? {
                ...folder,
                calendarSchedules: [...folder.calendarSchedules, item as CalendarSchedule],
                updatedAt: new Date().toISOString(),
              }
            : folder
        );
      }
      return prev;
    });
    setIsModalOpen(false);
  };

  const handleDeleteItem = (
    itemId: string,
    type: "folder" | "subfolder" | "note" | "task" | "schedule",
    parentFolderId?: string
  ) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    setFolders((prev) => {
      if (type === "folder") {
        return prev.filter((folder) => folder.id !== itemId);
      }
      return prev.map((folder) =>
        folder.id === parentFolderId
          ? {
              ...folder,
              subfolders:
                type === "subfolder"
                  ? folder.subfolders.filter((sub) => sub.id !== itemId)
                  : folder.subfolders,
              notes:
                type === "note"
                  ? folder.notes.filter((note) => note.id !== itemId)
                  : folder.notes,
              tasks:
                type === "task"
                  ? folder.tasks.filter((task) => task.id !== itemId)
                  : folder.tasks,
              calendarSchedules:
                type === "schedule"
                  ? folder.calendarSchedules.filter((schedule) => schedule.id !== itemId)
                  : folder.calendarSchedules,
              updatedAt: new Date().toISOString(),
            }
          : folder
      );
    });
  };

  const isFolder = (item: Folder | Subfolder): item is Folder => "subfolders" in item;

  const renderFolderContent = (folder: Folder | Subfolder, isSubfolder: boolean = false, parentPath: string = "") => {
    const path = isSubfolder
      ? `${parentPath}/${folder.name.toLowerCase().replace(/\s+/g, "-")}`
      : `/${folder.name.toLowerCase().replace(/\s+/g, "-")}`;

    if (!isFolder(folder)) {
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
            onDelete={() => handleDeleteItem(folder.id, "subfolder", folder.parentFolderId)}
            className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
          />
        </motion.div>
      );
    }

    const { icon, color } = getFolderIcon(folder);
    const children = [
      ...folder.subfolders.map((subfolder) => (
        <motion.div
          key={subfolder.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="pl-6"
        >
          {renderFolderContent(subfolder, true, path)}
        </motion.div>
      )),
      ...folder.tasks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <SideBarBtn
            text={task.title}
            icon={<PiHashStraightBold className="w-5 h-5" />}
            color="text-green-400"
            to={`${path}/task/${task.id}`}
            onClick={isMobile ? toggleSidebar : undefined}
            isSubfolder
            onDelete={() => handleDeleteItem(task.id, "task", folder.id)}
            className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
          />
        </motion.div>
      )),
      ...folder.notes.map((note) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <SideBarBtn
            text={note.title}
            icon={<BsFileText className="w-5 h-5" />}
            color="text-blue-400"
            to={`${path}/note/${note.id}`}
            onClick={isMobile ? toggleSidebar : undefined}
            isSubfolder
            onDelete={() => handleDeleteItem(note.id, "note", folder.id)}
            className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
          />
        </motion.div>
      )),
      ...folder.calendarSchedules.map((schedule) => (
        <motion.div
          key={schedule.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <SideBarBtn
            text={schedule.title}
            icon={<BiTime className="w-5 h-5" />}
            color="text-purple-400"
            to={`${path}/schedule/${schedule.id}`}
            onClick={isMobile ? toggleSidebar : undefined}
            isSubfolder
            onDelete={() => handleDeleteItem(schedule.id, "schedule", folder.id)}
            className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
          />
        </motion.div>
      )),
      <motion.div
        key={`add-${folder.id}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="pl-6"
      >
        <SideBarBtn
          text="Add Item"
          icon={<IoMdAddCircleOutline className="w-5 h-5" />}
          color="text-zinc-500"
          onClick={() => {
            setModalType("subfolder");
            setParentFolderId(folder.id);
            setIsModalOpen(true);
          }}
          isSubfolder
          className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
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
            width: var(--sidebar-width);
            transition: width 0.3s ease-in-out;
          }
        `}
      </style>
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddItem}
        type={modalType}
        parentFolderId={parentFolderId}
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
                <SideBarBtn
                  text="Home"
                  icon={<RiHomeSmile2Line className="w-5 h-5" />}
                  color="text-white"
                  to="/"
                  onClick={toggleSidebar}
                  className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                />
                <SideBarBtn
                  text="Search"
                  icon={<IoIosSearch className="w-5 h-5" />}
                  color="text-white"
                  onClick={toggleSidebar}
                  className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                />
                <div className="flex flex-col gap-4 mt-6">
                  <h1 className="uppercase text-zinc-400 px-3 text-xs font-medium tracking-wide">
                    Workspace
                  </h1>
                  <div className="flex flex-col gap-1.5">
                    <SideBarBtn
                      text="Notes"
                      icon={<BsFileText className="w-5 h-5" />}
                      color="text-blue-400"
                      to="/notes"
                      onClick={toggleSidebar}
                      className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                    />
                    <SideBarBtn
                      text="Tasks"
                      icon={<PiHashStraightBold className="w-5 h-5" />}
                      color="text-green-400"
                      to="/tasks"
                      onClick={toggleSidebar}
                      className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                    />
                    <SideBarBtn
                      text="Calendar"
                      icon={<BiTime className="w-5 h-5" />}
                      color="text-purple-400"
                      to="/calendar"
                      onClick={toggleSidebar}
                      className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex justify-between items-center px-3">
                    <h1 className="uppercase text-zinc-400 text-xs font-medium tracking-wide">
                      Folders
                    </h1>
                    <IoMdAddCircleOutline
                      className="text-white/70 hover:text-white w-5 h-5 cursor-pointer transition-colors duration-200"
                      onClick={() => {
                        setModalType("folder");
                        setParentFolderId(null);
                        setIsModalOpen(true);
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <AnimatePresence>
                      {folders.map((folder) =>
                        folder.subfolders.length === 0 &&
                        folder.tasks.length === 0 &&
                        folder.notes.length === 0 &&
                        folder.calendarSchedules.length === 0 ? (
                          <motion.div
                            key={folder.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <SideBarBtn
                              text={folder.name}
                              icon={getFolderIcon(folder).icon}
                              color={getFolderIcon(folder).color}
                              to={`/${folder.name.toLowerCase().replace(/\s+/g, "-")}`}
                              onClick={toggleSidebar}
                              onDelete={() => handleDeleteItem(folder.id, "folder")}
                              className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key={folder.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {renderFolderContent(folder)}
                          </motion.div>
                        )
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <div></div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <motion.div
          ref={sidebarRef}
          className={`sidebar-desktop h-full py-4 px-3 flex flex-col justify-between bg-zinc-900 rounded-r-2xl z-10 overflow-y-auto custom-scrollbar ${className}`}
          role="navigation"
          aria-label="Main navigation"
          aria-expanded={sidebarOpen}
        >
          <div className="flex flex-col gap-2">
            <SideBarBtn
              text="Home"
              icon={<RiHomeSmile2Line className="w-5 h-5" />}
              color="text-white"
              to="/"
              className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
            />
            <SideBarBtn
              text="Search"
              icon={<IoIosSearch className="w-5 h-5" />}
              color="text-white"
              className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
            />
            <div className="flex flex-col gap-4 mt-6">
              <h1 className="uppercase text-zinc-400 px-3 text-xs font-medium tracking-wide">
                Workspace
              </h1>
              <div className="flex flex-col gap-1.5">
                <SideBarBtn
                  text="Notes"
                  icon={<BsFileText className="w-5 h-5" />}
                  color="text-blue-400"
                  to="/notes"
                  className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                />
                <SideBarBtn
                  text="Tasks"
                  icon={<PiHashStraightBold className="w-5 h-5" />}
                  color="text-green-400"
                  to="/tasks"
                  className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                />
                <SideBarBtn
                  text="Calendar"
                  icon={<BiTime className="w-5 h-5" />}
                  color="text-purple-400"
                  to="/calendar"
                  className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex justify-between items-center px-3">
                <h1 className="uppercase text-zinc-400 text-xs font-medium tracking-wide">
                  Folders
                </h1>
                <IoMdAddCircleOutline
                  className="text-white/70 hover:text-white w-5 h-5 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    setModalType("folder");
                    setParentFolderId(null);
                    setIsModalOpen(true);
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <AnimatePresence>
                  {folders.map((folder) =>
                    folder.subfolders.length === 0 &&
                    folder.tasks.length === 0 &&
                    folder.notes.length === 0 &&
                    folder.calendarSchedules.length === 0 ? (
                      <motion.div
                        key={folder.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SideBarBtn
                          text={folder.name}
                          icon={getFolderIcon(folder).icon}
                          color={getFolderIcon(folder).color}
                          to={`/${folder.name.toLowerCase().replace(/\s+/g, "-")}`}
                          onDelete={() => handleDeleteItem(folder.id, "folder")}
                          className="hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={folder.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {renderFolderContent(folder)}
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div></div>
        </motion.div>
      )}
    </div>
  );
};

export default SideBar;