import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, defer } from "@remix-run/node";
import { useLoaderData, Await } from "@remix-run/react";
import { Suspense, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { HiPencil } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";
import notesData from "~/data/notes.json";
import TextSizeMenu from "~/components/TextSizeMenu";
import AddElementMenu from "~/components/AddElementMenu";
import { Form } from "~/components/Form";
import { formatRelativeTime } from "~/utils/dateUtils";
import type { Note, NoteBody } from "../types/notes";
import Spinner from "~/components/Spinner";

// Utility function to simulate delay
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const note = (data as { note: Promise<Note> })?.note;
  return [{ title: note ? `${(note as unknown as Note).title} - Notes` : "Notes" }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const note = notesData.find((n) => n.id === params.id);
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  return defer({
    note: wait(3500).then(() => note),
  });
};

export default function NoteDetails() {
  const { note: deferredNote } = useLoaderData<{ note: Promise<Note> }>();
  const [textSize, setTextSize] = useState<"sm" | "base" | "lg">("base");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedElementType, setSelectedElementType] = useState<
    "heading" | "subheading" | "paragraph" | "code" | "list" | null
  >(null);
  const [formContent, setFormContent] = useState<string>("");
  const [listItems, setListItems] = useState<string[]>([""]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const textSizeClasses = {
    sm: "text-xs md:text-sm",
    base: "text-sm md:text-base",
    lg: "text-base md:text-lg",
  };

  const openModal = (
    type: "heading" | "subheading" | "paragraph" | "code" | "list",
    index?: number,
    content?: string | string[]
  ) => {
    setSelectedElementType(type);
    if (index !== undefined) {
      setEditIndex(index);
    } else {
      setEditIndex(null);
    }
    if (content) {
      if (Array.isArray(content)) {
        setListItems(content);
      } else {
        setFormContent(content);
      }
    } else {
      setFormContent("");
      setListItems([""]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedElementType(null);
    setEditIndex(null);
    setFormContent("");
    setListItems([""]);
  };

  const addListItem = () => {
    setListItems([...listItems, ""]);
  };

  const updateListItem = (index: number, value: string) => {
    const newItems = [...listItems];
    newItems[index] = value;
    setListItems(newItems);
  };

  const renderContentWithLinks = (content: string) => {
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, text, url] = match;
      const startIndex = match.index;

      if (startIndex > lastIndex) {
        parts.push(content.slice(lastIndex, startIndex));
      }

      parts.push(
        <a
          key={startIndex}
          href={url}
          className="text-blue-600 underline hover:text-blue-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      );

      lastIndex = startIndex + fullMatch.length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col min-h-screen font-light">
      <Suspense
        fallback={
          <motion.div
            className="flex flex-col justify-center items-center min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Spinner size={60} strokeWidth={6} color="#0071c2" />
            <div className="text-white text-lg mt-4">Loading note...</div>
          </motion.div>
        }
      >
        <Await resolve={deferredNote}>
          {(note: Note) => {
            const [noteBody, setNoteBody] = useState<NoteBody[]>(note.body);

            const addElement = () => {
              if (!selectedElementType) return;

              let newElement: NoteBody;
              if (selectedElementType === "list") {
                const filteredItems = listItems.filter(
                  (item) => item.trim() !== ""
                );
                if (filteredItems.length === 0) return;
                newElement = { type: "list", content: filteredItems };
              } else {
                if (!formContent.trim()) return;
                newElement = {
                  type: selectedElementType,
                  content: formContent,
                };
              }

              const updatedBody = [...noteBody, newElement];
              setNoteBody(updatedBody);

              const noteIndex = notesData.findIndex((n) => n.id === note.id);
              if (noteIndex !== -1) {
                notesData[noteIndex] = { ...note, body: updatedBody };
              }

              closeModal();
            };

            const openEditForm = (index: number) => {
              const item = noteBody[index];
              openModal(item.type, index, item.content);
            };

            const closeEditForm = () => {
              closeModal();
            };

            const updateElement = () => {
              if (editIndex === null || !selectedElementType) return;

              let updatedElement: NoteBody;
              if (selectedElementType === "list") {
                const filteredItems = listItems.filter(
                  (item) => item.trim() !== ""
                );
                if (filteredItems.length === 0) return;
                updatedElement = { type: "list", content: filteredItems };
              } else {
                if (!formContent.trim()) return;
                updatedElement = {
                  type: selectedElementType,
                  content: formContent,
                };
              }

              const updatedBody = [...noteBody];
              updatedBody[editIndex] = updatedElement;
              setNoteBody(updatedBody);

              const noteIndex = notesData.findIndex((n) => n.id === note.id);
              if (noteIndex !== -1) {
                notesData[noteIndex] = { ...note, body: updatedBody };
              }

              closeEditForm();
            };

            return (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col min-h-screen font-light"
              >
                {/* Header */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col md:flex-row md:items-center md:justify-between px-8 md:px-10 pt-10"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag) => (
                        <motion.span
                          key={tag}
                          variants={itemVariants}
                          className="inline-flex items-center rounded-md bg-green-600/20 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-green-400/30 ring-inset"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                    <motion.h1
                      variants={itemVariants}
                      className="text-2xl md:text-5xl font-normal text-white tracking-tight"
                    >
                      {note.title}
                    </motion.h1>
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
                    {note.owners.map((owner) => (
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

                {/* Main Content */}
                <motion.div
                  variants={itemVariants}
                  className="flex-1 flex flex-col px-4 md:px-10 py-8 gap-4 md:gap-8 pb-16 overflow-y-auto pr-4 scrollbar-thin scrollbar-color-[var(--thumb-color,#4b5563)_var(--track-color,#1f2937)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                >
                  <div className="flex-1 flex flex-col gap-6">
                    <AnimatePresence>
                      {noteBody.map((item, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, y: -20 }}
                          className="relative group"
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          {editIndex === index ? (
                            <Form
                              elementType={selectedElementType!}
                              initialContent={formContent}
                              initialListItems={listItems}
                              setContent={setFormContent}
                              setListItems={setListItems}
                              onSubmit={updateElement}
                              onCancel={closeEditForm}
                            />
                          ) : (
                            <>
                              {hoveredIndex === index && (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  onClick={() => openEditForm(index)}
                                  className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white"
                                >
                                  <HiPencil className="w-5 h-5" />
                                </motion.button>
                              )}
                              {item.type === "heading" && (
                                <motion.h2
                                  variants={itemVariants}
                                  className="text-xl md:text-2xl font-normal text-white mt-6 mb-2"
                                >
                                  {item.content}
                                </motion.h2>
                              )}
                              {item.type === "subheading" && (
                                <motion.h3
                                  variants={itemVariants}
                                  className="text-lg md:text-xl font-light text-white mt-4 mb-2"
                                >
                                  {item.content}
                                </motion.h3>
                              )}
                              {item.type === "paragraph" && (
                                <motion.p
                                  variants={itemVariants}
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
                                  variants={containerVariants}
                                  className={`list-disc pl-6 text-gray-300 space-y-2 ${textSizeClasses[textSize]}`}
                                >
                                  {item.content.map((li, i) => (
                                    <motion.li key={i} variants={itemVariants}>
                                      {renderContentWithLinks(
                                        li.replace(/^[0-9a-z]\.\s/, "")
                                      )}
                                    </motion.li>
                                  ))}
                                </motion.ul>
                              )}
                              {item.type === "code" && (
                                <motion.pre
                                  variants={itemVariants}
                                  className={`bg-gray-800 rounded-md p-4 text-gray-200 overflow-x-auto ${textSizeClasses[textSize]}`}
                                >
                                  <code>{item.content}</code>
                                </motion.pre>
                              )}
                            </>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Sticky Footer */}
                <motion.div
                  variants={itemVariants}
                  className="sticky bottom-0 left-0 right-0 bg-zinc-900 w-full shadow-md py-3 px-4 md:px-2"
                >
                  <div className="flex items-center justify-end gap-8">
                    <AddElementMenu openModal={openModal} />
                    <TextSizeMenu setTextSize={setTextSize} />
                  </div>
                </motion.div>

                {/* Modal */}
                <Transition appear show={isModalOpen} as={Fragment}>
                  <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="fixed inset-0 bg-black bg-opacity-50" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                      <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                          as={Fragment}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0 scale-95"
                          enterTo="opacity-100 scale-100"
                          leave="ease-in duration-200"
                          leaveFrom="opacity-100 scale-100"
                          leaveTo="opacity-0 scale-95"
                        >
                          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-md bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title
                              as="h3"
                              className="text-lg font-medium leading-6 text-white"
                            >
                              {selectedElementType
                                ? `Add ${
                                    selectedElementType.charAt(0).toUpperCase() +
                                    selectedElementType.slice(1)
                                  }`
                                : "Add Element"}
                            </Dialog.Title>
                            <div className="mt-4">
                              {selectedElementType === "list" ? (
                                <div className="space-y-3">
                                  {listItems.map((item, index) => (
                                    <input
                                      key={index}
                                      type="text"
                                      value={item}
                                      onChange={(e) =>
                                        updateListItem(index, e.target.value)
                                      }
                                      placeholder={`Item ${index + 1}`}
                                      className="w-full rounded-md bg-gray-700 text-gray-300 px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    />
                                  ))}
                                  <button
                                    type="button"
                                    onClick={addListItem}
                                    className="mt-2 px-3 py-1 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
                                  >
                                    Add List Item
                                  </button>
                                </div>
                              ) : (
                                <textarea
                                  value={formContent}
                                  onChange={(e) => setFormContent(e.target.value)}
                                  placeholder={
                                    selectedElementType
                                      ? `Enter ${selectedElementType} content...`
                                      : "Enter content..."
                                  }
                                  rows={4}
                                  className="w-full rounded-md bg-gray-700 text-gray-300 px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                />
                              )}
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                              <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
                                onClick={closeModal}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                onClick={editIndex !== null ? updateElement : addElement}
                              >
                                {editIndex !== null ? "Update" : "Add"}
                              </button>
                            </div>
                          </Dialog.Panel>
                        </Transition.Child>
                      </div>
                    </div>
                  </Dialog>
                </Transition>
              </motion.div>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}