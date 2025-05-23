import { useState, useEffect, useCallback } from "react";

export const useIsMobile = (breakpoint: number = 640) => {
  const getInitialIsMobile = () =>
    typeof window !== "undefined" && window.innerWidth < breakpoint;

  const [isMobile, setIsMobile] = useState(getInitialIsMobile());

  const handleResize = useCallback(() => {
    const newIsMobile = window.innerWidth < breakpoint;
    if (newIsMobile !== isMobile) {
      setIsMobile(newIsMobile);
    }
  }, [breakpoint, isMobile]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    handleResize(); // Set initial state

    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100); // Debounce resize events
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  return isMobile;
};