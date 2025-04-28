import type { MetaFunction } from "@remix-run/node";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FiMoreVertical, FiPlus } from "react-icons/fi";
import { Link, useNavigate } from "@remix-run/react";
import { useState } from "react";
import notesData from "../data/notes.json";
import { formatRelativeTime } from "../utils/dateUtils";

export const meta: MetaFunction = () => {
  return [
    { title: "Notes Page" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

interface Owner {
  id: string;
  name: string;
  avatar: string;
}

interface NoteBody {
  type: string;
  content: string | string[];
}

interface Note {
  id: string;
  title: string;
  body: NoteBody[];
  updatedAt: string;
  createdAt: string;
  owners: Owner[];
  tags: string[];
}

export default function NotesPage() {
  const navigate = useNavigate();
  const notes: Note[] = notesData;
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const handleNewNote = () => {
    console.log("Create new note");
    navigate("/notes/new");
  };

  return (
    <div className="h-full w-full flex">
      <div className="py-5 pt-8 px-6 flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-900 dark:text-neutral-100">
            Notes
          </h1>
          <button
            onClick={handleNewNote}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 dark:text-neutral-100 bg-gray-100 dark:bg-neutral-700 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-600"
          >
            <FiPlus className="h-5 w-5" />
            New Note
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
            <thead className="bg-transparent">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  Tags
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  Updated
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  Owners
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedNoteId === note.id}
                  onDoubleClick={() => setSelectedNoteId(note.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onDoubleClick: () => void;
}

const NoteCard = ({ note, isSelected, onDoubleClick }: NoteCardProps) => {
  const formattedDate = formatRelativeTime(note.updatedAt);
  const excerpt =
    note.body.find((item) => item.type === "paragraph")?.content ||
    "No content";

  return (
    <tr
      className={`transition-all duration-200 ease-in-out group relative ${
        isSelected
          ? "bg-blue-100/50 dark:bg-blue-900/50"
          : "hover:bg-gray-100/30 dark:hover:bg-neutral-700/30"
      }`}
      onDoubleClick={onDoubleClick}
    >
      {/* Title and Excerpt */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <Link
            to={`/notes/${note.id}`}
            className="text-sm font-medium text-gray-900 dark:text-neutral-100 hover:underline"
          >
            {note.title}
          </Link>
          <span className="text-xs text-gray-500 dark:text-neutral-400 truncate max-w-xs">
            {typeof excerpt === "string" ? excerpt : excerpt[0]}
          </span>
        </div>
      </td>

      {/* Tags */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex gap-1 text-orange-500 dark:text-orange-400 text-xs">
          {note.tags.map((tag) => (
            <label key={tag}>{tag}</label>
          ))}
        </div>
      </td>

      {/* UpdatedAt */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
        {formattedDate}
      </td>

      {/* Owners */}
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

      {/* More Menu */}
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

      {/* Clickable Overlay */}
      <td className="absolute inset-0">
        <Link
          to={`/notes/${note.id}`}
          className="w-full h-full block"
          onClick={(e) => e.stopPropagation()}
        />
      </td>
    </tr>
  );
};
