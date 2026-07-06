import { redirect } from "react-router";
import { API_AUTH } from "../config";
import { apiFetch } from "../http.server";
import { redirectWithCookies } from "../auth.server";

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
      detail: "Invalid email or password",
    }));

    return {
      success: false,
      error: error.detail,
    };
  }

  return redirectWithCookies(res, "/dashboard");
}

export async function signUp(
  request: Request,
  formData: FormData,
): Promise<ActionResult> {
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

  return {
    success: true,
    message: "Check your email to verify your account.",
  };
}

export async function logout(request: Request) {
  await apiFetch(`${API_AUTH}/logout`, { method: "POST" }, request);

  return redirect("/");
}
