import { useState, useEffect, useRef } from 'react';
import { animate } from 'framer-motion';
import Badge from '../Badge';
import data from '~/data/data.json';
import { formatRelativeTime } from '~/utils/dateUtils';

// Define interfaces for type safety
interface Tag {
  label: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  folderId: string;
  assignee: string;
  tags?: Tag[];
}

interface TodayTaskComponentProps {
  className?: string;
}

const TodayTaskComponent: React.FC<TodayTaskComponentProps> = ({ className = '' }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const allTasks: Task[] = [];
    data.forEach((userData) => {
      userData.space.forEach((space) => {
        space.folders.forEach((folder) => {
          folder.tasks.forEach((task) => {
            allTasks.push({
              ...task,
              status: task.status as 'todo' | 'in_progress' | 'completed',
              priority: task.priority as 'low' | 'medium' | 'high',
              tags: [],
            });
          });
        });
      });
    });
    return allTasks;
  });

  const today = new Date('2025-05-21T11:05:00+03:00');
  const todayTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    return (
      dueDate.getFullYear() === today.getFullYear() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getDate() === today.getDate()
    );
  });

  const formattedToday = today.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'completed' ? 'todo' : 'completed',
            }
          : task
      )
    );
  };

  const handleRemoveTag = (taskId: string, tagIndex: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              tags: task.tags?.filter((_: Tag, index: number) => index !== tagIndex) ?? [],
            }
          : task
      )
    );
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 dark:text-red-400';
      case 'medium':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'low':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getFolderName = (folderId: string) => {
    for (const userData of data) {
      for (const space of userData.space) {
        for (const folder of space.folders) {
          if (folder.id === folderId) {
            return folder.name;
          }
          for (const subfolder of folder.subfolders) {
            if (subfolder.id === folderId) {
              return subfolder.name;
            }
          }
        }
      }
    }
    return 'Unknown';
  };

  const getTaskTags = (task: Task): Tag[] => {
    return [
      { label: task.status.replace('_', ' '), color: 'border-blue-500 text-blue-500' },
      { label: getFolderName(task.folderId), color: 'border-purple-500 text-purple-500' },
    ];
  };

  // Auto-scroll logic
  const listRef = useRef<HTMLUListElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!listRef.current || todayTasks.length === 0 || isPaused) return;

    const list = listRef.current;
    const scrollHeight = list.scrollHeight - list.clientHeight;
    if (scrollHeight <= 0) return; // No scrollable content

    const scroll = () => {
      // Scroll to bottom
      animate(list, { scrollTop: scrollHeight }, { duration: 5, ease: 'linear' }).then(() => {
        // Pause briefly at bottom
        scrollTimeoutRef.current = setTimeout(() => {
          // Scroll back to top
          animate(list, { scrollTop: 0 }, { duration: 5, ease: 'linear' }).then(() => {
            // Pause briefly at top
            if (!isPaused) {
              scrollTimeoutRef.current = setTimeout(scroll, 1000); // Loop after pause
            }
          });
        }, 1000); // Pause for 1 second at bottom
      });
    };

    scrollTimeoutRef.current = setTimeout(scroll, 1000); // Initial delay

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [todayTasks.length, isPaused]);

  // Pause on user interaction
  const handleInteractionStart = () => {
    setIsPaused(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  };

  const handleInteractionEnd = () => {
    setTimeout(() => setIsPaused(false), 500); // Delay resuming to avoid immediate restart
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
            {todayTasks.map((task, index) => (
              <li
                key={task.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl bg-gray-100 dark:bg-zinc-800/50 hover:bg-gray-200 dark:hover:bg-zinc-700/70 transition duration-300"
                aria-label={`Task: ${task.title}`}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="h-5 w-5 text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                    aria-label={`Mark ${task.title} as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
                  />
                  <div className="flex flex-col gap-2">
                    <h3
                      className={`text-lg font-semibold text-gray-900 dark:text-white ${
                        task.status === 'completed' ? 'line-through text-gray-500 dark:text-white/50' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-gray-600 dark:text-white/70 text-sm">{task.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {getTaskTags(task).map((tag, tagIndex) => (
                        <Badge
                          key={`${task.id}-tag-${tagIndex}`}
                          label={tag.label}
                          index={tagIndex}
                          onRemove={() => handleRemoveTag(task.id, tagIndex)}
                          className={tag.color}
                        />
                      ))}
                    </div>
                    <span className="text-gray-500 dark:text-white/60 text-xs">
                      Created: {formatRelativeTime(task.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-2 sm:mt-0 sm:items-end">
                  <span className="text-gray-600 dark:text-white/70 text-sm">
                    Due:{' '}
                    {new Date(task.dueDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className={`text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                    Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
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