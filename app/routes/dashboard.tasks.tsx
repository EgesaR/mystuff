import type { Route } from "./+types/dashboard.tasks";

export const meta: Route.MetaFunction = () => [{ title: "Tasks" }];

export default function TasksWorkspace() {
  return (
    <div className="w-full h-full flex flex-col py-8 px-8">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Tasks
        </h1>
        <p className="text-muted-foreground text-sm">
          Everything you need to get done.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-1 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="py-12 flex flex-col items-center justify-center text-center px-4 m-auto">
          <span className="text-sm text-muted-foreground">
            No tasks yet. Create one to get started.
          </span>
        </div>
      </div>
    </div>
  );
}
