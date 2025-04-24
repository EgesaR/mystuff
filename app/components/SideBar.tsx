import React from "react";
import { FaSearch } from "react-icons/fa";
import { FiCommand } from "react-icons/fi"
import { HiOutlineClock } from "react-icons/hi";
import { IoIosSearch } from "react-icons/io";
import { IoAddCircleOutline } from "react-icons/io5"

const SideBar = () => {
    return (
        <div className="h-full border-r border-gray-500 w-[15%] py-4 px-1 gap-6">
            <SideBarBtn text="New Note" icon={<IoAddCircleOutline />} command_icon={"/"} />
            <SideBarBtn text="Search"  icon={<IoIosSearch />} command_icon="S" />
            <SideBarBtn text="Recent" icon={<HiOutlineClock />} command_icon="R" />
        </div>
    )
}

interface SideBarBtnProps {
  text: string;
  icon: React.ReactNode;
  command_icon: string;
}

const SideBarBtn = ({ text, icon, command_icon } : SideBarBtnProps) => {
    return (
        <button className="w-full h-8 flex items-center justify-between px-3 rounded-md hover:bg-gray-300/30">
            <div className="flex items-center gap-2">
            {icon}
            <label className="text-sm">{text}</label>
            </div>
            <span className="flex flex-wrap items-center gap-x-1 text-[15px] text-gray-400 dark:text-neutral-600">
      <kbd className="min-h-7.5 inline-flex justify-center items-center font-mono text-xs text-gray-400 rounded-md dark:text-neutral-600">
      <FiCommand />
      </kbd>
      +
      <kbd className="min-h-7.5 inline-flex justify-center items-center font-mono text-xs text-gray-400 rounded-md dark:text-neutral-600">
        {command_icon}
      </kbd>
    </span>
        </button>
    )
}


export default SideBar 