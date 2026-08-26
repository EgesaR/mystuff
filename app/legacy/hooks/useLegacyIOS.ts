import { useEffect, useState } from "react";

function detectLegacyIOS(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent || "";

  return /iPad|iPhone|iPod/.test(ua) && /OS 12_/.test(ua);
}

export function useLegacyIOS(): boolean {
  const [legacyIOS, setLegacyIOS] = useState(false);

  useEffect(() => {
    setLegacyIOS(detectLegacyIOS());
  }, []);

  return legacyIOS;
}

export function isLegacyIOS(): boolean {
  return detectLegacyIOS();
}
