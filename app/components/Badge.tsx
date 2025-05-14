import React, { useEffect } from "react";
import { motion, usePresence, useAnimate } from "framer-motion";
import { FiX } from "react-icons/fi";

interface BadgeProps {
 label: string;
 onRemove?: () => void;
 className?: string;
 index: number; // Added to determine color based on index
 isAnimate?: Boolean;
}

const Badge: React.FC<BadgeProps> = ({
 label,
 onRemove,
 className = "",
 index,
 isAnimate
}) => {
 const [isPresent, safeToRemove] = usePresence();
 const [scope, animate] = useAnimate();

 // Define 8 color schemes for badges, cycling every 8 indices
 const colorStyles = [
  "border-teal-500 text-teal-500", // Color 3
  "border-blue-600 text-blue-600 dark:text-blue-500", // Color 4
  "border-red-500 text-red-500", // Color 5
  "border-yellow-500 text-yellow-500", // Color 6
  "border-white text-white", // Color 7
  "border-purple-500 text-purple-500" // Color 8 (new)
 ];

 // Determine color based on index (cycle every 8)
 const colorClass = colorStyles[index % colorStyles.length];

 useEffect(() => {
  if (!isPresent) {
   if (isAnimate) {
    const exitAnimation = async () => {
     await animate(
      scope.current,
      {
       opacity: 0,
       y: -24
      },
      { duration: 0.125, ease: "easeIn" }
     );
     safeToRemove();
    };
    exitAnimation();
   }
  }
 }, [isPresent]);
 return (
  <motion.span
   ref={scope}
   layout
   initial={isAnimate && { opacity: 0, x: 80 }}
   animate={isAnimate && { opacity: 1, x: 0 }}
   transition={{ ease: "easeInOut"}}
   className={`inline-flex items-center gap-x-1.5 py-1.5 ps-3 pe-2 rounded-full text-xs font-medium border ${colorClass} ${className}`}
  >
   {label}
   {onRemove && (
    <button
     type="button"
     onClick={onRemove}
     className="shrink-0 size-4 inline-flex items-center justify-center rounded-full hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 focus:text-gray-500 dark:hover:bg-neutral-700"
     aria-label={`Remove ${label} badge`}
    >
     <span className="sr-only">Remove badge</span>
     <FiX className="shrink-0 size-3" />
    </button>
   )}
  </motion.span>
 );
};

export default Badge;
