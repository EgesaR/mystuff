export interface Category {
  name: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  done: boolean;
  createdAt: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { name: "Personal", description: "Personal tasks" },
  { name: "Work", description: "Work-related tasks" },
  { name: "Other", description: "Miscellaneous tasks" },
];

export function isValidTask(task: any): task is Task {
  return (
    typeof task === "object" &&
    task !== null &&
    "id" in task &&
    "title" in task &&
    "category" in task &&
    "done" in task &&
    "createdAt" in task
  );
}

export function isValidCategory(category: any): category is Category {
  return (
    typeof category === "object" &&
    category !== null &&
    "name" in category &&
    typeof category.name === "string"
  );
}

export const getCategoryColor = (categoryName: unknown): string => {
  // Fallback for undefined/null
  if (!categoryName) return "#64748b";

  // Convert to string safely
  const nameString =
    typeof categoryName === "string"
      ? categoryName.trim()
      : String(categoryName).trim();

  // Fallback for empty string
  if (!nameString) return "#64748b";

  // Generate consistent color from string
  try {
    const hash = Array.from(nameString.toLowerCase()).reduce(
      (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash),
      0
    );
    const h = Math.abs(hash) % 360;
    const s = 80 + (Math.abs(hash) % 15);
    const l = 60 + (Math.abs(hash) % 10);
    return `hsl(${h}, ${s}%, ${l}%)`;
  } catch {
    return "#64748b"; // Fallback if hash generation fails
  }
};
