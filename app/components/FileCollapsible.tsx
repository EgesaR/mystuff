import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { Link } from "@remix-run/react";

interface FileCollapsibleProps {
  children: React.ReactNode;
  text: string;
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
  to?: string;
  onDelete?: () => void;
}

const FileCollapsible: React.FC<FileCollapsibleProps> = ({
  children,
  text,
  icon,
  color = "text-gray-400",
  onClick,
  to,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleToggle(e);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center w-full">
        <button
          type="button"
          className="flex items-center px-3 pr-1.5 h-8 hover:bg-zinc-800/40 rounded-md transition-colors focus:outline-none"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-controls={`file-collapsible-${text}`}
          aria-label={`Toggle ${text} folder`}
        >
          <motion.span
            className="inline-block w-4 h-4"
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <MdOutlineKeyboardArrowRight className="w-4 h-4 text-gray-400" />
          </motion.span>
        </button>
        <div className="flex-1 flex items-center justify-between">
          <Link
            to={to || "#"}
            onClick={onClick}
            className="flex-1"
            prefetch={to ? "intent" : "none"}
          >
            <div className="w-full h-8 flex items-center px-3 rounded-md group hover:bg-zinc-800/40 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`${color} w-5 h-5`}>{icon}</span>
                <label className="text-sm font-medium text-white whitespace-nowrap">{text}</label>
              </div>
            </div>
          </Link>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mr-3"
              aria-label={`Delete ${text}`}
            >
              <FaTrash size={12} />
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`file-collapsible-${text}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full overflow-hidden"
          >
            <div className="mt-1 p-3 pt-1.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileCollapsible;