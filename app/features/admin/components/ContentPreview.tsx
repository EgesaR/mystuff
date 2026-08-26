import clsx from "clsx";
import ReactMarkdown from "react-markdown";

const VARIANT_CLASSES: Record<"docs" | "blog", string> = {
  docs: clsx(
    "prose prose-neutral dark:prose-invert",
    "max-w-none",
    "prose-headings:font-semibold",
    "prose-headings:tracking-tight",
    "prose-a:text-primary",
    "prose-a:decoration-primary/40",
    "hover:prose-a:decoration-primary",
    "prose-code:bg-muted",
    "prose-code:text-foreground",
    "prose-pre:bg-muted",
    "prose-pre:text-foreground",
    "prose-blockquote:border-primary",
    "prose-blockquote:text-muted-foreground",
  ),

  blog: clsx(
    "prose prose-neutral dark:prose-invert",
    "max-w-none",
    "prose-headings:font-serif",
    "prose-a:text-primary",
    "prose-a:decoration-primary/40",
    "hover:prose-a:decoration-primary",
  ),
};

interface ContentPreviewProps {
  content: string;
  variant: "docs" | "blog";
}

const ContentPreview = ({ content, variant }: ContentPreviewProps) => {
  if (!content.trim()) {
    return (
      <p className='text-sm italic text-muted-foreground'>
        Nothing to preview yet.
      </p>
    );
  }

  return (
    <div className={clsx(VARIANT_CLASSES[variant])}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default ContentPreview;
