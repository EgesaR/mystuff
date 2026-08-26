import type { HTMLAttributes } from "react";
import { cn } from "~/lib/utils";

export function UnorderedList({
  className,
  ...props
}: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn(
        "my-6 ml-6 list-disc text-foreground/90 [&>li]:mt-2",
        className,
      )}
      {...props}
    />
  );
}

export function OrderedList({
  className,
  ...props
}: HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cn(
        "my-6 ml-6 list-decimal text-foreground/90 [&>li]:mt-2",
        className,
      )}
      {...props}
    />
  );
}

export function ListItem({
  className,
  ...props
}: HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("leading-7 [&>p]:mt-2", className)} {...props} />;
}
