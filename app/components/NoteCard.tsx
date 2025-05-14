import { useEffect } from "react";
import Spinner from "./Spinner";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Link } from "@remix-run/react";
import { FiMoreVertical, FiTrash2, FiShare2 } from "react-icons/fi";
import { motion, usePresence, useAnimate } from "framer-motion";
import type { Note } from "~/types/notes";
import { formatRelativeTime } from "~/utils/dateUtils";
import ErrorCardRow from "./ErrorCardRow";

interface NoteCardProps {
 note: Note;
 isSelected: boolean;
 onDoubleClick: () => void;
 setNotes: () => void;
}

const NoteCard = ({
 note,
 isSelected,
 onDoubleClick,
 setNotes
}: NoteCardProps) => {
 const [isPresent, safeToRemove] = usePresence();
 const [scope, animate] = useAnimate();

 if (!note || !note.id) return <ErrorCardRow />;

 const formattedDate = formatRelativeTime(note.updatedAt);
 const excerpt =
  note.body.find(item => item.type === "paragraph")?.content ||
  note.body[0]?.content ||
  "No content";

 const handleDeleteNote = async (id: string) => {
  let res = await fetch(`/notes/${note.id}/delete`, { method: "DELETE" });
  const json = await res.json();
  if (json.ok) {
   setNotes(json.notes);
  } else {
   return json.error;
  }
 };

 useEffect(() => {
  if (!isPresent) {
   const exitAnimate = async () => {
    animate(scope.current, { scale: 1.025 }, { ease: "easeIn", duration: 0.5 });
    await animate(
     scope.current,
     { opacity: 0, x: -30 },
     { ease: "easeIn", duration: 0.5, delay: 0.05 }
    );
    safeToRemove();
   };
   exitAnimate();
  }
 }, [isPresent]);

 return (
  <motion.tr
   ref={scope}
   layout
   initial={{ opacity: 0, y: 10 }}
   animate={{ opacity: 1, y: 0 }}
   // exit={{ opacity: 0, y: -10 }}
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
      prefetch="intent"
     >
      {note.title || "Untitled"}
     </Link>
     <span className="text-[12px] sm:text-xs text-gray-500 dark:text-neutral-400 truncate max-w-[150px] sm:max-w-xs">
      {typeof excerpt === "string" ? excerpt : excerpt[0] || "No content"}
     </span>
    </div>
   </td>
   <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap">
    <div className="flex gap-1 text-orange-500 dark:text-orange-400 text-xs">
     {note.tags.length > 0 ? (
      note.tags.map(tag => <label key={tag}>{tag.replace(/^#/, "")}</label>)
     ) : (
      <span>None</span>
     )}
    </div>
   </td>
   <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
    {formattedDate}
   </td>
   <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap">
    <div className="flex -space-x-1">
     {note.owners.length > 0 ? (
      note.owners
       .slice(0, 3)
       .map(owner => (
        <img
         key={owner.id}
         alt={owner.name}
         src={owner.avatar}
         className="inline-block size-6 rounded-full ring-2 ring-white dark:ring-neutral-800"
         title={owner.name}
        />
       ))
     ) : (
      <span className="text-xs text-gray-500 dark:text-neutral-400">
       No owners
      </span>
     )}
     {note.owners.length > 3 && (
      <div className="h-6 w-6 rounded-full bg-gray-400 dark:bg-neutral-600 text-xs text-white dark:text-neutral-200 flex items-center justify-center ring-2 ring-white dark:ring-neutral-800">
       +{note.owners.length - 3}
      </div>
     )}
    </div>
   </td>
   <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
    <Menu as="div" className="relative inline-block text-left">
     <MenuButton className="p-1 text-gray-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300 ring-0 outline-0">
      <FiMoreVertical className="h-5 w-5" />
     </MenuButton>
     <MenuItems
      anchor="bottom end"
      className="w-48 rounded-md bg-white dark:bg-neutral-800 shadow-lg py-1 text-sm text-gray-700 dark:text-neutral-200 border-0 ring-0 outline-0 active:border-0 active:outline-0 active:ring-0 hover:border-0 hover:ring-0 hover:outline-0"
     >
      <MenuItem>
       <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700">
        Rename
       </button>
      </MenuItem>
      <MenuItem>
       <button className="w-full flex gap-1 items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700">
        <FiShare2 />
        Share
       </button>
      </MenuItem>
      <MenuItem>
       <button
        className="w-full flex items-center text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-100/20 dark:hover:bg-red-600/20 dark:hover:text-red-300"
        onClick={() => handleDeleteNote(note.id)}
       >
        <FiTrash2 />
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
