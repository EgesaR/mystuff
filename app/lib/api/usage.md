# API HTTP Helpers Usage

This project uses two HTTP helpers for communicating with the FastAPI backend:

* `lib/api/client.ts` — browser/client-side requests
* `lib/api/server.ts` — React Router loaders/actions and other server-side requests

Supporting modules:

* `lib/api/constants.ts` — API origin, base URL, timeout
* `lib/api/endpoints.ts` — typed path constants
* `lib/api/utils.ts` — path normalization helpers
* `lib/api/response.server.ts` — cookie forwarding and redirect helpers

Both helpers provide:

* Request timeout handling (`API_TIMEOUT`)
* `AbortSignal` support
* FastAPI error handling (`detail` / `message`)
* JSON response parsing
* `204 No Content` support
* Automatic `Content-Type: application/json` for string bodies
* `FormData` support (browser sets multipart boundary)
* Authentication cookie handling
* Optional retries on the **client** for safe methods only

---

## File Structure

```text
app/
├── lib/
│   └── api/
│       ├── client.ts
│       ├── server.ts
│       ├── constants.ts
│       ├── endpoints.ts
│       ├── utils.ts
│       └── response.server.ts
│
├── routes/
│   ├── notes.tsx
│   ├── dashboard.tsx
│   └── ...
│
└── components/
    └── ...
```

### Responsibilities

| File                  | Environment     | Purpose                                              |
| --------------------- | --------------- | ---------------------------------------------------- |
| `constants.ts`        | Client + Server | `API_ORIGIN`, `API_BASE`, `API_PREFIX`, `API_TIMEOUT` |
| `endpoints.ts`        | Client + Server | Typed endpoint path constants                        |
| `utils.ts`            | Client + Server | Path normalization (`normalizedPath`, etc.)          |
| `client.ts`           | Browser         | Client-side `apiFetch`                               |
| `server.ts`           | Server          | Loader/action `apiFetch`                             |
| `response.server.ts`  | Server          | `extractCookies`, `redirectWithCookies`              |

---

## Rule of Thumb

| Where the code runs                         | Import from              | Call signature                          |
| ------------------------------------------- | ------------------------ | --------------------------------------- |
| Browser (components, hooks, event handlers) | `~/lib/api/client`       | `apiFetch(path, options?)`              |
| Loaders, actions, server-only code          | `~/lib/api/server`       | `apiFetch(path, options?, request?)`    |

Always prefer paths from `ENDPOINTS` instead of hard-coded strings.

```ts
import { ENDPOINTS } from "~/lib/api/endpoints";
```

---

# 1. Client API

Use `client.ts` from:

* React components
* Client-side hooks
* Browser event handlers
* Client-side utilities

```ts
import { apiFetch } from "~/lib/api/client";
import { ENDPOINTS } from "~/lib/api/endpoints";
```

## GET

```ts
const notes = await apiFetch<Note[]>(ENDPOINTS.notes.root);
```

The browser sends a same-origin request. Do **not** construct the backend origin manually:

```ts
// Prefer
apiFetch(ENDPOINTS.notes.root);

// Avoid
fetch("https://api.example.com/api/notes");
```

Client `buildUrl` only normalizes the path (and leaves absolute URLs unchanged). It does **not** prepend `API_BASE`. Same-origin proxying is handled by your React Router / hosting setup.

---

## GET With Query Parameters

```ts
const params = new URLSearchParams({
  page: "1",
  limit: "20",
});

const notes = await apiFetch<Note[]>(
  `${ENDPOINTS.notes.root}?${params.toString()}`,
);
```

---

## POST (JSON)

```ts
const note = await apiFetch<Note>(ENDPOINTS.notes.root, {
  method: "POST",
  body: JSON.stringify({
    title: "My note",
    content: "Hello world",
  }),
});
```

When `body` is a string and no `Content-Type` is set, the helper adds:

```http
Accept: application/json
Content-Type: application/json
```

You usually do not need to set these headers yourself.

---

## PATCH

```ts
const note = await apiFetch<Note>(ENDPOINTS.notes.byId(noteId), {
  method: "PATCH",
  body: JSON.stringify({
    title: "Updated title",
  }),
});
```

---

## DELETE

```ts
await apiFetch<void>(ENDPOINTS.notes.byId(noteId), {
  method: "DELETE",
});
```

A `204 No Content` response is returned as `undefined` (no JSON parse attempt).

---

## File Upload (FormData)

```ts
const formData = new FormData();
formData.append("file", file);

const result = await apiFetch<UploadResponse>(ENDPOINTS.files.uploads, {
  method: "POST",
  body: formData,
});
```

Do **not** set:

```ts
"Content-Type": "multipart/form-data"
```

The browser sets the correct multipart boundary automatically.

---

## Authentication (Client)

The client helper always uses:

```ts
credentials: "include"
```

Authentication cookies are sent on same-origin requests. You do not need to read or attach the cookie yourself:

```ts
const user = await apiFetch<User>(ENDPOINTS.auth.me);
```

---

## Request Cancellation

```ts
const controller = new AbortController();

const notes = await apiFetch<Note[]>(ENDPOINTS.notes.root, {
  signal: controller.signal,
});

// later
controller.abort();
```

Useful for unmounting components or debounced searches.

---

## Retries (Client Only)

Retries are **off by default**.

```ts
const notes = await apiFetch<Note[]>(ENDPOINTS.notes.root, {
  retries: 3,
  retryDelay: 1000, // ms; multiplies by 1.5 after each retry
});
```

Backoff example:

```text
Attempt 1
  → wait 1s
Attempt 2
  → wait 1.5s
Attempt 3
  → wait 2.25s
Attempt 4
```

Retries run only for safe methods:

```text
GET  HEAD  OPTIONS
```

`POST` / `PUT` / `PATCH` / `DELETE` are never auto-retried (avoids duplicate side effects).

Retries apply to:

* HTTP 5xx responses
* Network `TypeError`s
* Timeouts (when the caller did not abort)

Caller-initiated aborts are never retried.

---

# 2. Server API

Use `server.ts` from:

* React Router loaders
* React Router actions
* Server-side utilities
* Other server-only code

```ts
import { apiFetch } from "~/lib/api/server";
import { ENDPOINTS } from "~/lib/api/endpoints";
```

The server helper calls FastAPI directly via `API_BASE` (`API_ORIGIN` + `API_PREFIX`).

There are **no automatic retries** on the server helper.

---

## Server Loader

```ts
import type { Route } from "./+types/notes";
import { apiFetch } from "~/lib/api/server";
import { ENDPOINTS } from "~/lib/api/endpoints";

export async function loader({ request }: Route.LoaderArgs) {
  const notes = await apiFetch<Note[]>(
    ENDPOINTS.notes.root,
    {},
    request, // required to forward auth cookies
  );

  return { notes };
}
```

The third argument is the incoming React Router `Request`. Pass it whenever the user may be authenticated.

---

## Server Authentication (Cookie Forwarding)

Browser → React Router:

```http
Cookie: access_token=abc123
```

Loader/action:

```ts
export async function loader({ request }: Route.LoaderArgs) {
  const notes = await apiFetch<Note[]>(
    ENDPOINTS.notes.root,
    {},
    request,
  );
  // ...
}
```

Inside `apiFetch` (server):

```ts
const cookie = request.headers.get("cookie");
if (cookie) {
  headers.set("Cookie", cookie);
}
```

Flow:

```text
Browser
  │ Cookie
  ▼
React Router (loader / action)
  │ request
  ▼
lib/api/server.ts
  │ Cookie forwarded
  ▼
FastAPI  (API_BASE + path)
```

---

## Server Loader With Query Parameters

```ts
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const limit = url.searchParams.get("limit") ?? "20";

  const notes = await apiFetch<Note[]>(
    `${ENDPOINTS.notes.root}?page=${page}&limit=${limit}`,
    {},
    request,
  );

  return { notes };
}
```

---

## Server Action (JSON POST)

```ts
import type { Route } from "./+types/notes";
import { apiFetch } from "~/lib/api/server";
import { ENDPOINTS } from "~/lib/api/endpoints";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title");
  const content = formData.get("content");

  const note = await apiFetch<Note>(
    ENDPOINTS.notes.root,
    {
      method: "POST",
      body: JSON.stringify({ title, content }),
    },
    request,
  );

  return { note };
}
```

---

## Server File Upload

```ts
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const result = await apiFetch<UploadResponse>(
    ENDPOINTS.files.uploads,
    {
      method: "POST",
      body: formData,
    },
    request,
  );

  return { result };
}
```

Again, do not set `Content-Type: multipart/form-data` manually.

---

# 3. Cookie Helpers (`response.server.ts`)

When the backend returns `Set-Cookie` (login, logout, refresh, etc.), forward those cookies to the browser.

### `extractCookies(response)`

```ts
import { extractCookies } from "~/lib/api/response.server";

const headers = extractCookies(apiResponse);
// headers contains one or more Set-Cookie entries
```

Uses `response.headers.getSetCookie()` when available, with a fallback to a single `set-cookie` header.

### `redirectWithCookies(response, destination)`

```ts
import { redirectWithCookies } from "~/lib/api/response.server";
import { apiFetch } from "~/lib/api/server";
import { ENDPOINTS } from "~/lib/api/endpoints";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const response = await fetch(/* or use a lower-level call if you need the raw Response */);

  // Typical pattern when you need both body and Set-Cookie:
  // Prefer a dedicated login helper that returns the Response,
  // or extend apiFetch if you need the raw Response more often.

  return redirectWithCookies(response, "/dashboard");
}
```

`redirectWithCookies` builds a React Router `redirect()` and attaches every `Set-Cookie` from the backend response.

**Common auth action pattern** (login / logout / refresh):

```ts
export async function action({ request }: Route.ActionArgs) {
  // ... call backend, obtain Response that includes Set-Cookie ...
  return redirectWithCookies(backendResponse, "/dashboard");
}
```

---

# 4. Endpoints

Prefer the typed map in `endpoints.ts`:

```ts
import { ENDPOINTS } from "~/lib/api/endpoints";

ENDPOINTS.auth.me                    // "/auth/me"
ENDPOINTS.auth.login                 // "/auth/login"
ENDPOINTS.notes.root                 // "/notes"
ENDPOINTS.notes.byId(id)             // "/notes/<id>"
ENDPOINTS.notes.media(noteId)        // "/notes/<id>/media"
ENDPOINTS.files.uploads              // "/uploads"
ENDPOINTS.users.byId(id)             // "/users/<id>"
ENDPOINTS.health                     // "/health"
// ...
```

Dynamic segments use `encodeURIComponent` so IDs with special characters are safe.

---

# 5. Error Handling

Both helpers turn non-OK responses into a thrown `Response`.

FastAPI:

```json
{ "detail": "Note not found" }
```

Helper:

```ts
throw new Response("Note not found", {
  status: 404,
  statusText: "Not Found",
});
```

React Router error boundaries receive this naturally.

### Manual handling

```ts
try {
  const note = await apiFetch<Note>(ENDPOINTS.notes.byId("123"));
} catch (error) {
  if (error instanceof Response) {
    console.error(error.status);
    console.error(await error.text());
  }
  throw error; // rethrow so the boundary still runs
}
```

In most loaders/actions, let the `Response` propagate.

Timeouts become:

```ts
throw new Response("The API request timed out.", {
  status: 504,
  statusText: "Gateway Timeout",
});
```

Caller-initiated `AbortError` is rethrown unchanged (not converted to a timeout).

---

# 6. Response Types

Always supply a type parameter when the shape is known:

```ts
const notes = await apiFetch<Note[]>(ENDPOINTS.notes.root);
const note  = await apiFetch<Note>(ENDPOINTS.notes.byId(id));
const user  = await apiFetch<User>(ENDPOINTS.auth.me);
const void_ = await apiFetch<void>(ENDPOINTS.notes.byId(id), { method: "DELETE" });
```

For `204` responses the return value is `undefined`.

---

# 7. URL Architecture

### Client

```text
Browser
  ↓  same-origin relative path (e.g. /notes)
Your app / proxy (React Router, Vercel, etc.)
  ↓
FastAPI
```

Client never uses `API_BASE`. Paths stay relative; cookies stay first-party.

### Server

```text
React Router loader / action
  ↓
API_BASE + normalized path
  (e.g. http://localhost:8000/api/notes)
  ↓
FastAPI
```

`API_BASE` is built from env (`VITE_API_URL` / `process.env.VITE_API_URL`) + `API_PREFIX` (`/api`).

---

# 8. Shared Utilities (`utils.ts`)

### `normalizedPath(path)`

```ts
normalizedPath("notes");     // "/notes"
normalizedPath("/notes");    // "/notes"
normalizedPath("/notes/");   // "/notes"
normalizedPath("/api/notes/"); // "/api/notes"
```

Used by both client and server so path construction stays consistent.

### `stripTrailingSlash(value)`

Removes trailing slashes from any URL or path.

### `buildOriginFromRequest(request)`

Derives a backend origin from the incoming request (protocol + host + `BACKEND_PORT`). Useful when the server needs to talk to a colocated backend without relying solely on env config.

---

# 9. Constants (`constants.ts`)

| Constant       | Meaning                                              |
| -------------- | ---------------------------------------------------- |
| `API_PREFIX`   | `"/api"`                                             |
| `API_ORIGIN`   | Backend origin without trailing slash                |
| `API_BASE`     | `API_ORIGIN + API_PREFIX` (server-side base)         |
| `API_TIMEOUT`  | `30_000` ms                                          |
| `BACKEND_PORT` | From `VITE_API_PORT` (default `8000`)                |

Configure the backend URL with `VITE_API_URL` (defaults to `http://localhost:8000`).

---

# 10. Recommended Route Patterns

### Loader (read)

```ts
import type { Route } from "./+types/notes";
import { apiFetch } from "~/lib/api/server";
import { ENDPOINTS } from "~/lib/api/endpoints";

export async function loader({ request }: Route.LoaderArgs) {
  const notes = await apiFetch<Note[]>(ENDPOINTS.notes.root, {}, request);
  return { notes };
}
```

### Action (mutation)

```ts
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const note = await apiFetch<Note>(
    ENDPOINTS.notes.root,
    {
      method: "POST",
      body: JSON.stringify({
        title: formData.get("title"),
        content: formData.get("content"),
      }),
    },
    request,
  );

  return { note };
}
```

### Client component / hook

```ts
import { apiFetch } from "~/lib/api/client";
import { ENDPOINTS } from "~/lib/api/endpoints";

const notes = await apiFetch<Note[]>(ENDPOINTS.notes.root);
```

### Auth redirect that must set cookies

```ts
import { redirectWithCookies } from "~/lib/api/response.server";

// After a successful login/logout/refresh that returns Set-Cookie:
return redirectWithCookies(backendResponse, "/dashboard");
```

---

# 11. Quick Reference

### Client

```ts
import { apiFetch } from "~/lib/api/client";
import { ENDPOINTS } from "~/lib/api/endpoints";

apiFetch<Note[]>(ENDPOINTS.notes.root);

apiFetch<Note>(ENDPOINTS.notes.root, {
  method: "POST",
  body: JSON.stringify(data),
});

apiFetch<Note>(ENDPOINTS.notes.byId(id), {
  method: "PATCH",
  body: JSON.stringify(data),
});

apiFetch<void>(ENDPOINTS.notes.byId(id), { method: "DELETE" });

apiFetch<UploadResponse>(ENDPOINTS.files.uploads, {
  method: "POST",
  body: formData,
});

apiFetch<Note[]>(ENDPOINTS.notes.root, { retries: 3 });

const c = new AbortController();
apiFetch<Note[]>(ENDPOINTS.notes.root, { signal: c.signal });
c.abort();
```

### Server

```ts
import { apiFetch } from "~/lib/api/server";
import { ENDPOINTS } from "~/lib/api/endpoints";

apiFetch<Note[]>(ENDPOINTS.notes.root, {}, request);

apiFetch<Note>(
  ENDPOINTS.notes.root,
  { method: "POST", body: JSON.stringify(data) },
  request,
);

apiFetch<UploadResponse>(
  ENDPOINTS.files.uploads,
  { method: "POST", body: formData },
  request,
);
```

### Cookies / redirect

```ts
import {
  extractCookies,
  redirectWithCookies,
} from "~/lib/api/response.server";

const headers = extractCookies(apiResponse);
return redirectWithCookies(apiResponse, "/dashboard");
```

---

# Summary

* **Browser** → `~/lib/api/client` → same-origin relative paths, `credentials: "include"`, optional retries on safe methods.
* **Loader / action** → `~/lib/api/server` → `API_BASE` + path, forward `request` for cookies.
* Prefer **`ENDPOINTS`** for every path.
* Use **`redirectWithCookies`** when the backend sets auth cookies and you need to redirect.
* Let thrown `Response` errors bubble to React Router unless you have a specific reason to catch them.
