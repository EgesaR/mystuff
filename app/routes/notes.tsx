import Remix, {
 Await,
 defer,
 useLoaderData,
 useNavigate
} from "@remix-run/react";
import React, { Suspense, useState, useEffect } from "react";
import type { Note } from "~/types/notes";
import NoteCard from "~/components/NoteCard";
import NoteCardSkeleton from "~/components/NoteCardSkeleton";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { getNotes } from "~/data/notes";
import { FiPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export const meta: MetaFunction = () => {
 return [{ title: "Notes" }];
};

export const loader: LoaderFunction = () => {
 return defer({
  notes: getNotes()
 });
};

const NotesPage = () => {
 const data = useLoaderData<{ notes: Promise<Note[]> }>();
 const [notes, setNotes] = useState<Note[]>([]);
 const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
 const navigate = useNavigate();

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
     >
      <FiPlus className="size-4 sm:size-6" />
      New Note
     </button>
    </nav>
    <div className="overflow-x-auto">
     <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
      <thead className="bg-transparent">
       <tr>
        <th className="px-4 pr-8 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
         Title
        </th>
        <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
         Tags
        </th>
        <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
         Updated
        </th>
        <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
         Owners
        </th>
        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
         Actions
        </th>
       </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
       <Suspense
        fallback={
         <>
          {[...Array(5)].map((_, i) => (
           <NoteCardSkeleton key={i} />
          ))}
         </>
        }
       >
        <Await resolve={data.notes}>
         {(awaitedNotes: Note[]) => {
          useEffect(() => {
           if (notes.length === 0) {
            setNotes(awaitedNotes);
           }
          }, [awaitedNotes]);
          return (
           <>
            {notes?.length === 0 && (
             <tr>
              <td
               colSpan={5}
               className="text-center py-6 text-gray-500 dark:text-neutral-400"
              >
               No notes available.
              </td>
             </tr>
            )}
            <AnimatePresence>
             {[...notes].reverse().map(note => (
              <NoteCard
               key={note.id}
               note={note}
               isSelected={selectedNoteId === note.id}
               onDoubleClick={() => setSelectedNoteId(note.id)}
               setNotes={setNotes}
              />
             ))}
            </AnimatePresence>
           </>
          );
         }}
        </Await>
       </Suspense>
      </tbody>
     </table>
    </div>
   </div>
  </div>
 );
};

export default NotesPage;
