// app/routes/$.tsx
import type { Route } from "./+types/$";
import NotFound from "~/components/shared/NotFound";

export const meta: Route.MetaFunction = () => [{ title: "Page Not Found" }];

export default function GlobalNotFound() {
  return (
    <main className="w-full h-screen flex items-center justify-center bg-background">
      <NotFound />
    </main>
  );
}
