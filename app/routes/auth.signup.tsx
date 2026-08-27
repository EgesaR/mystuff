import { useActionData } from "react-router";
import { redirectIfAuthenticated, signUp } from "~/features/auth/api";
import { useAuthResult } from "~/features/auth/hooks/useAuthResult";
import AuthForm from "~/features/auth/components/AuthForm";
import { buildMeta } from "~/lib/seo";
import type { Route } from "./+types/auth.signup";

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Create Account",
    description: "Sign up for a new account to get started.",
    path: "/auth/signup",
  });

export async function loader({ request }: Route.LoaderArgs) {
  return redirectIfAuthenticated(request);
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  return signUp(request, formData);
}

export default function AuthSignup() {
  const result = useActionData<typeof action>();
  useAuthResult(result);

  return (
    <main className="flex min-h-svh w-full items-center justify-center sm:p-6">
      <AuthForm type="sign-up" />
    </main>
  );
}
