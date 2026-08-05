  import { useLoaderData } from "react-router";
  import type { Route } from "./+types/dashboard.feedback";
  import { apiFetch } from "~/lib/http.server";
  import type { Feedback } from "~/types/feedback";
  import { FeedbackComposer } from "~/components/dashboard/feedback/FeedbackComposer";
  import { FeedbackInbox } from "~/components/dashboard/feedback/FeedbackInbox";

  export async function loader({ request }: Route.LoaderArgs) {
    const res = await apiFetch("/api/feedback", {}, request);
    if (res.ok) {
      const items: Feedback[] = await res.json();
      return { items, isDeveloper: true as const };
    }
    return { items: [] as Feedback[], isDeveloper: false as const };
  }

  export default function FeedbackPage() {
    const { items, isDeveloper } = useLoaderData<typeof loader>();

    return (
      <div className="w-full h-full flex flex-col py-8 px-8 gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Feedback
          </h1>
          <p className="text-muted-foreground text-sm">
            {isDeveloper
              ? "Review feedback submitted by users, or send your own."
              : "Tell us what's working, what's broken, or what you'd like to see."}
          </p>
        </div>

        {isDeveloper ? (
          <FeedbackInbox initialItems={items} />
        ) : (
          <div className="max-w-xl">
            <FeedbackComposer />
          </div>
        )}
      </div>
    );
  }
