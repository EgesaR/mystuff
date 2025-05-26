import { useState, useEffect, useRef } from "react";
import { animate } from "framer-motion";
import data from "~/data/data.json";

// Define interfaces for type safety
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  folderId: string | null;
}

interface TodayTaskComponentProps {
  className?: string;
  tasks?: Task[];
}

// Utility to format relative time
const formatRelativeTime = (date: string) => {
  const now = new Date("2025-05-26");
  const targetDate = new Date(date);
  const diff = targetDate.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)}d ago`;
  return `In ${days} days`;
};

const TodayTaskComponent: React.FC<TodayTaskComponentProps> = ({ className = "", tasks }) => {
  const [allTasks, setAllTasks] = useState<Task[]>(() => {
    if (tasks) return tasks; // Use passed tasks if provided
    const allTasks: Task[] = [];
    data[0].space[0].folders.forEach((folder) => {
      folder.tasks.forEach((task) => {
        allTasks.push({ ...task, folderId: folder.id });
      });
      folder.subfolders.forEach((subfolder) => {
        subfolder.tasks.forEach((task) => {
          allTasks.push({ ...task, folderId: subfolder.id });
        });
      });
    });
    return allTasks;
  });

  const today = new Date("2025-05-26");
  const todayTasks = allTasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    return (
      dueDate.getFullYear() === today.getFullYear() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getDate() === today.getDate()
    );
  });

  const formattedToday = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const toggleTaskCompletion = (taskId: string) => {
    setAllTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return "Unknown";
    for (const folder of data[0].space[0].folders) {
      if (folder.id === folderId) return folder.name;
      for (const subfolder of folder.subfolders) {
        if (subfolder.id === folderId) return subfolder.name;
      }
    }
    return "Unknown";
  };

  // Auto-scroll logic
  const listRef = useRef<HTMLUListElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!listRef.current || todayTasks.length === 0 || isPaused) return;

    const list = listRef.current;
    const scrollHeight = list.scrollHeight - list.clientHeight;
    if (scrollHeight <= 0) return;

    const scroll = () => {
      animate(list, { scrollTop: scrollHeight }, { duration: 5, ease: "linear" }).then(() => {
        scrollTimeoutRef.current = setTimeout(() => {
          animate(list, { scrollTop: 0 }, { duration: 5, ease: "linear" }).then(() => {
            if (!isPaused) {
              scrollTimeoutRef.current = setTimeout(scroll, 1000);
            }
          });
        }, 1000);
      });
    };

    scrollTimeoutRef.current = setTimeout(scroll, 1000);

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [todayTasks.length, isPaused]);

  const handleInteractionStart = () => {
    setIsPaused(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  };

  const handleInteractionEnd = () => {
    setTimeout(() => setIsPaused(false), 500);
  };

  return (
    <div
      className={`h-full w-full bg-dark rounded-2xl px-6 py-3 shadow-lg ${className}`}
      role="region"
      aria-label="Today's Tasks"
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-gray-900 dark:text-white text-2xl font-bold">Today's Tasks</h2>
          <span className="text-gray-500 dark:text-white/60 text-sm">{formattedToday}</span>
        </div>
        <hr className="border-gray-300 dark:border-white/20" />
        {todayTasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-white/60 text-lg">No tasks due today</p>
          </div>
        ) : (
          <ul
            ref={listRef}
            className="overflow-y-auto space-y-3 max-h-[calc(100%-120px)] pr-2 custom-scrollbar"
            onMouseEnter={handleInteractionStart}
            onMouseLeave={handleInteractionEnd}
            onWheel={handleInteractionStart}
            onTouchStart={handleInteractionStart}
            onTouchEnd={handleInteractionEnd}
            aria-label="Task list"
          >
            {todayTasks.map((task) => (
              <li
                key={task.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl bg-gray-100 dark:bg-zinc-800/50 hover:bg-gray-200 dark:hover:bg-zinc-700/70 transition duration-300"
                aria-label={`Task: ${task.title}`}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="h-5 w-5 text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                    aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
                  />
                  <div className="flex flex-col gap-2">
                    <h3
                      className={`text-lg font-semibold text-gray-900 dark:text-white ${
                        task.completed ? "line-through text-gray-500 dark:text-white/50" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-gray-600 dark:text-white/70 text-sm">{task.description}</p>
                    <span className="text-gray-500 dark:text-white/60 text-xs">
                      Folder: {getFolderName(task.folderId)}
                    </span>
                    <span className="text-gray-500 dark:text-white/60 text-xs">
                      Created: {formatRelativeTime(task.dueDate)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-2 sm:mt-0 sm:items-end">
                  <span className="text-gray-600 dark:text-white/70 text-sm">Due: {task.dueDate}</span>
                  <span className="text-sm font-semibold text-gray-500 dark:text-white/60">
                    Status: {task.completed ? "Completed" : "Not Completed"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TodayTaskComponent;