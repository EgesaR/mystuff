import React from "react";
import { CiStickyNote } from "react-icons/ci";
import { HiOutlineClock } from "react-icons/hi";
import { IoIosAddCircle, IoIosSearch } from "react-icons/io";
import { PiHashStraightBold } from "react-icons/pi";
import { FiCommand } from "react-icons/fi";
import { Link, useNavigate } from "@remix-run/react";

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
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  const buttonContent = (
    <div className="w-full h-8 flex items-center justify-between px-2 sm:px-3 rounded-md group hover:bg-gray-300/30">
      <div className="flex items-center gap-2 sm:gap-3">
        {React.cloneElement(icon as React.ReactElement, {
          className: "text-lg sm:text-xl md:text-2xl",
        })}
        <label className="text-xs sm:text-sm md:text-base">{text}</label>
      </div>
      <span className="flex flex-wrap items-center gap-x-1 text-[12px] sm:text-[14px] md:text-[15px] text-gray-400 dark:text-neutral-600 group-hover:text-neutral-800 dark:group-hover:text-neutral-300">
        <kbd className="min-h-6 sm:min-h-7 inline-flex justify-center items-center font-mono text-[10px] sm:text-xs text-gray-400 rounded-md dark:text-neutral-600 group-hover:text-neutral-800 dark:group-hover:text-neutral-300">
          <FiCommand className="text-sm sm:text-base" />
        </kbd>
        +
        <kbd className="min-h-6 sm:min-h-7 inline-flex justify-center items-center font-mono text-[10px] sm:text-xs text-gray-400 rounded-md dark:text-neutral-600 group-hover:text-neutral-800 dark:group-hover:text-neutral-300">
          {command_icon}
        </kbd>
      </span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="w-full">
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      className="w-full h-8 flex items-center justify-between px-2 sm:px-3 rounded-md group hover:bg-gray-300/30"
      onClick={handleClick}
    >
      {buttonContent}
    </button>
  );
};

const SideBar = () => {
  return (
    <div className="h-full border-r border-gray-500 w-full md:w-48 lg:w-64 bg-gray-800 py-3 sm:py-4 px-1 sm:px-2 flex flex-col justify-between pt-4 sm:pt-6">
      <div className="flex flex-col gap-1 sm:gap-2">
        <SideBarBtn text="Search" icon={<IoIosSearch />} command_icon="S" />
        <SideBarBtn text="Recent" icon={<HiOutlineClock />} command_icon="R" />
        <div className="flex flex-col gap-3 sm:gap-4 mt-6 sm:mt-8">
          <h1 className="uppercase text-gray-400 px-2 sm:px-3 text-xs sm:text-sm">
            Workspace
          </h1>
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <SideBarBtn
              text="Notes"
              icon={<CiStickyNote />}
              command_icon="N + /"
              to="/notes"
            />
            <SideBarBtn
              text="Tasks"
              icon={<PiHashStraightBold />}
              command_icon="N + /"
              to="/tasks"
            />
          </div>
        </div>
      </div>
      <div>
        <SideBarBtn
          text="New Page"
          icon={<IoIosAddCircle />}
          command_icon="N"
          onClick={() => console.log("Create new page")}
        />
      </div>
    </div>
  );
};

export default SideBar;
