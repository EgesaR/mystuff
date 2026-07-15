// routes/dashboard.settings.security.tsx
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export default function SecuritySettings() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setStatus("error");
      setMessage("New passwords don't match.");
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: form.current,
          new_password: form.next,
        }),
      });
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => null))?.detail ??
            "Couldn't update your password.",
        );
      setStatus("success");
      setMessage("Password updated.");
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Change your password.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current">Current password</Label>
          <Input
            id="current"
            type="password"
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="next">New password</Label>
          <Input
            id="next"
            type="password"
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </div>
        {message && (
          <p
            className={cn(
              "text-sm",
              status === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {message}
          </p>
        )}
        <Button
          type="submit"
          disabled={status === "saving"}
          className="rounded-lg"
        >
          {status === "saving" ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
