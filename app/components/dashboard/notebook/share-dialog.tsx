import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { createShare } from "~/lib/api/shares";
import type { ShareResourceType, SharePermission } from "~/types/storage";

export function ShareDialog({
  open,
  onOpenChange,
  resourceType,
  resourceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: ShareResourceType;
  resourceId: string;
}) {
  const [username, setUsername] = useState("");
  const [permission, setPermission] = useState<SharePermission>("view");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const handleShare = async () => {
    if (!username.trim()) return;
    setStatus("sending");
    const result = await createShare({
      resource_type: resourceType,
      resource_id: resourceId,
      target_username: username.trim(),
      permission,
    });
    setStatus(result ? "sent" : "error");
    if (result) setUsername("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this {resourceType}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <Input
            placeholder="Username to share with"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant={permission === "view" ? "default" : "outline"}
              size="sm"
              onClick={() => setPermission("view")}
            >
              Can view
            </Button>
            <Button
              variant={permission === "edit" ? "default" : "outline"}
              size="sm"
              onClick={() => setPermission("edit")}
            >
              Can edit
            </Button>
          </div>
          {status === "sent" && (
            <p className="text-xs text-emerald-600">
              Invite sent — they'll get a notification.
            </p>
          )}
          {status === "error" && (
            <p className="text-xs text-destructive">Couldn't find that user.</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleShare} disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
