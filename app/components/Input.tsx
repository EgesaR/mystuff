import { ChangeEvent, FocusEvent, KeyboardEvent } from "react";

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
  name?: string; // Added for Remix form compatibility
}

const Input: React.FC<InputProps> = ({
  label = "Title",
  id = "hs-floating-underline-input",
  type = "text",
  placeholder,
  disabled = false,
  hasError = false,
  className = "",
  onBlur,
  value,
  onKeyDown,
  onChange,
  name,
}) => {
  const inputStyles = `
    peer w-full bg-transparent border-0 border-b-2 
    ${hasError ? "border-red-500 dark:border-red-400" : "border-gray-200 dark:border-neutral-700"}
    py-4 text-sm placeholder-transparent 
    focus:border-b-orange-500 dark:focus:border-b-orange-600 
    focus:outline-0 focus:ring-0 
    disabled:opacity-50 disabled:pointer-events-none 
    dark:text-neutral-400 
    transition-all duration-200 ease-in-out 
    ${value ? "pt-6 pb-2" : ""} 
    ${className}
  `;

  const labelStyles = `
    absolute left-0 top-5 text-sm text-gray-500 
    transition-all duration-200 ease-in-out origin-left 
    pointer-events-none 
    peer-disabled:opacity-50 peer-disabled:pointer-events-none 
    peer-focus:scale-90 peer-focus:-translate-y-5 
    peer-focus:text-orange-500 dark:peer-focus:text-orange-300 
    dark:text-neutral-400
    ${value ? "scale-90 -translate-y-5 text-orange-500 dark:text-orange-300" : ""}
    ${hasError ? "text-red-500 dark:text-red-400" : ""}
  `;

  return (
    <div className="relative w-full">
      <input
        type={type}
        id={id}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        className={inputStyles}
        placeholder={placeholder || label}
        aria-describedby={`${id}-label`}
        disabled={disabled}
        aria-invalid={hasError}
        aria-label={label}
      />
      <label htmlFor={id} className={labelStyles} id={`${id}-label`}>
        {label}
      </label>
    </div>
  );
};

export default Input;