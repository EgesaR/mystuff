import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CiStickyNote } from "react-icons/ci";
import { IoIosSearch } from "react-icons/io";
import { HiOutlineClock } from "react-icons/hi";
import { PiHashStraightBold } from "react-icons/pi";
import { FiCalendar, FiCommand } from "react-icons/fi";
import { Link } from "@remix-run/react";

interface SideBarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const SideBar = ({ sidebarOpen, toggleSidebar }: SideBarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        toggleSidebar();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && sidebarOpen) {
        toggleSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [sidebarOpen, toggleSidebar]);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.div
          ref={sidebarRef}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="h-full w-[70%] sm:w-[20%] md:w-[15%] py-4 px-1 flex flex-col justify-between absolute sm:relative bg-gray-800 z-10 pt-6"
          role="navigation"
          aria-label="Main navigation"
          aria-expanded={sidebarOpen}
        >
          <div className="flex flex-col gap-1">
            <SideBarBtn
              text="Search"
              icon={<IoIosSearch />}
              command_icon="S"
              onClick={toggleSidebar}
            />
            <SideBarBtn
              text="Recent"
              icon={<HiOutlineClock />}
              command_icon="R"
              onClick={toggleSidebar}
            />
            <div className="flex flex-col gap-4 mt-8">
              <h1 className="uppercase text-gray-400 px-3 text-sm">Workspace</h1>
              <div className="flex flex-col gap-1.5">
                <SideBarBtn
                  text="Notes"
                  icon={<CiStickyNote />}
                  command_icon="N + /"
                  to="/notes"
                  onClick={toggleSidebar}
                />
                <SideBarBtn
                  text="Tasks"
                  icon={<PiHashStraightBold />}
                  command_icon="T + /"
                  to="/tasks"
                  onClick={toggleSidebar}
                />
                <SideBarBtn
                  text="Calendar"
                  icon={<FiCalendar />}
                  command_icon="C + /"
                  to="/calendar"
                  onClick={toggleSidebar}
                />
              </div>
            </div>
          </div>
          <div></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface SideBarBtnProps {
  text: string;
  icon: React.ReactNode;
  command_icon: string;
  onClick?: () => void;
  to?: string;
}

const SideBarBtn = ({ text, icon, command_icon, onClick, to }: SideBarBtnProps) => {
  return (
    <Link
      to={to || "#"}
      onClick={onClick}
      className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      prefetch={to ? "intent" : "none"}
    >
      <div className="w-full h-8 flex items-center justify-between px-3 rounded-md group hover:bg-gray-600">
        <div className="flex items-center gap-3">
          {icon}
          <label className="text-sm">{text}</label>
        </div>
        <span className="flex flex-wrap items-center gap-x-1 text-[15px] text-gray-400 dark:text-neutral-600 group-hover:text-neutral-200">
          <kbd className="min-h-7.5 inline-flex justify-center items-center font-mono text-xs text-gray-400 rounded-md dark:text-neutral-600 group-hover:text-neutral-200">
            <FiCommand />
          </kbd>
          +
          <kbd className="min-h-7.5 inline-flex justify-center items-center font-mono text-xs text-gray-400 rounded-md dark:text-neutral-600 group-hover:text-neutral-200">
            {command_icon}
          </kbd>
        </span>
      </div>
    </Link>
  );
};

export default SideBar;