import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import notesData from "../data/notes.json";
import { formatRelativeTime } from "../utils/dateUtils";

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
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-10 pt-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
            {note.title}
          </h1>
          <div className="flex items-center text-gray-500 text-xs md:text-sm gap-2">
            <p>Created {formatRelativeTime(note.createdAt)}</p>
            <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
            <p>Updated {formatRelativeTime(note.updatedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          {note.owners.map((owner) => (
            <img
              key={owner.id}
              alt={owner.name}
              src={owner.avatar}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white shadow"
              title={owner.name}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row px-4 md:px-10 py-8 gap-4 md:gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/3 md:max-w-xs flex flex-col gap-4">
          <button className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md shadow transition-colors">
            ➕ Add Element
          </button>
          {/* Additional sidebar content can be added here */}
        </aside>

        {/* Note Body */}
        <div className="flex-1 flex flex-col gap-6">
          {note.body.map((item, index) => (
            <div key={index}>
              {item.type === "heading" && (
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {item.content}
                </h2>
              )}
              {item.type === "subheading" && (
                <h3 className="text-lg md:text-xl font-semibold text-gray-700">
                  {item.content}
                </h3>
              )}
              {item.type === "paragraph" && (
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {renderContentWithLinks(item.content as string)}
                </p>
              )}
              {item.type === "list" && Array.isArray(item.content) && (
                <ul className="list-disc pl-6 text-gray-600 space-y-2 text-sm md:text-base">
                  {item.content.map((li, i) => (
                    <li key={i}>
                      {renderContentWithLinks(li.replace(/^[0-9a-z]\.\s/, ""))}
                    </li>
                  ))}
                </ul>
              )}
              {item.type === "code" && (
                <pre className="bg-gray-100 rounded-md p-4 text-xs md:text-sm overflow-x-auto">
                  <code>{item.content}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Control Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 md:px-10 py-4 border-t bg-gray-50 text-gray-500 text-xs md:text-sm">
        <div className="flex gap-2 md:gap-4 mb-2 md:mb-0">
          <button className="hover:text-gray-800 transition-colors">
            Aa - Small
          </button>
          <button className="hover:text-gray-800 transition-colors">
            Aa - Medium
          </button>
          <button className="hover:text-gray-800 transition-colors">
            Aa - Large
          </button>
        </div>
        <div>Last edited {formatRelativeTime(note.updatedAt)}</div>
      </div>
    </div>
  );
}
