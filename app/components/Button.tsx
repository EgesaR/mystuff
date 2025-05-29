import React from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  btn_type?: ButtonVariant;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  ariaLabel?: string;
  type?: "button" | "submit" | "reset"; // Added for Remix form compatibility
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  btn_type = "primary",
  onClick,
  disabled = false,
  ariaLabel,
  type = "button",
}) => {
  const baseStyles =
    "inline-flex items-center gap-x-2 text-sm font-medium rounded-lg px-4 py-2 focus:outline-none disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200 cursor-pointer";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-orange-500 text-white hover:bg-orange-600 dark:hover:bg-orange-400 dark:focus:bg-orange-400",
    outline:
      "border border-transparent dark:text-neutral-100 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-800/30 dark:hover:text-orange-400 'dark:focus:bg-orange-800/30 'dark:focus:text-orange-400",
    ghost:
      "text-gray-900 dark:text-neutral-100 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600",
  };

  const getVariantStyles = () => variantStyles[btn_type];

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${getVariantStyles()} ${className}`}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;