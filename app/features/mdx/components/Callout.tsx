import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Lightbulb,
  TriangleAlert,
} from "lucide-react";

import { cn } from "~/lib/utils";

type CalloutType =
  "default" | "info" | "success" | "warning" | "danger" | "tip";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
  className?: string;
}

const CONFIG: Record<
  CalloutType,
  {
    icon: typeof Info;
    className: string;
  }
> = {
  default: {
    icon: Info,
    className: "border-border bg-muted/50",
  },

  info: {
    icon: Info,
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },

  success: {
    icon: CheckCircle2,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },

  warning: {
    icon: TriangleAlert,
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },

  danger: {
    icon: AlertCircle,
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },

  tip: {
    icon: Lightbulb,
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
};

export function Callout({
  type = "default",
  title,
  children,
  className,
}: CalloutProps) {
  const config = CONFIG[type];
  const Icon = config.icon;

  return (
    <aside
      className={cn(
        "my-6 flex gap-3 rounded-lg border p-4 text-sm",
        config.className,
        className,
      )}
    >
      <Icon className='mt-0.5 size-4 shrink-0' />

      <div className='min-w-0'>
        {title && <div className='mb-1 font-semibold'>{title}</div>}

        <div className='leading-6 [&>p]:m-0'>{children}</div>
      </div>
    </aside>
  );
}
