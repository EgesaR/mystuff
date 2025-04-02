// app/components/CategoryCard.tsx
import { motion } from "framer-motion";
import { Task, getCategoryColor } from "~/types";

interface CategoryCardProps {
  category: {
    name: string;
    description?: string;
  };
  tasks: Task[];
  onDeleteCategory?: (name: string) => void;
}

export default function CategoryCard({ category, tasks }: CategoryCardProps) {
  const categoryTasks = tasks.filter((t) => t.category === category.name);
  const completedTasks = categoryTasks.filter((t) => t.done).length;
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
          <h5 className="text-xl font-semibold capitalize" style={{ color: color }}>
            {category.name}
          </h5>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {completedTasks}/{totalTasks}
          </span>
        </div>

        {category.description && (
          <p className="text-slate-600 dark:text-slate-400 leading-normal font-light text-sm mb-4">
            {category.description}
          </p>
        )}

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
}
