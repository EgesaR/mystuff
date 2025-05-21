import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CiStickyNote } from "react-icons/ci";
import { IoIosSearch, IoMdAddCircleOutline } from "react-icons/io";
import { PiHashStraightBold } from "react-icons/pi";
import { FiCalendar } from "react-icons/fi";
import { Link } from "@remix-run/react";
import useMeasure from "react-use-measure";
import { RiHomeSmile2Line } from "react-icons/ri";
import { BsFolder2, BsFileText } from "react-icons/bs";
import FileCollapsible from "./FileCollapsible";
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
}

const SideBar: React.FC<SideBarProps> = ({ sidebarOpen, toggleSidebar, isMobile }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [measureRef, { width: containerWidth }] = useMeasure();

  // Debug logs
  console.log("SideBar rendered:", new Date().toISOString());
  console.log("Number of folders:", data[0].space[0].folders.length);
  console.log(
    "Folder details:",
    data[0].space[0].folders.map((f) => ({
      name: f.name,
      subfolders: f.subfolders.length,
      tasks: f.tasks.length,
      notes: f.notes.length,
      schedules: f.calendarSchedules.length,
    }))
  );

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

  const getSidebarWidth = () => {
    if (isMobile) {
      return `${containerWidth * 0.525}px`;
    }
    return `${Math.max(containerWidth * 0.2, 220)}px`;
  };

  // Type guard for Folder
  const isFolder = (folder: Folder | Subfolder): folder is Folder => {
    return "subfolders" in folder;
  };

  // Check if folder has content
  const hasContent = (folder: Folder) => {
    return (
      folder.subfolders.length > 0 ||
      folder.tasks.length > 0 ||
      folder.notes.length > 0 ||
      folder.calendarSchedules.length > 0
    );
  };

  // Render folder or subfolder content
  const renderFolderContent = (
    folder: Folder | Subfolder,
    isSubfolder: boolean = false,
    parentPath: string = ""
  ) => {
    const path = isSubfolder
      ? `${parentPath}/${folder.name.toLowerCase().replace(/\s+/g, "-")}`
      : `/${folder.name.toLowerCase().replace(/\s+/g, "-")}`;

    // Subfolder: render as SideBarBtn (no subfolders/files in data.json)
    if (!isFolder(folder)) {
      return (
        <SideBarBtn
          key={folder.id}
          text={folder.name}
          icon={<BsFolder2 />}
          to={path}
          onClick={isMobile ? toggleSidebar : undefined}
          isSubfolder
        />
      );
    }

    // Folder: render as FileCollapsible with subfolders/files
    const children = [];
    if (folder.subfolders.length > 0) {
      children.push(
        ...folder.subfolders.map((subfolder) => (
          <div key={subfolder.id} className="pl-6">
            {renderFolderContent(subfolder, true, path)}
          </div>
        ))
      );
    }
    if (folder.tasks.length > 0) {
      children.push(
        ...folder.tasks.map((task) => (
          <SideBarBtn
            key={task.id}
            text={task.title}
            icon={<BsFileText />}
            to={`${path}/task/${task.id}`}
            onClick={isMobile ? toggleSidebar : undefined}
            isSubfolder
          />
        ))
      );
    }
    if (folder.notes.length > 0) {
      children.push(
        ...folder.notes.map((note) => (
          <SideBarBtn
            key={note.id}
            text={note.title}
            icon={<BsFileText />}
            to={`${path}/note/${note.id}`}
            onClick={isMobile ? toggleSidebar : undefined}
            isSubfolder
          />
        ))
      );
    }
    if (folder.calendarSchedules.length > 0) {
      children.push(
        ...folder.calendarSchedules.map((schedule) => (
          <SideBarBtn
            key={schedule.id}
            text={schedule.title}
            icon={<BsFileText />}
            to={`${path}/schedule/${schedule.id}`}
            onClick={isMobile ? toggleSidebar : undefined}
            isSubfolder
          />
        ))
      );
    }

    return (
      <FileCollapsible
        key={folder.id}
        text={folder.name}
        icon={<BsFolder2 />}
        to={path}
        onClick={isMobile ? toggleSidebar : undefined}
      >
        <div className="flex flex-col gap-1.5">{children}</div>
      </FileCollapsible>
    );
  };

  const renderSidebar = () => (
    <motion.div
      ref={sidebarRef}
      initial={isMobile ? { x: "-100%" } : { x: 0 }}
      animate={{ x: 0 }}
      exit={isMobile ? { x: "-100%" } : { x: 0 }}
      transition={isMobile ? { type: "tween", duration: 0.3 } : { duration: 0 }}
      className={`h-full py-4 px-1 flex flex-col justify-between ${
        isMobile ? "absolute" : "relative"
      } bg-zinc-900 rounded-r-2xl z-10 pt-8 overflow-y-auto scrollbar scrollbar-thumb-zinc-700 scrollbar-track-zinc-900`}
      style={{ width: getSidebarWidth() }}
      role="navigation"
      aria-label="Main navigation"
      aria-expanded={sidebarOpen}
    >
      <div className="flex flex-col gap-1">
        {/* Top Navigation */}
        <SideBarBtn
          text="Home"
          icon={<RiHomeSmile2Line />}
          to="/"
          onClick={isMobile ? toggleSidebar : undefined}
        />
        <SideBarBtn
          text="Search"
          icon={<IoIosSearch />}
          onClick={isMobile ? toggleSidebar : undefined}
        />

        {/* Workspace Section */}
        <div className="flex flex-col gap-4 mt-8">
          <h1 className="uppercase text-gray-400 px-3 text-sm">Workspace</h1>
          <div className="flex flex-col gap-1.5">
            <SideBarBtn
              text="Notes"
              icon={<CiStickyNote />}
              to="/notes"
              onClick={isMobile ? toggleSidebar : undefined}
            />
            <SideBarBtn
              text="Tasks"
              icon={<PiHashStraightBold />}
              to="/tasks"
              onClick={isMobile ? toggleSidebar : undefined}
            />
            <SideBarBtn
              text="Calendar"
              icon={<FiCalendar />}
              to="/calendar"
              onClick={isMobile ? toggleSidebar : undefined}
            />
          </div>
        </div>

        {/* Folders Section */}
        <div className="flex flex-col gap-4 mt-8">
          <div className="flex justify-between items-center">
            <h1 className="uppercase text-gray-400 px-3 text-[12px]">Folders</h1>
            <IoMdAddCircleOutline className="text-white/70 hover:text-white mr-3" />
          </div>
          <div className="flex flex-col gap-1.5">
            {data[0].space[0].folders.map((folder) => {
              if (!hasContent(folder)) {
                return (
                  <SideBarBtn
                    key={folder.id}
                    text={folder.name}
                    icon={<BsFolder2 />}
                    to={`/${folder.name.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={isMobile ? toggleSidebar : undefined}
                  />
                );
              }
              return renderFolderContent(folder);
            })}
          </div>
        </div>
      </div>
      <div></div>
    </motion.div>
  );

  return (
    <div
      ref={measureRef}
      className={`h-full ${
        isMobile && sidebarOpen ? "bg-neutral-950/70 absolute inset-0 w-full" : ""
      }`}
    >
      {isMobile ? (
        <AnimatePresence>{sidebarOpen && renderSidebar()}</AnimatePresence>
      ) : (
        renderSidebar()
      )}
    </div>
  );
};

interface SideBarBtnProps {
  text: string;
  icon: React.ReactNode;
  onClick?: () => void;
  to?: string;
  isSubfolder?: boolean;
}

const SideBarBtn: React.FC<SideBarBtnProps> = ({ text, icon, onClick, to, isSubfolder }) => {
  return (
    <Link
      to={to || "#"}
      onClick={onClick}
      className="w-full"
      prefetch={to ? "intent" : "none"}
    >
      <div className="w-full h-8 flex items-center justify-between px-3 rounded-md group hover:bg-zinc-800/40 transition-colors">
        <div className="flex items-center gap-3 text-white">
          {icon}
          <label className={`${isSubfolder ? "text-xs" : "text-sm"}`}>{text}</label>
        </div>
      </div>
    </Link>
  );
};

export default SideBar;