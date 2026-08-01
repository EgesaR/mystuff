import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { acceptShare } from "~/lib/api/shares";

export default function AcceptSharePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");

  useEffect(() => {
    if (!token) return;
    acceptShare(token).then((share) => {
      if (!share) return setStatus("error");
      setStatus("ok");
      const dest =
        share.resource_type === "note"
          ? `/dashboard/notes/note/${share.resource_id}`
          : "/dashboard/storage";
      setTimeout(() => navigate(dest), 900);
    });
  }, [token, navigate]);

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      {status === "pending" && (
        <p className="text-sm text-muted-foreground">Accepting share…</p>
      )}
      {status === "ok" && (
        <p className="text-sm text-emerald-600">
          Share accepted — redirecting…
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">
          This share link is invalid or expired.
        </p>
      )}
    </div>
  );
}
