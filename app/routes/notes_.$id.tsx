import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import notesData from "../data/notes.json";
import { formatRelativeTime } from "../utils/dateUtils";
import { FaPlus } from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

export const meta: MetaFunction = () => {
  return [{ title: "Note Details" }];
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

  const textSizeClasses = {
    sm: "text-xs md:text-sm",
    base: "text-sm md:text-base",
    lg: "text-base md:text-lg",
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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-10 pt-6">
        <div className="flex flex-col gap-2">
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
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
            {note.title}
          </h1>
          <div className="flex items-center text-gray-400 text-xs md:text-sm gap-2">
            <p>Created {formatRelativeTime(note.createdAt)}</p>
            <div className="h-1 w-1 bg-gray-500 rounded-full"></div>
            <p>Last modified {formatRelativeTime(note.updatedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
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
          {note.body.map((item, index) => (
            <div key={index}>
              {item.type === "heading" && (
                <h2 className="text-xl md:text-2xl font-bold text-white mt-6 mb-2">
                  {item.content}
                </h2>
              )}
              {item.type === "subheading" && (
                <h3 className="text-lg md:text-xl font-semibold text-white mt-4 mb-2">
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
        <div className="flex items-center justify-between">
          {/* Add Element Menu */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              <FaPlus className="text-lg" />
              Add Element
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 bottom-12 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-gray-600 ring-opacity-50 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        } group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        Add Heading
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        } group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        Add Paragraph
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        } group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        Add List
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        } group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        Add Code Block
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Text Size Menu */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="text-gray-400 hover:text-white transition-colors">
              Aa
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 bottom-12 w-32 rounded-md shadow-lg bg-gray-800 ring-1 ring-gray-600 ring-opacity-50 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setTextSize("sm")}
                        className={`${
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        } group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        Small
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setTextSize("base")}
                        className={`${
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        } group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        Medium
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setTextSize("lg")}
                        className={`${
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        } group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        Large
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}
