import { redirect } from "react-router";

/**
 * Extracts Set-Cookie headers from an incoming API response
 * and attaches them to outbound Headers.
 */
export function extractCookies(response: Response): Headers {
  const headers = new Headers();

  const cookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];

  if (cookies.length > 0) {
    for (const cookie of cookies) {
      headers.append("Set-Cookie", cookie);
    }
  } else {
    /*
     * Fallback for runtimes that don't support getSetCookie().
     */
    const singleCookie = response.headers.get("set-cookie");

    if (singleCookie) {
      headers.append("Set-Cookie", singleCookie);
    }
  }

  return headers;
}

/**
 * Redirects the user while forwarding Set-Cookie headers
 * from the backend response.
 */
export function redirectWithCookies(
  response: Response,
  destination: string,
): Response {
  const headers = extractCookies(response);

  return redirect(destination, { headers });
}
