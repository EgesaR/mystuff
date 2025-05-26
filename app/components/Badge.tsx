import React, { useEffect } from "react";
import { motion, usePresence, useAnimate } from "framer-motion";
import { FiX } from "react-icons/fi";
import clsx from "clsx";

interface BadgeProps {
  label: string;
  onRemove?: () => void;
  className?: string;
  index?: number;
  isAnimate?: boolean;
  disabled?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  onRemove,
  className = "",
  index = 1,
  isAnimate = true,
  disabled = false,
}) => {
  const [isPresent, safeToRemove] = usePresence();
  const [scope, animate] = useAnimate();

  const colorStyles = [
    "border-teal-500 text-teal-500",
    "border-blue-600 text-blue-600 dark:text-blue-500",
    "border-red-500 text-red-500",
    "border-yellow-500 text-yellow-500",
    "border-white text-white",
    "border-purple-500 text-purple-500",
  ];

  const colorClass = colorStyles[index % colorStyles.length];

  useEffect(() => {
    if (!isPresent && isAnimate) {
      const exitAnimation = async () => {
        await animate(
          scope.current,
          { opacity: 0, y: -24 },
          { duration: 0.125, ease: "easeIn" }
        );
        safeToRemove();
      };
      exitAnimation();
    }
  }, [isPresent, isAnimate, animate, scope, safeToRemove]);

  return (
    <motion.span
      ref={scope}
      layout
      initial={isAnimate ? { opacity: 0, x: 80 } : false}
      animate={isAnimate ? { opacity: 1, x: 0 } : false}
      transition={{ ease: "easeInOut" }}
      className={clsx(
        "inline-flex items-center gap-x-1.5 py-1.5 ps-3 pe-2 rounded-full text-xs font-medium border",
        colorClass,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className={clsx(
            "shrink-0 size-4 inline-flex items-center justify-center rounded-full",
            "hover:bg-gray-200 focus:bg-gray-200 focus:text-gray-500",
            "dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label={`Remove ${label} badge`}
          tabIndex={disabled ? -1 : 0}
        >
          <span className="sr-only">Remove badge</span>
          <FiX className="shrink-0 size-3" />
        </button>
      )}
    </motion.span>
  );
};

export default Badge;