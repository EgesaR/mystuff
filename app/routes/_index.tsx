import type { MetaFunction } from "@remix-run/node";
import { FaSearch, FaPlus, FaTrash, FaUndo } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "My Stuff" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

interface Task {
  id: string;
  title: string;
  category: string;
  done: boolean;
}

interface CategoryData {
  name: string;
  color: string;
  description?: string;
}

const getCategoryColor = (categoryName: string): string => {
  const hash = Array.from(categoryName.toLowerCase()).reduce(
    (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash),
    0
  );

  const h = Math.abs(hash) % 360;
  const s = 80 + (Math.abs(hash) % 15);
  const l = 60 + (Math.abs(hash) % 10);

  return `hsl(${h}, ${s}%, ${l}%)`;
};

const categoryColors: Record<string, string> = {
  personal: getCategoryColor("personal"),
  business: getCategoryColor("business"),
  project: getCategoryColor("project"),
  health: getCategoryColor("health"),
  learning: getCategoryColor("learning"),
  other: getCategoryColor("other"),
};

const CategoryCard: React.FC<{ category: CategoryData; tasks: Task[] }> = ({
  category,
  tasks,
}) => {
  const categoryTasks = tasks.filter(
    (task) => task.category.toLowerCase() === category.name.toLowerCase()
  );
  const completedTasks = categoryTasks.filter((task) => task.done).length;
  const totalTasks = categoryTasks.length;
  const completionPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const color = getCategoryColor(category.name);

  return (
    <motion.div
      className="relative flex flex-col my-6 bg-white dark:bg-gray-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg min-w-[280px] max-w-[320px] flex-shrink-0"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h5 className="text-slate-800 dark:text-slate-200 text-xl font-semibold capitalize">
            {category.name}
          </h5>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {completedTasks}/{totalTasks}
          </span>
        </div>

        <p className="text-slate-600 dark:text-slate-400 leading-normal font-light text-sm mb-4">
          {category.description || "Complete tasks to make progress"}
        </p>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="h-2 rounded-full"
            style={{
              width: `${completionPercent}%`,
              backgroundColor: color,
            }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
          <span>Progress</span>
          <span>{completionPercent}%</span>
        </div>
      </div>
    </motion.div>
  );
};

const TaskItem: React.FC<{
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ task, onToggle, onDelete }) => {
  const categoryColor = getCategoryColor(task.category);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleted, setIsDeleted] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.timeStamp;
    touchStartXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartXRef.current) return;
    const deltaX = e.touches[0].clientX - touchStartXRef.current;
    if (deltaX < 0) {
      setSwipeOffset(Math.max(deltaX, -120));
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (swipeOffset < -80) {
      setIsDeleted(true);
      setTimeout(() => onDelete(task.id), 300);
    } else {
      setSwipeOffset(0);
    }
    touchStartRef.current = null;
    touchStartXRef.current = null;
  };

  const handleUndo = () => {
    setIsDeleted(false);
    setSwipeOffset(0);
  };

  if (isDeleted) {
    return (
      <motion.div
        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20"
        initial={{ opacity: 1, x: swipeOffset }}
        animate={{ opacity: 0, height: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
          <FaTrash />
          <span>Task deleted</span>
        </div>
        <button
          onClick={handleUndo}
          className="flex items-center gap-1 text-sm text-blue-500 dark:text-blue-400"
        >
          <FaUndo /> Undo
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative overflow-hidden"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, height: 0 }}
      animate={{
        opacity: 1,
        height: "auto",
        x: swipeOffset,
        transition: { type: "spring", bounce: 0.3 },
      }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`flex items-center gap-3 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 ${
          task.done ? "opacity-70" : ""
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => onToggle(task.id)}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            task.done ? "bg-green-500 border-green-500" : ""
          }`}
          style={{ borderColor: task.done ? "" : categoryColor }}
          disabled={task.done}
          aria-label={task.done ? "Task completed" : "Mark as complete"}
        >
          {task.done && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <span
          className={`flex-grow ${
            task.done
              ? "line-through text-slate-400 dark:text-slate-500"
              : "text-slate-700 dark:text-slate-300"
          }`}
        >
          {task.title}
        </span>
        <span
          className="text-xs px-2 py-1 rounded-full capitalize"
          style={{
            backgroundColor: `${categoryColor}20`,
            color: categoryColor,
          }}
        >
          {task.category}
        </span>
      </div>

      <motion.div
        className="absolute right-0 top-0 h-full flex items-center px-4 bg-red-500"
        style={{
          width: `${Math.abs(swipeOffset)}px`,
          transform: `translateX(${swipeOffset}px)`,
        }}
        animate={{
          opacity: isSwiping ? 1 : 0,
        }}
      >
        <FaTrash className="text-white" />
      </motion.div>
    </motion.div>
  );
};

const AddTaskButton = ({ onAdd }: { onAdd: () => void }) => {
  return (
    <motion.button
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg grid place-content-center z-30"
      onClick={onAdd}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      aria-label="Add new task"
    >
      <FaPlus className="text-xl" />
    </motion.button>
  );
};

const AddTaskModal = ({
  isOpen,
  onClose,
  onAddTask,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: { title: string; category: string }) => void;
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Personal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask({ title, category });
      setTitle("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl p-6 shadow-xl z-50 max-w-md mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <h3 className="text-xl font-semibold mb-4 dark:text-white">
              Add New Task
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                  autoFocus
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                >
                  {Object.keys(categoryColors).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Task
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Morning workout", category: "Health", done: false },
    { id: "2", title: "Client meeting", category: "Business", done: true },
    { id: "3", title: "Design wireframes", category: "Project", done: false },
    { id: "4", title: "Read book", category: "Personal", done: false },
    { id: "5", title: "Learn React", category: "Learning", done: true },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const addTask = ({
    title,
    category,
  }: {
    title: string;
    category: string;
  }) => {
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        title,
        category,
        done: false,
      },
    ]);
  };

  const categories: CategoryData[] = [
    { name: "Personal", color: getCategoryColor("Personal") },
    { name: "Business", color: getCategoryColor("Business") },
    { name: "Project", color: getCategoryColor("Project") },
    { name: "Health", color: getCategoryColor("Health") },
    { name: "Learning", color: getCategoryColor("Learning") },
  ];

  return (
    <div className="flex flex-col gap-4 pb-20">
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => (
          <CategoryCard key={category.name} category={category} tasks={tasks} />
        ))}
      </div>

      <motion.div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <AddTaskButton onAdd={() => setIsAddModalOpen(true)} />
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={addTask}
      />
    </div>
  );
};

export default function Index() {
  return (
    <div className="h-screen w-full">
      <nav className="w-full h-16 px-3 flex justify-between items-center border border-slate-200/10">
        <h1 className="text-xl font-semibold">My Stuff</h1>
        <div className="flex gap-3">
          <motion.button
            className="h-8 w-8 rounded-full grid place-content-center hover:bg-slate-300/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaSearch />
          </motion.button>
        </div>
      </nav>
      <div className="w-full h-full flex flex-col gap-4 px-5 pt-6 py-3">
        <h1 className="text-6xl tracking-tighter text-balance">
          What's up Ray!
        </h1>
        <TaskList />
      </div>
    </div>
  );
}
