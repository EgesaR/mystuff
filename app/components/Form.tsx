import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

export const Form = ({
  elementType,
  initialContent = "",
  initialListItems = [""],
  initialImageCaption = "",
  setContent,
  setListItems,
  setImageCaption,
  onSubmit,
  onCancel,
  isEditing = false,
}: {
  elementType:
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
  initialContent?: string;
  initialListItems?: string[];
  initialImageCaption?: string;
  setContent: (content: string) => void;
  setListItems: (items: string[]) => void;
  setImageCaption?: (caption: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}) => {
  const [text, setText] = useState(initialContent);
  const [listItems, setLocalListItems] = useState<string[]>(initialListItems);
  const [imageCaption, setLocalImageCaption] = useState(initialImageCaption);
  const [tableRows, setTableRows] = useState<string[][]>([]);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setText(initialContent);
    setLocalListItems(initialListItems);
    setLocalImageCaption(initialImageCaption);
    setTableRows([]); // Reset rows for simplicity; extend if needed
  }, [initialContent, initialListItems, initialImageCaption]);

  useEffect(() => {
    if (
      (elementType === "list" ||
        elementType === "checkbox" ||
        elementType === "grid" ||
        elementType === "flexbox" ||
        elementType === "table") &&
      firstInputRef.current
    ) {
      firstInputRef.current.focus();
    } else if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [elementType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", { elementType, text, listItems, imageCaption, tableRows });
    setContent(text);
    setListItems(listItems);
    if (setImageCaption) setImageCaption(imageCaption);
    onSubmit();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setText(e.target.value);
    setContent(e.target.value);
  };

  const handleListItemChange = (index: number, value: string) => {
    const newItems = [...listItems];
    newItems[index] = value;
    setLocalListItems(newItems);
    setListItems(newItems);
  };

  const handleTableRowChange = (rowIndex: number, cellIndex: number, value: string) => {
    const newRows = [...tableRows];
    newRows[rowIndex][cellIndex] = value;
    setTableRows(newRows);
  };

  const addListItem = () => {
    const newItems = [...listItems, ""];
    setLocalListItems(newItems);
    setListItems(newItems);
  };

  const removeListItem = (index: number) => {
    const newItems = listItems.filter((_, i) => i !== index);
    setLocalListItems(newItems.length > 0 ? newItems : [""]);
    setListItems(newItems.length > 0 ? newItems : [""]);
  };

  const addTableRow = () => {
    setTableRows([...tableRows, Array(listItems.length).fill("")]);
  };

  const removeTableRow = (rowIndex: number) => {
    setTableRows(tableRows.filter((_, i) => i !== rowIndex));
  };

  const isSubmitDisabled =
    (elementType !== "list" &&
      elementType !== "checkbox" &&
      elementType !== "grid" &&
      elementType !== "flexbox" &&
      !text.trim()) ||
    (elementType === "image" && !text.trim()) ||
    (elementType === "table" && listItems.every((item) => !item.trim()));

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
        {elementType === "list" ||
        elementType === "checkbox" ||
        elementType === "grid" ||
        elementType === "flexbox" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {listItems.map((item, index) => (
              <motion.div
                key={`list-item-${index}-${item}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex gap-2"
              >
                <input
                  ref={index === 0 ? firstInputRef : null}
                  type="text"
                  value={item}
                  name={`Item-${index}`}
                  onChange={(e) => handleListItemChange(index, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                  className="w-full rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-0"
                />
                <button
                  type="button"
                  onClick={() => removeListItem(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </motion.div>
            ))}
            <motion.button
              type="button"
              onClick={addListItem}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 px-3 py-1 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
            >
              Add Item
            </motion.button>
          </motion.div>
        ) : elementType === "image" ? (
          <motion.div
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-zinc-300">Image URL</label>
              <input
                ref={firstInputRef}
                type="url"
                value={text}
                onChange={handleTextChange}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">Caption (optional)</label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => {
                  setLocalImageCaption(e.target.value);
                  if (setImageCaption) setImageCaption(e.target.value);
                }}
                placeholder="Image caption"
                className="w-full rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-0"
              />
            </div>
          </motion.div>
        ) : elementType === "table" ? (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-zinc-300">Headers</label>
              {listItems.map((item, index) => (
                <motion.div
                  key={`header-${index}-${item}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-2 mt-2"
                >
                  <input
                    ref={index === 0 ? firstInputRef : null}
                    type="text"
                    value={item}
                    onChange={(e) => handleListItemChange(index, e.target.value)}
                    placeholder={`Header ${index + 1}`}
                    className="w-full rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-0"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </motion.div>
              ))}
              <motion.button
                type="button"
                onClick={addListItem}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 px-3 py-1 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
              >
                Add Header
              </motion.button>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">Rows</label>
              {tableRows.map((row, rowIndex) => (
                <motion.div
                  key={`row-${rowIndex}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-2 mt-2"
                >
                  {row.map((cell, cellIndex) => (
                    <input
                      key={`cell-${rowIndex}-${cellIndex}`}
                      type="text"
                      value={cell}
                      onChange={(e) => handleTableRowChange(rowIndex, cellIndex, e.target.value)}
                      placeholder={`Cell ${cellIndex + 1}`}
                      className="w-full rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-0"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => removeTableRow(rowIndex)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </motion.div>
              ))}
              <motion.button
                type="button"
                onClick={addTableRow}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 px-3 py-1 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
              >
                Add Row
              </motion.button>
            </div>
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
            rows={elementType === "code" ? 6 : 4}
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