import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaPlus } from "react-icons/fa";

interface AddElementMenuProps {
  openModal: (
    type: string,
    index?: number,
    content?: string | string[] | { url: string; caption?: string } | { headers: string[]; rows: string[][] }
  ) => void;
}

export default function AddElementMenu({ openModal }: AddElementMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-300 hover:text-zinc-50 transition-colors bg-zinc-800/10 h-[33px] w-[33px] rounded-full">
        <FaPlus className="text-xl text-zinc-50 hover:text-zinc-300 transition-colors" />
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
        <Menu.Items className="absolute right-0 bottom-12 w-48 rounded-md shadow-lg bg-zinc-800 ring-1 ring-zinc-600 ring-opacity-50 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => openModal("heading")}
                  className={`${
                    active ? "bg-zinc-700 text-zinc-50" : "text-zinc-300"
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Add Heading
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => openModal("subheading")}
                  className={`${
                    active ? "bg-zinc-700 text-zinc-50" : "text-zinc-300"
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Add Subheading
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => openModal("paragraph")}
                  className={`${
                    active ? "bg-zinc-700 text-zinc-50" : "text-zinc-300"
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
                    active ? "bg-zinc-700 text-zinc-50" : "text-zinc-300"
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Add List
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => openModal("checkbox")}
                  className={`${
                    active ? "bg-zinc-700 text-zinc-50" : "text-zinc-300"
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Add Checklist
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => openModal("code")}
                  className={`${
                    active ? "bg-zinc-700 text-zinc-50" : "text-zinc-300"
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Add Code Block
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => openModal("image")}
                  className={`${
                    active ? "bg-zinc-700 text-zinc-50" : "text-zinc-300"
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Add Image
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => openModal("table")}
                  className={`${
                    active ? "bg-zinc-700 text-zinc-50" : "text-zinc-300"
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Add Table
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => openModal("grid")}
                  className={`${
                    active ? "bg-zinc-700 text-zinc-50" : "text-zinc-300"
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Add Grid
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => openModal("flexbox")}
                  className={`${
                    active ? "bg-zinc-700 text-zinc-50" : "text-zinc-300"
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Add Flexbox
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}