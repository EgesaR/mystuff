import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus } from "react-icons/fa";

interface AddElementMenuProps {
  openModal: (type: string) => void;
}

const AddElementMenu: React.FC<AddElementMenuProps> = ({ openModal }) => {
  const [isOpen, setIsOpen] = useState(false);

  const elements = [
    { type: "heading", label: "Heading" },
    { type: "subheading", label: "Subheading" },
    { type: "paragraph", label: "Paragraph" },
    { type: "code", label: "Code" },
    { type: "list", label: "List" },
    { type: "checkbox", label: "Checkbox" },
    { type: "image", label: "Image" },
    { type: "table", label: "Table" },
    { type: "grid", label: "Grid" },
    { type: "flexbox", label: "Flexbox" },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleElementSelect = (type: string) => {
    openModal(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={toggleMenu}
        className="flex items-center gap-2 rounded bg-orange-600 px-3 py-1.5 text-sm text-orange-50 hover:bg-orange-500"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaPlus />
        <span>Add Element</span>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 w-40 rounded-md bg-zinc-800 shadow-lg z-50"
          >
            <ul className="py-1">
              {elements.map((element) => (
                <motion.li
                  key={element.type}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  className="px-4 py-2 text-sm text-zinc-300 hover:text-orange-500 cursor-pointer"
                  onClick={() => handleElementSelect(element.type)}
                >
                  {element.label}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddElementMenu;