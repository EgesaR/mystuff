import type { BlockquoteHTMLAttributes } from "react";
import { cn } from "~/lib/utils";

export function Blockquote({
  className,
  ...props
}: BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn(
        "my-6 rounded-r-md border-l-2 border-primary bg-muted/50 py-2 pl-6 italic text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
