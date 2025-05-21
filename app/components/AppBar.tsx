import { Form } from "@remix-run/react";
import { FaBars } from "react-icons/fa";
import Input from "./Input";
import SearchList from "./SearchList"; // Import the SearchList component
import { useState, memo } from "react";

interface AppBarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const AppBar = memo(({ toggleSidebar, isSidebarOpen }: AppBarProps) => {
  const [search, setSearch] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false); // Track input focus
  const items = ["Apple", "Banana", "Orange", "Mango", "Pineapple"];
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative flex flex-col w-full mb-2 mt-1.5">
      <header className="flex w-full h-[100%] items-center gap-4 px-2 sm:px-4 pr-6 pt-0.5 text-white shadow-2xl sm:gap-0 sm:justify-between">
        {/* Hamburger Menu for Mobile */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden text-white focus:outline-none"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <FaBars className="text-xl sm:text-2xl" />
        </button>

        {/* App Title */}
        <h1 className="text-2xl sm:text-xl md:text-2xl font-medium">My Stuff</h1>

        {/* Search Form */}
        <div className="w-[30%] pb-0.5 relative">
          <Form className="w-full h-full">
          <Input
      label="Search"
      name="search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onFocus={() => setIsInputFocused(true)}
      onBlur={() => setIsInputFocused(false)}
      focusInputClass="" // Custom input focus styles
      focusLabelClass="" // Custom label focus styles
    />
          </Form>
          {/* SearchList: Only show when input is focused */}
          {isInputFocused && filteredItems.length > 0 && (
            <SearchList
              items={filteredItems}
              className="absolute top-full left-0 mt-2 z-10"
            />
          )}
        </div>

        {/* User Greeting */}
        <div className="w-6 sm:w-8">Hello</div>
      </header>
    </div>
  );
});

AppBar.displayName = "AppBar";

export default AppBar;