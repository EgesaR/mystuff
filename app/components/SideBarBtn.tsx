import React from "react";
import { Link } from "@remix-run/react";

interface SideBarBtnProps {
  text: string;
  icon: React.ReactNode;
  color: string;
  to?: string;
  onClick?: () => void;
  onDelete?: () => void;
  isSubfolder?: boolean;
  isCollapsed?: boolean;
  className?: string;
}

const SideBarBtn: React.FC<SideBarBtnProps> = ({
  text,
  icon,
  color,
  to,
  onClick,
  onDelete,
  isSubfolder,
  isCollapsed,
  className,
}) => {
  const content = (
    <div
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium ${color} ${
        isSubfolder ? "pl-5" : ""
      } ${isCollapsed ? "justify-center px-0" : ""} ${className} sidebar-btn`}
      onClick={onClick}
    >
      {icon}
      {!isCollapsed && <span className="truncate sidebar-text">{text}</span>}
      {!isCollapsed && onDelete && (
        <button
          className="ml-auto text-zinc-500 hover:text-red-400 transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );

  return to ? (
    <Link to={to} className="block">
      {content}
    </Link>
  ) : (
    <button className="block w-full text-left">{content}</button>
  );
};

export default SideBarBtn;