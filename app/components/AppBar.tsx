import React from "react";
import { FaBars } from "react-icons/fa";

interface AppBarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const AppBar = ({ toggleSidebar, isSidebarOpen }: AppBarProps) => {
  return (
    <div className="w-full h-[8%] border-b border-gray-500 flex items-center justify-between px-2 sm:px-3 md:px-4 bg-gray-900 text-white">
      {/* Hamburger Menu for Mobile */}
      <button
        onClick={toggleSidebar}
        className="md:hidden text-white focus:outline-none"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <FaBars className="text-xl sm:text-2xl" />
      </button>

      {/* App Title */}
      <h1 className="text-lg sm:text-xl md:text-2xl font-medium">My Stuff</h1>

      {/* Placeholder for additional content (e.g., user profile, search) */}
      <div className="w-6 sm:w-8 md:w-auto" />
    </div>
  );
};

export default AppBar;
