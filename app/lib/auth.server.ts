import { redirect } from "react-router";

export function redirectWithCookies(response: Response, destination: string) {
  const headers = new Headers();

  const cookies = (response.headers as any).getSetCookie?.() ?? [];

  if (cookies.length === 0) {
    const cookie = response.headers.get("set-cookie");

    if (cookie) {
      headers.append("Set-Cookie", cookie);
    }
  } else {
    for (const cookie of cookies) {
      headers.append("Set-Cookie", cookie);
    }
  }
  return redirect(destination, { headers });
}
