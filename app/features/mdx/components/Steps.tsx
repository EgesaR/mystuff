import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface StepsProps {
  children: ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  return (
    <div className={cn("my-8 ml-2 border-l pl-6", className)}>{children}</div>
  );
}
