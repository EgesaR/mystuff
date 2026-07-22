import { useRef, useCallback } from "react";

export function useClickTimer(
  onSingleClick: (e: React.MouseEvent) => void,
  onDoubleClick: (e: React.MouseEvent) => void,
  delay = 250,
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        onDoubleClick(e);
      } else {
        // e.persist() is optional in React 17+, but safe to call if using older versions
        e.persist?.();
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          onSingleClick(e);
        }, delay);
      }
    },
    [onSingleClick, onDoubleClick, delay],
  );

  return { onClick };
}

export function useLongPress(
  onLongPress: (x: number, y: number) => void,
  delay = 500,
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      let clientX, clientY;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      timerRef.current = setTimeout(() => {
        onLongPress(clientX, clientY);
      }, delay);
    },
    [onLongPress, delay],
  );

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchMove: clear,
  };
}
    