import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import notesData from "../data/notes.json";
import { formatRelativeTime } from "../utils/dateUtils";
import { useState } from "react";
import TextSizeMenu from "~/components/TextSizeMenu";
import AddElementMenu from "~/components/AddElementMenu";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export const meta: MetaFunction = () => {
  return [{ title: "Note Details" }];
};

interface Owner {
  id: string;
  name: string;
  avatar: string;
}

interface TextNoteBody {
  type: "heading" | "subheading" | "paragraph" | "code";
  content: string;
}

interface ListNoteBody {
  type: "list";
  content: string[];
}

type NoteBody = TextNoteBody | ListNoteBody;

interface Note {
  id: string;
  title: string;
  body: NoteBody[];
  updatedAt: string;
  createdAt: string;
  owners: Owner[];
  tags: string[];
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const note = notesData.find((n) => n.id === params.id);
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ note });
};

export default function NoteDetails() {
  const { note } = useLoaderData<{ note: Note }>();
  const [textSize, setTextSize] = useState<"sm" | "base" | "lg">("base");
  const [noteBody, setNoteBody] = useState<NoteBody[]>(note.body);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedElementType, setSelectedElementType] = useState<string | null>(
    null
  );
  const [formContent, setFormContent] = useState<string>("");
  const [listItems, setListItems] = useState<string[]>([""]);

  const textSizeClasses = {
    sm: "text-xs md:text-sm",
    base: "text-sm md:text-base",
    lg: "text-base md:text-lg",
  };

  const openModal = (type: string) => {
    setSelectedElementType(type);
    setFormContent("");
    setListItems([""]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedElementType(null);
  };

  const addListItem = () => {
    setListItems([...listItems, ""]);
  };

  const updateListItem = (index: number, value: string) => {
    const newItems = [...listItems];
    newItems[index] = value;
    setListItems(newItems);
  };

  const addElement = () => {
    if (!selectedElementType) return;

    let newElement: NoteBody;
    if (selectedElementType === "list") {
      const filteredItems = listItems.filter((item) => item.trim() !== "");
      if (filteredItems.length === 0) return;
      newElement = { type: "list", content: filteredItems };
    } else {
      if (!formContent.trim()) return;
      newElement = {
        type: selectedElementType as
          | "heading"
          | "subheading"
          | "paragraph"
          | "code",
        content: formContent,
      };
    }

    const updatedBody = [...noteBody, newElement];
    setNoteBody(updatedBody);

    // Simulate saving to notesData (in a real app, this would be an API call)
    const noteIndex = notesData.findIndex((n) => n.id === note.id);
    if (noteIndex !== -1) {
      notesData[noteIndex] = { ...note, body: updatedBody };
      // In a real app, you'd make an API call here to save the updated notesData
      // Example: await fetch('/api/saveNote', { method: 'POST', body: JSON.stringify(notesData[noteIndex]) });
    }

    closeModal();
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

  return (
    <div className="flex flex-col min-h-screen font-light">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-8 md:px-10 pt-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-green-600/20 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-green-400/30 ring-inset"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl md:text-5xl font-normal text-white tracking-tight">
            {note.title}
          </h1>
          <div className="flex items-center text-gray-400 text-xs md:text-sm gap-2">
            <p>Created {formatRelativeTime(note.createdAt)}</p>
            <div className="h-1 w-1 bg-gray-500 rounded-full"></div>
            <p>Last modified {formatRelativeTime(note.updatedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0 -space-x-4">
          {note.owners.map((owner) => (
            <img
              key={owner.id}
              alt={owner.name}
              src={owner.avatar}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full ring-2 ring-gray-800"
              title={owner.name}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 md:px-10 py-8 gap-4 md:gap-8 pb-16">
        {/* Note Body */}
        <div className="flex-1 flex flex-col gap-6">
          {noteBody.map((item, index) => (
            <div key={index}>
              {item.type === "heading" && (
                <h2 className="text-xl md:text-2xl font-normal text-white mt-6 mb-2">
                  {item.content}
                </h2>
              )}
              {item.type === "subheading" && (
                <h3 className="text-lg md:text-xl font-light text-white mt-4 mb-2">
                  {item.content}
                </h3>
              )}
              {item.type === "paragraph" && (
                <p
                  className={`text-gray-300 leading-relaxed ${
                    textSizeClasses[textSize]
                  } ${
                    index === 0
                      ? "bg-yellow-800/50 p-4 rounded-md text-yellow-200"
                      : ""
                  }`}
                >
                  {renderContentWithLinks(item.content as string)}
                </p>
              )}
              {item.type === "list" && Array.isArray(item.content) && (
                <ul
                  className={`list-disc pl-6 text-gray-300 space-y-2 ${textSizeClasses[textSize]}`}
                >
                  {item.content.map((li, i) => (
                    <li key={i}>
                      {renderContentWithLinks(li.replace(/^[0-9a-z]\.\s/, ""))}
                    </li>
                  ))}
                </ul>
              )}
              {item.type === "code" && (
                <pre
                  className={`bg-gray-800 rounded-md p-4 text-gray-200 overflow-x-auto ${textSizeClasses[textSize]}`}
                >
                  <code>{item.content}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-600 shadow-md py-3 px-4 md:px-10">
        <div className="flex items-center justify-end gap-12">
          <AddElementMenu openModal={openModal} />
          <TextSizeMenu setTextSize={setTextSize} />
        </div>
      </div>

      {/* Modal for Adding Elements */}
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
                      onClick={addElement}
                    >
                      Add
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
