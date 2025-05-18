import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { Form } from "~/components/Form";

interface ElementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: {
    type:
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
    index: number | null;
    content: string | string[] | { url: string; caption?: string } | { headers: string[]; rows: string[][] };
  } | null;
  onSave: (
    type: string,
    content: string | string[] | { url: string; caption?: string } | { headers: string[]; rows: string[][] },
    index: number | null
  ) => void;
}

export default function ElementFormModal({
  isOpen,
  onClose,
  element,
  onSave,
}: ElementFormModalProps) {
  const [formContent, setFormContent] = useState<string>("");
  const [listItems, setListItems] = useState<string[]>([""]);
  const [imageCaption, setImageCaption] = useState<string>("");

  useEffect(() => {
    if (element?.content) {
      if (element.type === "list" || element.type === "checkbox" || element.type === "grid" || element.type === "flexbox") {
        setListItems(
          Array.isArray(element.content) && element.content.length > 0
            ? element.content
            : [""]
        );
        setFormContent("");
        setImageCaption("");
      } else if (element.type === "image") {
        const content = element.content as { url: string; caption?: string };
        setFormContent(content.url);
        setImageCaption(content.caption || "");
        setListItems([""]);
      } else if (element.type === "table") {
        const content = element.content as { headers: string[]; rows: string[][] };
        setListItems(content.headers.length > 0 ? content.headers : [""]);
        setFormContent("");
        setImageCaption("");
      } else {
        setFormContent(element.content as string);
        setListItems([""]);
        setImageCaption("");
      }
    } else {
      setFormContent("");
      setListItems([""]);
      setImageCaption("");
    }
  }, [element]);

  const handleSave = () => {
    if (!element?.type) {
      console.error("No element type provided");
      return;
    }
    let content:
      | string
      | string[]
      | { url: string; caption?: string }
      | { headers: string[]; rows: string[][] };
    if (element.type === "list" || element.type === "checkbox" || element.type === "grid" || element.type === "flexbox") {
      content = listItems;
    } else if (element.type === "image") {
      content = { url: formContent, caption: imageCaption || undefined };
    } else if (element.type === "table") {
      content = { headers: listItems, rows: [] };
    } else {
      content = formContent;
    }
    console.log("Saving:", { type: element.type, content, index: element.index });
    onSave(element.type, content, element.index);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-md bg-zinc-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-zinc-50"
                >
                  {element?.type
                    ? `${element.index !== null ? "Edit" : "Add"} ${
                        element.type.charAt(0).toUpperCase() +
                        element.type.slice(1)
                      }`
                    : "Add Element"}
                </Dialog.Title>
                <div className="mt-4">
                  {element && (
                    <Form
                      elementType={element.type}
                      initialContent={formContent}
                      initialListItems={listItems}
                      initialImageCaption={imageCaption}
                      setContent={setFormContent}
                      setListItems={setListItems}
                      setImageCaption={setImageCaption}
                      onSubmit={handleSave}
                      onCancel={onClose}
                      isEditing={element.index !== null}
                    />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}