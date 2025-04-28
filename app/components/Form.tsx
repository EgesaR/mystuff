import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

export const Form = ({
  elementType,
  initialContent = "",
  initialListItems = [""],
  setContent,
  setListItems,
  onSubmit,
  onCancel,
}: {
  elementType: "heading" | "subheading" | "paragraph" | "code" | "list";
  initialContent?: string;
  initialListItems?: string[];
  setContent: (content: string) => void;
  setListItems: (items: string[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) => {
  const [text, setText] = useState(initialContent);
  const [listItems, setLocalListItems] = useState<string[]>(initialListItems);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setContent(e.target.value);
  };

  const handleListItemChange = (index: number, value: string) => {
    const newItems = [...listItems];
    newItems[index] = value;
    setLocalListItems(newItems);
    setListItems(newItems);
  };

  const addListItem = () => {
    const newItems = [...listItems, ""];
    setLocalListItems(newItems);
    setListItems(newItems);
  };

  return (
    <AnimatePresence>
      <motion.form
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 25 }}
        onSubmit={handleSubmit}
        className="w-full rounded border border-zinc-700 bg-zinc-900 p-3"
      >
        {elementType === "list" ? (
          <div className="space-y-3">
            {listItems.map((item, index) => (
              <input
                key={index}
                type="text"
                value={item}
                onChange={(e) => handleListItemChange(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="w-full rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-0"
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
            value={text}
            onChange={handleTextChange}
            placeholder={`Enter ${elementType} content...`}
            className="h-24 w-full resize-none rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-0"
          />
        )}
        <div className="flex items-center justify-end gap-3 mt-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-1.5 py-1 text-xs bg-zinc-300/20 text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-indigo-600 px-1.5 py-1 text-xs text-indigo-50 transition-colors hover:bg-indigo-500"
          >
            Submit
          </button>
        </div>
      </motion.form>
    </AnimatePresence>
  );
};
