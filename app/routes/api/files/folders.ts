// Minimal API route: app/routes/api/files/folders.ts
// Provides a loader for GET (returns an empty array) and an action for POST
// that returns a created folder object. This is a small stub to prevent the
// "no action for route" error. Replace with real backend logic as needed.

export async function loader() {
  return new Response(JSON.stringify([]), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function action({ request }: { request: Request }) {
  try {
    const data = await request.json();
    const id = typeof crypto !== "undefined" && (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : String(Date.now());

    const folder = {
      id,
      name: data.name ?? "Untitled",
      color: data.color ?? "#64748b",
      parent_id: data.parent_id ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(folder), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
