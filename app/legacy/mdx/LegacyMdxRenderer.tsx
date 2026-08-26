import ReactMarkdown from "react-markdown";

import { transformLegacyMdx } from "./legacyMdx";

interface LegacyMdxRendererProps {
  content: string;
}

export default function LegacyMdxRenderer({ content }: LegacyMdxRendererProps) {
  const markdown = transformLegacyMdx(content);

  return (
    <div className='text-foreground'>
      <ReactMarkdown
        components={{
          h1: ({ className, ...props }) => (
            <h1
              className={`mt-10 mb-6 scroll-m-20 text-3xl font-bold tracking-tight first:mt-0 sm:text-4xl ${
                className ?? ""
              }`}
              {...props}
            />
          ),

          h2: ({ className, ...props }) => (
            <h2
              className={`mt-10 mb-4 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight ${
                className ?? ""
              }`}
              {...props}
            />
          ),

          h3: ({ className, ...props }) => (
            <h3
              className={`mt-8 mb-3 text-xl font-semibold tracking-tight ${
                className ?? ""
              }`}
              {...props}
            />
          ),

          p: ({ className, ...props }) => (
            <p
              className={`leading-7 text-foreground/90 [&:not(:first-child)]:mt-4 ${
                className ?? ""
              }`}
              {...props}
            />
          ),

          ul: ({ className, ...props }) => (
            <ul
              className={`my-6 ml-6 list-disc text-foreground/90 [&>li]:mt-2 ${
                className ?? ""
              }`}
              {...props}
            />
          ),

          ol: ({ className, ...props }) => (
            <ol
              className={`my-6 ml-6 list-decimal text-foreground/90 [&>li]:mt-2 ${
                className ?? ""
              }`}
              {...props}
            />
          ),

          li: ({ className, ...props }) => (
            <li className={`leading-7 ${className ?? ""}`} {...props} />
          ),

          a: ({ className, href, ...props }) => (
            <a
              href={href}
              className={`font-medium text-primary underline underline-offset-4 ${
                className ?? ""
              }`}
              {...props}
            />
          ),

          blockquote: ({ className, ...props }) => (
            <blockquote
              className={`my-6 rounded-r-md border-l-2 border-primary bg-muted/50 py-2 pl-6 italic text-muted-foreground ${
                className ?? ""
              }`}
              {...props}
            />
          ),

          img: ({ className, alt, ...props }) => (
            <img
              alt={alt ?? ""}
              className={`my-6 block h-auto max-w-full rounded-lg border object-contain ${
                className ?? ""
              }`}
              {...props}
            />
          ),

          pre: ({ className, ...props }) => (
            <pre
              className={`my-6 overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm leading-relaxed text-foreground ${
                className ?? ""
              }`}
              {...props}
            />
          ),

          code: ({ className, ...props }) => (
            <code
              className={`rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground ${
                className ?? ""
              }`}
              {...props}
            />
          ),

          hr: ({ className, ...props }) => (
            <hr
              className={`my-8 border-border ${className ?? ""}`}
              {...props}
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
