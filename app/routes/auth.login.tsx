import { useActionData } from "react-router";
import { redirectIfAuthenticated, signIn } from "~/features/auth/api";
import { useAuthResult } from "~/features/auth/hooks/useAuthResult";
import AuthForm from "~/features/auth/components/AuthForm";
import { buildMeta } from "~/lib/seo";
import type { Route } from "./+types/auth.login";

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Sign In",
    description: "Sign in to your account to access your dashboard.",
    path: "/auth/login",
  });

export async function loader({ request }: Route.LoaderArgs) {
  return redirectIfAuthenticated(request);
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  return signIn(request, formData);
}

export default function AuthLogin() {
  const result = useActionData<typeof action>();
  useAuthResult(result);

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6">
      <AuthForm type="sign-in" />
    </main>
  );
}
