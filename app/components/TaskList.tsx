// app/components/TaskList.tsx
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import TaskItem from "./TaskItem";
import AddTaskButton from "./AddTaskButton";
import AddTaskModal from "./AddTaskModal";
import CategoryCard from "./CategoryCard";
import { Task, Category, getCategoryColor } from "~/types";

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onAddTask: (task: { title: string; category: string }) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (name: string) => void;
}

export default function TaskList({
  tasks,
  categories,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddCategory,
  onDeleteCategory,
}: TaskListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const allCategories: Category[] = Array.from(
    new Set([...categories.map((c) => c.name), ...tasks.map((t) => t.category)])
  )
    .filter(Boolean)
    .map((name) => {
      const existing = categories.find((c) => c.name === name);
      return existing || { name };
    });

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Categories Section */}
      {allCategories.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {allCategories.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
              tasks={tasks.filter((t) => t.category === category.name)}
              onDeleteCategory={onDeleteCategory}
            />
          ))}
        </div>
      )}

      {/* Tasks Section */}
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
              />
            ))
          ) : (
            <motion.div
              className="p-4 text-center text-slate-500 dark:text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {allCategories.length === 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <p>No tasks or categories yet</p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Create Your First Task
                  </button>
                </div>
              ) : (
                "No tasks found. Try a different search or add a new task."
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AddTaskButton onAdd={() => setIsAddModalOpen(true)} />
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={onAddTask}
        categories={allCategories.map((c) => c.name)}
        onAddCategory={onAddCategory}
      />
    </div>
  );
}
