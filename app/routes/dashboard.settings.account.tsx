// routes/dashboard.settings.account.tsx
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuth } from "~/hooks/useAuth";
import type { User } from "~/lib/types";

interface FormState {
  first_name: string;
  last_name: string;
}

function AccountCenter() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState<FormState>({
    first_name: "",
    last_name: "",
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const [first = "", ...rest] = (user.full_name ?? "").split(" ");
    setFormData({ first_name: first, last_name: rest.join(" ") });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        }),
      });
      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.detail ??
            "Couldn't save your changes.",
        );
      }
      const updatedUser: User = await res.json();
      setUser(updatedUser);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  const initials =
    `${formData.first_name[0] ?? ""}${formData.last_name[0] ?? ""}`.toUpperCase() ||
    "?";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Account Center</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
            <Button
              type="button"
              variant="outline"
              className="text-sm rounded-lg"
            >
              Change Avatar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ""}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Email changes aren't supported from this form yet — see note
              below.
            </p>
          </div>

          <div className="pt-4 border-t border-border/50 flex items-center justify-between">
            <div className="text-sm">
              {status === "success" && (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Saved.
                </span>
              )}
              {status === "error" && (
                <span className="text-red-600 dark:text-red-400">
                  {errorMessage}
                </span>
              )}
            </div>
            <Button type="submit" disabled={saving} className="rounded-lg">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AccountCenter;
