import { ChangeEvent, FocusEvent, KeyboardEvent, memo, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

interface InputProps {
  label?: string;
  id?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  value?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void; // Added for focus handling
  name?: string;
}

const Input = memo(
  ({
    label = "Title",
    id = "hs-floating-underline-input",
    type = "text",
    placeholder,
    disabled = false,
    hasError = false,
    className = "",
    onBlur,
    value = "",
    onKeyDown,
    onChange,
    onFocus,
    name,
  }: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    // Handle focus state on client side
    useEffect(() => {
      if (typeof document === "undefined") return; // Skip during SSR

      const handleFocus = () => setIsFocused(true);
      const handleBlur = () => setIsFocused(false);

      const inputElement = document.getElementById(id);
      if (inputElement) {
        inputElement.addEventListener("focus", handleFocus);
        inputElement.addEventListener("blur", handleBlur);
      }

      return () => {
        if (inputElement) {
          inputElement.removeEventListener("focus", handleFocus);
          inputElement.removeEventListener("blur", handleBlur);
        }
      };
    }, [id]);

    const inputStyles = twMerge(
      "peer w-full bg-transparent border-0 border-b-2",
      hasError
        ? "border-red-500 dark:border-red-400"
        : "border-gray-200 dark:border-neutral-700",
      "pt-4 pb-0 text-sm placeholder-transparent",
      "focus:border-b-orange-500 dark:focus:border-b-orange-600 focus:outline-0 focus:ring-0",
      "disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400",
      "transition-all duration-200 ease-in-out",
      value && "pt-6 pb-0",
      className,
    );

    const labelVariants = {
      idle: {
        y: 0,
        scale: 1,
        color: hasError ? "rgb(239, 68, 68)" : "rgb(107, 114, 128)", // gray-500
      },
      focused: {
        y: -20,
        scale: 0.9,
        color: hasError
          ? "rgb(239, 68, 68)"
          : "rgb(249, 115, 22)", // orange-500
      },
    };

    return (
      <div className="relative w-full">
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          className={inputStyles}
          placeholder={placeholder || label}
          aria-describedby={`${id}-label`}
          disabled={disabled}
          aria-invalid={hasError}
          aria-label={label}
        />
        <motion.label
          htmlFor={id}
          className={twMerge(
            "absolute left-0 top-3 text-sm",
            "transition-all duration-200 ease-in-out origin-left pointer-events-none",
            "peer-disabled:opacity-50 peer-disabled:pointer-events-none",
            hasError && "text-red-500 dark:text-red-400",
          )}
          id={`${id}-label`}
          variants={labelVariants}
          initial="idle"
          animate={value || isFocused ? "focused" : "idle"}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {label}
        </motion.label>
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;