import { motion } from "framer-motion";
import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { json, defer } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { FiPlus } from "react-icons/fi";
import TodayTaskComponent from "~/components/tasks/TodayTaskComponent";
import data from "~/data/data.json";

// Meta function
export const meta: MetaFunction = () => [{ title: "Tasks" }];

// Loader function
export const loader = async ({ params }: LoaderFunctionArgs) => {
  return defer({ tasks: data[0].space[0].folders });
};

// Interfaces
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  folderId: string | null;
}

interface Folder {
  id: string;
  name: string;
  tasks: Task[];
  subfolders: Folder[];
}

// Get all tasks from folders and subfolders
const getTasks = (folders: Folder[]) => {
  const allTasks: Task[] = [];
  folders.forEach((folder) => {
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
};

// Categorize tasks
const categorizeTasks = (tasks: Task[], currentDate: Date) => {
  const overdue: Task[] = [];
  const upcoming: Task[] = [];
  const completed: Task[] = [];

  tasks.forEach((task) => {
    const dueDate = new Date(task.dueDate);
    if (task.completed) {
      completed.push(task);
    } else if (dueDate < currentDate) {
      overdue.push(task);
    } else {
      upcoming.push(task);
    }
  });

  return { overdue, upcoming, completed };
};

// Strongly type the tab data
const tabData: { id: "overdue" | "upcoming" | "completed"; label: string }[] = [
  { id: "overdue", label: "Overdue" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

// Tasks and categories
const tasks = getTasks(data[0].space[0].folders);
const currentDate = new Date("2025-05-26");
const categorizedTasks = categorizeTasks(tasks, currentDate);

// Animated desktop tabs
function AnimatedTabs({ onChange }: { onChange?: (tab: "overdue" | "upcoming" | "completed") => void }) {
  const [activeTab, setActiveTab] = useState<"overdue" | "upcoming" | "completed">("overdue");

  return (
    <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-700 p-1 rounded-full">
      {tabData.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            onChange?.(tab.id);
          }}
          className={`${
            activeTab === tab.id
              ? "text-white"
              : "text-gray-900 dark:text-neutral-100 hover:text-white/60"
          } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition`}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          {activeTab === tab.id && (
            <motion.span
              layoutId="bubble"
              className="absolute inset-0 z-10 bg-white mix-blend-difference"
              style={{ borderRadius: 9999 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {tab.label} ({categorizedTasks[tab.id].length})
        </button>
      ))}
    </div>
  );
}

// Main Page
export default function TasksPage() {
  const [currentTab, setCurrentTab] = useState<"overdue" | "upcoming" | "completed">("overdue");

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

  return (
    <div className="w-full h-full flex">
      {/* 📱 Mobile */}
      <div className="flex flex-col sm:hidden w-full h-full py-5 pt-8 px-3">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-900 dark:text-neutral-100">Tasks</h1>
          <button className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-900 dark:text-neutral-100 bg-gray-100 dark:bg-neutral-700 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-600">
            <FiPlus className="size-4" />
            New Task
          </button>
        </nav>
        <div className="my-4">
          <TabGroup>
            <TabList className="flex gap-2 overflow-auto">
              {tabData.map((tab) => (
                <Tab
                  key={tab.id}
                  className="rounded-full px-3 py-1 text-sm font-semibold text-gray-900 dark:text-neutral-100 focus:outline-none data-selected:bg-gray-200 dark:data-selected:bg-neutral-600"
                >
                  {tab.label} ({categorizedTasks[tab.id].length})
                </Tab>
              ))}
            </TabList>
            <TabPanels className="mt-3">
              {tabData.map((tab) => (
                <TabPanel key={tab.id} className="rounded-xl bg-gray-100 dark:bg-neutral-700 p-3">
                  <TodayTaskComponent tasks={categorizedTasks[tab.id]} />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </div>

      {/* 💻 Desktop */}
      <div className="hidden sm:flex h-screen w-full justify-center px-4 pt-24">
        <div className="w-full max-w-4xl">
          <nav className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-medium text-gray-900 dark:text-neutral-100">Tasks</h1>
            <button className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-900 dark:text-neutral-100 bg-gray-100 dark:bg-neutral-700 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-600">
              <FiPlus className="size-6" />
              New Task
            </button>
          </nav>

          <AnimatedTabs onChange={(id) => setCurrentTab(id)} />

          <main className="grid grid-cols-2 gap-4 h-[calc(100%-120px)] w-full mt-4">
            {categorizedTasks[currentTab].map((task) => (
              <div
                key={task.id}
                className="h-full w-full bg-gray-100 dark:bg-neutral-700 rounded-2xl aspect-square flex flex-col items-center justify-center p-4 text-center"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">{task.title}</h2>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-2">{task.description}</p>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-2">Due: {task.dueDate}</p>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-2">Folder: {getFolderName(task.folderId)}</p>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-2">
                  Status: {task.completed ? "Completed" : "Not Completed"}
                </p>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
