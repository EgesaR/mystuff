import type { HTMLAttributes } from "react";
import { cn } from "~/lib/utils";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4;
}

export function Heading({ level, className, ...props }: HeadingProps) {
  const classes = cn(
    "scroll-m-20 tracking-tight",
    level === 1 && "mt-10 mb-6 text-4xl font-extrabold first:mt-0 lg:text-5xl",
    level === 2 && "mt-10 mb-4 border-b pb-2 text-3xl font-semibold first:mt-0",
    level === 3 && "mt-8 mb-3 text-2xl font-semibold",
    level === 4 && "mt-6 mb-2 text-xl font-semibold",
    className,
  );

  if (level === 1) {
    return <h1 className={classes} {...props} />;
  }

  if (level === 2) {
    return <h2 className={classes} {...props} />;
  }

  if (level === 3) {
    return <h3 className={classes} {...props} />;
  }

  return <h4 className={classes} {...props} />;
}
