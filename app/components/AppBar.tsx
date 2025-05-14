import React from "react";
import { FaBars } from "react-icons/fa";

interface AppBarProps {
 toggleSidebar?: () => void;
 isSidebarOpen?: boolean;
}

const AppBar = ({ toggleSidebar, isSidebarOpen }: AppBarProps) => {
 const handleToggleSidebar = () => toggleSidebar(prev => !prev);
 return (
  <div className="w-full h-[9%] flex items-center gap-4 sm:gap-0 sm:justify-between px-2 sm:px-3 md:px-4 pt-0.5 text-white shadow-2xl">
   {/* Hamburger Menu for Mobile */}
   <button
    onClick={handleToggleSidebar}
    className="md:hidden text-white focus:outline-none"
    aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
   >
    <FaBars className="text-xl sm:text-2xl" />
   </button>

   {/* App Title */}
   <h1 className="text-2xl sm:text-xl md:text-2xl font-medium">My Stuff</h1>

   {/* Placeholder for additional content (e.g., user profile, search) */}
   <div className="w-6 sm:w-8 md:w-auto" />
  </div>
 );
};

export default AppBar;
