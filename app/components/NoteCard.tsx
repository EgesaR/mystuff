import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Link } from "@remix-run/react";
import { FiMoreVertical } from "react-icons/fi";
import { motion } from "framer-motion";
import { Note } from "~/types/notes";
import { formatRelativeTime } from "~/utils/dateUtils";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onDoubleClick: () => void;
}

export const NoteCardSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-4 whitespace-nowrap">
      <div className="flex flex-col">
        <div className="h-4 bg-gray-200 rounded-full dark:bg-neutral-700 w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded-full dark:bg-neutral-700 w-1/2"></div>
      </div>
    </td>
    <td className="px-4 py-4 whitespace-nowrap">
      <div className="flex gap-1">
        <div className="h-3 bg-gray-200 rounded-full dark:bg-neutral-700 w-12"></div>
        <div className="h-3 bg-gray-200 rounded-full dark:bg-neutral-700 w-12"></div>
      </div>
    </td>
    <td className="px-4 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded-full dark:bg-neutral-700 w-24"></div>
    </td>
    <td className="px-4 py-4 whitespace-nowrap">
      <div className="flex -space-x-1">
        <div className="size-6 bg-gray-200 rounded-full dark:bg-neutral-700"></div>
        <div className="size-6 bg-gray-200 rounded-full dark:bg-neutral-700"></div>
      </div>
    </td>
    <td className="px-4 py-4 whitespace-nowrap text-right">
      <div className="h-5 w-5 bg-gray-200 rounded-full dark:bg-neutral-700"></div>
    </td>
  </tr>
);

export const ErrorCardRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-4 whitespace-nowrap">
      <div className="flex flex-col">
        <div className="h-4 bg-red-200 rounded-full dark:bg-red-700 w-3/4 mb-2"></div>
        <div className="h-3 bg-red-200 rounded-full dark:bg-red-700 w-1/2"></div>
      </div>
    </td>
    <td className="px-4 py-4 whitespace-nowrap">
      <div className="flex gap-1">
        <div className="h-3 bg-red-200 rounded-full dark:bg-red-700 w-12"></div>
        <div className="h-3 bg-red-200 rounded-full dark:bg-red-700 w-12"></div>
      </div>
    </td>
    <td className="px-4 py-4 whitespace-nowrap">
      <div className="h-4 bg-red-200 rounded-full dark:bg-red-700 w-24"></div>
    </td>
    <td className="px-4 py-4 whitespace-nowrap">
      <div className="flex -space-x-1">
        <div className="size-6 bg-red-200 rounded-full dark:bg-red-700"></div>
        <div className="size-6 bg-red-200 rounded-full dark:bg-red-700"></div>
      </div>
    </td>
    <td className="px-4 py-4 whitespace-nowrap text-right">
      <div className="h-5 w-5 bg-red-200 rounded-full dark:bg-red-700"></div>
    </td>
  </tr>
);

const NoteCard = ({ note, isSelected, onDoubleClick }: NoteCardProps) => {
  if (!note) return <ErrorCardRow />;

  const formattedDate = formatRelativeTime(note.updatedAt);
  const excerpt =
    note.body.find((item) => item.type === "paragraph")?.content || "No content";

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`transition-all duration-200 ease-in-out group relative ${
        isSelected
          ? "bg-blue-100/50 dark:bg-blue-900/50"
          : "hover:bg-gray-100/30 dark:hover:bg-neutral-700/30"
      }`}
      onDoubleClick={onDoubleClick}
    >
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <Link
            to={`/notes/${note.id}`}
            className="text-sm font-medium text-gray-900 dark:text-neutral-100 hover:underline"
          >
            {note.title}
          </Link>
          <span className="text-xs text-gray-500 dark:text-neutral-400 truncate max-w-xs">
            {typeof excerpt === "string" ? excerpt : excerpt[0] || "No content"}
          </span>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex gap-1 text-orange-500 dark:text-orange-400 text-xs">
          {note.tags.map((tag) => (
            <label key={tag}>{tag.replace(/^#/, "")}</label>
          ))}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
        {formattedDate}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex -space-x-1">
          {note.owners.slice(0, 3).map((owner) => (
            <img
              key={owner.id}
              alt={owner.name}
              src={owner.avatar}
              className="inline-block size-6 rounded-full ring-2 ring-white dark:ring-neutral-800"
              title={owner.name}
            />
          ))}
          {note.owners.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-gray-400 dark:bg-neutral-600 text-xs text-white dark:text-neutral-200 flex items-center justify-center ring-2 ring-white dark:ring-neutral-800">
              +{note.owners.length - 3}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="p-1 text-gray-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300">
            <FiMoreVertical className="h-5 w-5" />
          </MenuButton>
          <MenuItems
            anchor="bottom end"
            className="w-48 rounded-md bg-white dark:bg-neutral-800 shadow-lg border border-gray-200 dark:border-neutral-700 py-1 text-sm text-gray-700 dark:text-neutral-200"
          >
            <MenuItem>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700">
                Rename
              </button>
            </MenuItem>
            <MenuItem>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700">
                Duplicate
              </button>
            </MenuItem>
            <MenuItem>
              <button className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-700">
                Delete
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </td>
    </motion.tr>
  );
};

export default NoteCard;
