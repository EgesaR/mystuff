// app/routes/index.tsx
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaUndo, FaRedo } from "react-icons/fa";
import TaskList from "~/components/TaskList";
import {
  Task,
  Category,
  DEFAULT_CATEGORIES,
  isValidTask,
  isValidCategory,
} from "~/types";

export default function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<
    { tasks: Task[]; categories: Category[] }[]
  >([]);
  const [future, setFuture] = useState<
    { tasks: Task[]; categories: Category[] }[]
  >([]);
  const [showUndoFeedback, setShowUndoFeedback] = useState(false);
  const [showRedoFeedback, setShowRedoFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("tasks");
      const savedCategories = localStorage.getItem("categories");

      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        setTasks(Array.isArray(parsed) ? parsed.filter(isValidTask) : []);
      }

      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        setCategories(
          Array.isArray(parsed)
            ? parsed
                .map((item) =>
                  typeof item === "string" ? { name: item } : item
                )
                .filter(isValidCategory)
            : DEFAULT_CATEGORIES
        );
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setTasks([]);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  // History management
  const saveToHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-9), { tasks, categories }]);
    setFuture([]);
  }, [tasks, categories]);

  const undoLastAction = useCallback(() => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setFuture((prev) => [{ tasks, categories }, ...prev]);
      setTasks(previousState.tasks);
      setCategories(previousState.categories);
      setHistory((prev) => prev.slice(0, -1));
      setShowUndoFeedback(true);
      setTimeout(() => setShowUndoFeedback(false), 2000);
    }
  }, [history, tasks, categories]);

  const redoLastAction = useCallback(() => {
    if (future.length > 0) {
      const nextState = future[0];
      setHistory((prev) => [...prev, { tasks, categories }]);
      setTasks(nextState.tasks);
      setCategories(nextState.categories);
      setFuture((prev) => prev.slice(1));
      setShowRedoFeedback(true);
      setTimeout(() => setShowRedoFeedback(false), 2000);
    }
  }, [future, tasks, categories]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undoLastAction();
      }
      if (e.ctrlKey && e.shiftKey && e.key === "Z") {
        e.preventDefault();
        redoLastAction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoLastAction, redoLastAction]);

  // Task and category handlers
  const handleAddTask = useCallback(
    ({ title, category }: { title: string; category: string }) => {
      saveToHistory();
      const newTask: Task = {
        id: Date.now().toString(),
        title: title.trim(),
        category: category.trim(),
        done: false,
        createdAt: Date.now(),
      };
      setTasks((prev) => [...prev, newTask]);
    },
    [saveToHistory]
  );

  const handleToggleTask = useCallback(
    (id: string) => {
      saveToHistory();
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, done: !task.done } : task
        )
      );
    },
    [saveToHistory]
  );

  const handleDeleteTask = useCallback(
    (id: string) => {
      saveToHistory();
      setTasks((prev) => prev.filter((task) => task.id !== id));
    },
    [saveToHistory]
  );

  const handleAddCategory = useCallback(
    (name: string) => {
      const trimmedName = name.trim();
      if (trimmedName && !categories.some((c) => c.name === trimmedName)) {
        saveToHistory();
        setCategories((prev) => [...prev, { name: trimmedName }]);
      }
    },
    [categories, saveToHistory]
  );

  const handleDeleteCategory = useCallback(
    (name: string) => {
      saveToHistory();
      setCategories((prev) => prev.filter((c) => c.name !== name));
      setTasks((prev) => prev.filter((t) => t.category !== name));
    },
    [saveToHistory]
  );

  // Search functionality
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      {/* Feedback notifications */}
      {showUndoFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          Changes undone!
        </motion.div>
      )}
      {showRedoFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          Changes redone!
        </motion.div>
      )}

      <nav className="w-full h-16 px-3 flex justify-between items-center border border-slate-200/10">
        <h1 className="text-xl font-semibold">My Tasks</h1>
        <div className="flex gap-3 items-center">
          <motion.button
            onClick={undoLastAction}
            disabled={history.length === 0}
            className={`h-8 w-8 rounded-full grid place-content-center ${
              history.length === 0
                ? "text-gray-400"
                : "text-green-500 hover:bg-green-500/10"
            }`}
            whileHover={history.length > 0 ? { scale: 1.1 } : {}}
            whileTap={history.length > 0 ? { scale: 0.9 } : {}}
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
          >
            <FaUndo />
          </motion.button>
          <motion.button
            onClick={redoLastAction}
            disabled={future.length === 0}
            className={`h-8 w-8 rounded-full grid place-content-center ${
              future.length === 0
                ? "text-gray-400"
                : "text-blue-500 hover:bg-blue-500/10"
            }`}
            whileHover={future.length > 0 ? { scale: 1.1 } : {}}
            whileTap={future.length > 0 ? { scale: 0.9 } : {}}
            aria-label="Redo"
            title="Redo (Ctrl+Shift+Z)"
          >
            <FaRedo />
          </motion.button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1 rounded-full border border-slate-300 dark:border-slate-600 bg-transparent text-sm"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </nav>

      <div className="w-full h-full flex flex-col gap-4 px-5 pt-6 py-3">
        <h1 className="text-6xl tracking-tighter text-balance">What's up!</h1>
        <TaskList
          tasks={filteredTasks}
          categories={categories}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </div>
    </div>
  );
}
