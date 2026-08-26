import type { HTMLAttributes } from "react";
import { CopyButton } from "./CopyButton";
import { cn } from "~/lib/utils";

interface CodeBlockProps extends HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div className='group relative my-6 overflow-hidden rounded-lg border bg-muted shadow-sm'>
      <div className='flex items-center justify-between border-b bg-muted/70 px-3 py-2'>
        <span className='font-mono text-xs text-muted-foreground'>Code</span>

        <CopyButton value={String(children ?? "")} />
      </div>

      <pre
        className={cn(
          "overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
