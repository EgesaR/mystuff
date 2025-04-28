import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaPlus } from "react-icons/fa";

interface AddElementMenuProps {
  openModal: (
    type: string,
    index?: number,
    content?: string | string[]
  ) => void;
}

export default function AddElementMenu({ openModal }: AddElementMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center justify-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors bg-gray-800/10 dark:bg-gray-200/10 h-[33px] w-[33px] rounded-full ">
        <FaPlus className="text-xl text-white hover:text-gray-300 transition-colors" />
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
        <Menu.Items className="absolute right-0 bottom-12 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-gray-600 ring-opacity-50 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => openModal("heading")}
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
                  onClick={() => openModal("paragraph")}
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
                  onClick={() => openModal("list")}
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
                  onClick={() => openModal("code")}
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
  );
}
