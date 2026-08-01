import { memo } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  Eraser,
  Undo2,
} from "lucide-react";

interface ToolbarCommand {
  cmd: string;
  val?: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}

const TEXT_STYLE: ToolbarCommand[] = [
  { cmd: "bold", icon: Bold, label: "Bold" },
  { cmd: "italic", icon: Italic, label: "Italic" },
  { cmd: "underline", icon: Underline, label: "Underline" },
  { cmd: "strikeThrough", icon: Strikethrough, label: "Strikethrough" },
];

const HEADINGS: ToolbarCommand[] = [
  { cmd: "formatBlock", val: "H1", icon: Heading1, label: "Heading 1" },
  { cmd: "formatBlock", val: "H2", icon: Heading2, label: "Heading 2" },
  { cmd: "formatBlock", val: "H3", icon: Heading3, label: "Heading 3" },
];

const LISTS: ToolbarCommand[] = [
  { cmd: "insertUnorderedList", icon: List, label: "Bullet list" },
  { cmd: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
];

const BLOCKS: ToolbarCommand[] = [
  { cmd: "blockquote", icon: Quote, label: "Quote" },
  { cmd: "code", icon: Code2, label: "Code block" },
  { cmd: "createLink", icon: Link2, label: "Link" },
];

const UTILITY: ToolbarCommand[] = [
  { cmd: "removeFormat", icon: Eraser, label: "Clear formatting" },
  { cmd: "undo", icon: Undo2, label: "Undo" },
];

const GROUPS = [TEXT_STYLE, HEADINGS, LISTS, BLOCKS, UTILITY];

export const RichTextToolbar = memo(function RichTextToolbar({
  onCommand,
}: {
  onCommand: (cmd: string, val?: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-border/40 flex-wrap">
      {GROUPS.map((group, i) => (
        <div key={i} className="flex items-center gap-0.5">
          {i > 0 && <div className="w-px h-5 bg-border/60 mx-1.5" />}
          {group.map(({ cmd, val, icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              title={label}
              // Critical: without preventDefault here, the mousedown steals
              // focus/selection out of the editor before the click fires,
              // so bold/italic/etc. would apply to nothing.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onCommand(cmd, val)}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
});
