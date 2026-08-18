import { useRef } from "react";

/**
 * Distinguishes a single click from a double click without a UI library.
 * Single click fires after `delay` ms if no second click follows; a second
 * click within `delay` cancels the single-click callback and fires double.
 */
export function useClickTimer(
  onSingle: (e: React.MouseEvent) => void,
  onDouble: (e: React.MouseEvent) => void,
  delay = 230,
) {
  const clickCount = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEvent = useRef<React.MouseEvent | null>(null);

  const onClick = (e: React.MouseEvent) => {
    // persist the synthetic event so it's still valid inside the timeout
    e.persist?.();
    lastEvent.current = e;
    clickCount.current += 1;

    if (clickCount.current === 1) {
      timer.current = setTimeout(() => {
        if (clickCount.current === 1 && lastEvent.current) {
          onSingle(lastEvent.current);
        }
        clickCount.current = 0;
      }, delay);
    } else {
      if (timer.current) clearTimeout(timer.current);
      clickCount.current = 0;
      onDouble(e);
    }
  };

  return { onClick };
}

/**
 * Touch-only long-press, for opening a context menu on mobile where
 * right-click doesn't exist. Cancels if the finger moves (scroll) or lifts
 * before `delay`. Coordinates are captured synchronously at touchstart
 * rather than read later, since synthetic events shouldn't be relied on
 * inside a timeout.
 */
export function useLongPress(
  onLongPress: (x: number, y: number) => void,
  delay = 500,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moved = useRef(false);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  return {
    onTouchStart: (e: React.TouchEvent) => {
      moved.current = false;
      const touch = e.touches[0];
      const x = touch?.clientX ?? 0;
      const y = touch?.clientY ?? 0;
      timer.current = setTimeout(() => {
        if (!moved.current) onLongPress(x, y);
      }, delay);
    },
    onTouchMove: () => {
      moved.current = true;
      clear();
    },
    onTouchEnd: clear,
  };
}
