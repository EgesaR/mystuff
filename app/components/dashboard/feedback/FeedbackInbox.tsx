import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Plus, Bug, Sparkles, MessageCircle, Heart } from "lucide-react";
import { updateFeedbackStatus } from "~/lib/api/feedback";
import { FeedbackComposer } from "~/components/dashboard/feedback/FeedbackComposer";
import type { Feedback, FeedbackStatus } from "~/types/feedback";
import { useFeedbackSocket } from "~/hooks/useFeedbackSocket";

const CATEGORY_META: Record<
  Feedback["category"],
  { label: string; icon: React.ElementType; className: string }
> = {
  bug: {
    label: "Bug",
    icon: Bug,
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  feature: {
    label: "Feature",
    icon: Sparkles,
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  general: {
    label: "General",
    icon: MessageCircle,
    className: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
  },
  praise: {
    label: "Praise",
    icon: Heart,
    className: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  },
};

const STATUS_OPTIONS: { value: FeedbackStatus; label: string; dot: string }[] =
  [
    { value: "new", label: "New", dot: "bg-amber-500" },
    { value: "reviewed", label: "Reviewed", dot: "bg-indigo-500" },
    { value: "resolved", label: "Resolved", dot: "bg-emerald-500" },
  ];

export function FeedbackInbox({ initialItems }: { initialItems: Feedback[] }) {
  const [items, setItems] = useState(initialItems);
  const [justArrivedId, setJustArrivedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialItems[0]?.id ?? null,
  );
  const [composerOpen, setComposerOpen] = useState(false);

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? items
        : items.filter((f) => f.status === statusFilter),
    [items, statusFilter],
  );

  useFeedbackSocket((incoming) => {
    setItems((cur) => {
      if (cur.some((f) => f.id === incoming.id)) return cur;
      return [incoming, ...cur];
    });

    setJustArrivedId(incoming.id);
    setTimeout(
      () => setJustArrivedId((cur) => (cur === incoming.id ? null : cur)),
      2500,
    );
  });

  const selected = items.find((f) => f.id === selectedId) ?? null;

  const handleStatusChange = async (id: string, status: FeedbackStatus) => {
    const prev = items;
    setItems((cur) => cur.map((f) => (f.id === id ? { ...f, status } : f)));
    try {
      await updateFeedbackStatus(id, status);
    } catch {
      setItems(prev);
    }
  };

  return (
    <div className="flex flex-1 min-h-0 gap-4">
      <div className="w-80 shrink-0 flex flex-col rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between gap-2 p-3 border-b border-black/5 dark:border-white/10">
          <div className="flex gap-1 flex-wrap">
            {(["all", "new", "reviewed", "resolved"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize",
                  statusFilter === s
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="size-7 shrink-0">
                <Plus size={15} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <FeedbackComposer onSubmitted={() => setComposerOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none">
          <AnimatePresence initial={false}>
            {filtered.map((item) => {
              const meta = CATEGORY_META[item.category];
              return (
                <motion.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "w-full text-left px-3 py-3 border-b border-black/5 dark:border-white/5 transition-colors",
                    selectedId === item.id
                      ? "bg-indigo-500/10"
                      : "hover:bg-black/5 dark:hover:bg-white/5",
                    justArrivedId === item.id &&
                      "ring-1 ring-inset ring-indigo-400/60",
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        STATUS_OPTIONS.find((s) => s.value === item.status)
                          ?.dot,
                      )}
                    />
                    <span className="text-xs font-medium text-foreground truncate">
                      {item.user.username}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "ml-auto gap-1 text-[10px] px-1.5 py-0",
                        meta.className,
                      )}
                    >
                      <meta.icon size={10} />
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.message}
                  </p>
                </motion.button>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-10">
              No feedback here yet.
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">
                    {selected.user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selected.user.email} ·{" "}
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <Select
                  value={selected.status}
                  onValueChange={(v) =>
                    handleStatusChange(selected.id, v as FeedbackStatus)
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className={cn("size-1.5 rounded-full", opt.dot)}
                          />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </p>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Select a piece of feedback to view it
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
