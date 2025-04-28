import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";

interface ElementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: { type: string; index?: number; content?: string | string[] } | null;
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
        setListItems(element.content as string[]);
      } else {
        setFormContent(element.content as string);
      }
    } else {
      setFormContent("");
      setListItems([""]);
    }
  }, [element]);

  const addListItem = () => {
    setListItems([...listItems, ""]);
  };

  const updateListItem = (index: number, value: string) => {
    const newItems = [...listItems];
    newItems[index] = value;
    setListItems(newItems);
  };

  const handleSave = () => {
    if (!element?.type) return;
    const content = element.type === "list" ? listItems : formContent;
    onSave(element.type, content, element.index);
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
                    ? `${element.index !== undefined ? "Edit" : "Add"} ${
                        element.type.charAt(0).toUpperCase() +
                        element.type.slice(1)
                      }`
                    : "Add Element"}
                </Dialog.Title>
                <div className="mt-4">
                  {element?.type === "list" ? (
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
                        element?.type
                          ? `Enter ${element.type} content...`
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
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    onClick={handleSave}
                  >
                    {element?.index !== undefined ? "Save" : "Add"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
