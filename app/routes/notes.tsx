import { useNavigate } from "@remix-run/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import NoteCard from "~/components/NoteCard";
import NoteCardSkeleton from "~/components/NoteCardSkeleton";
import type { Note } from "~/types/notes";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Notes" }];
};

export default function NotesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await fetch("/api/loader/notes");
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }
      const { notes } = await response.json();
      return notes as Note[];
    },
    staleTime: 1000 * 10, // Reduced to 10 seconds for faster updates
  });

  const handleNewNote = () => {
    navigate("/notes/new");
  };

  return (
    <div className="h-full w-full flex">
      <div className="py-5 pt-8 px-3 sm:px-6 flex flex-col gap-4 w-full">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-900 dark:text-neutral-100">
            Notes
          </h1>
          <button
            onClick={handleNewNote}
            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-neutral-100 bg-gray-100 dark:bg-neutral-700 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-600"
            aria-label="Create a new note"
          >
            <FiPlus className="size-4 sm:size-6" />
            New Note
          </button>
        </nav>
        <div className="overflow-x-auto">
          <table
            className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700"
            role="table"
            aria-label="Notes list"
          >
            <thead className="bg-transparent">
              <tr>
                <th
                  scope="col"
                  className="px-4 pr-8 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider"
                  aria-sort="none"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider"
                  aria-sort="none"
                >
                  Tags
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider"
                  aria-sort="none"
                >
                  Updated
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider"
                  aria-sort="none"
                >
                  Owners
                </th>
                <th
                  scope="col"
                  className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {isLoading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <NoteCardSkeleton key={i} />
                  ))}
                </>
              ) : notes?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-gray-500 dark:text-neutral-400"
                  >
                    No notes available.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {[...(notes || [])].reverse().map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isSelected={selectedNoteId === note.id}
                      onDoubleClick={() => setSelectedNoteId(note.id)}
                      setNotes={(updatedNotes: Note[]) => {
                        queryClient.setQueryData(["notes"], updatedNotes);
                      }}
                    />
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}