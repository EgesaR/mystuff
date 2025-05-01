import React from "react";

interface SpinnerProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 24, // Matches Tailwind's size-6 (1.5rem = 24px)
  strokeWidth = 3, // Matches border-3 (3px), though not used in new design
  color = "text-blue-600 dark:text-blue-500", // Matches provided colors
}) => {
  return (
    <div
      className={`animate-spin inline-block border-[3px] border-current border-t-transparent rounded-full ${color}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;