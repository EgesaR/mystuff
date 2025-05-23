import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Link } from "@remix-run/react";
import { FiMoreVertical, FiTrash2, FiShare2, FiEdit } from "react-icons/fi";
import { motion, usePresence, useAnimate } from "framer-motion";
import type { Note } from "~/types/notes";
import { formatRelativeTime } from "~/utils/dateUtils";
import ErrorCardRow from "./ErrorCardRow";
import Spinner from "./Spinner";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onDoubleClick: () => void;
  setNotes: (notes: Note[]) => void;
}

const NoteCard = ({ note, isSelected, onDoubleClick, setNotes }: NoteCardProps) => {
  const [isPresent, safeToRemove] = usePresence();
  const [scope, animate] = useAnimate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  if (!note || !note.id) return <ErrorCardRow />;

  const formattedDate = formatRelativeTime(note.updatedAt);
  const excerpt = (() => {
    const paragraph = note.body.find((item) => item.type === "paragraph");
    if (paragraph && typeof paragraph.content === "string") return paragraph.content;
    const firstItem = note.body[0];
    if (firstItem) {
      if (typeof firstItem.content === "string") return firstItem.content;
      if (Array.isArray(firstItem.content)) return firstItem.content[0] || "No content";
      if (firstItem.type === "image") return firstItem.content.caption || "Image";
      if (firstItem.type === "table") return "Table content";
    }
    return "No content";
  })();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/notes/${id}/delete`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete note");
      }
      return response.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]) || [];
      const updatedNotes = previousNotes.filter((n) => n.id !== id);
      queryClient.setQueryData(["notes"], updatedNotes);
      setNotes(updatedNotes);
      return { previousNotes };
    },
    onError: (error: Error, id, context) => {
      queryClient.setQueryData(["notes"], context?.previousNotes);
      setNotes(context?.previousNotes || []);
      setError(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setError(null);
    },
  });

  useEffect(() => {
    if (!isPresent) {
      const exitAnimate = async () => {
        await animate(
          scope.current,
          { opacity: 0, x: -30 },
          { duration: 0.3, ease: "easeInOut" }
        );
        safeToRemove();
      };
      exitAnimate();
    }
  }, [isPresent, animate, scope, safeToRemove]);

  return (
    <motion.tr
      ref={scope}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`transition-all duration-200 ease-in-out group relative ${
        isSelected
          ? "bg-blue-100/50 dark:bg-blue-900/50"
          : "hover:bg-gray-100/30 dark:hover:bg-neutral-700/30"
      }`}
      onDoubleClick={onDoubleClick}
      aria-selected={isSelected}
      role="row"
    >
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <Link
            to={`/notes/${note.id}`}
            className="text-sm font-medium text-gray-900 dark:text-neutral-100 hover:underline"
            prefetch="intent"
            aria-label={`View note: ${note.title || "Untitled"}`}
          >
            {note.title || "Untitled"}
          </Link>
          <span className="text-[12px] sm:text-xs text-gray-500 dark:text-neutral-400 truncate max-w-[150px] sm:max-w-xs">
            {excerpt}
          </span>
        </div>
      </td>
      <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap">
        <div className="flex gap-1 text-orange-500 dark:text-orange-400 text-xs">
          {note.tags.length > 0 ? (
            note.tags.map((tag) => <label key={tag}>{tag.replace(/^#/, "")}</label>)
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
            note.owners.slice(0, 3).map((owner) => (
              <img
                key={owner.id}
                alt={owner.name}
                src={owner.avatar}
                className="inline-block size-6 rounded-full ring-2 ring-white dark:ring-neutral-800"
                title={owner.name}
                aria-label={`Owner: ${owner.name}`}
              />
            ))
          ) : (
            <span className="text-xs text-gray-500 dark:text-neutral-400">
              No owners
            </span>
          )}
          {note.owners.length > 3 && (
            <div
              className="h-6 w-6 rounded-full bg-gray-400 dark:bg-neutral-600 text-xs text-white dark:text-neutral-200 flex items-center justify-center ring-2 ring-white dark:ring-neutral-800"
              aria-label={`Additional owners: ${note.owners.length - 3}`}
            >
              +{note.owners.length - 3}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        {error && (
          <span className="text-red-400 text-xs mr-2" role="alert">
            {error}
          </span>
        )}
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton
            className="p-1 text-gray-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300 focus:outline-none"
            aria-label="More actions for this note"
          >
            <FiMoreVertical className="h-5 w-5" />
          </MenuButton>
          <MenuItems
            anchor="bottom end"
            className="w-48 rounded-md bg-white dark:bg-neutral-800 shadow-lg py-1 text-sm text-gray-700 dark:text-neutral-200 focus:outline-none"
          >
            <MenuItem>
              {({ focus }) => (
                <Link
                  to={`/notes/${note.id}/edit`}
                  className={`w-full flex gap-1 items-center text-left px-4 py-2 ${
                    focus
                      ? "bg-gray-100 dark:bg-neutral-700"
                      : "hover:bg-gray-100 dark:hover:bg-neutral-700"
                  }`}
                  aria-label={`Rename note: ${note.title || "Untitled"}`}
                >
                  <FiEdit />
                  Rename
                </Link>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={`w-full flex gap-1 items-center text-left px-4 py-2 ${
                    focus
                      ? "bg-gray-100 dark:bg-neutral-700"
                      : "hover:bg-gray-100 dark:hover:bg-neutral-700"
                  }`}
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  aria-label={`Share note: ${note.title || "Untitled"}`}
                >
                  <FiShare2 />
                  Share
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={`w-full flex items-center text-left px-4 py-2 text-red-600 dark:text-red-400 ${
                    focus
                      ? "bg-red-100/20 dark:bg-red-600/20 dark:text-red-300"
                      : "hover:bg-red-100/20 dark:hover:bg-red-600/20 dark:hover:text-red-300"
                  }`}
                  onClick={() => deleteMutation.mutate(note.id)}
                  disabled={deleteMutation.isPending}
                  aria-label={`Delete note: ${note.title || "Untitled"}`}
                >
                  {deleteMutation.isPending ? <Spinner /> : <FiTrash2 />}
                  Delete
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>
      </td>
    </motion.tr>
  );
};

export default NoteCard;