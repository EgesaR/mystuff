import { motion } from "framer-motion";

export function NotebookSplash() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-24">
      <motion.div style={{ perspective: 600 }} className="relative w-16 h-20">
        <div className="absolute inset-0 rounded-sm bg-indigo-500/90 shadow-lg" />
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: [0, -140, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "left center" }}
          className="absolute inset-y-0 left-0 w-1/2 rounded-l-sm bg-indigo-50 border-r border-indigo-200"
        />
      </motion.div>
      <p className="text-sm text-muted-foreground animate-pulse">
        Opening your note…
      </p>
    </div>
  );
}
