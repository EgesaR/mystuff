import { useState } from "react";
import { Search, Replace, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function FindReplacePanel({
  onClose,
  onFind,
  onReplaceAll,
}: {
  onClose: () => void;
  onFind: (query: string, direction: "next" | "prev") => number;
  onReplaceAll: (query: string, replacement: string) => number;
}) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);

  const runFind = (direction: "next" | "prev") => {
    if (!query) return;
    setMatchCount(onFind(query, direction));
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40 bg-muted/40 text-xs flex-wrap">
      <Search size={14} className="text-muted-foreground shrink-0" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && runFind("next")}
        placeholder="Find..."
        className="h-7 w-40 text-xs"
        autoFocus
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => runFind("prev")}
      >
        <ChevronUp size={14} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => runFind("next")}
      >
        <ChevronDown size={14} />
      </Button>
      {matchCount !== null && (
        <span className="text-muted-foreground">
          {matchCount} match{matchCount === 1 ? "" : "es"}
        </span>
      )}
      <div className="w-px h-4 bg-border/60" />
      <Replace size={14} className="text-muted-foreground shrink-0" />
      <Input
        value={replacement}
        onChange={(e) => setReplacement(e.target.value)}
        placeholder="Replace with..."
        className="h-7 w-40 text-xs"
      />
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={() => setMatchCount(onReplaceAll(query, replacement))}
      >
        Replace all
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 ml-auto"
        onClick={onClose}
      >
        <X size={14} />
      </Button>
    </div>
  );
}
