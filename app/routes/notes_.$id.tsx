import Button from "~/components/Button";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect, useRef, useMemo } from "react";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import TextSizeMenu from "~/components/TextSizeMenu";
import AddElementMenu from "~/components/AddElementMenu";
import ElementFormModal from "~/components/ElementFormModal";
import { Form } from "~/components/Form";
import { formatRelativeTime } from "~/utils/dateUtils";
import { renderContentWithLinks } from "~/utils/renderContentWithLinks";
import type { Note, NoteBody } from "~/types/notes";
import { getNotes } from "~/data/notes";
import { useFetcher } from "@remix-run/react";
import { IoPencil } from "react-icons/io5";
import { IoMdTrash } from "react-icons/io";

type ElementType =
  | "heading"
  | "subheading"
  | "paragraph"
  | "code"
  | "list"
  | "checkbox"
  | "image"
  | "table"
  | "grid"
  | "flexbox";

interface FetcherData {
  ok?: boolean;
  error?: string;
}

export const meta: MetaFunction = ({ data }) => {
  const note = (data as { note: Note })?.note;
  return [{ title: note ? `${note.title} - Notes` : "Note Details - Notes" }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const notes = await getNotes();
  const note = notes.find((n) => n.id === params.id);
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ note });
};

export default function NoteDetails() {
  const { note } = useLoaderData<{ note: Note }>();
  const [textSize, setTextSize] = useState<"sm" | "base" | "lg">("base");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editorType, setEditorType] = useState<ElementType | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [editorListItems, setEditorListItems] = useState<string[]>([""]);
  const [editorImageCaption, setEditorImageCaption] = useState<string>("");
  const [editorRows, setEditorRows] = useState<string[][]>([[]]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [noteBody, setNoteBody] = useState<NoteBody[]>(note.body);
  const [noteId] = useState<string>(note.id);
  const navigate = useNavigate();
  const fetcher = useFetcher<FetcherData>();
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const textSizeClasses = {
    sm: "text-xs md:text-sm",
    base: "text-sm md:text-base",
    lg: "text-base md:text-lg",
  };

  const modalElement = useMemo(() => {
    if (!editorType) return null;
    return {
      type: editorType,
      index: editIndex,
      content:
        editorType === "list" ||
        editorType === "checkbox" ||
        editorType === "grid" ||
        editorType === "flexbox"
          ? editorListItems
          : editorType === "image"
          ? { url: editorContent, caption: editorImageCaption || undefined }
          : editorType === "table"
          ? { headers: editorListItems, rows: editorRows }
          : editorContent,
    };
  }, [editorType, editIndex, editorContent, editorListItems, editorImageCaption, editorRows]);

  const openModal = (
    type: string,
    index: number | null = null,
    content?: string | string[] | { url: string; caption?: string } | { headers: string[]; rows: string[][] }
  ) => {
    setEditorType(type as ElementType);
    setEditIndex(index);
    if (content) {
      if (Array.isArray(content)) {
        setEditorListItems(content.length > 0 ? content : [""]);
        setEditorContent("");
        setEditorImageCaption("");
        setEditorRows([[]]);
      } else if (typeof content === "object" && "url" in content) {
        setEditorContent(content.url);
        setEditorImageCaption(content.caption || "");
        setEditorListItems([""]);
        setEditorRows([[]]);
      } else if (typeof content === "object" && "headers" in content) {
        setEditorListItems(content.headers.length > 0 ? content.headers : [""]);
        setEditorContent("");
        setEditorImageCaption("");
        setEditorRows(content.rows.length > 0 ? content.rows : [content.headers.map(() => "")]);
      } else {
        setEditorContent(content as string);
        setEditorListItems([""]);
        setEditorImageCaption("");
        setEditorRows([[]]);
      }
    } else {
      setEditorContent("");
      setEditorListItems([""]);
      setEditorImageCaption("");
      setEditorRows([[]]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditorType(null);
    setEditIndex(null);
    setEditorContent("");
    setEditorListItems([""]);
    setEditorImageCaption("");
    setEditorRows([[]]);
  };

  const openEditor = (
    type: string,
    index: number,
    content: string | string[] | { url: string; caption?: string } | { headers: string[]; rows: string[][] }
  ) => {
    setEditorType(type as ElementType);
    setEditIndex(index);
    if (Array.isArray(content)) {
      setEditorListItems(content.length > 0 ? content : [""]);
      setEditorContent("");
      setEditorImageCaption("");
      setEditorRows([[]]);
    } else if (typeof content === "object" && "url" in content) {
      setEditorContent(content.url);
      setEditorImageCaption(content.caption || "");
      setEditorListItems([""]);
      setEditorRows([[]]);
    } else if (typeof content === "object" && "headers" in content) {
      setEditorListItems(content.headers.length > 0 ? content.headers : [""]);
      setEditorContent("");
      setEditorImageCaption("");
      setEditorRows(content.rows.length > 0 ? content.rows : [content.headers.map(() => "")]);
    } else {
      setEditorContent(content as string);
      setEditorListItems([""]);
      setEditorImageCaption("");
      setEditorRows([[]]);
    }
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setEditorType(null);
    setEditIndex(null);
    setEditorContent("");
    setEditorListItems([""]);
    setEditorImageCaption("");
    setEditorRows([[]]);
  };

  const saveElement = (
    type: string,
    content: string | string[] | { url: string; caption?: string } | { headers: string[]; rows: string[][] },
    index: number | null
  ) => {
    if (!type || !noteId) {
      console.error("Missing type or noteId:", { type, noteId });
      return;
    }

    const newElement: NoteBody =
      type === "list" || type === "checkbox" || type === "grid" || type === "flexbox"
        ? {
            type: type as "list" | "checkbox" | "grid" | "flexbox",
            content: Array.isArray(content) ? content.filter((item) => item.trim() !== "") : [],
          }
        : type === "image"
        ? {
            type: "image",
            content: typeof content === "object" && "url" in content ? content : { url: content as string },
          }
        : type === "table"
        ? {
            type: "table",
            content:
              typeof content === "object" && "headers" in content
                ? content
                : { headers: content as string[], rows: [] },
          }
        : {
            type: type as "heading" | "subheading" | "paragraph" | "code",
            content: content as string,
          };

    if (
      newElement.type !== "list" &&
      newElement.type !== "checkbox" &&
      newElement.type !== "grid" &&
      newElement.type !== "flexbox" &&
      typeof newElement.content === "string" &&
      !newElement.content.trim()
    ) {
      console.warn("Empty content for non-list element, skipping");
      return;
    }

    let updatedBody: NoteBody[];
    if (index !== null) {
      updatedBody = [...noteBody];
      updatedBody[index] = newElement;
    } else {
      updatedBody = [...noteBody, newElement];
    }

    setNoteBody(updatedBody);

    if (index === null) {
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
    fetcher.submit(formData, {
      method: "put",
      action: `/notes/${noteId}/update`,
    });

    if (index !== null) {
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
        action: `/notes/${noteId}/delete`,
      });
    }
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      const data = fetcher.data;
      if (data.error) {
        console.error("Operation failed:", data.error);
        alert(`Failed: ${data.error}`);
      } else if (data.ok) {
        console.log("Operation successful");
        if (fetcher.formMethod === "delete") {
          navigate("/notes");
        }
      }
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex flex-col min-h-screen font-light bg-zinc-900">
      <div className="py-6 px-3">
        <Button btn_type="ghost" onClick={() => navigate(-1)}>
          <FaArrowLeft className="text-zinc-300" />
        </Button>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col min-h-screen font-light"
        key={`note-${note.id}`}
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center md:justify-between px-8 md:px-10 pt-4 pb-6 border-b border-zinc-700"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <motion.h1
                variants={itemVariants}
                className="text-3xl md:text-5xl font-medium text-zinc-50 tracking-tight"
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
            <motion.div
              variants={itemVariants}
              className="flex items-center text-zinc-400 text-xs md:text-sm gap-2"
            >
              <p>Created {formatRelativeTime(note.createdAt)}</p>
              <div className="h-1 w-1 bg-zinc-500 rounded-full"></div>
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
                className="w-6 h-6 md:w-8 md:h-8 rounded-full ring-2 ring-zinc-800"
                title={owner.name}
              />
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex-1 flex flex-col px-4 md:px-10 py-8 gap-4 pb-28 overflow-y-auto pr-4 scrollbar-thin scrollbar-color-[var(--thumb-color,#4b5563)_var(--track-color,#1f2937)] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600"
        >
          <div className="flex-1 flex flex-col gap-4">
            <AnimatePresence>
              {noteBody.map((item, index) => (
                <motion.div
                  key={`${item.type}-${index}`}
                  ref={(el) => (elementRefs.current[index] = el)}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  className="relative group p-2 flex"
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    setHoveredIndex(index);
                    const element = elementRefs.current[index];
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    }
                  }}
                  onMouseLeave={() => {
                    hoverTimeoutRef.current = setTimeout(() => {
                      setHoveredIndex(null);
                    }, 200);
                  }}
                >
                  <div className="flex-shrink-0 w-8 relative z-10">
                    <AnimatePresence>
                      {hoveredIndex === index && (
                        <motion.div
                          variants={buttonVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="absolute left-0 top-0 flex flex-col gap-1"
                          onMouseEnter={() => {
                            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                          }}
                          onMouseLeave={() => {
                            hoverTimeoutRef.current = setTimeout(() => {
                              setHoveredIndex(null);
                            }, 200);
                          }}
                        >
                          <motion.button
                            onClick={() => openEditor(item.type, index, item.content)}
                            className="p-1 text-zinc-400 hover:text-orange-500 bg-zinc-800 rounded"
                          >
                            <IoPencil className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              const updatedBody = [...noteBody];
                              updatedBody.splice(index, 1);
                              setNoteBody(updatedBody);
                              const formData = new FormData();
                              formData.append("body", JSON.stringify(updatedBody));
                              fetcher.submit(formData, {
                                method: "put",
                                action: `/notes/${noteId}/update`,
                              });
                            }}
                            className="p-1 text-zinc-400 hover:text-orange-500 bg-zinc-800 rounded"
                          >
                            <IoMdTrash className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex-1">
                    {isEditing && editIndex === index && editorType ? (
                      <motion.div
                        key={`form-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Form
                          elementType={editorType}
                          initialContent={editorContent}
                          initialListItems={editorListItems}
                          initialImageCaption={editorImageCaption}
                          initialRows={editorRows}
                          setContent={setEditorContent}
                          setListItems={setEditorListItems}
                          setImageCaption={setEditorImageCaption}
                          setRows={setEditorRows}
                          onSubmit={() =>
                            saveElement(
                              editorType,
                              editorType === "list" ||
                              editorType === "checkbox" ||
                              editorType === "grid" ||
                              editorType === "flexbox"
                                ? editorListItems
                                : editorType === "image"
                                ? { url: editorContent, caption: editorImageCaption || undefined }
                                : editorType === "table"
                                ? { headers: editorListItems, rows: editorRows }
                                : editorContent,
                              index
                            )
                          }
                          onCancel={closeEditor}
                          isEditing={true}
                        />
                      </motion.div>
                    ) : (
                      <div className="space-y-1">
                        {item.type === "heading" && (
                          <motion.h2
                            key={`heading-${index}`}
                            variants={itemVariants}
                            className="text-xl md:text-2xl font-normal text-zinc-50 mt-1 mb-1"
                          >
                            {item.content}
                          </motion.h2>
                        )}
                        {item.type === "subheading" && (
                          <motion.h3
                            key={`subheading-${index}`}
                            variants={itemVariants}
                            className="text-lg md:text-xl font-light text-zinc-50 mt-1 mb-1"
                          >
                            {item.content}
                          </motion.h3>
                        )}
                        {item.type === "paragraph" && (
                          <motion.p
                            key={`paragraph-${index}`}
                            variants={itemVariants}
                            className={`text-zinc-300 leading-relaxed ${textSizeClasses[textSize]} mt-1 mb-1`}
                          >
                            {renderContentWithLinks(item.content as string)}
                          </motion.p>
                        )}
                        {item.type === "list" && Array.isArray(item.content) && (
                          <motion.ul
                            key={`list-${index}`}
                            variants={containerVariants}
                            className={`list-disc pl-6 text-zinc-300 space-y-0.5 ${textSizeClasses[textSize]} mt-1 mb-1`}
                          >
                            {item.content.map((li, i) => (
                              <motion.li key={`list-${index}-${i}`} variants={itemVariants}>
                                {renderContentWithLinks(li.replace(/^[0-9a-z]\.\s/, ""))}
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                        {item.type === "checkbox" && Array.isArray(item.content) && (
                          <motion.div
                            key={`checkbox-${index}`}
                            variants={containerVariants}
                            className={`text-zinc-300 ${textSizeClasses[textSize]} mt-1 mb-1 space-y-1`}
                          >
                            {item.content.map((li, i) => (
                              <motion.label
                                key={`checkbox-${index}-${i}`}
                                variants={itemVariants}
                                className="flex items-center gap-2"
                              >
                                <input type="checkbox" className="h-4 w-4 text-orange-600 rounded" />
                                <span>{renderContentWithLinks(li)}</span>
                              </motion.label>
                            ))}
                          </motion.div>
                        )}
                        {item.type === "code" && (
                          <motion.pre
                            key={`code-${index}`}
                            variants={itemVariants}
                            className={`bg-zinc-800 rounded-md p-4 text-zinc-200 overflow-x-auto ${textSizeClasses[textSize]} mt-1 mb-1`}
                          >
                            <code>{item.content}</code>
                          </motion.pre>
                        )}
                        {item.type === "image" && typeof item.content === "object" && "url" in item.content && (
                          <motion.div
                            key={`image-${index}`}
                            variants={itemVariants}
                            className="mt-1 mb-1"
                          >
                            <img
                              src={item.content.url}
                              alt={item.content.caption || "Note image"}
                              className="max-w-full h-auto rounded-md"
                            />
                            {item.content.caption && (
                              <p className={`text-zinc-400 text-sm ${textSizeClasses[textSize]} mt-1`}>
                                {item.content.caption}
                              </p>
                            )}
                          </motion.div>
                        )}
                        {item.type === "table" && typeof item.content === "object" && "headers" in item.content && (
                          <motion.div
                            key={`table-${index}`}
                            variants={containerVariants}
                            className={`overflow-x-auto mt-1 mb-1 ${textSizeClasses[textSize]}`}
                          >
                            <table className="w-full text-zinc-300 border-collapse">
                              <thead>
                                <tr>
                                  {item.content.headers.map((header, i) => (
                                    <motion.th
                                      key={`table-th-${index}-${i}`}
                                      variants={itemVariants}
                                      className="border border-zinc-500 p-2 bg-zinc-700"
                                    >
                                      {header}
                                    </motion.th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {item.content.rows.map((row, i) => (
                                  <motion.tr key={`table-tr-${index}-${i}`} variants={itemVariants}>
                                    {row.map((cell, j) => (
                                      <motion.td
                                        key={`table-td-${index}-${i}-${j}`}
                                        variants={itemVariants}
                                        className="border border-zinc-500 p-2"
                                      >
                                        {cell}
                                      </motion.td>
                                    ))}
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </motion.div>
                        )}
                        {item.type === "grid" && Array.isArray(item.content) && (
                          <motion.div
                            key={`grid-${index}`}
                            variants={containerVariants}
                            className={`grid grid-cols-2 md:grid-cols-3 gap-4 mt-1 mb-1 ${textSizeClasses[textSize]}`}
                          >
                            {item.content.map((contentItem, i) => (
                              <motion.div
                                key={`grid-${index}-${i}`}
                                variants={itemVariants}
                                className="bg-zinc-700 p-4 rounded-md text-zinc-300"
                              >
                                {renderContentWithLinks(contentItem)}
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                        {item.type === "flexbox" && Array.isArray(item.content) && (
                          <motion.div
                            key={`flexbox-${index}`}
                            variants={containerVariants}
                            className={`flex flex-wrap gap-4 mt-1 mb-1 ${textSizeClasses[textSize]}`}
                          >
                            {item.content.map((contentItem, i) => (
                              <motion.div
                                key={`flexbox-${index}-${i}`}
                                variants={itemVariants}
                                className="bg-zinc-700 p-4 rounded-md text-zinc-300 flex-1 min-w-[150px]"
                              >
                                {renderContentWithLinks(contentItem)}
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="fixed sm:sticky bottom-0 left-0 right-0 bg-zinc-900 w-full shadow-md py-3 px-4 md:px-2"
        >
          <div className="flex items-center justify-end gap-8">
            <AddElementMenu openModal={openModal} />
            <TextSizeMenu textSize={textSize} setTextSize={setTextSize} />
          </div>
        </motion.div>

        <ElementFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          element={modalElement}
          onSave={saveElement}
        />
      </motion.div>
    </div>
  );
}