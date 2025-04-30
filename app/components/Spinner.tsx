import React from "react";

interface SpinnerProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 60,
  strokeWidth = 6,
  color = "#0071c2",
}) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dashArray = `${circumference / 2} ${circumference / 2}`;
  const offset = circumference;

  return (
    <svg
      className="animate-spin"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        padding: `${strokeWidth / 2}px`,
        overflow: "visible",
      }}
    >
      <circle
        fill="none"
        stroke={color}
        cx="50%"
        cy="50%"
        r={`${radius}%`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        transform-origin="center"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-90;810"
          keyTimes="0;1"
          dur="6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          values={`0%;0%;-${offset}%`}
          calcMode="spline"
          keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0"
          keyTimes="0;0.5;1"
          dur="6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dasharray"
          values={`0% ${offset}%;${dashArray};0% ${offset}%`}
          calcMode="spline"
          keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0"
          keyTimes="0;0.5;1"
          dur="6s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default Spinner;