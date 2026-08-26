import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutosave<T>({
  data,
  onSave,
  delay = 1500,
  enabled = true,
}: UseAutosaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  const isFirstRun = useRef(true);
  const savingRef = useRef(false);

  dataRef.current = data;

  const save = useCallback(async () => {
    if (savingRef.current) return;

    savingRef.current = true;
    setStatus("saving");

    try {
      await onSave(dataRef.current);
      setStatus("saved");
    } catch (error) {
      setStatus("error");
    } finally {
      savingRef.current = false;
    }
  }, [onSave]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (!enabled) return;

    setStatus("unsaved");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, enabled, delay]);

  const saveNow = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    return save();
  }, [save]);

  return { status, saveNow };
}
