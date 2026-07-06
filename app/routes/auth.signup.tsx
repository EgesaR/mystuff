import AuthForm from "~/components/auth/AuthForm";
import type { Route } from "./+types/auth.login";
import { redirectIfAuthenticated } from "~/lib/loaders/auth.server";
import { signUp } from "~/lib/actions/auth.server";
import { useActionData } from "react-router";

export const meta: Route.MetaFunction = () => [
  { title: "Signup" },
  { name: "description", content: "Description" },
  { name: "keywords", content: "Keywords" },
  { name: "author", content: "Author" },
  { name: "robots", content: "index, follow" },
];

export async function loader({ request }: Route.LoaderArgs) {
  return redirectIfAuthenticated(request);
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  return signUp(request, formData);
}

const AuthSignup = () => {
  const result = useActionData<typeof action>();
  return (
    <div>
      <AuthForm type="sign-up" />

      {result?.success === false && <p>{result.error}</p>}
    </div>
  );
};

export default AuthSignup;
