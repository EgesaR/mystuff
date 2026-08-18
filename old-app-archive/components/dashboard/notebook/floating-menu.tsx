"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Highlighter,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  List,
  Image as ImageIcon,
  Share,
  Text,
  ChevronDown,
  Baseline,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from "~/components/ui/color-picker";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const springConfig: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 1,
};

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
const TEXT_PRESETS = [
  "#09090b",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];
const HIGHLIGHT_PRESETS = [
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
  "#fbcfe8",
  "#fed7aa",
  "#e9d5ff",
  "transparent",
];

/** Wraps a Range in a <span style="..."> to apply arbitrary CSS (color,
 * font-size, background) — execCommand's built-in equivalents either don't
 * exist (font-size only supports 7 fixed legacy sizes) or are inconsistent
 * across browsers (hiliteColor/foreColor). Falls back to extract+wrap when
 * the range crosses element boundaries and surroundContents() can't apply
 * directly. */
function wrapRangeWithStyle(range: Range, prop: string, value: string): void {
  const span = document.createElement("span");
  span.style.setProperty(prop, value);
  try {
    range.surroundContents(span);
  } catch {
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
  }
}

interface FloatingMenuProps {
  /** The contentEditable element this toolbar acts on. */
  editorRef: React.RefObject<HTMLDivElement | null>;
  /** Called after any DOM mutation so the parent can re-sanitize/save/recompute stats. */
  onChange: () => void;
  /** Parent already owns the hidden file input + saveSelection/insert flow for images. */
  onRequestImage: () => void;
  /** Opens the note's existing ShareDialog. */
  onRequestShare: () => void;
}

export default function FloatingMenu({
  editorRef,
  onChange,
  onRequestImage,
  onRequestShare,
}: FloatingMenuProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState<number>(16);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [textColor, setTextColor] = useState("#09090b");
  const [highlightColor, setHighlightColor] = useState("#fef08a");
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const suppressHide = isFontDropdownOpen || textColorOpen || highlightOpen;

  const captureRange = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const applyToSavedRange = useCallback(
    (prop: string, value: string) => {
      if (!savedRangeRef.current) return;
      wrapRangeWithStyle(savedRangeRef.current, prop, value);
      onChange();
    },
    [onChange],
  );

  // Selection tracking: show on mouseup/keyup/touchend (matches how
  // Notion/Google Docs surface this — after the gesture completes, not
  // mid-drag), hide as soon as the selection collapses (unless a popover
  // or the font-size dropdown is holding it open).
  useEffect(() => {
    const updateFromSelection = () => {
      const sel = window.getSelection();
      const root = editorRef.current;
      if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !root) {
        if (!suppressHide) setVisible(false);
        return;
      }
      const anchor = sel.anchorNode;
      if (!anchor || !root.contains(anchor)) {
        if (!suppressHide) setVisible(false);
        return;
      }

      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const vw = window.visualViewport?.width ?? window.innerWidth;
      const menuWidth = menuRef.current?.offsetWidth ?? 460;
      const menuHeight = menuRef.current?.offsetHeight ?? 48;
      const margin = 8;

      let top = rect.top - menuHeight - margin;
      if (top < margin) top = rect.bottom + margin; // flip below if no room above
      let left = rect.left + rect.width / 2 - menuWidth / 2;
      left = Math.min(Math.max(left, margin), vw - menuWidth - margin);

      setPosition({ top, left });

      setActiveFormats(
        new Set(
          [
            "bold",
            "italic",
            "underline",
            "strikeThrough",
            "justifyLeft",
            "justifyCenter",
            "justifyRight",
            "insertUnorderedList",
            "insertOrderedList",
          ].filter((cmd) => {
            try {
              return document.queryCommandState(cmd);
            } catch {
              return false;
            }
          }),
        ),
      );

      setVisible(true);
    };

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if ((!sel || sel.isCollapsed) && !suppressHide) setVisible(false);
    };

    document.addEventListener("mouseup", updateFromSelection);
    document.addEventListener("keyup", updateFromSelection);
    document.addEventListener("touchend", updateFromSelection);
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("mouseup", updateFromSelection);
      document.removeEventListener("keyup", updateFromSelection);
      document.removeEventListener("touchend", updateFromSelection);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [editorRef, suppressHide]);

  const runCommand = useCallback(
    (cmd: string) => {
      document.execCommand(cmd, false);
      onChange();
      setActiveFormats((prev) => {
        const next = new Set(prev);
        if (document.queryCommandState(cmd)) next.add(cmd);
        else next.delete(cmd);
        return next;
      });
    },
    [onChange],
  );

  const applyFontSize = useCallback(
    (size: number) => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      wrapRangeWithStyle(sel.getRangeAt(0), "font-size", `${size}px`);
      setFontSize(size);
      setIsFontDropdownOpen(false);
      onChange();
    },
    [onChange],
  );

  if (!visible) return null;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={springConfig}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 50,
      }}
      className={cn(
        "flex max-w-[92vw] items-center gap-0.5 overflow-x-auto rounded-2xl p-1.5 shadow-2xl",
        "bg-white/90 backdrop-blur-xl border border-zinc-200/50",
        "dark:bg-zinc-950/90 dark:border-zinc-800/50 dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]",
      )}
    >
      {/* Font size */}
      <div className="relative flex items-center shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsFontDropdownOpen((v) => !v)}
          className="flex h-9 items-center gap-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors px-2 outline-none cursor-pointer"
        >
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-5 text-center select-none">
            {fontSize}
          </span>
          <ChevronDown className="h-3 w-3 text-zinc-500" />
        </button>

        <AnimatePresence>
          {isFontDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={springConfig}
              className="absolute top-full left-0 mt-2 flex flex-col w-16 max-h-48 overflow-y-auto bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-2xl p-1 z-50 origin-top"
            >
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFontSize(size)}
                  className={cn(
                    "text-sm px-2 py-1.5 rounded-lg text-center hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors",
                    fontSize === size &&
                      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-semibold",
                  )}
                >
                  {size}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Divider />

      {/* Text styles */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Popover
          open={textColorOpen}
          onOpenChange={(open) => {
            if (open) {
              captureRange();
              setTextColorOpen(true);
            } else {
              setTextColorOpen(false);
              applyToSavedRange("color", textColor);
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 outline-none cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <Baseline className="h-4 w-4 stroke-[2.5] text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                <div
                  className="h-0.75 w-4 rounded-full transition-colors"
                  style={{ backgroundColor: textColor }}
                />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-4 border-zinc-200/50 bg-white/95 backdrop-blur-xl dark:bg-zinc-950/95 dark:border-zinc-800/50 rounded-2xl shadow-2xl"
            align="start"
            sideOffset={14}
          >
            <ColorPicker
              value={textColor}
              onChange={(rgba: number[]) =>
                setTextColor(
                  `rgba(${Math.round(rgba[0])}, ${Math.round(rgba[1])}, ${Math.round(rgba[2])}, ${rgba[3]})`,
                )
              }
              className="h-auto w-64"
            >
              <ColorPickerSelection className="h-40 rounded-lg" />
              <ColorPickerHue />
              <ColorPickerAlpha />
              <div className="flex items-center gap-2">
                <ColorPickerEyeDropper />
                <ColorPickerOutput />
                <ColorPickerFormat />
              </div>
            </ColorPicker>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {TEXT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setTextColor(c)}
                  className="h-6 w-6 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarButton
          icon={Bold}
          isActive={activeFormats.has("bold")}
          onClick={() => runCommand("bold")}
        />
        <ToolbarButton
          icon={Italic}
          isActive={activeFormats.has("italic")}
          onClick={() => runCommand("italic")}
        />
        <ToolbarButton
          icon={Underline}
          isActive={activeFormats.has("underline")}
          onClick={() => runCommand("underline")}
        />
        <ToolbarButton
          icon={Strikethrough}
          isActive={activeFormats.has("strikeThrough")}
          onClick={() => runCommand("strikeThrough")}
        />

        <Popover
          open={highlightOpen}
          onOpenChange={(open) => {
            if (open) {
              captureRange();
              setHighlightOpen(true);
            } else {
              setHighlightOpen(false);
              applyToSavedRange("background-color", highlightColor);
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 outline-none cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <Highlighter className="h-4 w-4 stroke-[2.5] text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                <div
                  className="h-0.75 w-4 rounded-full transition-colors"
                  style={{ backgroundColor: highlightColor }}
                />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-4 border-zinc-200/50 bg-white/95 backdrop-blur-xl dark:bg-zinc-950/95 dark:border-zinc-800/50 rounded-2xl shadow-2xl"
            align="start"
            sideOffset={14}
          >
            <ColorPicker
              value={highlightColor}
              onChange={(rgba: number[]) =>
                setHighlightColor(
                  `rgba(${Math.round(rgba[0])}, ${Math.round(rgba[1])}, ${Math.round(rgba[2])}, ${rgba[3]})`,
                )
              }
              className="h-auto w-64"
            >
              <ColorPickerSelection className="h-40 rounded-lg" />
              <ColorPickerHue />
              <ColorPickerAlpha />
              <div className="flex items-center gap-2">
                <ColorPickerEyeDropper />
                <ColorPickerOutput />
                <ColorPickerFormat />
              </div>
            </ColorPicker>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {HIGHLIGHT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setHighlightColor(c)}
                  className="h-6 w-6 rounded-full border border-black/10 shrink-0"
                  style={{
                    backgroundColor: c === "transparent" ? undefined : c,
                    backgroundImage:
                      c === "transparent"
                        ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)"
                        : undefined,
                    backgroundSize: c === "transparent" ? "6px 6px" : undefined,
                    backgroundPosition:
                      c === "transparent" ? "0 0, 3px 3px" : undefined,
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Divider />

      {/* Alignment */}
      <div className="flex items-center gap-0.5 shrink-0">
        <ToolbarButton
          icon={AlignLeft}
          isActive={activeFormats.has("justifyLeft")}
          onClick={() => runCommand("justifyLeft")}
        />
        <ToolbarButton
          icon={AlignCenter}
          isActive={activeFormats.has("justifyCenter")}
          onClick={() => runCommand("justifyCenter")}
        />
        <ToolbarButton
          icon={AlignRight}
          isActive={activeFormats.has("justifyRight")}
          onClick={() => runCommand("justifyRight")}
        />
      </div>

      <Divider />

      {/* Lists */}
      <div className="flex items-center gap-0.5 shrink-0">
        <ToolbarButton
          icon={ListOrdered}
          isActive={activeFormats.has("insertOrderedList")}
          onClick={() => runCommand("insertOrderedList")}
        />
        <ToolbarButton
          icon={List}
          isActive={activeFormats.has("insertUnorderedList")}
          onClick={() => runCommand("insertUnorderedList")}
        />
      </div>

      <Divider />

      {/* Media */}
      <div className="flex items-center gap-0.5 shrink-0">
        <ToolbarButton icon={ImageIcon} onClick={onRequestImage} />
        <ToolbarButton icon={Share} onClick={onRequestShare} />
      </div>

      <Divider />

      {/* Tags — no backend model exists for this yet, kept visible but inert */}
      <button
        type="button"
        disabled
        title="Tags — coming soon"
        className="flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium outline-none cursor-not-allowed opacity-40 text-zinc-600 dark:text-zinc-400"
      >
        <Text className="h-4 w-4" />
        Tags
      </button>
    </motion.div>
  );
}

function Divider() {
  return (
    <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0" />
  );
}

interface ToolbarButtonProps {
  icon: React.ElementType;
  isActive?: boolean;
  onClick?: () => void;
  activeColor?: string;
  activeBg?: string;
}

function ToolbarButton({
  icon: Icon,
  isActive,
  onClick,
  activeColor = "text-indigo-600 dark:text-indigo-400",
  activeBg = "bg-indigo-100 dark:bg-indigo-500/20",
}: ToolbarButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={springConfig}
      // Prevents the button click from stealing focus out of the
      // contentEditable — without this, window.getSelection() would be
      // empty by the time onClick runs.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 outline-none cursor-pointer",
        isActive
          ? cn(activeBg, activeColor)
          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50",
      )}
    >
      {isActive && (
        <motion.div
          className={cn("absolute inset-0 rounded-lg", activeBg)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <Icon className="relative z-10 h-4 w-4 stroke-[2.5]" />
    </motion.button>
  );
}
