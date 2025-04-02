// app/components/AddTaskModal.tsx
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { useState } from "react";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: { title: string; category: string }) => void;
  categories: string[];
  onAddCategory: (name: string) => void;
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onAddTask,
  categories,
  onAddCategory,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory =
      category ||
      (isCreatingCategory && newCategory.trim()
        ? newCategory.trim()
        : "Uncategorized");

    if (isCreatingCategory && newCategory.trim()) {
      onAddCategory(newCategory.trim());
    }

    onAddTask({
      title: title.trim(),
      category: finalCategory,
    });

    setTitle("");
    setCategory("");
    setNewCategory("");
    setIsCreatingCategory(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl p-6 shadow-xl z-50 max-w-md mx-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold dark:text-white">
                Add Task
              </h3>
              <button
                onClick={onClose}
                className="text-slate-500 dark:text-slate-400"
              >
                <FaTimes />
              </button>
            </div>

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
                {categories.length > 0 && !isCreatingCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                    >
                      <option value="">Select or create...</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCategory(true)}
                      className="px-3 bg-gray-200 dark:bg-gray-700 rounded-lg"
                    >
                      New
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={isCreatingCategory ? newCategory : category}
                      onChange={(e) =>
                        isCreatingCategory
                          ? setNewCategory(e.target.value)
                          : setCategory(e.target.value)
                      }
                      placeholder="Enter category name"
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                    />
                    {isCreatingCategory && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(false)}
                        className="px-3 bg-gray-200 dark:bg-gray-700 rounded-lg"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
