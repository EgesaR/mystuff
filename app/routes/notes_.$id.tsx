import Button from "~/components/Button";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, defer } from "@remix-run/node";
import { useLoaderData, Await, useNavigate } from "@remix-run/react";
import { Suspense, useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import TextSizeMenu from "~/components/TextSizeMenu";
import AddElementMenu from "~/components/AddElementMenu";
import ElementFormModal from "~/components/ElementFormModal";
import { Form } from "~/components/Form";
import { formatRelativeTime } from "~/utils/dateUtils";
import { renderContentWithLinks } from "~/utils/renderContentWithLinks";
import type { Note, NoteBody } from "~/types/notes";
import Spinner from "~/components/Spinner";
import { getNotes, updateNote } from "~/data/notes";
import { useFetcher } from "@remix-run/react";

export const meta: MetaFunction = ({ data }) => {
 const note = (data as { note: Promise<Note> })?.note;
 return [{ title: note ? `${note.title} - Notes` : "Note Details - Notes" }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
 const notes = await getNotes();
 const note = notes.find(n => n.id === params.id);
 if (!note) {
  throw new Response("Not Found", { status: 404 });
 }
 return defer({ note });
};

export default function NoteDetails() {
 const { note: deferredNote } = useLoaderData<{ note: Promise<Note> }>();
 const [textSize, setTextSize] = useState<"sm" | "base" | "lg">("base");
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isEditing, setIsEditing] = useState(false);
 const [editorType, setEditorType] = useState<
  "heading" | "subheading" | "paragraph" | "code" | "list" | null
 >(null);
 const [editorContent, setEditorContent] = useState<string>("");
 const [editorListItems, setEditorListItems] = useState<string[]>([""]);
 const [editIndex, setEditIndex] = useState<number | null>(null);
 const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
 const [noteBody, setNoteBody] = useState<NoteBody[]>([]);
 const [noteId, setNoteId] = useState<string | null>(null);
 const navigate = useNavigate();
 const fetcher = useFetcher();
 const [updateKey, setUpdateKey] = useState(0);
 const elementRefs = useRef<(HTMLDivElement | null)[]>([]);

 const textSizeClasses = {
  sm: "text-xs md:text-sm",
  base: "text-sm md:text-base",
  lg: "text-base md:text-lg"
 };

 const openModal = (
  type: string,
  index?: number,
  content?: string | string[]
 ) => {
  setEditorType(
   type as "heading" | "subheading" | "paragraph" | "code" | "list"
  );
  setEditIndex(index ?? null);
  if (content) {
   if (Array.isArray(content)) {
    setEditorListItems(content.length > 0 ? content : [""]);
   } else {
    setEditorContent(content);
   }
  } else {
   setEditorContent("");
   setEditorListItems([""]);
  }
  console.log("Opening modal:", { type, index, content });
  setIsModalOpen(true);
 };

 const closeModal = () => {
  setIsModalOpen(false);
  setEditorType(null);
  setEditIndex(null);
  setEditorContent("");
  setEditorListItems([""]);
 };

 const openEditor = (
  type: string,
  index: number,
  content: string | string[]
 ) => {
  setEditorType(
   type as "heading" | "subheading" | "paragraph" | "code" | "list"
  );
  setEditIndex(index);
  if (Array.isArray(content)) {
   setEditorListItems(content.length > 0 ? content : [""]);
  } else {
   setEditorContent(content);
  }
  setIsEditing(true);
 };

 const closeEditor = () => {
  setIsEditing(false);
  setEditorType(null);
  setEditIndex(null);
  setEditorContent("");
  setEditorListItems([""]);
 };

 const saveElement = (
  type: string,
  content: string | string[],
  index?: number
 ) => {
  if (!type || !noteId) {
   console.error("Missing type or noteId:", { type, noteId });
   return;
  }

  const newElement: NoteBody =
   type === "list"
    ? {
       type: "list",
       content: (content as string[]).filter(item => item.trim() !== "")
      }
    : {
       type: type as "heading" | "subheading" | "paragraph" | "code",
       content: content as string
      };

  if (newElement.type !== "list" && !newElement.content.trim()) {
   console.warn("Empty content for non-list element, skipping");
   return;
  }

  const previousBody = [...noteBody];
  let updatedBody: NoteBody[];
  if (index !== undefined && index !== null) {
   updatedBody = [...noteBody];
   updatedBody[index] = newElement;
  } else {
   updatedBody = [...noteBody, newElement];
  }

  console.log("Updating noteBody:", updatedBody);
  setNoteBody(updatedBody);
  setUpdateKey(prev => prev + 1);

  if (index === undefined || index === null) {
   setTimeout(() => {
    const lastElementIndex = updatedBody.length - 1;
    const lastElement = elementRefs.current[lastElementIndex];
    if (lastElement) {
     lastElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
   }, 100);
  }

  const formData = new FormData();
  formData.append("body", JSON.stringify(updatedBody));
  console.log("Submitting to server:", { noteId, body: updatedBody });
  fetcher.submit(formData, {
   method: "put",
   action: `/notes/${noteId}/update`
  });

  if (index !== undefined && index !== null) {
   closeEditor();
  } else {
   closeModal();
  }
 };

 const handleDelete = () => {
  if (!noteId) {
   console.error("No noteId for deletion");
   return;
  }
  if (confirm("Are you sure you want to delete this note?")) {
   fetcher.submit(null, {
    method: "delete",
    action: `/notes/${noteId}/delete`
   });
  }
 };

 useEffect(() => {
  if (fetcher.state === "idle" && fetcher.data) {
   if (fetcher.data.error) {
    console.error("Operation failed:", fetcher.data.error);
    alert(`Failed: ${fetcher.data.error}`);
   } else if (fetcher.data.ok) {
    console.log("Operation successful");
    if (fetcher.formMethod === "delete") {
     navigate("/notes");
    }
   }
  }
 }, [fetcher.state, fetcher.data, navigate]);

 const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
   opacity: 1,
   transition: {
    staggerChildren: 0.1
   }
  }
 };

 const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
 };

 return (
  <div className="flex flex-col min-h-screen font-light">
   <div className="py-6 px-3">
    <Button btn_type="ghost" onClick={() => navigate(-1)}>
     <FaArrowLeft />
    </Button>
   </div>
   <Suspense
    fallback={
     <motion.div
      className="flex flex-col justify-center items-center min-h-[50vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
     >
      <Spinner size={60} strokeWidth={6} color="#0071c2" />
      <div className="text-white text-lg mt-4">Loading note...</div>
     </motion.div>
    }
   >
    <Await
     resolve={deferredNote}
     errorElement={
      <div className="text-red-400 text-center py-8">
       Failed to load note. Please try again.
      </div>
     }
    >
     {(note: Note) => {
      useEffect(() => {
       if (noteBody.length === 0 || noteId !== note.id) {
        setNoteBody(note.body);
        setNoteId(note.id);
       }
      }, [note]);

      return (
       <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col min-h-screen font-light"
        key={`note-${note.id}-${updateKey}`}
       >
        <motion.div
         variants={itemVariants}
         className="flex flex-col md:flex-row md:items-center md:justify-between px-8 md:px-10 pt-4 pb-6 border-b border-zinc-700"
        >
         <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
           <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-5xl font-medium text-white tracking-tight"
           >
            {note.title}
           </motion.h1>
           <Button
            btn_type="ghost"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300"
            disabled={fetcher.state !== "idle"}
           >
            <FaTrash />
           </Button>
          </div>
          <div className="flex flex-wrap gap-2">
           {note.tags.map(tag => (
            <motion.span
             key={tag}
             variants={itemVariants}
             className="inline-flex items-center rounded-md bg-green-600/20 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-green-400/30 ring-inset"
            >
             {tag}
            </motion.span>
           ))}
          </div>
          <motion.div
           variants={itemVariants}
           className="flex items-center text-gray-400 text-xs md:text-sm gap-2"
          >
           <p>Created {formatRelativeTime(note.createdAt)}</p>
           <div className="h-1 w-1 bg-gray-500 rounded-full"></div>
           <p>Last modified {formatRelativeTime(note.updatedAt)}</p>
          </motion.div>
         </div>
         <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 mt-4 md:mt-0 -space-x-4"
         >
          {note.owners.map(owner => (
           <motion.img
            key={owner.id}
            variants={itemVariants}
            alt={owner.name}
            src={owner.avatar}
            className="w-6 h-6 md:w-8 md:h-8 rounded-full ring-2 ring-gray-800"
            title={owner.name}
           />
          ))}
         </motion.div>
        </motion.div>

        <motion.div
         variants={itemVariants}
         className="flex-1 flex flex-col px-4 md:px-10 py-8 gap-4 md:gap-8 pb-28 overflow-y-auto pr-4 scrollbar-thin scrollbar-color-[var(--thumb-color,#4b5563)_var(--track-color,#1f2937)] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        >
         <div className="flex-1 flex flex-col gap-6">
          <AnimatePresence mode="wait">
           {noteBody.map((item, index) => (
            <motion.div
             key={`${item.type}-${index}-${updateKey}`}
             ref={el => (elementRefs.current[index] = el)}
             variants={itemVariants}
             initial="hidden"
             animate="visible"
             exit={{ opacity: 0, y: -20 }}
             layout
             className="relative group"
             onMouseEnter={() => setHoveredIndex(index)}
             onMouseLeave={() => setHoveredIndex(null)}
            >
             <AnimatePresence mode="wait">
              {isEditing && editIndex === index && editorType ? (
               <motion.div
                key={`form-${index}`}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 25 }}
                transition={{ duration: 0.3 }}
               >
                <Form
                 elementType={editorType}
                 initialContent={editorContent}
                 initialListItems={editorListItems}
                 setContent={setEditorContent}
                 setListItems={setEditorListItems}
                 onSubmit={() =>
                  saveElement(
                   editorType,
                   editorType === "list" ? editorListItems : editorContent,
                   index
                  )
                 }
                 onCancel={closeEditor}
                 isEditing={true}
                />
               </motion.div>
              ) : (
               <motion.div
                key={`display-${index}`}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
                className="space-y-3"
               >
                {hoveredIndex === index && (
                 <motion.button
                  initial={{ opacity: 0, scale: 0.8, top: 0 }}
                  animate={{ opacity: 1, scale: 1, top: -25 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => openEditor(item.type, index, item.content)}
                  className="absolute top-0 -right-2 p-2 text-gray-400 hover:text-white"
                 >
                  <svg
                   className="w-5 h-5"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg"
                  >
                   <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                   />
                  </svg>
                 </motion.button>
                )}
                <motion.div
                 variants={itemVariants}
                 initial="hidden"
                 animate="visible"
                 exit={{ opacity: 0, y: -20 }}
                 layout
                 className="mt-2"
                >
                 <AnimatePresence>
                  {item.type === "heading" && (
                   <motion.h2
                    key={`heading-${index}`}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-xl md:text-2xl font-normal text-white mt-6 mb-2"
                   >
                    {item.content}
                   </motion.h2>
                  )}
                  {item.type === "subheading" && (
                   <motion.h3
                    key={`subheading-${index}`}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-lg md:text-xl font-light text-white mt-4 mb-2"
                   >
                    {item.content}
                   </motion.h3>
                  )}
                  {item.type === "paragraph" && (
                   <motion.p
                    key={`paragraph-${index}`}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`text-gray-300 leading-relaxed ${
                     textSizeClasses[textSize]
                    } ${
                     index === 0
                      ? "bg-yellow-800/50 p-4 rounded-md text-yellow-200"
                      : ""
                    }`}
                   >
                    {renderContentWithLinks(item.content as string)}
                   </motion.p>
                  )}
                  {item.type === "list" && Array.isArray(item.content) && (
                   <motion.ul
                    key={`list-${index}`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -20 }}
                    className={`list-disc pl-6 text-gray-300 space-y-2 ${textSizeClasses[textSize]}`}
                   >
                    {item.content.map((li, i) => (
                     <motion.li
                      key={`${index}-li-${i}`}
                      variants={itemVariants}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                     >
                      {renderContentWithLinks(li.replace(/^[0-9a-z]\.\s/, ""))}
                     </motion.li>
                    ))}
                   </motion.ul>
                  )}
                  {item.type === "code" && (
                   <motion.pre
                    key={`code-${index}`}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-gray-800 rounded-md p-4 text-gray-200 overflow-x-auto ${textSizeClasses[textSize]}`}
                   >
                    <code>{item.content}</code>
                   </motion.pre>
                  )}
                 </AnimatePresence>
                </motion.div>
               </motion.div>
              )}
             </AnimatePresence>
            </motion.div>
           ))}
          </AnimatePresence>
         </div>
        </motion.div>

        <motion.div
         variants={itemVariants}
         className="fixed sm:sticky bottom-0 sm:bottom-0 left-0 right-0 bg-zinc-900 w-full shadow-md py-3 px-4 md:px-2"
        >
         <div className="flex items-center justify-end gap-8">
          <AddElementMenu openModal={openModal} />
          <TextSizeMenu textSize={textSize} setTextSize={setTextSize} />
         </div>
        </motion.div>

        <ElementFormModal
         isOpen={isModalOpen}
         onClose={closeModal}
         element={
          editorType
           ? {
              type: editorType,
              index: editIndex,
              content: editorType === "list" ? editorListItems : editorContent
             }
           : null
         }
         onSave={saveElement}
        />
       </motion.div>
      );
     }}
    </Await>
   </Suspense>
  </div>
 );
}
