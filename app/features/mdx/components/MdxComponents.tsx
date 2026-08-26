import type { MDXComponents } from "mdx/types";
import { Link } from "react-router";

import { cn } from "~/lib/utils";

import { Heading } from "./typography/Heading";

import { Paragraph } from "./typography/Paragraph";

import { UnorderedList, OrderedList, ListItem } from "./typography/Lists";

import { Blockquote } from "./typography/Blockquote";

import { CodeBlock } from "./CodeBlock";

import { Callout } from "./Callout";

import { Steps } from "./Steps";
import { Step } from "./Step";

import { MdxCard } from "./Card";

export const mdxComponents: MDXComponents = {
  h1: (props) => <Heading level={1} {...props} />,

  h2: (props) => <Heading level={2} {...props} />,

  h3: (props) => <Heading level={3} {...props} />,

  h4: (props) => <Heading level={4} {...props} />,

  p: Paragraph,

  ul: UnorderedList,

  ol: OrderedList,

  li: ListItem,

  blockquote: Blockquote,

  a: ({ className, href, ...props }) => {
    const isInternal =
      href?.startsWith("/") || href?.startsWith(".") || href?.startsWith("#");

    const classes = cn(
      "font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary",
      className,
    );

    if (isInternal) {
      return <Link to={href || ""} className={classes} {...props} />;
    }

    return (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className={classes}
        {...props}
      />
    );
  },

  img: ({ className, alt, ...props }) => (
    <img
      className={cn(
        "my-6 max-h-[450px] w-full rounded-lg border object-cover shadow-sm",
        className,
      )}
      alt={alt ?? ""}
      {...props}
    />
  ),

  hr: ({ className, ...props }) => (
    <hr className={cn("my-8 border-border", className)} {...props} />
  ),

  table: ({ className, ...props }) => (
    <div className='my-6 w-full overflow-x-auto rounded-lg border'>
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),

  thead: ({ className, ...props }) => (
    <thead className={cn("bg-muted/70", className)} {...props} />
  ),

  tbody: ({ className, ...props }) => (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),

  tr: ({ className, ...props }) => (
    <tr
      className={cn(
        "border-t transition-colors even:bg-muted/30 hover:bg-muted/50",
        className,
      )}
      {...props}
    />
  ),

  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border-x px-4 py-2 text-left font-semibold first:border-l-0 last:border-r-0",
        className,
      )}
      {...props}
    />
  ),

  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border-x px-4 py-2 text-left first:border-l-0 last:border-r-0",
        className,
      )}
      {...props}
    />
  ),

  code: ({ className, ...props }) => {
    const isBlock =
      typeof className === "string" && className.startsWith("language-");

    return (
      <code
        className={cn(
          isBlock
            ? "font-mono text-sm"
            : "rounded-md border bg-muted px-[0.35rem] py-[0.2rem] font-mono text-[0.85em] font-medium text-foreground",
          className,
        )}
        {...props}
      />
    );
  },

  pre: CodeBlock,

  Callout,

  Steps,

  Step,

  Card: MdxCard,
};
