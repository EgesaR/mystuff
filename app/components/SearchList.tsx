import { memo } from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface SearchListProps {
  items: string[];
  className?: string;
}

const SearchList = memo(({ items, className = "" }: SearchListProps) => {
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <motion.ul
      className={twMerge(
        "w-full max-w-md list-none p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-md",
        className,
      )}
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.li
          key={index}
          className="py-2 px-4 text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-md"
          variants={itemVariants}
          whileHover="hover"
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
});

SearchList.displayName = "List";

export default SearchList;