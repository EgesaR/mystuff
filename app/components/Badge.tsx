import React from 'react';

interface BadgeProps {
  label: string;
  onRemove?: () => void;
  className?: string;
  index: number; // Added to determine color based on index
}

const Badge: React.FC<BadgeProps> = ({ label, onRemove, className = '', index }) => {
  // Define 8 color schemes for badges, cycling every 8 indices
  const colorStyles = [
    'border-teal-500 text-teal-500', // Color 3
    'border-blue-600 text-blue-600 dark:text-blue-500', // Color 4
    'border-red-500 text-red-500', // Color 5
    'border-yellow-500 text-yellow-500', // Color 6
    'border-white text-white', // Color 7
    'border-purple-500 text-purple-500', // Color 8 (new)
  ];

  // Determine color based on index (cycle every 8)
  const colorClass = colorStyles[index % colorStyles.length];

  return (
    <span
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
          <svg
            className="shrink-0 size-3"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18"></path>
            <path d="M6 6 12 12"></path>
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge;