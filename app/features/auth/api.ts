/**
 * Auth API helpers for React Router loaders/actions.
 *
 * Cookie-sensitive flows (login, signup, logout) use a raw request
 * so Set-Cookie headers from FastAPI can be forwarded to the browser.
 *
 * Data-only flows (requireUser, redirectIfAuthenticated) use apiFetch.
 */

import { redirect } from "react-router";

import { API_BASE, API_TIMEOUT } from "~/lib/api/constants";
import { ENDPOINTS } from "~/lib/api/endpoints";
import { extractCookies, redirectWithCookies } from "~/lib/api/response.server";
import { apiFetch } from "~/lib/api/server";
import { normalizedPath } from "~/lib/api/utils";

import type { ActionResult, AppUser } from "./types"; // adjust if your User type lives elsewhere

// ---------------------------------------------------------------------------
// Endpoints (destructured once for readability)
// ---------------------------------------------------------------------------

const {
  login: loginUrl,
  signup: signupUrl,
  logout: logoutUrl,
  forgotPassword: forgotPasswordUrl,
  resetPassword: resetPasswordUrl,
  changePassword: changePasswordUrl,
  me: meUrl,
  oauth: { google: googleUrl, github: githubUrl },
} = ENDPOINTS.auth;

// ---------------------------------------------------------------------------
// Raw request helper (preserves Response + Set-Cookie)
// ---------------------------------------------------------------------------

/**
 * Low-level fetch against FastAPI that returns the raw Response.
 * Used only where Set-Cookie must be forwarded (login / signup / logout).
 *
 * Does not parse the body and does not throw on non-OK status —
 * the caller decides how to handle errors and cookies.
 */
async function authRequest(
  path: string,
  options: RequestInit = {},
  request?: Request,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  const onAbort = () => controller.abort();

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener("abort", onAbort, { once: true });
    }
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (request) {
    const cookie = request.headers.get("cookie");
    if (cookie) {
      headers.set("Cookie", cookie);
    }
  }

  try {
    return await fetch(`${API_BASE}${normalizedPath(path)}`, {
      ...options,
      signal: controller.signal,
      headers,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      if (options.signal?.aborted) {
        throw error;
      }
      throw new Response("The API request timed out.", {
        status: 504,
        statusText: "Gateway Timeout",
      });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    if (options.signal) {
      options.signal.removeEventListener("abort", onAbort);
    }
  }
}

/**
 * Best-effort extraction of FastAPI error detail from a failed response.
 */
async function readErrorDetail(response: Response, fallback: string): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof (data as { detail: unknown }).detail === "string"
    ) {
      return (data as { detail: string }).detail;
    }
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Sign in (password + OAuth start)
// ---------------------------------------------------------------------------

export async function signIn(
  request: Request,
  formData: FormData,
): Promise<Response | ActionResult> {
  const intent = formData.get("intent");

  try {
    // ----- OAuth: backend returns { url } to redirect the browser -----
    if (intent === "google" || intent === "github") {
      const res = await authRequest(
        intent === "google" ? googleUrl : githubUrl,
        { method: "POST" },
        request,
      );

      if (!res.ok) {
        return {
          success: false,
          error: "Unable to start OAuth login.",
        };
      }

      const data = (await res.json()) as { url?: string };
      if (!data.url) {
        return {
          success: false,
          error: "Unable to start OAuth login.",
        };
      }

      throw redirect(data.url);
    }

    // ----- Password login -----
    const res = await authRequest(
      loginUrl,
      {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      },
      request,
    );

    if (!res.ok) {
      return {
        success: false,
        error: await readErrorDetail(res, "Invalid credentials"),
      };
    }

    // Forward Set-Cookie from FastAPI and send the user to the app
    const headers = extractCookies(res);

    return Response.json(
      {
        success: true,
        message: "Successfully login you in! Redirecting to dashboard...",
      },
      { headers },
    );
  } catch (error) {
    // React Router redirects are Responses — rethrow them
    if (error instanceof Response) {
      throw error;
    }

    console.error("Login fetch error", error);
    return {
      success: false,
      error: "Unable to connect to the server. Please check your connection and try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------------

export async function signUp(
  request: Request,
  formData: FormData,
): Promise<Response | ActionResult> {
  try {
    const res = await authRequest(
      signupUrl,
      {
        method: "POST",
        body: JSON.stringify({
          username: formData.get("username"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      },
      request,
    );

    if (!res.ok) {
      return {
        success: false,
        error: await readErrorDetail(res, "Unable to create account"),
      };
    }

    // Account created — forward auth cookies and return a success payload
    const headers = extractCookies(res);

    return Response.json(
      {
        success: true,
        message: "Account created successfully! Redirecting to dashboard...",
      },
      { headers },
    );
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    console.error("Signup fetch error", error);
    return {
      success: false,
      error: "Unable to connect to the server. Please check your connection and try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout(request: Request): Promise<Response> {
  try {
    const res = await authRequest(logoutUrl, { method: "POST" }, request);
    // Clear cookies via whatever Set-Cookie the backend returns
    return redirectWithCookies(res, "/");
  } catch (error) {
    console.error("Logout fetch error:", error);
    return redirect("/auth/login");
  }
}

// ---------------------------------------------------------------------------
// Session guards (data only — apiFetch is fine here)
// ---------------------------------------------------------------------------

/**
 * Ensures the request is authenticated.
 * Returns the current user (and access token if present in the cookie).
 * Redirects to /auth/login when unauthenticated or on network failure.
 */
export async function requireUser(request: Request): Promise<{
  user: AppUser;
  token: string | null;
}> {
  try {
    const user = await apiFetch<AppUser>(meUrl, { method: "GET" }, request);

    const cookieHeader = request.headers.get("cookie") ?? "";
    const token =
      cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("access_token="))
        ?.split("=")[1] ?? null;

    return { user, token };
  } catch (error) {
    if (error instanceof Response) {
      // apiFetch throws Response on 4xx/5xx — treat as unauthenticated
      throw redirect("/auth/login");
    }
    throw redirect("/auth/login");
  }
}

/**
 * If the user is already authenticated, redirect away from auth pages.
 * Returns null when the user is a guest (stay on the page).
 */
export async function redirectIfAuthenticated(request: Request): Promise<null> {
  try {
    await apiFetch<AppUser>(meUrl, {}, request);
    // Session is valid → leave auth screens
    throw redirect("/dashboard");
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      // That was our redirect — rethrow
      throw error;
    }
    // 401/403 or network error → treat as guest
    return null;
  }
}

export async function forgotPassword(formData: FormData): Promise<ActionResult> {
  try {
    const res = await authRequest(forgotPasswordUrl, {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
      }),
    });

    if (!res.ok) {
      return {
        success: false,
        error: await readErrorDetail(res, "Unable to process your request."),
      };
    }

    return {
      success: true,
      message:
        "If an account exists for that email, a 6-digit password reset code has been sent to your inbox.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      error: "Unable to connect to the server. Please try again.",
    };
  }
}

export async function resetPassword(email: string, code: string, password: string): Promise<ActionResult> {
  try {
    const res = await authRequest(resetPasswordUrl, {
      method: "POST",
      body: JSON.stringify({ email, code, password }),
    });

    if (!res.ok) {
      return {
        success: false,
        error: await readErrorDetail(
          res,
          "Unable to reset password. The code may be invalid or expired.",
        ),
      };
    }

    return {
      success: true,
      message: "Your password has been reset successfully.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: "Unable to connect to the server. Please try again.",
    };
  }
}
