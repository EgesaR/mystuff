import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitFeedback } from "~/features/feedback/api";
import type { FeedbackCategory } from "~/types/feedback";

const CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "bug", label: "Something's broken" },
  { value: "feature", label: "Feature request" },
  { value: "praise", label: "Just saying thanks" },
];

export function FeedbackComposer({
  onSubmitted,
}: {
  onSubmitted?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim() || status === "submitting") return;
    setStatus("submitting");
    setError(null);
    try {
      await submitFeedback({ message: message.trim(), category });
      setStatus("sent");
      setMessage("");
      onSubmitted?.();
    } catch {
      setError("Couldn't send that — try again in a moment.");
      setStatus("idle");
    }
  };

  return (
    <div className="relative rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl p-5 shadow-sm">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center justify-center gap-3 py-10 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
                delay: 0.05,
              }}
            >
              <CheckCircle2 size={40} className="text-emerald-500" />
            </motion.div>
            <div>
              <p className="font-semibold text-foreground">
                Thanks for the feedback
              </p>
              <p className="text-sm text-muted-foreground">
                We'll take a look soon.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatus("idle")}
              className="mt-1"
            >
              Send more feedback
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-3"
          >
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as FeedbackCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="What's this about?" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind?"
              rows={5}
              className="resize-none"
            />

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || status === "submitting"}
              className="self-end gap-2"
            >
              {status === "submitting" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              Send feedback
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
