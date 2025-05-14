import React from "react";
import { CiStickyNote } from "react-icons/ci";
import { IoIosSearch } from "react-icons/io";
import { HiOutlineClock } from "react-icons/hi";
import { PiHashStraightBold } from "react-icons/pi";
import { FiCalendar, FiCommand } from "react-icons/fi";
import { Link } from "@remix-run/react";

interface SideBarProps {
 toggleSidebar?: () => void;
 sidebarOpen?: boolean;
}

const SideBar = ({ sidebarOpen, toggleSidebar }: SideBarProps) => {
 const handleToggleSidebar = () => toggleSidebar(prev => (prev = false));
 return (
  <div
   className={`h-full w-[60%] sm:w-[18%] py-4 px-1 flex flex-col justify-between absolute sm:relative bg-dark z-10 pt-6 transition-all ease-in-out duration-300 ${
    sidebarOpen ? "left-0" : "left-[-100%]"
   }`}
  >
   <div className="flex flex-col gap-1">
    <SideBarBtn
     text="Search"
     icon={<IoIosSearch />}
     command_icon="S"
     onClick={handleToggleSidebar}
    />
    <SideBarBtn
     text="Recent"
     icon={<HiOutlineClock />}
     command_icon="R"
     onClick={handleToggleSidebar}
    />
    <div className="flex flex-col gap-4 mt-8">
     <h1 className="uppercase text-gray-400 px-3 text-sm">Workspace</h1>
     <div className="flex flex-col gap-1.5">
      <SideBarBtn
       text="Notes"
       icon={<CiStickyNote />}
       command_icon="N + /"
       to="/notes"
       onClick={handleToggleSidebar}
      />
      <SideBarBtn
       text="Tasks"
       icon={<PiHashStraightBold />}
       command_icon="T + /"
       to="/tasks"
       onClick={handleToggleSidebar}
      />
      <SideBarBtn
       text="Calendar"
       icon={<FiCalendar />}
       command_icon="C + /"
       to="/calendar"
       onClick={handleToggleSidebar}
      />
     </div>
    </div>
   </div>
   <div></div>
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
 to
}: SideBarBtnProps) => {
 return (
  <Link
   to={to || "#"}
   onClick={onClick}
   className="w-full"
   prefetch={to ? "intent" : "none"}
  >
   <div className="w-full h-8 flex items-center justify-between px-3 rounded-md group hover:bg-gray-300/30">
    <div className="flex items-center gap-3">
     {icon}
     <label className="text-sm">{text}</label>
    </div>
    <span className="flex flex-wrap items-center gap-x-1 text-[15px] text-gray-400 dark:text-neutral-600 group-hover:text-neutral-800 dark:group-hover:text-neutral-300">
     <kbd className="min-h-7.5 inline-flex justify-center items-center font-mono text-xs text-gray-400 rounded-md dark:text-neutral-600 group-hover:text-neutral-800 dark:group-hover:text-neutral-300">
      <FiCommand />
     </kbd>
     +
     <kbd className="min-h-7.5 inline-flex justify-center items-center font-mono text-xs text-gray-400 rounded-md dark:text-neutral-600 group-hover:text-neutral-800 dark:group-hover:text-neutral-300">
      {command_icon}
     </kbd>
    </span>
   </div>
  </Link>
 );
};

export default SideBar;
