import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CiStickyNote } from "react-icons/ci";
import { IoIosSearch } from "react-icons/io";
import { HiOutlineClock } from "react-icons/hi";
import { PiHashStraightBold } from "react-icons/pi";
import { FiCalendar, FiCommand } from "react-icons/fi";
import { Link } from "@remix-run/react";
import useMeasure from "react-use-measure";
import { RiHomeSmile2Line } from "react-icons/ri";

interface SideBarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  isMobile: boolean;
}

const SideBar = ({ sidebarOpen, toggleSidebar, isMobile }: SideBarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [measureRef, { width: containerWidth }] = useMeasure();

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
    return `${Math.max(containerWidth * 0.2, 200)}px`; // 20% or min 200px
  };

  const renderSidebar = () => (
    <motion.div
      ref={sidebarRef}
      initial={isMobile ? { x: "-100%" } : { x: 0 }}
      animate={isMobile ? { x: 0 } : { x: 0 }}
      exit={isMobile ? { x: "-100%" } : { x: 0 }}
      transition={isMobile ? { type: "tween", duration: 0.3 } : { duration: 0 }}
      className={`h-full py-4 px-1 flex flex-col justify-between ${
        isMobile ? "absolute" : "relative"
      } bg-zinc-900 rounded-r-2xl z-10 pt-8 w-[10%]`}
      style={{ width: getSidebarWidth() }}
      role="navigation"
      aria-label="Main navigation"
      aria-expanded={sidebarOpen}
    >
      <div className="flex flex-col gap-1">
        <SideBarBtn
          text="Home"
          icon={<RiHomeSmile2Line />}
          command_icon="H + /"
          to="/"
          onClick={isMobile ? toggleSidebar : undefined}
        />
        <SideBarBtn
          text="Search"
          icon={<IoIosSearch />}
          command_icon="S"
          onClick={isMobile ? toggleSidebar : undefined}
        />
        <div className="flex flex-col gap-4 mt-8">
          <h1 className="uppercase text-gray-400 px-3 text-sm">Workspace</h1>
          <div className="flex flex-col gap-1.5">
            <SideBarBtn
              text="Notes"
              icon={<CiStickyNote />}
              command_icon="N + /"
              to="/notes"
              onClick={isMobile ? toggleSidebar : undefined}
            />
            <SideBarBtn
              text="Tasks"
              icon={<PiHashStraightBold />}
              command_icon="T + /"
              to="/tasks"
              onClick={isMobile ? toggleSidebar : undefined}
            />
            <SideBarBtn
              text="Calendar"
              icon={<FiCalendar />}
              command_icon="C + /"
              to="/calendar"
              onClick={isMobile ? toggleSidebar : undefined}
            />
          </div>
        </div>
      </div>
      <div></div>
    </motion.div>
  );

  return (  
    <div ref={measureRef} className={`h-full ${isMobile && sidebarOpen ? "bg-neutral-950/70 absolute inset-0 w-full" : ""} ${sidebarOpen ? "" : ""}`}>
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
  command_icon: string;
  onClick?: () => void;
  to?: string;
}

const SideBarBtn = ({
  text,
  icon,
  command_icon,
  onClick,
  to,
}: SideBarBtnProps) => {
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
