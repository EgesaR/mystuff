import type { HTMLAttributes } from "react";
import { cn } from "~/lib/utils";

export function Paragraph({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "leading-7 text-foreground/90 [&:not(:first-child)]:mt-4",
        className,
      )}
      {...props}
    />
  );
}
