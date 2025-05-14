import React from "react";

interface SpinnerProps {
 size?: number;
 strokeWidth?: number;
 color?: string;
 label?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
 size = 24,
 strokeWidth = 3,
 color = "text-blue-600 dark:text-blue-500",
 label = "Loading..."
}) => {
 return (
  <div
   className={`animate-spin inline-block border-[3px] border-current border-t-transparent rounded-full ${color}`}
   style={{
    width: `${size}px`,
    height: `${size}px`
   }}
   role="status"
   aria-label="loading"
  >
   <span className="sr-only">{label}</span>
  </div>
 );
};

export default Spinner;
