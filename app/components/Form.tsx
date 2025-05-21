import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "~/components/Button";

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

interface FormProps {
  elementType: ElementType;
  initialContent?: string;
  initialListItems?: string[];
  initialImageCaption?: string;
  initialRows?: string[][];
  setContent: (content: string) => void;
  setListItems: (items: string[]) => void;
  setImageCaption?: (caption: string) => void;
  setRows?: (rows: string[][]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const Form: React.FC<FormProps> = ({
  elementType,
  initialContent = "",
  initialListItems = [""],
  initialImageCaption = "",
  initialRows = [[]],
  setContent,
  setListItems,
  setImageCaption,
  setRows,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [text, setText] = useState(initialContent);
  const [listItems, setLocalListItems] = useState<string[]>(initialListItems);
  const [imageCaption, setLocalImageCaption] = useState(initialImageCaption);
  const [tableRows, setTableRows] = useState<string[][]>(
    elementType === "table" && initialRows.length > 0 ? initialRows : [initialListItems.map(() => "")]
  );
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setText(initialContent);
    setLocalListItems(initialListItems);
    setLocalImageCaption(initialImageCaption);
    if (elementType === "table") {
      setTableRows(initialRows.length > 0 ? initialRows : [initialListItems.map(() => "")]);
    }
  }, [initialContent, initialListItems, initialImageCaption, initialRows, elementType]);

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
    setContent(text);
    setListItems(listItems);
    if (setImageCaption) setImageCaption(imageCaption);
    if (setRows && elementType === "table") setRows(tableRows);
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
    if (elementType === "table") {
      setTableRows(tableRows.map((row) => [...row, ""]));
    }
  };

  const removeListItem = (index: number) => {
    const newItems = listItems.filter((_, i) => i !== index);
    const updatedItems = newItems.length > 0 ? newItems : [""];
    setLocalListItems(updatedItems);
    setListItems(updatedItems);
    if (elementType === "table") {
      setTableRows(
        tableRows.map((row) => row.filter((_, i) => i !== index)).map((row) => (row.length > 0 ? row : [""]))
      );
    }
  };

  const addTableRow = () => {
    setTableRows([...tableRows, Array(listItems.length).fill("")]);
  };

  const removeTableRow = (rowIndex: number) => {
    const newRows = tableRows.filter((_, i) => i !== rowIndex);
    setTableRows(newRows.length > 0 ? newRows : [Array(listItems.length).fill("")]);
  };

  const isSubmitDisabled =
    (elementType === "list" ||
      elementType === "checkbox" ||
      elementType === "grid" ||
      elementType === "flexbox") &&
    listItems.every((item) => !item.trim()) ||
    (elementType === "image" && !text.trim()) ||
    (elementType === "table" &&
      listItems.every((item) => !item.trim()) &&
      tableRows.every((row) => row.every((cell) => !cell.trim()))) ||
    (elementType !== "list" &&
      elementType !== "checkbox" &&
      elementType !== "grid" &&
      elementType !== "flexbox" &&
      elementType !== "image" &&
      elementType !== "table" &&
      !text.trim());

  return (
    <motion.form
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 25 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="w-full rounded border border-zinc-700 bg-zinc-900 p-3"
    >
      <AnimatePresence mode="wait">
        {elementType === "list" ||
        elementType === "checkbox" ||
        elementType === "grid" ||
        elementType === "flexbox" ? (
          <div key="list" className="space-y-3">
            {listItems.map((item, index) => (
              <div key={`list-item-${index}`} className="flex gap-2">
                <input
                  ref={index === 0 ? firstInputRef : null}
                  type="text"
                  value={item}
                  name={`Item-${index}`}
                  onChange={(e) => handleListItemChange(index, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                  className="w-full rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Button
                  type="button"
                  btn_type="ghost"
                  onClick={() => removeListItem(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              btn_type="ghost"
              onClick={addListItem}
              className="mt-2 text-orange-600 hover:text-orange-500"
            >
              Add Item
            </Button>
          </div>
        ) : elementType === "image" ? (
          <div key="image" className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300">Image URL</label>
              <input
                ref={firstInputRef}
                type="url"
                value={text}
                onChange={handleTextChange}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="w-full rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        ) : elementType === "table" ? (
          <div key="table" className="space-y-3">
            <div className="block text-sm font-medium text-zinc-300">Table</div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${listItems.length + 1}, minmax(0, 1fr))` }}>
              {listItems.map((item, index) => (
                <div key={`header-${index}`} className="flex flex-col gap-1">
                  <input
                    ref={index === 0 ? firstInputRef : null}
                    type="text"
                    value={item}
                    onChange={(e) => handleListItemChange(index, e.target.value)}
                    placeholder={`Header ${index + 1}`}
                    className="rounded bg-zinc-900 p-2 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {listItems.length > 1 && (
                    <Button
                      type="button"
                      btn_type="ghost"
                      onClick={() => removeListItem(index)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <div></div>
              {tableRows.map((row, rowIndex) => (
                <React.Fragment key={`row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <input
                      key={`cell-${rowIndex}-${cellIndex}`}
                      type="text"
                      value={cell}
                      onChange={(e) => handleTableRowChange(rowIndex, cellIndex, e.target.value)}
                      placeholder={`Cell ${cellIndex + 1}`}
                      className="rounded bg-zinc-900 p-2 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  ))}
                  <Button
                    type="button"
                    btn_type="ghost"
                    onClick={() => removeTableRow(rowIndex)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </Button>
                </React.Fragment>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                btn_type="ghost"
                onClick={addListItem}
                className="text-orange-600 hover:text-orange-500"
              >
                Add Column
              </Button>
              <Button
                type="button"
                btn_type="ghost"
                onClick={addTableRow}
                className="text-orange-600 hover:text-orange-500"
              >
                Add Row
              </Button>
            </div>
          </div>
        ) : (
          <div key="textarea">
            <label className="block text-sm font-medium text-zinc-300 capitalize">{elementType}</label>
            <textarea
              ref={textareaRef}
              value={text}
              name={elementType}
              onChange={handleTextChange}
              placeholder={`Enter ${elementType} content...`}
              className="h-24 w-full resize-none rounded bg-zinc-900 p-3 text-sm text-zinc-50 placeholder-zinc-500 caret-zinc-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={elementType === "code" ? 6 : 4}
            />
          </div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-end gap-3 mt-3">
        <Button
          type="button"
          btn_type="ghost"
          onClick={onCancel}
          className="rounded px-1.5 py-1 text-xs bg-zinc-300/20 text-zinc-300 hover:bg-zinc-600 hover:text-orange-500"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          btn_type="primary"
          disabled={isSubmitDisabled}
          className={`rounded px-1.5 py-1 text-xs text-orange-50 transition-colors ${
            isSubmitDisabled ? "opacity-50 cursor-not-allowed bg-orange-600" : "bg-orange-600 hover:bg-orange-500"
          }`}
        >
          {isEditing ? "Update" : "Add"}
        </Button>
      </div>
    </motion.form>
  );
};