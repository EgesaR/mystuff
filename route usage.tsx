import type { Route } from "./+types/dashboard";
import type { ShouldRevalidateFunctionArgs } from "react-router";
import { Form, isRouteErrorResponse, useRouteError } from "react-router";

export function headers() {
    return {
        "X-Stretchy-Pants": "its for fun",
        "Cache-Control": "max-age=300, s-maxage=3600",
    };
}

export const handle = {
    its: "all yours",
};

export function links() {
    return [
        {
            rel: "icon",
            href: "/favicon.png",
            type: "image/png",
        },
        {
            rel: "stylesheet",
            href: "https://example.com/some/styles.css",
        },
        {
            rel: "preload",
            href: "/images/banner.jpg",
            as: "image",
        },
    ];
}

export async function loader() {
    // TODO: GET data
    const items = ['Item 1', 'Item 2', 'Item 3'];
    return { items };
}

export async function action({ request }: Route.ActionArgs) {
    const data = await request.formData();
    // TODO: POST/PUT/DELETE/PATCH data
    return { ok: true };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
    // TODO: do something on the client
    const serverData = await serverLoader();
    return serverData;
}
clientLoader.hydrate = true as const;

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
    // TODO: do something on the client
    const serverData = await serverAction();
    return serverData;
}

const loggingMiddleware: Route.MiddlewareFunction = async ({ request, context }, next) => {
    console.log(`${new Date().toISOString()} ${request.method} ${request.url}`);
    const start = performance.now();
    const response = await next();
    const duration = performance.now() - start;
    console.log(`${new Date().toISOString()} Response ${response.status} (${duration}ms)`);
    return response;
}

export const middleware = [loggingMiddleware];

const loggingClientMiddleware: Route.MiddlewareFunction = async ({ request, context }, next) => {
    console.log(`${new Date().toISOString()} ${request.method} ${request.url}`);
    const start = performance.now();
    await next();
    const duration = performance.now() - start;
    console.log(`${new Date().toISOString()} (${duration}ms)`);
}

export const clientMiddleware = [loggingClientMiddleware];

export function shouldRevalidate(arg: ShouldRevalidateFunctionArgs) {
    return true;
}

export function HydrateFallback() {
    return <p>Loading Game...</p>;
}

export default function Component({ loaderData }: Route.ComponentProps) {
    return (
        <div>
            {loaderData.items.map((item) => (
                <p key={item}>{item}</p>
            ))}
            <Form method="post" navigate={false} action="/list">
                <input type="text" name="title" />
                <button type="submit">Create Todo</button>
            </Form>
        </div>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <div>
                <h1>
                    {error.status} {error.statusText}
                </h1>
                <p>{error.data}</p>
            </div>
        );
    } else if (error instanceof Error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{error.message}</p>
                <p>The stack trace is:</p>
                <pre>{error.stack}</pre>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}

<div className="min-h-screen bg-[#F2F1EC] text-[#1C2321]">
  <SiteHeader />

  <main className="mx-auto max-w-4xl px-6 py-20">
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F5D50]">
      Documentation
    </p>
    <h1
      className="mt-4 text-4xl text-[#1C2321] sm:text-5xl"
      style={{ fontFamily: "'Fraunces', serif" }}
    >
      My Stuff Documentation
    </h1>

    {categories.length === 0 ? (
      <p className="mt-10 text-[#5B5A50]">
        Everything you need to learn about notes, files, collections, sharing,
        and the My Stuff API. Check back shortly, or{" "}
        <Link
          to="/contact"
          className="text-[#2F5D50] underline underline-offset-2"
        >
          ask a question directly
        </Link>
        .
      </p>
    ) : (
      <div className="mt-12 space-y-10">
        {categories.map(([category, pages]) => (
          <div key={category}>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-[#8A8676]">
              {category}
            </h2>
            <ul className="mt-3 divide-y divide-[#C9C4B7] rounded-sm border border-[#C9C4B7] bg-[#F8F7F2]">
              {pages
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((page) => (
                  <li key={page.id}>
                    <Link
                      to={`/docs/${page.slug}`}
                      className="flex items-center justify-between px-5 py-4 text-[#1C2321] hover:bg-[#EDEBE1]"
                    >
                      <span>{page.title}</span>
                      <span className="font-mono text-xs text-[#8A8676]">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    )}
  </main>

  <SiteFooter />
</div>;