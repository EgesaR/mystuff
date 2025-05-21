import { AnimatePresence, motion } from "framer-motion";
import { useState, useCallback } from "react";
import { Form } from "~/components/Form";
import type { NoteBody } from "~/types/notes";

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

interface Element {
  type: ElementType;
  index: number | null;
  content: string | string[] | { url: string; caption?: string } | { headers: string[]; rows: string[][] };
}

interface ElementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: Element | null;
  onSave: (
    type: string,
    content: string | string[] | { url: string; caption?: string } | { headers: string[]; rows: string[][] },
    index: number | null
  ) => void;
}

const ElementFormModal: React.FC<ElementFormModalProps> = ({ isOpen, onClose, element, onSave }) => {
  const [content, setContent] = useState<string>(
    element && typeof element.content === "string" ? element.content : ""
  );
  const [listItems, setListItems] = useState<string[]>(
    element && Array.isArray(element.content)
      ? element.content
      : element && typeof element.content === "object" && "headers" in element.content
      ? element.content.headers
      : [""]
  );
  const [imageCaption, setImageCaption] = useState<string>(
    element && typeof element.content === "object" && "caption" in element.content
      ? element.content.caption || ""
      : ""
  );
  const [rows, setRows] = useState<string[][]>(
    element && typeof element.content === "object" && "rows" in element.content
      ? element.content.rows
      : listItems.length > 0
      ? [listItems.map(() => "")]
      : [[]]
  );

  const handleSubmit = useCallback(() => {
    if (!element?.type) return;
    const finalContent =
      element.type === "list" || element.type === "checkbox" || element.type === "grid" || element.type === "flexbox"
        ? listItems
        : element.type === "image"
        ? { url: content, caption: imageCaption || undefined }
        : element.type === "table"
        ? { headers: listItems, rows }
        : content;
    onSave(element.type, finalContent, element.index);
    setContent("");
    setListItems([""]);
    setImageCaption("");
    setRows([listItems.map(() => "")]);
    onClose();
  }, [element, content, listItems, imageCaption, rows, onSave, onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setContent("");
    setListItems([""]);
    setImageCaption("");
    setRows([listItems.map(() => "")]);
  }, [onClose, listItems]);

  if (!isOpen || !element) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-zinc-800 rounded-lg p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl text-zinc-50 mb-4">
            {element.index !== null ? `Edit ${element.type}` : `Add ${element.type}`}
          </h2>
          <Form
            elementType={element.type}
            initialContent={content}
            initialListItems={listItems}
            initialImageCaption={imageCaption}
            initialRows={rows}
            setContent={setContent}
            setListItems={setListItems}
            setImageCaption={setImageCaption}
            setRows={setRows}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isEditing={element.index !== null}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ElementFormModal;