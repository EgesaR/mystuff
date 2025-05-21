import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link } from "@remix-run/react";

interface FileCollapsibleProps {
  children: React.ReactNode;
  text: string;
  icon: React.ReactNode;
  onClick?: () => void;
  to?: string;
}

const FileCollapsible: React.FC<FileCollapsibleProps> = ({
  children,
  text,
  icon,
  onClick,
  to,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full">
      <div className="flex items-center w-full">
        <button
          type="button"
          className="flex items-center px-3 pr-1.5 h-8"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-controls={`file-collapsible-${text}`}
        >
          <motion.span
            className="inline-block w-4 h-4"
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <MdOutlineKeyboardArrowRight className="w-4 h-4" />
          </motion.span>
        </button>
        <Link
          to={to || "#"}
          onClick={onClick}
          className="flex-1"
          prefetch={to ? "intent" : "none"}
        >
          <div className="w-full h-8 flex items-center justify-between px-3 rounded-md group hover:bg-zinc-800/40 transition-colors">
            <div className="flex items-center gap-3 text-white">
              {icon}
              <label className="text-sm font-medium whitespace-nowrap">{text}</label>
            </div>
          </div>
        </Link>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`file-collapsible-${text}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
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