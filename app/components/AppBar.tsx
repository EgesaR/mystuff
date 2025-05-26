import { Form } from "@remix-run/react";
import { BiTime } from "react-icons/bi";
import { FaBars , FaFolderPlus } from "react-icons/fa";
import Input from "./Input";
import SearchList from "./SearchList";
import { useState, memo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PiHashStraightBold } from "react-icons/pi";
import { BsFileText } from "react-icons/bs";

interface AppBarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const AppBar = memo(({ toggleSidebar, isSidebarOpen }: AppBarProps) => {
  const [search, setSearch] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [items, setItems] = useState([
    "Apple",
    "Banana",
    "Orange",
    "Mango",
    "Pineapple",
  ]);

  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = [
    {
      label: "Add new file",
      icon: <BsFileText className="text-sm" />,
      onClick: () => alert("Add new file clicked"),
    },
    {
      label: "Add new folder",
      icon: <FaFolderPlus className="text-sm" />,
      onClick: () => alert("Add new folder clicked"),
    },
    {
      label: "Add new task",
      icon: <PiHashStraightBold className="text-sm" />,
      onClick: () => alert("Add new task clicked"),
    },
    {
      label: "Schedule meeting",
      icon: <BiTime className="text-sm" />,
      onClick: () => alert("Schedule meeting clicked"),
    },
  ];

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (newItem: string) => {
    if (newItem.trim() && !items.includes(newItem)) {
      setItems([...items, newItem]);
      setSearch("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem(search);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const isShortcut = isMac
        ? e.metaKey && e.key === "k"
        : e.ctrlKey && e.key === "k";

      if (isShortcut) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsInputFocused(true);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="relative flex flex-col w-full mb-2 mt-1.5">
      <header className="flex w-full items-center gap-4 px-4 pt-2 pb-4 text-white shadow-md">
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden text-white focus:outline-none"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <FaBars className="text-2xl" />
        </button>

        <h1 className="text-xl font-semibold flex-1">My Stuff</h1>

        <div className="relative w-full max-w-sm">
          <Form onSubmit={handleSubmit}>
            <Input
              label="Search... (Ctrl+K or ⌘+K)"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 100)}
              placeholder="Search... (Ctrl+K or ⌘+K)"
              focusInputClass="border-orange-500"
              focusLabelClass="text-orange-500"
              ref={inputRef}
            />
          </Form>

          <AnimatePresence>
            {isInputFocused && (
              <motion.div
                key="search-list"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute top-full left-0 mt-2 z-50 w-full"
              >
                <SearchList
                  items={filteredItems}
                  onAddItem={addItem}
                  searchQuery={search}
                  setSearchQuery={setSearch}
                  quickActions={quickActions}
                  className="w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-sm font-medium">Hello</div>
      </header>
    </div>
  );
});

AppBar.displayName = "AppBar";
export default AppBar;
