import React, { useState, useEffect, useRef } from "react";
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
  isEditing = false,
}: {
  elementType: "heading" | "subheading" | "paragraph" | "code" | "list";
  initialContent?: string;
  initialListItems?: string[];
  setContent: (content: string) => void;
  setListItems: (items: string[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}) => {
  const [text, setText] = useState(initialContent);
  const [listItems, setLocalListItems] = useState<string[]>(initialListItems);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setText(initialContent);
    setLocalListItems(initialListItems);
  }, [initialContent, initialListItems]);

  useEffect(() => {
    if (elementType === "list" && firstInputRef.current) {
      firstInputRef.current.focus();
    } else if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [elementType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", { elementType, text, listItems });
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

  const isSubmitDisabled = elementType !== "list" && !text.trim();

  return (
    <motion.form
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 25 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="w-full rounded border border-zinc-700 bg-zinc-900 p-3"
      layout
    >
      <AnimatePresence mode="wait">
        {elementType === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {listItems.map((item, index) => (
              <motion.input
                key={`list-item-${index}-${item}`}
                ref={index === 0 ? firstInputRef : null}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                type="text"
                value={item}
                name={`Item-${index}`}
                onChange={(e) => handleListItemChange(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="w-full rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-0"
              />
            ))}
            <motion.button
              type="button"
              onClick={addListItem}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 px-3 py-1 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
            >
              Add List Item
            </motion.button>
          </motion.div>
        ) : (
          <motion.textarea
            key="textarea"
            ref={textareaRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            value={text}
            name={elementType}
            onChange={handleTextChange}
            placeholder={`Enter ${elementType} content...`}
            className="h-24 w-full resize-none rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-0"
          />
        )}
      </AnimatePresence>
      <motion.div
        className="flex items-center justify-end gap-3 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-1.5 py-1 text-xs bg-zinc-300/20 text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`rounded bg-orange-600 px-1.5 py-1 text-xs text-orange-50 transition-colors ${
            isSubmitDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-orange-500"
          }`}
        >
          {isEditing ? "Update" : "Add"}
        </button>
      </motion.div>
    </motion.form>
  );
};