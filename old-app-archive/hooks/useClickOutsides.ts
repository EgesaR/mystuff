import { useEffect, type RefObject } from "react";

/**
 * Calls `onOutside` when the user clicks/taps outside of `ref`, or presses Escape.
 * Pass `active = false` to skip attaching listeners when the target isn't open.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  active: boolean = true,
) {
  useEffect(() => {
    if (!active) return;

    function handlePointer(e: MouseEvent | TouchEvent) {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) onOutside();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOutside();
    }

    // mousedown (not click) so the outside click doesn't also fire a
    // separate onClick handler underneath the menu right after closing it
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, onOutside, active]);
}
