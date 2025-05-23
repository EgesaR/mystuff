import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getOwnerSuggestions } from "~/data/notes";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  try {
    const owners = await getOwnerSuggestions(query);
    return json({ owners });
  } catch (error) {
    return json({ error: "Failed to fetch owner suggestions" }, { status: 500 });
  }
};