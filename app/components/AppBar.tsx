import { Form } from "@remix-run/react";
import { BiTime } from "react-icons/bi";
import { FaBars, FaFolderPlus, FaSearch, FaTimes, FaTimesCircle } from "react-icons/fa";
import { PiHashStraightBold } from "react-icons/pi";
import { BsFileText } from "react-icons/bs";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { useState, memo, useRef, useEffect, Dispatch, SetStateAction } from "react";
import Input from "./Input";
import SearchList from "./SearchList";
import { IoSettingsOutline } from "react-icons/io5";

interface AppBarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

// Define SearchListProps interface
interface SearchListProps {
  items: string[];
  onAddItem: (newItem: string) => void;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  quickActions: { label: string; icon: React.ReactElement; onClick: () => void }[];
  className: string;
}

const AppBar = memo(({ toggleSidebar, isSidebarOpen }: AppBarProps) => {
  const [search, setSearch] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [items, setItems] = useState([
    "Apple",
    "Banana",
    "Orange",
    "Mango",
    "Pineapple",
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchListScope, animateSearchList] = useAnimate();
  const [inputScope, animateInput] = useAnimate();
  const [parentScope, animateParent] = useAnimate();
  const [searchIconScope, animateSearchIcon] = useAnimate();

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

  const handleClearSearch = () => {
    setSearch("");
    inputRef.current?.focus();
  };

  const handleCloseSearch = async () => {
    // Trigger sequential exit animations
    await animateSearchList(searchListScope.current, { opacity: 0, y: -8 }, { duration: 0.3, ease: "easeInOut" });
    await animateInput(inputScope.current, { width: 0, opacity: 0 }, { duration: 0.3, ease: "easeInOut", delay: 0.1 });
    await animateParent(parentScope.current, { maxWidth: "2.5rem" }, { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.2 });
    await animateSearchIcon(searchIconScope.current, { opacity: 1, scale: 1 }, { duration: 0.2, ease: "easeOut", delay: 0.3 });
    setIsSearchActive(false);
    setIsInputFocused(false);
    setSearch("");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  // Handle search input auto-focus when search icon is clicked
  useEffect(() => {
    if (isSearchActive) {
      inputRef.current?.focus();
      setIsInputFocused(true);
    }
  }, [isSearchActive]);

  // Handle Cmd/Ctrl + K shortcut and Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const isSearchShortcut = isMac
        ? e.metaKey && e.key === "k"
        : e.ctrlKey && e.key === "k";

      if (isSearchShortcut) {
        e.preventDefault();
        setIsSearchActive(true);
        inputRef.current?.focus();
        setIsInputFocused(true);
      } else if (e.key === "Escape" && isSearchActive) {
        e.preventDefault();
        handleCloseSearch();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSearchActive]);

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

        <motion.div
          ref={parentScope}
          className="relative w-full flex items-center"
          initial={{ maxWidth: "2.5rem" }}
          animate={{ maxWidth: isSearchActive ? "24rem" : "2.5rem" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <Form onSubmit={handleSubmit} className="flex w-full transition duration-300 ease-in-out">
            <AnimatePresence>
              {!isSearchActive && (
                <motion.button
                  ref={searchIconScope}
                  type="button"
                  className="rounded-full border border-transparent h-10 w-10 grid place-content-center transition-all text-slate-600 hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100"
                  onClick={() => setIsSearchActive(true)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    animate={{ rotateX: isSearchActive ? 90 : 0 }}
                    transition={{ duration: 0.4, ease: "easeIn" }}
                  >
                    <FaSearch size={16} />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isSearchActive && (
                <motion.div
                  ref={inputScope}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: "easeInOut" }}
                  className="flex items-center w-full relative"
                >
                  <Input
                    label="Search... (Ctrl+K or ⌘+K)"
                    name="search"
                    value={search}
                    placeholder=" "
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        if (document.activeElement !== inputRef.current) {
                          setIsInputFocused(false);
                          if (!search) handleCloseSearch();
                        }
                      }, 100);
                    }}
                    focusInputClass="border-orange-500"
                    focusLabelClass="text-orange-500"
                    ref={inputRef}
                    className="w-full pr-16"
                  />
                  <AnimatePresence>
                    {search && (
                      <motion.button
                        type="button"
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800"
                        onClick={handleClearSearch}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <FaTimesCircle size={16} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <motion.button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800"
                    onClick={handleCloseSearch}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, delay: 0.6, ease: "easeOut" }}
                  >
                    <FaTimes size={16} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </Form>

          <AnimatePresence>
            {isInputFocused && isSearchActive && (
              <motion.div
                ref={searchListScope}
                key="search-list"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
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
        </motion.div>

        <button
          className="rounded-full border border-transparent p-2.5 text-center text-sm transition-all text-slate-600 hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          type="button"
        >
          <IoSettingsOutline size={18} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="Toggle profile menu"
          >
            <img
              alt="Profile"
              src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="inline-block size-6 rounded-full ring-2 ring-white"
            />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
              >
                <div className="flex items-center gap-2 px-4 py-2">
                  <img
                    alt="Profile"
                    src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="inline-block size-6 rounded-full ring-2 ring-white"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-200">Egesa Raymond</span>
                    <span className="text-xs text-zinc-400">egesaraymond644@gmail.com</span>
                  </div>
                </div>
                <a
                  href="#profile"
                  className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Settings
                </a>
                <a
                  href="#settings"
                  className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Help Center
                </a>
                <a
                  href="#logout"
                  className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Log Out
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </div>
  );
});

AppBar.displayName = "AppBar";
export default AppBar;