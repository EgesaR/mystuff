import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { Form } from "~/components/Form";

interface ElementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: {
    type: "heading" | "subheading" | "paragraph" | "code" | "list";
    index: number | null;
    content: string | string[];
  } | null;
  onSave: (type: string, content: string | string[], index?: number) => void;
}

export default function ElementFormModal({
  isOpen,
  onClose,
  element,
  onSave,
}: ElementFormModalProps) {
  const [formContent, setFormContent] = useState<string>("");
  const [listItems, setListItems] = useState<string[]>([""]);

  useEffect(() => {
    if (element?.content) {
      if (element.type === "list") {
        setListItems(
          Array.isArray(element.content) && element.content.length > 0
            ? element.content
            : [""]
        );
        setFormContent("");
      } else {
        setFormContent(element.content as string);
        setListItems([""]);
      }
    } else {
      setFormContent("");
      setListItems([""]);
    }
  }, [element]);

  const handleSave = () => {
    if (!element?.type) {
      console.error("No element type provided");
      return;
    }
    const content = element.type === "list" ? listItems : formContent;
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-md bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white"
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
                      setContent={setFormContent}
                      setListItems={setListItems}
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