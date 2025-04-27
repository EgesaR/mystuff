import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

interface TextSizeMenuProps{
    setTextSize: (size: "sm" | "base" | "lg") => void;
}

const TextSizeMenu = ({ setTextSize }: TextSizeMenuProps) => {
return (
  <Menu as="div" className="relative inline-block text-left">
    <Menu.Button className="text-gray-200 hover:text-white transition-colors bg-gray-800/10 dark:bg-gray-200/10 h-[33px] w-[33px] rounded-full">
      Aa
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
      <Menu.Items className="absolute right-0 bottom-14 w-32 rounded-md shadow-lg bg-gray-800 ring-1 ring-gray-600 ring-opacity-50 focus:outline-none">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => setTextSize("sm")}
                className={`${
                  active ? "bg-gray-700 text-white" : "text-gray-300"
                } group flex w-full items-center px-4 py-2 text-sm`}
              >
                Small
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => setTextSize("base")}
                className={`${
                  active ? "bg-gray-700 text-white" : "text-gray-300"
                } group flex w-full items-center px-4 py-2 text-sm`}
              >
                Medium
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => setTextSize("lg")}
                className={`${
                  active ? "bg-gray-700 text-white" : "text-gray-300"
                } group flex w-full items-center px-4 py-2 text-sm`}
              >
                Large
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
);}

export default TextSizeMenu