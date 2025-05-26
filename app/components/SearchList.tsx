import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface SearchListProps {
  items: string[];
  className?: string;
  onAddItem: (item: string) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  quickActions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
}

const SearchList = memo(
  ({
    items,
    className = "",
    onAddItem,
    searchQuery,
    setSearchQuery,
    quickActions = [],
  }: SearchListProps) => {
    const listVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.2,
          when: "beforeChildren",
          staggerChildren: 0.05,
        },
      },
      exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
    };

    const itemVariants = {
      hidden: { opacity: 0, x: 20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.2 },
      },
      exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
    };

    return (
      <AnimatePresence>
        <motion.ul
          className={twMerge(
            "w-full bg-white dark:bg-neutral-900 rounded-md border border-gray-200 dark:border-neutral-700 shadow-lg overflow-hidden p-2",
            className
          )}
          variants={listVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {items.length === 0 && searchQuery.trim() && (
            <motion.li
              className="p-3 text-sm text-gray-500 dark:text-neutral-400 italic"
              variants={itemVariants}
            >
              No results found for "{searchQuery}"
            </motion.li>
          )}

          {items.map((item) => (
            <motion.li
              key={item}
              onClick={() => setSearchQuery(item)}
              className="px-4 py-2 text-sm rounded-md text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              {item}
            </motion.li>
          ))}

          {!searchQuery && quickActions.length > 0 && (
            <div className="border-t border-gray-200 dark:border-neutral-700 mt-1 pt-1">
              <p className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wide">
                Quick actions
              </p>
              {quickActions.map((action, index) => (
                <motion.li
                  key={index}
                  onClick={action.onClick}
                  className="px-4 py-2 flex items-center gap-2 rounded-md text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  {action.icon && <span>{action.icon}</span>}
                  {action.label}
                </motion.li>
              ))}
            </div>
          )}
        </motion.ul>
      </AnimatePresence>
    );
  }
);

SearchList.displayName = "SearchList";
export default SearchList;
