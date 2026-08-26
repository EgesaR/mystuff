import { Check, Circle, CircleAlert, Loader2 } from "lucide-react";

import LegacyMotion from "~/legacy/components/LegacyMotion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { SaveStatus } from "~/hooks/useAutosave";

const CONFIG: Record<
  SaveStatus,
  {
    label: string;
    variant: React.ComponentProps<typeof Badge>["variant"];
    className?: string;
    icon: React.ComponentType<{ className?: string }>;
    showAction: boolean;
  }
> = {
  idle: {
    label: "Saved",
    variant: "outline",
    className: "text-muted-foreground",
    icon: Check,
    showAction: false,
  },

  saved: {
    label: "Saved",
    variant: "secondary",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: Check,
    showAction: false,
  },

  unsaved: {
    label: "Unsaved changes",
    variant: "outline",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: Circle,
    showAction: true,
  },

  saving: {
    label: "Saving...",
    variant: "outline",
    className: "text-muted-foreground",
    icon: Loader2,
    showAction: false,
  },

  error: {
    label: "Couldn't save",
    variant: "destructive",
    icon: CircleAlert,
    showAction: true,
  },
};

interface SaveStatusBadgeProps {
  status: SaveStatus;
  onSaveNow: () => void;
}

export const SaveStatusBadge = ({
  status,
  onSaveNow,
}: SaveStatusBadgeProps) => {
  const current = CONFIG[status] ?? CONFIG.idle;
  const Icon = current.icon;

  return (
    <div className='flex max-w-full select-none items-center gap-2 overflow-hidden sm:gap-3'>
      <div className='min-w-0 shrink-0'>
        <LegacyMotion
          key={status}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.15,
            ease: "easeOut",
          }}
        >
          <Badge
            variant={current.variant}
            className={[
              "flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 text-xs font-medium transition-all",
              current.className,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Icon
              className={[
                "size-3.5 shrink-0",
                status === "saving" && "animate-spin",
                status === "unsaved" && "fill-current",
              ]
                .filter(Boolean)
                .join(" ")}
            />

            <span className='max-w-30 truncate sm:max-w-none'>
              {current.label}
            </span>
          </Badge>
        </LegacyMotion>
      </div>

      {current.showAction && (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 shrink-0 whitespace-nowrap px-2 text-xs font-medium text-muted-foreground transition-transform hover:text-foreground active:scale-95'
          onClick={onSaveNow}
        >
          Save now
        </Button>
      )}
    </div>
  );
};
