// app/components/TaskItem.tsx
import { motion } from "framer-motion";
import { FaTrash, FaUndo } from "react-icons/fa";
import { Task, getCategoryColor } from "~/types";
import { useState, useRef } from "react";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleted, setIsDeleted] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const categoryColor = getCategoryColor(task.category || "Uncategorized");

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    touchStartRef.current = Date.now();
    touchStartXRef.current = clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartXRef.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - touchStartXRef.current;
    if (deltaX < 0) setSwipeOffset(Math.max(deltaX, -120));
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
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
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
}
