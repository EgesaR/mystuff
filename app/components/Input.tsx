import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  forwardRef,
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
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
  focusInputClass?: string;
  focusLabelClass?: string;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  value?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  name?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label = "Title",
      id = "floating-input",
      type = "text",
      placeholder,
      disabled = false,
      hasError = false,
      className = "",
      focusInputClass = "",
      focusLabelClass = "",
      onBlur,
      onKeyDown,
      onChange,
      onFocus,
      value = "",
      name,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleFocus = () => {
      setIsFocused(true);
      onFocus?.();
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const inputStyles = twMerge(
      "peer w-full bg-transparent border-0 border-b-2 pt-4 pb-0 text-sm placeholder-transparent transition-all duration-200 ease-in-out",
      hasError
        ? "border-red-500 dark:border-red-400"
        : "border-gray-200 dark:border-neutral-700 focus:border-b-orange-500 dark:focus:border-b-orange-600",
      "focus:outline-0 focus:ring-0 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400",
      className,
      isFocused && focusInputClass
    );

    const labelStyles = twMerge(
      "absolute left-0 top-3 text-sm transition-all duration-200 ease-in-out origin-left pointer-events-none",
      hasError && "text-red-500 dark:text-red-400",
      "peer-disabled:opacity-50 peer-disabled:pointer-events-none",
      isFocused && focusLabelClass
    );

    const labelVariants = {
      idle: {
        y: 0,
        scale: 1,
        color: hasError ? "rgb(239, 68, 68)" : "rgb(107, 114, 128)",
      },
      focused: {
        y: -17,
        scale: 0.9,
        color: hasError ? "rgb(239, 68, 68)" : "rgb(249, 115, 22)",
      },
    };

    return (
      <div className="relative w-full">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          className={inputStyles}
          placeholder={placeholder || label}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={label}
          aria-invalid={hasError}
          aria-describedby={`${id}-label`}
        />

        <motion.label
          htmlFor={id}
          id={`${id}-label`}
          className={labelStyles}
          variants={labelVariants}
          initial="idle"
          animate={value || isFocused ? "focused" : "idle"}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {label}
        </motion.label>
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
