// app/components/AddTaskButton.tsx
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";

interface AddTaskButtonProps {
  onAdd: () => void;
}

const AddTaskButton = ({ onAdd }: AddTaskButtonProps) => {
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
}

export default AddTaskButton 