import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getTagSuggestions } from "~/data/notes";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  try {
    const tags = await getTagSuggestions(query);
    return json({ tags });
  } catch (error) {
    return json({ error: "Failed to fetch tag suggestions" }, { status: 500 });
  }
};