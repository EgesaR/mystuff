import { apiFetch } from "~/lib/http.server";
import type { Route } from "./+types/api.$";

export async function action({ request, params }: Route.ActionArgs) {
  const path = params["*"];

  const res = await apiFetch(
    `/api/${path}`,
    {
      method: request.method,
      body: await request.text(),
      headers: {
        "Content-Type":
          request.headers.get("Content-Type") || "application/json",
      },
    },
    request,
  );

  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/json",
    },
  });
}
