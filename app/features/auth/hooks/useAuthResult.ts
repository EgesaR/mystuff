import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { ActionResult } from "../types";

export function useAuthResult(
  result: ActionResult | undefined,
  redirectTo: string = "/dashboard",
  delayMs: number = 1500,
) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!result) return;

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message);
    const timer = setTimeout(() => {
      navigate(redirectTo);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [result, navigate, redirectTo, delayMs]);
}
