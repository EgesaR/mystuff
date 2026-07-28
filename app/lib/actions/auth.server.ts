import { redirect } from "react-router";
import { API_AUTH } from "../config";
import { apiFetch } from "../http.server";
import { extractCookies, redirectWithCookies } from "../auth.server";

export type ActionResult =
  | {
      success: true;
      message?: string;
    }
  | {
      success: false;
      error: string;
    };

export async function signIn(
  request: Request,
  formData: FormData,
): Promise<Response | ActionResult> {
  const intent = formData.get("intent");

  try {
    // OAuth
    if (intent === "google" || intent === "github") {
      const res = await apiFetch(
        `${API_AUTH}/oauth/${intent}`,
        {
          method: "POST",
        },
        request,
      );

      if (!res.ok) {
        return {
          success: false,
          error: "Unable to start OAuth login.",
        };
      }

      const { url } = await res.json();

      throw redirect(url);
    }

    // Password Login
    const res = await apiFetch(
      `${API_AUTH}/login`,
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
      const error = await res.json().catch(() => ({
        detail: "Invalid credentials",
      }));

      return {
        success: false,
        error: error.detail,
      };
    }

    // Forward auth cookies to browser and redirect
    return redirectWithCookies(res, "/dashboard");
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    // Catch the sleep/wake fetch failure and return it to UI
    console.error("Login fetch error", error);
    return {
      success: false,
      error:
        "Unable to connect to the sever. Please check your connection and try again",
    };
  }
}

export async function signUp(
  request: Request,
  formData: FormData,
): Promise<Response | ActionResult> {
  try {
    const res = await apiFetch(
      `${API_AUTH}/signup`,
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
      const error = await res.json().catch(() => ({
        detail: "Unable to create account",
      }));

      return {
        success: false,
        error: error.detail,
      };
    }

    // Cookie Extraction
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
      error:
        "Unable to connect to the server. Please check your connection and try again...",
    };
  }
}

export async function logout(request: Request) {
  try {
    const res = await apiFetch(
      `${API_AUTH}/logout`,
      { method: "POST" },
      request,
    );

    return redirectWithCookies(res, "/");
  } catch (error) {
    console.error("Logout fetch error:", error)
    return redirect("/auth/login")
  }
}
