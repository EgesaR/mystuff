import { useEffect, useRef, useState, type RefObject } from "react";

export interface SelectionBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface UseBoxSelectOptions {
  containerRef: RefObject<HTMLElement | null>;
  /** CSS selector for selectable items. Each must carry a `data-item-id`. */
  itemSelector?: string;
  /** Called on mouseup with the ids the box intersected (empty array if it
   * was just a background click) and whether the gesture was additive
   * (shift/cmd/ctrl held) vs. a plain replace-selection drag. */
  onSelect: (ids: string[], additive: boolean) => void;
  enabled?: boolean;
}

const MIN_DRAG_PX = 4; // below this, treat it as a click, not a drag

/**
 * Lets the user draw a rectangle over a container (mousedown+drag on empty
 * space) to select every element with a matching `data-item-id` that the
 * rectangle overlaps — the "lasso select" pattern from file managers.
 *
 * Returns the box to render as a visual overlay (or null when not dragging).
 * Coordinates are viewport (client) coordinates, so render the overlay with
 * `position: fixed`.
 */
export function useBoxSelect({
  containerRef,
  itemSelector = "[data-item-id]",
  onSelect,
  enabled = true,
}: UseBoxSelectOptions): SelectionBox | null {
  const [box, setBox] = useState<SelectionBox | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const additiveRef = useRef(false);

  // Keep the latest callback without re-subscribing DOM listeners on every render.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return; // left click only
      const target = e.target as HTMLElement;
      // Don't start a lasso if the press began on an item or an interactive control —
      // that's a native drag or a normal click, not a box-select gesture.
      if (
        target.closest(itemSelector) ||
        target.closest("button, a, input, select, label")
      ) {
        return;
      }
      additiveRef.current = e.metaKey || e.ctrlKey || e.shiftKey;
      startRef.current = { x: e.clientX, y: e.clientY };
      setBox({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
    }

    function onMouseMove(e: MouseEvent) {
      if (!startRef.current) return;
      const x = Math.min(startRef.current.x, e.clientX);
      const y = Math.min(startRef.current.y, e.clientY);
      const w = Math.abs(e.clientX - startRef.current.x);
      const h = Math.abs(e.clientY - startRef.current.y);
      setBox({ x, y, w, h });
    }

    function onMouseUp() {
      if (!startRef.current) return;
      startRef.current = null;
      setBox((current) => {
        if (!current) return null;
        if (current.w < MIN_DRAG_PX && current.h < MIN_DRAG_PX) {
          // Treated as a background click — clear selection unless additive.
          onSelectRef.current([], additiveRef.current);
          return null;
        }
        const rectRight = current.x + current.w;
        const rectBottom = current.y + current.h;
        const hits: string[] = [];
        container?.querySelectorAll(itemSelector).forEach((el) => {
          const r = el.getBoundingClientRect();
          const intersects = !(
            r.right < current.x ||
            r.left > rectRight ||
            r.bottom < current.y ||
            r.top > rectBottom
          );
          if (intersects) {
            const id = (el as HTMLElement).dataset.itemId;
            if (id) hits.push(id);
          }
        });
        onSelectRef.current(hits, additiveRef.current);
        return null;
      });
    }

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [containerRef, itemSelector, enabled]);

  return box;
}
