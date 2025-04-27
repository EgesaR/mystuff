import React from "react";
import { CiStickyNote } from "react-icons/ci";
import { FaSearch } from "react-icons/fa";
import { FiCommand } from "react-icons/fi";
import { HiOutlineClock } from "react-icons/hi";
import { IoIosAddCircle, IoIosSearch } from "react-icons/io";
import { IoAddCircleOutline } from "react-icons/io5";
import { PiHashStraightBold } from "react-icons/pi";
import { Link, useNavigate } from "@remix-run/react";

const SideBar = () => {
  return (
    <div className="h-full border-r border-gray-500 w-[18%] py-4 px-1 flex flex-col justify-between pt-6">
      <div className="flex flex-col gap-1">
        <SideBarBtn text="Search" icon={<IoIosSearch />} command_icon="S" />
        <SideBarBtn text="Recent" icon={<HiOutlineClock />} command_icon="R" />
        <div className="flex flex-col gap-4 mt-8">
          <h1 className="uppercase text-gray-400 px-3 text-sm">Workspace</h1>
          <div className="flex flex-col gap-1.5">
            <SideBarBtn
              text="Notes"
              icon={<CiStickyNote />}
              command_icon={"N + /"}
              to="/notes"
            />
            <SideBarBtn
              text="Tasks"
              icon={<PiHashStraightBold />}
              command_icon={"N + /"}
              to="/tasks"
            />
          </div>
        </div>
      </div>
      <div>
        <SideBarBtn
          text="New Page"
          icon={<IoIosAddCircle />}
          command_icon={"N"}
          onClick={() => console.log("Create new page")}
        />
      </div>
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

const SideBarBtn = ({ text, icon, command_icon, onClick, to }: SideBarBtnProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  // If there's a 'to' prop, wrap the button in a Link for better accessibility and prefetching
  if (to) {
    return (
      <Link to={to} className="w-full">
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
  }

  return (
    <button 
      className="w-full h-8 flex items-center justify-between px-3 rounded-md group hover:bg-gray-300/30" 
      onClick={handleClick}
    >
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
    </button>
  );
};

export default SideBar;